import { EventLogPlugin, Events } from '@asicupv/paella-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';

type StatisticEventType =
    'video:play' | 'video:resume' | 'video:pause' | 'video:seek' | 'video:watched';

// Positions are milliseconds since the start of the video
type PositionPayload = { at: number };
type SeekPayload = { to: number };
type WatchedPayload = { from: number; to: number };
type StatisticPayload = PositionPayload | SeekPayload | WatchedPayload;

type OpencastStatisticEvent = {
    timestamp: string; // UTC timestamp when the event happened
    itemType: 'video'; // Always "video" in our case
    itemId: string; // Mediapackage ID
    eventType: StatisticEventType; // See https://docs.opencast.org/develop/developer/architecture/basicstatistics/
    eventPayload?: StatisticPayload; // Object, depends on event type (see link above). Not sent for "video:play".
};

// Opencast answers with HTTP 200 even if it did not accept some of the events
type ClientPushResponse = {
    accepted: number;
    rejected: { index: number; error: string }[]; // Index in the request, error message for developers
};

type DebounceGroup = 'seek' | 'playback';

type PendingDebouncedEvent = {
    timer: number;
    event: OpencastStatisticEvent;
};

/**
 * Plugin to report "events" to Opencast for statistical analysis
 *
 * Uses a debounce map to consolidate events that happen multiple times in a very short timeframe. For example,
 * the user mashing the "seek 10 seconds forward" should only result in one seek event (or at least not that many).
 *
 * Uses a queue batch events, in order to reduce the number of requests we send to the backend.
 */
export default class OpencastBasicStatisticsPlugin extends EventLogPlugin {
    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    private readonly ITEM_TYPE = 'video';
    private _isFirstPlay = true;

    private readonly DEBOUNCE_DELAY = 500;

    private pendingDebounced = new Map<DebounceGroup, PendingDebouncedEvent>();

    // The backend will not accept events older than 15 minutes, so we need to
    // make sure we get our events out before then
    private readonly MAX_BUFFER_AGE = 5 * 60 * 1000; // 5 minutes
    // Events that could not be sent are retried, but not once they are about to be too old for the backend to accept
    // them anyway. Slightly less than the 15 minutes above.
    private readonly MAX_EVENT_AGE = 14 * 60 * 1000;
    // Arbitrarily chosen to avoid making our requests too large
    private readonly MAX_BATCH_SIZE = 20;

    private queue: OpencastStatisticEvent[] = [];
    private flushTimer: number | null = null;
    private flushInProgress = false;

    private watchedTracker = new WatchedTracker((range) => {
        void this.enqueue(
            this.createStatisticEvent(range.itemId, 'video:watched', {
                from: range.from,
                to: range.to,
            }),
        );
    });

    get name() {
        return super.name || 'org.opencast.paella.basicStatisticsPlugin';
    }

    // Initialize
    async load() {
        // Flush out remaining events on page close
        window.addEventListener('pagehide', () => {
            this.watchedTracker.flush();
            void (async () => {
                await this.flushPendingDebounced();
                await this.flush(true);
            })();
        });
    }

    // Only enabled in Opencast Paella Player, and if there is an Opencast to send the statistics to
    async isEnabled() {
        const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
        if (!isOcPlayer) {
            this.player.log.warn(
                `${this.name} is only available in Opencast Paella Player`,
                `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
            );
            return false;
        }
        if (!(await super.isEnabled())) {
            return false;
        }
        const ocPlayer = this.player;
        if (ocPlayer.opencastPresentationUrl == null) {
            this.player.log.warn(
                `${this.name} is not enabled because Opencast presentation URL is not set`,
                `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
            );
            return false;
        }

        return true;
    }

    // Define which events we subscribe too
    get events() {
        return [Events.PLAY, Events.PAUSE, Events.SEEK, Events.TIMEUPDATE, Events.ENDED];
    }

