import { Paella, type MenuButtonPluginConfig } from '@asicupv/paella-core';
import { EventConversor, OpencastPaellaPlayer, type OpencastPaellaConfig, type Attachment, type Event, type Track } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';
import MenuGroupButtonPlugin, { type MenuGroupItem } from './common/MenuGroupButtonPlugin';
import DownloadIcon from './icons/download.svg?raw';




type OpencastDownloadsFilterElementsConfig = {
    groupByFlavor?: boolean
    downloadFlavors?: string[]
    downloadTags?: string[]
    downloadMimeTypes?: string[]
}

export type OpencastDownloadsPluginConfig = MenuButtonPluginConfig & {
    enableOnLicenses?: string[]
    enableOnWritePermission?: boolean
    tracks?: OpencastDownloadsFilterElementsConfig
    attachments?: OpencastDownloadsFilterElementsConfig
}

type TrackOrAttachment = Track | Attachment;

export default class OpencastDownloadsPlugin extends MenuGroupButtonPlugin {
    _downloadableContent: MenuGroupItem[] = [];
    _eventConversor: EventConversor;

    constructor(player: Paella, name?: string) {
        super(player, name);
        const ocConfig = player.config as OpencastPaellaConfig;        
        this._eventConversor = new EventConversor(player, ocConfig.opencast?.conversionConfig ?? {});
    }

    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    get config(): OpencastDownloadsPluginConfig {
        return super.config as OpencastDownloadsPluginConfig;
    }

    get name() {
        return super.name || 'org.opencast.paella.downloadsPlugin';
    }

    getAriaLabel() {
        return this.player.translate('Downloads');
    }

    getDescription() {
        return this.getAriaLabel();
    }

    async getHelp() {
        return {
            title: this.player.translate('Video downloads'),
            description: this.player.translate('This plugin allows users to download the video tracks / attachments of the video.')
        };
    }

    async load() {
        this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || DownloadIcon;
    }

    async isEnabled() {
        const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
        if (!isOcPlayer) {
            this.player.log.warn('This plugin is only available in Opencast Paella Player', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
            return false;
        }
                
        const metadata = this.player.metadata as Event['metadata'];

        const hasWritePermission: boolean = (!!this.config.enableOnWritePermission && await this.player.opencastAuth.canWrite());
        const hasAllowedLicense: boolean = (this.config.enableOnLicenses && metadata?.license)
            ? (this.config.enableOnLicenses.includes(metadata.license))
            : true;
        const enabled: boolean = (await super.isEnabled()) && (hasWritePermission || hasAllowedLicense);

        
        if (enabled) {
            const downloadableContent = await this.getDownloadableContent();
            this.items = downloadableContent;            
        }

        return enabled && this.items.length > 0;
    }


    filterElements(elements: TrackOrAttachment[], filterConfig: OpencastDownloadsFilterElementsConfig = {}): TrackOrAttachment[] {
        return elements.filter(elem => {
            if (filterConfig.downloadFlavors) {                
                const downloadFlavors = filterConfig.downloadFlavors?.includes(elem.flavor);
                if ((downloadFlavors === undefined) || (downloadFlavors === false)) {
                    return false;
                } 
            }

            if (filterConfig.downloadTags) {
                const tags = elem?.tags ?? [];
                const downloadTags = filterConfig.downloadTags?.some(tag => {
                    return tags.includes(tag);
                });
                if ((downloadTags === undefined) || (downloadTags === false)) {
                    return false;
                }
            }

            if (filterConfig.downloadMimeTypes) {
                const downloadMimeTypes = filterConfig.downloadMimeTypes?.includes(elem.mimetype);
                if ((downloadMimeTypes === undefined ) || (downloadMimeTypes === false)) {
                    return false;
                }
            }

            return true;
        });
    }
     
    convertToDownloadableContent(items: TrackOrAttachment[], _groupByFlavor: boolean = true): MenuGroupItem[] {
        // if (!groupByFlavor) {
        //     return items.map(item => ({
        //         id: item.id,
        //         url: item.url,
        //         title: item.mimetype || 'Unknown type'
        //     }));
        // }

        const grouped: Record<string, MenuGroupItem> = {};

        const getText = (item: TrackOrAttachment): string => {
            const track = item as Track;

            if (track.video) {
                return `[${track.mimetype}] ${track.video.width}x${track.video.height} ${track.video.framerate}fps`;
            }
            if (track.audio) {
                return `[${track.mimetype}] ${track.audio.channels} channels ${track.audio.samplingrate}Hz`;
            }
            if (track.flavor.startsWith("captions/")) {
                const caps = this._eventConversor.processCaptionsFromMpElements([track]);
                if (caps.length > 0) {
                    const langText = caps[0].text ?? caps[0].lang ?? 'Unknown language';
                    return `[${track.mimetype}] ${langText}`;
                }                
            }            

            return item.mimetype || 'Unknown type';
        }

        items.forEach(item => {
            const flavor = item.flavor || 'unknown';
            if (!grouped[flavor]) {
                grouped[flavor] = {
                    id: flavor,
                    title: flavor,
                    data: {
                        items: []
                    }
                };
            }
            grouped[flavor].data?.items?.push({
                id: item.id,
                title: getText(item),
                data: {
                    url: item.url,                    
                }
            });
        });

        return Object.values(grouped);
    }

    async getDownloadableContent(): Promise<MenuGroupItem[]> {
        const ocPlayer = this.player as OpencastPaellaPlayer;
        const event = ocPlayer.getEvent();

        const tracks: Track[] = event.tracks ?? [];
        const attachments: Attachment[] = event.attachments ?? [];
        
        const filteredTracks = this.filterElements(tracks, this.config.tracks);
        const filteredAttachments = this.filterElements(attachments, this.config.attachments);

        const downloadableTracks = this.convertToDownloadableContent(filteredTracks, false); //this.config.tracks?.groupByFlavor ?? true);
        const downloadableAttachments = this.convertToDownloadableContent(filteredAttachments, false); //this.config.attachments?.groupByFlavor ?? true);

        if (downloadableTracks.length === 0 && downloadableAttachments.length === 0) {
            return [];
        }

        if (downloadableTracks.length === 0) {
            return downloadableAttachments;
        }

        if (downloadableAttachments.length === 0) {
            return downloadableTracks;
        }

        return [
            {
                id: 'tracks',
                title: 'Tracks',
                data: {items: downloadableTracks }
            },
            {
                id: 'attachments',
                title: 'Attachments',
                data: { items: downloadableAttachments }
            }
        ];
    }

}

