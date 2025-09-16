import { Paella, type CaptionManifestItem, type Manifest, type Frame, type Transcription, type Source, type Stream } from '@asicupv/paella-core';
import { type Event, type MediaPackageElement, type Attachment, type Track } from '../Event';
import { splitFlavor } from '../utils';

// const translate = (key: string): string => {
//     return key;
// }

export interface ConversionConfig {
    captionsBackwardsCompatibility?: boolean
    segmentPreviewAttachmentsFlavours?: string[]
    playerPreviewAttachmentsFlavours?: string[]
    timelineAttachmentsFlavours?: string[]
    tagFor360Video?: string

    hideTimeLineOnLive?: boolean // TODO: Esto hay que colocarlo en otro sitio
}


export class EventConversor {
    readonly paella: Paella;
    readonly conversionConfig: ConversionConfig;

    /**
     * Creates a new EventConversor instance.
     * @param paella The Paella instance.
     * @param config Optional configuration for the conversion.
     */
    constructor(paella: Paella, conversionConfig: ConversionConfig = {}) {
        this.paella = paella;
        this.conversionConfig = conversionConfig;
    }

    getTimeLineInfo(event: Event): NonNullable<Manifest['metadata']>["timeline"] | undefined {
        const attachments = event.attachments ?? [];

        const timelineFlavors = this.conversionConfig.timelineAttachmentsFlavours ?? ["presentation/timeline+preview", "presenter/timeline+preview"];
        const previewAttachment = attachments.find(attachment => timelineFlavors.includes(attachment.flavor));
        

        

        if (previewAttachment) {
            const rows = previewAttachment?.additionalProperties?.imageSizeX ? Number(previewAttachment.additionalProperties.imageSizeX) : 10;
            const cols = previewAttachment?.additionalProperties?.imageSizeY ? Number(previewAttachment.additionalProperties.imageSizeY) : 10;
            return {
                url: previewAttachment?.url,
                rows,
                cols
            }
        }
    }


    // Metadata functions
    getMetadata(event: Event): Manifest['metadata'] {
        const isLive = event.tracks?.some((track) => track.is_live === true);
        const visibleTimeLine = !(isLive && this.conversionConfig?.hideTimeLineOnLive);

        const timelineInfo = this.getTimeLineInfo(event);


        const result: Manifest['metadata'] = {
            duration: event.metadata?.duration ?? 0,
            ...event?.metadata,
            //
            ocEvent: event,
            visibleTimeLine,
            timeline: timelineInfo
        };

        return result;
    }

    // Captions functions
    processCaptionsFromMpElements(mpElements: MediaPackageElement[]): CaptionManifestItem[] {
        const captions: CaptionManifestItem[] = [];
        mpElements.forEach((mpElement) => {
            try {
                const captions_regex = /^captions\/([^+]+)(\+(.+))?/g;
                const captions_match = captions_regex.exec(mpElement.flavor);

                if (captions_match) {
                    // Fallback for captions which use the old flavor style, e.g. "captions/vtt+en"
                    let captions_lang = captions_match[3];
                    let captions_generated = '';
                    let captions_closed = '';
                    const captions_subtype = captions_match[1];

                    if (mpElement.tags) {
                        mpElement.tags.forEach((tag) => {
                            if (tag.startsWith('lang:')) {
                                captions_lang = tag.substring('lang:'.length);
                            }
                            if (tag.startsWith('generator-type:') && tag.substring('generator-type:'.length) === 'auto') {
                                captions_generated = ' (' + this.paella.translate('automatically generated') + ')';
                            }
                            if (tag.startsWith('type:') && tag.substring('type:'.length) === 'closed-caption') {
                                captions_closed = '[CC] ';
                            }
                        });
                    }

                    let captions_format = mpElement.url.split('.').pop();
                    // Backwards support for 'captions/dfxp' flavored xml files
                    if (captions_subtype === 'dfxp' && captions_format === 'xml') {
                        captions_format = captions_subtype;
                    }

                    let captions_description = this.paella.translate('Undefined caption');
                    if (captions_lang) {
                        const languageNames = new Intl.DisplayNames([window.navigator.language], { type: 'language' });
                        const captions_language_name = languageNames.of(captions_lang) ?? this.paella.translate('Unknown language');
                        captions_description = captions_closed + captions_language_name + captions_generated;
                    }

                    if (captions_format) {
                        const c: CaptionManifestItem = {
                            id: mpElement.id,
                            format: captions_format,
                            url: mpElement.url,
                            lang: captions_lang,
                            text: captions_description
                        };
                        captions.push(c);
                    }
                }
            }
            catch (err) { /**/ }
        });

        return captions;
    }

    getCaptions(event: Event): Manifest["captions"] {
        const captions: Manifest["captions"] = [];

        // Read captions from tracks
        const tracks = event.tracks ?? [];
        const trackCaptions = this.processCaptionsFromMpElements(tracks);
        captions.push(...trackCaptions);

        // Read captions from attachments
        if (this.conversionConfig.captionsBackwardsCompatibility === true) {
            const attachments = event.attachments ?? [];
            const attachmentsCaptions = this.processCaptionsFromMpElements(attachments);
            captions.push(...attachmentsCaptions);
        }

        return captions;
    }