    async onEvent(event: Events, params: any) {
        const ocPlayer = this.player as OpencastPaellaPlayer;
        const metadata = ocPlayer.getEvent().metadata;

        const itemId = metadata?.id;

        // Can't have statistics be unassociated to an Opencast entity
        if (!itemId) {
            return;
        }

        switch (event) {
            case Events.PLAY: {
                const currentTime = (await this.player.videoContainer?.currentTime()) ?? 0;
                if (this._isFirstPlay) {
                    this._isFirstPlay = false;

                    await this.enqueue(this.createStatisticEvent(itemId, 'video:play', undefined));
                } else {
                    this.debounce(
                        'playback',
                        this.createStatisticEvent(itemId, 'video:resume', {
                            at: Math.floor(currentTime * 1000),
                        }),
                    );
                }

                this.watchedTracker.resume(itemId, Math.floor(currentTime * 1000));

                break;
            }
            case Events.PAUSE: {
                const currentTime = (await this.player.videoContainer?.currentTime()) ?? 0;
                this.debounce(
                    'playback',
                    this.createStatisticEvent(itemId, 'video:pause', {
                        at: Math.floor(currentTime * 1000),
                    }),
                );

                this.watchedTracker.pause();

                break;
            }
            case Events.SEEK:
                this.debounce(
                    'seek',
                    this.createStatisticEvent(itemId, 'video:seek', {
                        to: Math.floor(params.newTime * 1000),
                    }),
                );

                this.watchedTracker.seek(itemId, Math.floor(params.newTime * 1000));

                break;
            case Events.TIMEUPDATE:
                this.watchedTracker.update(Math.floor(params.currentTime * 1000));
                break;
            case Events.ENDED:
                // Flush out all the things
                this.watchedTracker.pause();
                await this.flushPendingDebounced();
                await this.flush();
                break;
            default:
                return;
        }
    }

    /**
     * Debouncing
     */
    private debounce(group: DebounceGroup, event: OpencastStatisticEvent) {
        const existing = this.pendingDebounced.get(group);

        if (existing) {
            clearTimeout(existing.timer);
        }

        const timer = window.setTimeout(() => {
            this.pendingDebounced.delete(group);
            void this.enqueue(event);
        }, this.DEBOUNCE_DELAY);

        this.pendingDebounced.set(group, {
            event,
            timer,
        });
    }

    private async flushPendingDebounced() {
        for (const [group, pending] of this.pendingDebounced) {
            clearTimeout(pending.timer);
            this.pendingDebounced.delete(group);
            await this.enqueue(pending.event);
        }
    }

    /**
     * Flushing
     */
    // Add event to buffer and schedule flushing
    private async enqueue(event: OpencastStatisticEvent) {
        if (this.mergeAdjacentWatchRanges(event)) {
            return;
        }

        this.queue.push(event);
        await this.scheduleFlush();
    }

    // Trigger flushing of batched events based on time or number
    private async scheduleFlush() {
        // Flush immediately if we've accumulated enough events.
        if (this.queue.length >= this.MAX_BATCH_SIZE) {
            await this.flush();
            return;
        }

        // Start the timer when the first event arrives.
        if (this.flushTimer === null) {
            this.flushTimer = window.setTimeout(() => {
                void this.flush();
            }, this.MAX_BUFFER_AGE);
        }
    }

    // Empty the event queue into a post request against Opencast.
    // Usually this waits for a request that is still in flight. With `force` it does not, which is for when the page is
    // being closed and there will be no later chance to send what is queued.
    private async flush(force = false) {
        if ((this.flushInProgress && !force) || this.queue.length === 0) {
            return;
        }

        this.flushInProgress = true;

        if (this.flushTimer !== null) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        const events = this.queue;
        this.queue = [];

        try {
            const ocPlayer = this.player as OpencastPaellaPlayer;
            const url = ocPlayer.getUrlFromOpencastServer('/basic-statistics/clientPush');

            if (!url) {
                this.player.log.warn(
                    'Opencast server URL not set',
                    `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
                );
                this.requeue(events);
                return;
            }

            const response = await fetch(url, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events }),
            });

            if (!response.ok) {
                if (this.isWorthRetrying(response.status)) {
                    throw new Error(`HTTP ${response.status}`);
                }

                // Sending the same events again would just get the same answer, so give up on them
                this.player.log.warn(
                    `Opencast did not accept statistics (HTTP ${response.status}), dropping ${events.length} events`,
                    `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
                );
            } else {
                await this.logRejectedEvents(response, events);
            }
        } catch (e) {
            // Put the events back so we can retry later.
            this.requeue(events);
            this.player.log.error(
                'Failed to send statistics',
                e instanceof Error ? e.message : String(e),
            );
        } finally {
            this.flushInProgress = false;

            // If more events arrived while flushing, restart the timer.
            if (this.queue.length > 0 && this.flushTimer === null) {
                this.flushTimer = window.setTimeout(() => {
                    void this.flush();
                }, this.MAX_BUFFER_AGE);
            }
        }
    }

