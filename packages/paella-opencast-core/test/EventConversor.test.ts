import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { opencastSearchResultToOpencastPaellaEvent, opencastSearchResultToPaellaManifest } from '../src/EventConversor/EngageEventConversor';
import { opencastExternalAPIEventToOpencastPaellaEvent, opencastExternalAPIEventToPaellaManifest, parseChecksum } from '../src/EventConversor/APIEventConversor';
import { EventConversor } from '../src/EventConversor/EventConversor';
import data from './mock/episodes/dual.json'
import externalEvent from './mock/episodes/api.json';
import {commonEvent} from './mock/episodes/common';
import {Event, MediaPackageElement, Track} from '../src/Event';
import { OpencastPaellaPlayer } from '../src';

describe('EventConversor', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('opencastSearchResultToOpencastPaellaEvent', () => {
        test('should correctly convert Opencast search result to Paella event format', async () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});            
            const conversion = opencastSearchResultToOpencastPaellaEvent(data.result[0]);

            expect(conversion.tracks).toMatchObject(commonEvent.tracks);
            expect(conversion.attachments).toMatchObject(commonEvent.attachments);
            expect(conversion.catalogs).toMatchObject(commonEvent.catalogs);
        });

        test('should handle search result with missing metadata gracefully', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});            

            const minimalSearchResult = {
                mediapackage: {
                    id: 'test-id',
                    title: 'Test Title',
                    media: { track: [] },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(minimalSearchResult);

            expect(conversion.id).toBe('test-id');
            expect(conversion.metadata?.title).toBe('Test Title');
            expect(conversion.tracks).toEqual([]);
            expect(conversion.attachments).toEqual([]);
            expect(conversion.catalogs).toEqual([]);
        });

        test('should correctly parse track video resolution', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithTrack = {
                mediapackage: {
                    id: 'test-id',
                    media: { 
                        track: {
                            id: 'track-1',
                            url: 'http://example.com/video.mp4',
                            mimetype: 'video/mp4',
                            type: 'presenter/source',
                            video: {
                                resolution: '1920x1080',
                                id: 'video-1',
                                framerate: 30,
                                bitrate: 5000
                            },
                            tags: { tag: [] }
                        }
                    },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithTrack);

            expect(conversion.tracks).toBeDefined();
            expect(conversion.tracks).toHaveLength(1);
            if (conversion.tracks) {
                expect(conversion.tracks[0].video?.width).toBe(1920);
                expect(conversion.tracks[0].video?.height).toBe(1080);
            }
        });

        test('should handle malformed video resolution gracefully', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithBadResolution = {
                mediapackage: {
                    id: 'test-id',
                    media: { 
                        track: {
                            id: 'track-1',
                            video: {
                                resolution: 'invalid-resolution'
                            },
                            tags: { tag: [] }
                        }
                    },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithBadResolution);

            expect(conversion.tracks).toBeDefined();
            expect(conversion.tracks).toHaveLength(1);
            if (conversion.tracks) {
                expect(conversion.tracks[0].video?.width).toBe(0);
                expect(conversion.tracks[0].video?.height).toBe(0);
            }
        });

        test('should convert duration from milliseconds to seconds', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithDuration = {
                mediapackage: {
                    id: 'test-id',
                    duration: 120000, // 2 minutes in milliseconds
                    media: { track: [] },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithDuration);

            expect(conversion.metadata?.duration).toBe(120); // 2 minutes in seconds
        });

        test('should handle multiple presenters and contributors', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithMultiplePeople = {
                mediapackage: {
                    id: 'test-id',
                    creators: {
                        creator: ['John Doe', 'Jane Smith']
                    },
                    contributors: {
                        contributor: ['Contributor 1', 'Contributor 2', 'Contributor 3']
                    },
                    media: { track: [] },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithMultiplePeople);

            expect(conversion.metadata?.presenters).toEqual(['John Doe', 'Jane Smith']);
            expect(conversion.metadata?.contributors).toEqual(['Contributor 1', 'Contributor 2', 'Contributor 3']);
        });

        test('should parse checksums correctly', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithChecksum = {
                mediapackage: {
                    id: 'test-id',
                    media: { 
                        track: {
                            id: 'track-1',
                            checksum: {
                                type: 'md5',
                                $: 'abc123def456'
                            },
                            tags: { tag: [] }
                        }
                    },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithChecksum);

            expect(conversion.tracks).toBeDefined();
            expect(conversion.tracks).toHaveLength(1);
            if (conversion.tracks) {
                expect(conversion.tracks[0].checksum?.type).toBe('md5');
                expect(conversion.tracks[0].checksum?.value).toBe('abc123def456');
            }
        });
    });

    describe('opencastExternalAPIEventToOpencastPaellaEvent', () => {
        test('should correctly convert External API event to Paella event format', async () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(externalEvent);

            const checkElem = (elem1: MediaPackageElement, elem2: MediaPackageElement) => {
                expect(elem1.url).toBe(elem2.url);
                expect(elem1.mimetype).toBe(elem2.mimetype);
                expect(elem1.flavor).toBe(elem2.flavor);
                expect(elem1.tags).toEqual(expect.arrayContaining(elem2.tags || []));
                expect(elem1.checksum?.type).toBe(elem2.checksum?.type);
                expect(elem1.checksum?.value).toBe(elem2.checksum?.value);
                expect(elem1.size).toBe(elem2.size);
            }

            expect(conversion.metadata).toMatchObject(commonEvent.metadata);
            conversion.tracks?.forEach((track: Track, index: number) => {
                checkElem(track, commonEvent.tracks[index]);
            });
        });

        test('should handle External API event with missing optional fields', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const minimalExternalEvent = {
                identifier: 'test-id',
                title: 'Test Title',
                media: []
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(minimalExternalEvent);

            expect(conversion.id).toBe('test-id');
            expect(conversion.metadata?.title).toBe('Test Title');
            expect(conversion.tracks).not.toBeDefined();
        });

        test('should handle External API event with null/undefined values', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const eventWithNulls = {
                identifier: 'test-id',
                title: null,
                description: undefined,
                media: null
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(eventWithNulls);

            expect(conversion.id).toBe('test-id');
            expect(conversion.metadata?.title).toBeNull();
            expect(conversion.metadata?.description).toBeUndefined();
            expect(conversion.tracks).not.toBeDefined();
        });

        test('should correctly parse publication URLs from External API', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const eventWithPublications = {
                identifier: 'test-id',
                publications: [
                    {
                        channel: 'engage-player',
                        media: [
                            {
                                id: 'track-1',
                                url: 'http://example.com/video.mp4',
                                mimetype: 'video/mp4',
                                flavor: 'presenter/delivery'
                            }
                        ]
                    }
                ]
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent( eventWithPublications);

            expect(conversion.tracks?.[0]?.url).toBe('http://example.com/video.mp4');
            expect(conversion.tracks?.[0]?.flavor).toBe('presenter/delivery');
        });

        test('should handle multiple publication channels', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const eventWithMultipleChannels = {
                identifier: 'test-id',
                publications: [
                    {
                        channel: 'engage-player',
                        media: [{ id: 'track-1', url: 'http://engage.com/video.mp4' }]
                    },
                    {
                        channel: 'api',
                        media: [{ id: 'track-2', url: 'http://api.com/video.mp4' }]
                    }
                ]
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(eventWithMultipleChannels);

            expect(conversion.tracks?.length).toBeGreaterThan(0);
        });

        test('should parse date fields correctly from External API', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const eventWithDates = {
                identifier: 'test-id',
                start: '2023-01-01T10:00:00Z',
                created: '2023-01-01T09:00:00Z'
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(eventWithDates);

            expect(conversion.metadata?.startDate).toBeInstanceOf(Date);
            expect(conversion.metadata?.created).toBeInstanceOf(Date);
            expect(conversion.metadata?.startDate?.getTime()).toBe(new Date('2023-01-01T10:00:00Z').getTime());
        });

        test('should handle invalid date formats gracefully', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const eventWithInvalidDates = {
                identifier: 'test-id',
                start: 'invalid-date',
                created: null
            };

            const conversion = opencastExternalAPIEventToOpencastPaellaEvent(eventWithInvalidDates);

            expect(conversion.metadata?.startDate).toBeInstanceOf(Date);
            expect(isNaN(conversion.metadata?.startDate?.getTime()!)).toBe(true);
        });
    });

    describe('Edge cases and error handling', () => {
        test('should handle null input for search result converter', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            expect(() => opencastSearchResultToOpencastPaellaEvent(null)).not.toThrow();
        });

        test('should handle undefined input for search result converter', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            expect(() => opencastSearchResultToOpencastPaellaEvent(undefined)).not.toThrow();
        });

        test('should handle null input for external API converter', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            expect(() => opencastExternalAPIEventToOpencastPaellaEvent(null)).toThrow();
            
        });

        test('should handle undefined input for external API converter', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            expect(() => opencastExternalAPIEventToOpencastPaellaEvent(undefined)).toThrow();
        });

        test('should handle empty object input for both converters', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});

            const emptySearchResult = opencastSearchResultToOpencastPaellaEvent({});
            const emptyExternalEvent = opencastExternalAPIEventToOpencastPaellaEvent({});

            expect(emptySearchResult).toBeDefined();
            expect(emptyExternalEvent).toBeDefined();
        });

        test('should handle arrays as single values in search result', () => {
            const elem: HTMLElement = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const searchResultWithArrays = {
                dc: {
                    subject: ['Subject 1', 'Subject 2'],
                    description: ['Description 1', 'Description 2']
                },
                mediapackage: {
                    media: { track: [] },
                    attachments: { attachment: [] },
                    metadata: { catalog: [] }
                }
            };

            const conversion = opencastSearchResultToOpencastPaellaEvent(searchResultWithArrays);

            expect(conversion.metadata?.subject).toBe('Subject 1'); // Should take first element
            expect(conversion.metadata?.description).toBe('Description 1'); // Should take first element
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // parseChecksum
    // ─────────────────────────────────────────────────────────────────────────
    describe('parseChecksum', () => {
        test('should parse valid checksum string with md5', () => {
            const result = parseChecksum('abc123def456 (md5)');
            expect(result).toEqual({ type: 'md5', value: 'abc123def456' });
        });

        test('should parse valid checksum string with sha1', () => {
            const result = parseChecksum('aabbccddee1122334455 (sha1)');
            expect(result).toEqual({ type: 'sha1', value: 'aabbccddee1122334455' });
        });

        test('should return undefined for undefined input', () => {
            expect(parseChecksum(undefined)).toBeUndefined();
        });

        test('should return undefined for string without parentheses', () => {
            expect(parseChecksum('abc123def456 md5')).toBeUndefined();
        });

        test('should return undefined for empty string', () => {
            expect(parseChecksum('')).toBeUndefined();
        });

        test('should return undefined when hash part is empty', () => {
            expect(parseChecksum(' (md5)')).toBeUndefined();
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EventConversor (direct unit tests)
    // ─────────────────────────────────────────────────────────────────────────
    describe('EventConversor (direct)', () => {
        const makePlayer = () => {
            const elem = document.createElement('div');
            return new OpencastPaellaPlayer(elem, {});
        };

        // ── getStreams ─────────────────────────────────────────────────────
        describe('getStreams', () => {
            test('should group mp4 tracks by main flavor', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/presenter.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60 },
                        { id: 't2', url: 'http://example.com/presentation.mp4', mimetype: 'video/mp4', flavor: 'presentation/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const streams = conversor.getStreams(event);
                expect(streams).toHaveLength(2);
                const flavors = streams.map(s => s.content);
                expect(flavors).toContain('presenter');
                expect(flavors).toContain('presentation');
            });

            test('should include hls sources for non-live tracks', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/presenter.m3u8', mimetype: 'application/x-mpegURL', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const streams = conversor.getStreams(event);
                expect(streams).toHaveLength(1);
                expect(streams[0].sources.hls).toBeDefined();
                expect(streams[0].sources.hls).toHaveLength(1);
            });

            test('should include hlsLive sources for live tracks', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/live.m3u8', mimetype: 'application/x-mpegURL', flavor: 'presenter/delivery', tags: [], is_live: true, is_master: false, duration: 0 }
                    ]
                };
                const streams = conversor.getStreams(event);
                expect(streams[0].sources.hlsLive).toBeDefined();
                expect(streams[0].sources.mp4).toBeUndefined();
            });

            test('should assign role mainAudio to the first flavor with audio', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/presenter.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60, audio: { id: 'a1', channels: 2, samplingrate: 44100, bitrate: 128000 } },
                        { id: 't2', url: 'http://example.com/presentation.mp4', mimetype: 'video/mp4', flavor: 'presentation/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const streams = conversor.getStreams(event);
                const presenterStream = streams.find(s => s.content === 'presenter');
                const presentationStream = streams.find(s => s.content === 'presentation');
                expect(presenterStream?.role).toBe('mainAudio');
                expect(presentationStream?.role).toBeUndefined();
            });

            test('should add canvas video360 when tag is present', () => {
                const conversor = new EventConversor(makePlayer(), { tagFor360Video: 'video360' });
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/360.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: ['video360'], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const streams = conversor.getStreams(event);
                expect(streams[0].canvas).toContain('video360');
            });

            test('should return empty array when no video/audio tracks', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/sub.vtt', mimetype: 'text/vtt', flavor: 'captions/source+en', tags: [], is_live: false, is_master: false, duration: 0 }
                    ]
                };
                const streams = conversor.getStreams(event);
                expect(streams).toHaveLength(0);
            });
        });

        // ── parseVTTChapters ───────────────────────────────────────────────
        describe('parseVTTChapters', () => {
            test('should parse VTT with WEBVTT header and chapters without id', () => {
                const vtt = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\nIntroduction\n\n00:00:10.000 --> 00:00:20.000\nChapter 2`;
                const conversor = new EventConversor(makePlayer());
                const chapters = conversor.parseVTTChapters(vtt);
                expect(chapters).toHaveLength(2);
                expect(chapters[0].title).toBe('Introduction');
                expect(chapters[0].time).toBe(0);
                expect(chapters[1].title).toBe('Chapter 2');
                expect(chapters[1].time).toBe(10);
            });

            test('should parse VTT blocks with cue id', () => {
                const vtt = `WEBVTT\n\nchapter-1\n00:00:05.000 --> 00:00:15.000\nWith ID`;
                const conversor = new EventConversor(makePlayer());
                const chapters = conversor.parseVTTChapters(vtt);
                expect(chapters).toHaveLength(1);
                expect(chapters[0].id).toBe('chapter-1');
                expect(chapters[0].title).toBe('With ID');
                expect(chapters[0].time).toBe(5);
            });

            test('should skip blocks without --> separator', () => {
                const vtt = `WEBVTT\n\nThis is not a cue block`;
                const conversor = new EventConversor(makePlayer());
                const chapters = conversor.parseVTTChapters(vtt);
                expect(chapters).toHaveLength(0);
            });

            test('should return empty array for empty string', () => {
                const conversor = new EventConversor(makePlayer());
                expect(conversor.parseVTTChapters('')).toEqual([]);
            });

            test('should parse VTT without WEBVTT header', () => {
                const vtt = `00:00:00.000 --> 00:00:10.000\nNo Header`;
                const conversor = new EventConversor(makePlayer());
                const chapters = conversor.parseVTTChapters(vtt);
                expect(chapters).toHaveLength(1);
                expect(chapters[0].title).toBe('No Header');
            });

            test('should use auto-generated id when no cue id is present', () => {
                const vtt = `WEBVTT\n\n00:00:30.000 --> 00:00:40.000\nNo ID Chapter`;
                const conversor = new EventConversor(makePlayer());
                const chapters = conversor.parseVTTChapters(vtt);
                expect(chapters[0].id).toBe('id_30');
            });
        });

        // ── getChapters ────────────────────────────────────────────────────
        describe('getChapters', () => {
            test('should return undefined when no chapter tracks exist', async () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/video.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const chapters = await conversor.getChapters(event);
                expect(chapters).toBeUndefined();
            });

            test('should fetch and parse VTT chapters when chapter track exists', async () => {
                const vttContent = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\nChapter One\n\n00:00:10.000 --> 00:00:20.000\nChapter Two`;
                vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ text: () => Promise.resolve(vttContent) })));

                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 'ch1', url: 'http://example.com/chapters.vtt', mimetype: 'text/vtt', flavor: 'chapters/source', tags: [], is_live: false, is_master: false, duration: 0 }
                    ]
                };
                const chapters = await conversor.getChapters(event);
                expect(chapters).toBeDefined();
                expect(chapters?.chapterList).toHaveLength(2);
                expect(chapters?.chapterList[0].title).toBe('Chapter One');
            });

            test('should use custom chaptersFlavours from config', async () => {
                const vttContent = `WEBVTT\n\n00:00:05.000 --> 00:00:15.000\nCustom Chapter`;
                const fetchSpy = vi.fn(() => Promise.resolve({ text: () => Promise.resolve(vttContent) }));
                vi.stubGlobal('fetch', fetchSpy);

                const conversor = new EventConversor(makePlayer(), { chaptersFlavours: ['custom/chapters'] });
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 'ch1', url: 'http://example.com/custom-chapters.vtt', mimetype: 'text/vtt', flavor: 'custom/chapters', tags: [], is_live: false, is_master: false, duration: 0 }
                    ]
                };
                const chapters = await conversor.getChapters(event);
                expect(chapters?.chapterList).toHaveLength(1);
                expect(fetchSpy).toHaveBeenCalledWith('http://example.com/custom-chapters.vtt');
            });
        });

        // ── getFrameList ───────────────────────────────────────────────────
        describe('getFrameList', () => {
            test('should return undefined when no segment preview attachments exist', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = { id: 'test', attachments: [] };
                expect(conversor.getFrameList(event)).toBeUndefined();
            });

            test('should parse frame list from matching attachments', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'f1', url: 'http://example.com/frame0.jpg', mimetype: 'image/jpeg', flavor: 'presentation/segment+preview', tags: [], ref: 'track:abc#time=T00:00:00' },
                        { id: 'f2', url: 'http://example.com/frame30.jpg', mimetype: 'image/jpeg', flavor: 'presentation/segment+preview', tags: [], ref: 'track:abc#time=T00:00:30' }
                    ]
                };
                const frameList = conversor.getFrameList(event);
                expect(frameList).toBeDefined();
                expect(frameList?.frames).toHaveLength(2);
                expect(frameList?.frames[0].time).toBe(0);
                expect(frameList?.frames[1].time).toBe(30);
            });

            test('should sort frames by time', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'f2', url: 'http://example.com/frame60.jpg', mimetype: 'image/jpeg', flavor: 'presentation/segment+preview', tags: [], ref: 'track:abc#time=T00:01:00' },
                        { id: 'f1', url: 'http://example.com/frame0.jpg', mimetype: 'image/jpeg', flavor: 'presentation/segment+preview', tags: [], ref: 'track:abc#time=T00:00:00' }
                    ]
                };
                const frameList = conversor.getFrameList(event);
                expect(frameList?.frames[0].time).toBe(0);
                expect(frameList?.frames[1].time).toBe(60);
            });

            test('should use custom segmentPreviewAttachmentsFlavours from config', () => {
                const conversor = new EventConversor(makePlayer(), { segmentPreviewAttachmentsFlavours: ['custom/segment+preview'] });
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'f1', url: 'http://example.com/frame0.jpg', mimetype: 'image/jpeg', flavor: 'custom/segment+preview', tags: [], ref: 'track:abc#time=T00:00:05' }
                    ]
                };
                const frameList = conversor.getFrameList(event);
                expect(frameList?.frames).toHaveLength(1);
                expect(frameList?.frames[0].time).toBe(5);
            });
        });

        // ── getTimeLineInfo ────────────────────────────────────────────────
        describe('getTimeLineInfo', () => {
            test('should return undefined when no timeline attachment exists', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = { id: 'test', attachments: [] };
                expect(conversor.getTimeLineInfo(event)).toBeUndefined();
            });

            test('should return timeline info with rows and cols from attachment properties', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        {
                            id: 'tl1', url: 'http://example.com/timeline.jpg', mimetype: 'image/jpeg',
                            flavor: 'presentation/timeline+preview', tags: [],
                            additionalProperties: { imageSizeX: '5', imageSizeY: '8' }
                        }
                    ]
                };
                const info = conversor.getTimeLineInfo(event);
                expect(info).toBeDefined();
                expect(info?.url).toBe('http://example.com/timeline.jpg');
                expect(info?.rows).toBe(5);
                expect(info?.cols).toBe(8);
            });

            test('should default rows and cols to 10 when properties are missing', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'tl1', url: 'http://example.com/timeline.jpg', mimetype: 'image/jpeg', flavor: 'presenter/timeline+preview', tags: [] }
                    ]
                };
                const info = conversor.getTimeLineInfo(event);
                expect(info?.rows).toBe(10);
                expect(info?.cols).toBe(10);
            });
        });

        // ── getMetadata ────────────────────────────────────────────────────
        describe('getMetadata', () => {
            test('should return metadata with duration 0 when not provided', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = { id: 'test' };
                const metadata = conversor.getMetadata(event);
                expect(metadata?.duration).toBe(0);
            });

            test('should set visibleTimeLine to false for live events with hideTimeLineOnLive', () => {
                const conversor = new EventConversor(makePlayer(), { hideTimeLineOnLive: true });
                const event: Event = {
                    id: 'test',
                    tracks: [{ id: 't1', url: 'http://example.com/live.m3u8', mimetype: 'application/x-mpegURL', flavor: 'presenter/delivery', tags: [], is_live: true, is_master: false, duration: 0 }]
                };
                const metadata = conversor.getMetadata(event);
                expect(metadata?.visibleTimeLine).toBe(false);
            });

            test('should set visibleTimeLine to true for live events without hideTimeLineOnLive', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [{ id: 't1', url: 'http://example.com/live.m3u8', mimetype: 'application/x-mpegURL', flavor: 'presenter/delivery', tags: [], is_live: true, is_master: false, duration: 0 }]
                };
                const metadata = conversor.getMetadata(event);
                expect(metadata?.visibleTimeLine).toBe(true);
            });

            test('should include event metadata fields in result', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    metadata: { title: 'My Video', duration: 120, series: 'series-1' }
                };
                const metadata = conversor.getMetadata(event);
                expect(metadata?.title).toBe('My Video');
                expect(metadata?.duration).toBe(120);
                expect(metadata?.series).toBe('series-1');
            });
        });

        // ── getCaptions ────────────────────────────────────────────────────
        describe('getCaptions', () => {
            test('should return captions from tracks with captions flavor', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 'cap1', url: 'http://example.com/en.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt+en', tags: [], is_live: false, is_master: false, duration: 0 }
                    ]
                };
                const captions = conversor.getCaptions(event);
                expect(captions).toHaveLength(1);
                expect(captions![0].lang).toBe('en');
                expect(captions![0].url).toBe('http://example.com/en.vtt');
            });

            test('should return empty array when no captions tracks', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    tracks: [
                        { id: 't1', url: 'http://example.com/video.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ]
                };
                const captions = conversor.getCaptions(event);
                expect(captions).toHaveLength(0);
            });

            test('should include attachments captions when captionsBackwardsCompatibility is true', () => {
                const conversor = new EventConversor(makePlayer(), { captionsBackwardsCompatibility: true });
                const event: Event = {
                    id: 'test',
                    tracks: [],
                    attachments: [
                        { id: 'cap1', url: 'http://example.com/es.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt+es', tags: [] }
                    ]
                };
                const captions = conversor.getCaptions(event);
                expect(captions).toHaveLength(1);
                expect(captions![0].lang).toBe('es');
            });

            test('should NOT include attachment captions when captionsBackwardsCompatibility is false', () => {
                const conversor = new EventConversor(makePlayer(), { captionsBackwardsCompatibility: false });
                const event: Event = {
                    id: 'test',
                    tracks: [],
                    attachments: [
                        { id: 'cap1', url: 'http://example.com/es.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt+es', tags: [] }
                    ]
                };
                const captions = conversor.getCaptions(event);
                expect(captions).toHaveLength(0);
            });
        });

        // ── processCaptionsFromMpElements ──────────────────────────────────
        describe('processCaptionsFromMpElements', () => {
            test('should parse caption from lang tag', () => {
                const player = makePlayer();
                vi.spyOn(player, 'translate').mockImplementation((key: string) => key);
                const conversor = new EventConversor(player);
                const elements: MediaPackageElement[] = [
                    { id: 'c1', url: 'http://example.com/es.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt', tags: ['lang:es'] }
                ];
                const captions = conversor.processCaptionsFromMpElements(elements);
                expect(captions).toHaveLength(1);
                expect(captions[0].lang).toBe('es');
                expect(captions[0].format).toBe('vtt');
            });

            test('should mark caption as generated when generator-type:auto tag is present', () => {
                const player = makePlayer();
                vi.spyOn(player, 'translate').mockImplementation((key: string) => `(${key})`);
                const conversor = new EventConversor(player);
                const elements: MediaPackageElement[] = [
                    { id: 'c1', url: 'http://example.com/auto.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt+en', tags: ['generator-type:auto'] }
                ];
                const captions = conversor.processCaptionsFromMpElements(elements);
                expect(captions[0].text).toContain('(automatically generated)');
            });

            test('should prefix caption text with [CC] when type:closed-caption tag is present', () => {
                const player = makePlayer();
                vi.spyOn(player, 'translate').mockImplementation((key: string) => key);
                const conversor = new EventConversor(player);
                const elements: MediaPackageElement[] = [
                    { id: 'c1', url: 'http://example.com/cc.vtt', mimetype: 'text/vtt', flavor: 'captions/vtt+en', tags: ['type:closed-caption'] }
                ];
                const captions = conversor.processCaptionsFromMpElements(elements);
                expect(captions[0].text).toMatch(/^\[CC\]/);
            });

            test('should handle DFXP XML format', () => {
                const conversor = new EventConversor(makePlayer());
                const elements: MediaPackageElement[] = [
                    { id: 'c1', url: 'http://example.com/captions.xml', mimetype: 'text/xml', flavor: 'captions/dfxp+en', tags: [] }
                ];
                const captions = conversor.processCaptionsFromMpElements(elements);
                expect(captions).toHaveLength(1);
                expect(captions[0].format).toBe('dfxp');
            });

            test('should ignore elements with non-captions flavor', () => {
                const conversor = new EventConversor(makePlayer());
                const elements: MediaPackageElement[] = [
                    { id: 'a1', url: 'http://example.com/image.jpg', mimetype: 'image/jpeg', flavor: 'presenter/player+preview', tags: [] }
                ];
                const captions = conversor.processCaptionsFromMpElements(elements);
                expect(captions).toHaveLength(0);
            });

            test('should silently skip elements that cause errors', () => {
                const conversor = new EventConversor(makePlayer());
                const elements: MediaPackageElement[] = [
                    { id: 'bad', url: null as any, mimetype: 'text/vtt', flavor: 'captions/vtt+en', tags: [] }
                ];
                expect(() => conversor.processCaptionsFromMpElements(elements)).not.toThrow();
            });
        });

        // ── getTranscriptions ──────────────────────────────────────────────
        describe('getTranscriptions', () => {
            test('should return empty array when no segments', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = { id: 'test' };
                expect(conversor.getTranscriptions(event)).toEqual([]);
            });

            test('should map segments to transcription format', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    segments: [
                        { index: 0, preview: 'http://example.com/thumb.jpg', text: 'Hello world', time: 0, duration: 5000 },
                        { index: 1, preview: 'http://example.com/thumb2.jpg', text: 'Second segment', time: 5000, duration: 3000 }
                    ]
                };
                const transcriptions = conversor.getTranscriptions(event);
                expect(transcriptions).toHaveLength(2);
                expect(transcriptions[0].text).toBe('Hello world');
                expect(transcriptions[1].index).toBe(1);
            });
        });

        // ── getPreviewUrl ──────────────────────────────────────────────────
        describe('getPreviewUrl', () => {
            test('should return presenter/player+preview URL', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'p1', url: 'http://example.com/preview.jpg', mimetype: 'image/jpeg', flavor: 'presenter/player+preview', tags: [] }
                    ]
                };
                expect(conversor.getPreviewUrl(event)).toBe('http://example.com/preview.jpg');
            });

            test('should return presentation/player+preview URL when presenter is missing', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'p1', url: 'http://example.com/presentation-preview.jpg', mimetype: 'image/jpeg', flavor: 'presentation/player+preview', tags: [] }
                    ]
                };
                expect(conversor.getPreviewUrl(event)).toBe('http://example.com/presentation-preview.jpg');
            });

            test('should return undefined when no preview attachments exist', () => {
                const conversor = new EventConversor(makePlayer());
                const event: Event = { id: 'test', attachments: [] };
                expect(conversor.getPreviewUrl(event)).toBeUndefined();
            });

            test('should use custom playerPreviewAttachmentsFlavours from config', () => {
                const conversor = new EventConversor(makePlayer(), { playerPreviewAttachmentsFlavours: ['custom/preview'] });
                const event: Event = {
                    id: 'test',
                    attachments: [
                        { id: 'p1', url: 'http://example.com/custom.jpg', mimetype: 'image/jpeg', flavor: 'custom/preview', tags: [] }
                    ]
                };
                expect(conversor.getPreviewUrl(event)).toBe('http://example.com/custom.jpg');
            });
        });

        // ── commonEventToPaellaManifest ────────────────────────────────────
        describe('commonEventToPaellaManifest', () => {
            test('should build a complete manifest from a real mock event', async () => {
                vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ text: () => Promise.resolve('') })));
                const conversor = new EventConversor(makePlayer());
                const event: Event = {
                    id: 'test',
                    metadata: { title: 'Test', duration: 60 },
                    tracks: [
                        { id: 't1', url: 'http://example.com/presenter.mp4', mimetype: 'video/mp4', flavor: 'presenter/delivery', tags: [], is_live: false, is_master: false, duration: 60 }
                    ],
                    attachments: [
                        { id: 'p1', url: 'http://example.com/preview.jpg', mimetype: 'image/jpeg', flavor: 'presenter/player+preview', tags: [] }
                    ]
                };
                const manifest = await conversor.commonEventToPaellaManifest(event);
                expect(manifest.streams).toHaveLength(1);
                expect(manifest.streams[0].content).toBe('presenter');
                expect(manifest.metadata?.title).toBe('Test');
                expect(manifest.metadata?.preview).toBe('http://example.com/preview.jpg');
                expect(manifest.metadata?.previewPortrait).toBe('http://example.com/preview.jpg');
                expect(Array.isArray(manifest.captions)).toBe(true);
                expect(Array.isArray(manifest.transcriptions)).toBe(true);
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Complete manifest validation (P2)
    // ─────────────────────────────────────────────────────────────────────────
    describe('opencastSearchResultToPaellaManifest', () => {
        test('should produce a manifest with streams and metadata from dual.json', async () => {
            vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ text: () => Promise.resolve('') })));
            const elem = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const manifest = await opencastSearchResultToPaellaManifest(ocPlayer, data.result[0]);
            expect(Array.isArray(manifest.streams)).toBe(true);
            expect(manifest.streams.length).toBeGreaterThan(0);
            expect(manifest.metadata).toBeDefined();
            expect(manifest.metadata?.title).toBe('Dual-Stream Demo');
        });
    });

    describe('opencastExternalAPIEventToPaellaManifest', () => {
        test('should produce a manifest with streams and metadata from api.json', async () => {
            vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ text: () => Promise.resolve('') })));
            const elem = document.createElement('div');
            const ocPlayer = new OpencastPaellaPlayer(elem, {});
            const manifest = await opencastExternalAPIEventToPaellaManifest(ocPlayer, externalEvent);
            expect(Array.isArray(manifest.streams)).toBe(true);
            expect(manifest.streams.length).toBeGreaterThan(0);
            expect(manifest.metadata).toBeDefined();
            expect(manifest.metadata?.title).toBe('Dual-Stream Demo');
        });
    });
});