    // frameList functions
    getFrameList(event: Event): Manifest["frameList"] {
        const attachments = event.attachments ?? [];

        const segmentPreviewAttachmentsFlavours = this.conversionConfig.segmentPreviewAttachmentsFlavours ?? ['presentation/segment+preview'];

        // split attachments by flavor
        const flavoredAttachments = attachments
        .filter(attachment => segmentPreviewAttachmentsFlavours.includes(attachment.flavor))
        .reduce<Record<string, Attachment[]>>((acc, attachment) => {
            const flavor = attachment.flavor;
            acc[flavor] = acc[flavor] ? [...acc[flavor], attachment] : [attachment];
            return acc;
        }, {});


        const potentialSegmentPreviewImages = segmentPreviewAttachmentsFlavours
        .map((flavor) => flavoredAttachments[flavor])
        .filter(x => x != undefined);

        if (potentialSegmentPreviewImages.length === 0) {
            return;
        }

        const previewAttachments = potentialSegmentPreviewImages[0];
        const frames: Frame[] = previewAttachments
        .map((attachment) => {
            const timeRE = /time=T(\d+):(\d+):(\d+)/.exec(attachment.ref ?? '');
            if (!timeRE) {
                throw new Error('Invalid time format');
            }
            const h = Number(timeRE[1]) * 60 * 60;
            const m = Number(timeRE[2]) * 60;
            const s = Number(timeRE[3]);
            const time = h + m + s;

            return {
                id: `frame_${time}`,
                time,
                mimetype: attachment.mimetype,
                url: attachment.url,
                thumb: attachment.url
            };
        })
        .sort((a, b) => a.time - b.time);

        const frameList: Manifest['frameList'] = {
            targetContent: 'presentation',
            frames
        };
        return frameList;
    }

    getTranscriptions(event: Event): Transcription[] {
        const segments = event.segments ?? [];

        const transcriptions = segments.map(({ index, preview, text, time, duration }) => {
            return {
                index,
                preview,
                text,
                time,
                duration
            };
        });

        return transcriptions;
    }

    getPreviewUrl(event: Event): string {
        const attachments = event.attachments ?? [];

        const playerPreviewAttachmentsFlavours = this.conversionConfig.playerPreviewAttachmentsFlavours ?? ['presenter/player+preview', 'presentation/player+preview'];

        const potentialPreviewImages = playerPreviewAttachmentsFlavours
        .map((flavor) => {
            return attachments.find(attachment => attachment.flavor === flavor);
        })
        .filter(x => x != undefined);

        return potentialPreviewImages[0]?.url;
    }



    // function matchesFlavor(flavor: string, configFlavor: string) {
    //   const [ flavorType, flavorSubtype ] = splitFlavor(flavor);
    //   const [ configFlavorType, configFlavorSubtype ] = splitFlavor(configFlavor);

    //   if ((configFlavorType === '*' || configFlavorType === flavorType) &&
    //   (configFlavorSubtype === '*' || configFlavorSubtype === flavorSubtype)) {
    //     return true;
    //   }
    //   return false;
    // }

    getStreams(event: Event): Manifest['streams'] {
        const tracks = event.tracks ?? [];

        // split tracks by flavor
        const flavoredTracks = tracks
        .filter(track => track.mimetype === 'video/mp4' || track.mimetype === 'application/x-mpegURL')
        .reduce<Record<string, Track[]>>((acc, track) => {
            const flavor = splitFlavor(track.flavor)[0];
            acc[flavor] = acc[flavor] ? [...acc[flavor], track] : [track];
            return acc;
        }, {});

        // Get a stream for each mainflavor
        let mainAudioFlavor: string | null = null; // **TODO**: This should be a config option
        const streams = Object.keys(flavoredTracks).map((mainFlavor) => {
            const tracks = flavoredTracks[mainFlavor];

            const getSource = (track: Track): Source => {
                const src = track.url;
                const mimetype = track.mimetype;
                const res = {
                    w: track.video?.width ?? 0,
                    h: track.video?.height ?? 0
                };

                return { src, mimetype, res };
            };
            // getMp4sources(tracks, config);
            const mp4Sources = tracks
            .filter(track => track.mimetype === 'video/mp4')
            .map(getSource);
            // getHlsSources(tracks, config);
            const hlsSources = tracks
            .filter(track => track.mimetype === 'application/x-mpegURL' && track.is_live === false)
            .map(getSource);
            // getHlsLiveSources(tracks, config);
            const hlsLiveSources = tracks
            .filter(track => track.mimetype === 'application/x-mpegURL' && track.is_live === true)
            .map(getSource);

            const hasAudio = tracks.some(track => track.audio);
            if (hasAudio && (mainAudioFlavor === null || mainAudioFlavor === mainFlavor)) {
                mainAudioFlavor = mainFlavor;
            }
            const tagFor360Video = this.conversionConfig.tagFor360Video ?? 'video360';
            const hasTagVideo360 = tracks.some(track => track.tags?.includes(tagFor360Video)); // **TODO**: This should be a config option

            const stream: Stream = {
                content: mainFlavor,
                ...(hasTagVideo360 && { canvas: ['video360'] }),
                ...((mainAudioFlavor === mainFlavor) && { role: 'mainAudio' }),
                sources: {
                    ...(mp4Sources.length > 0 && { mp4: mp4Sources }),
                    ...(hlsSources.length > 0 && { hls: hlsSources }),
                    ...(hlsLiveSources.length > 0 && { hlsLive: hlsLiveSources })
                }
            };
            return stream;
        });

        return streams;
    }

    commonEventToPaellaManifest(event: Event): Manifest {
        const metadata = this.getMetadata(event);
        const captions = this.getCaptions(event);
        const frameList = this.getFrameList(event);
        const streams = this.getStreams(event);
        const transcriptions = this.getTranscriptions(event);
        const preview = this.getPreviewUrl(event);

        const result: Manifest = {
            metadata: {
                ...metadata,
                preview,
                previewPortrait: preview // Opencast does not generate an image in portrait mode, we use the same image for landscape and portrait.
            },
            streams,
            captions,
            frameList,
            transcriptions
        };

        return result;
    }
}