    /**
     * Helper
     */
    // Put events that could not be sent back into the queue, unless they are too old for Opencast to accept them
    private requeue(events: OpencastStatisticEvent[]) {
        const oldestAllowed = Date.now() - this.MAX_EVENT_AGE;
        const stillUseful = events.filter((event) => Date.parse(event.timestamp) >= oldestAllowed);

        if (stillUseful.length < events.length) {
            this.player.log.warn(
                `Dropping ${events.length - stillUseful.length} statistics events that are too old to be accepted`,
                `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
            );
        }

        this.queue.unshift(...stillUseful);
    }

    // Events that Opencast rejected are not valid, so sending them again would not help. We can only report them.
    private async logRejectedEvents(response: Response, events: OpencastStatisticEvent[]) {
        let result: ClientPushResponse;
        try {
            result = (await response.json()) as ClientPushResponse;
        } catch {
            // The events were accepted as far as we know, so this must not make the caller send them again
            return;
        }

        for (const rejected of result?.rejected ?? []) {
            this.player.log.warn(
                `Opencast rejected the statistics event ${JSON.stringify(events[rejected.index])}: ${rejected.error}`,
                `${this.getPluginModuleInstance().moduleName} [${this.name}]`,
            );
        }
    }

    // Whether sending the same request again later might succeed
    private isWorthRetrying(status: number): boolean {
        return status < 400 || status >= 500 || status === 408 || status === 429;
    }

    // Shorthand for creating an event
    private createStatisticEvent(
        itemId: string,
        eventType: StatisticEventType,
        eventPayload?: StatisticPayload,
    ): OpencastStatisticEvent {
        return {
            timestamp: new Date().toISOString(),
            itemType: this.ITEM_TYPE,
            itemId,
            eventType,
            eventPayload,
        };
    }

    // Utility for consolidating watched ranges
    private mergeAdjacentWatchRanges = (event: OpencastStatisticEvent): boolean => {
        const last = this.queue.at(-1);

        if (last && last.eventType === 'video:watched' && event.eventType === 'video:watched') {
            const previous = last.eventPayload as WatchedPayload;
            const current = event.eventPayload as WatchedPayload;

            if (last.itemId === event.itemId && previous.to === current.from) {
                last.eventPayload = {
                    from: previous.from,
                    to: current.to,
                };
                // The timestamp of a watched event is the time the range ended
                last.timestamp = event.timestamp;

                return true;
            }
        }

        return false;
    };
}

type WatchedRange = {
    itemId: string;
    from: number; // milliseconds
    to: number; // milliseconds
};

/**
 * Helper class for tracking a watch range across multiple paella events
 */
class WatchedTracker {
    // Emit a watched event at least every 30 seconds
    private readonly REPORT_INTERVAL = 30000;
    private readonly BACKWARD_TOLERANCE = 1000;
    private readonly FORWARD_TOLERANCE = 2000;

    private currentRange: WatchedRange | null = null;
    private isTracking = false;
    private lastReportedPosition = 0;

    private readonly onRangeComplete: (range: WatchedRange) => void;

    constructor(onRangeComplete: (range: WatchedRange) => void) {
        this.onRangeComplete = onRangeComplete;
    }

    resume(itemId: string, positionMs: number) {
        this.isTracking = true;
        this.startNewRange(itemId, positionMs);
    }

    pause() {
        this.isTracking = false;
        this.flush();
    }

    seek(itemId: string, positionMs: number) {
        this.flush();

        if (this.isTracking) {
            this.startNewRange(itemId, positionMs);
        }
    }

    update(positionMs: number) {
        if (!this.isTracking || !this.currentRange) {
            return;
        }

        // Playback jumped backwards or forwards unexpectedly
        const jumpedBackward = positionMs + this.BACKWARD_TOLERANCE < this.currentRange.to;

        const jumpedForward = positionMs - this.currentRange.to > this.FORWARD_TOLERANCE;

        if (jumpedBackward || jumpedForward) {
            const itemId = this.currentRange.itemId;
            this.flush();
            this.startNewRange(itemId, positionMs);
            return;
        }

        this.currentRange.to = positionMs;

        // Emit progress every REPORT_INTERVAL.
        if (positionMs - this.lastReportedPosition >= this.REPORT_INTERVAL) {
            const itemId = this.currentRange.itemId;
            this.flush();
            this.startNewRange(itemId, positionMs);
        }
    }

    flush() {
        if (!this.currentRange) {
            return;
        }

        // Ignore zero-length ranges.
        if (this.currentRange.to > this.currentRange.from) {
            this.onRangeComplete(this.currentRange);
        }

        this.currentRange = null;
    }

    private startNewRange(itemId: string, positionMs: number) {
        this.currentRange = {
            itemId,
            from: positionMs,
            to: positionMs,
        };

        this.lastReportedPosition = positionMs;
    }
}
