import { VideoLayout, type Stream, type VideoLayoutStructure } from '@asicupv/paella-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';

export default class OpencastMultiVideoDynamicLayout extends VideoLayout {
    _currentVideos: VideoLayoutStructure['videos'] | undefined = undefined;

    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    get name() {
        return super.name || 'org.opencast.paella.multiVideoDynamicLayout';
    }

    get identifier() {
        return 'multiple-video-dynamic';
    }

    get layoutType() {
        return 'dynamic';
    }

    async load() {
        this.player.log.debug('Multi video layout loaded', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
    }

    getValidStreams(streamData: Stream) {
        // Ignore content of streamData
        return [streamData];
    }

    getValidContentIds() {
        // Ignore content of streamData
        return this.validContentIds;
    }

    getLayoutStructure(streamData: Stream[]): VideoLayoutStructure {
        if (!this._currentVideos) {
            const size = 100 / streamData.length;
            this._currentVideos = streamData.map(d => {
                return {
                    content: d.content,
                    visible: true,
                    size
                };
            });
        }

        return {
            hidden: false,
            videos: this._currentVideos
        };
    }
}
