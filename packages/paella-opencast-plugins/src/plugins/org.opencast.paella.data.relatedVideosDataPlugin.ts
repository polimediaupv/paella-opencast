import { DataPlugin, type DataPluginConfig } from '@asicupv/paella-core';
import { ensureArray, OpencastPaellaPlayer, opencastSearchResultToOpencastPaellaEvent, type Event } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';

export type OpencastRelatedVideosDataPluginConfig = DataPluginConfig & {
  maxCount?: number
  playerPreviewAttachmentsFlavours?: string[]
};

type RelatedVideo = {
  id: string;
  title: string;
  previewUrl?: string;
  presenter?: string;
  startDate?: Date;
  duration?: number;
  url: string;
}

type RelatedVideosDataResponse = {
  total: number;
  skip: number;
  limit: number;
  items: RelatedVideo[]
}

export default class OpencastRelatedVideosDataPlugin extends DataPlugin<OpencastRelatedVideosDataPluginConfig, RelatedVideosDataResponse> {
  getPluginModuleInstance() {
    return OpencastPaellaPluginsModule.Get();
  }

  async isEnabled() {
    const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
    if (!isOcPlayer) {
      this.player.log.warn(`${this.name} is only available in Opencast Paella Player`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
      return false;
    }
    if (!(await super.isEnabled())) {
      return false;
    }
    const ocPlayer = this.player as OpencastPaellaPlayer;
    if (ocPlayer.opencastPresentationUrl == null) {
      this.player.log.warn(`${this.name} is not enabled because Opencast presentation URL is not set`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
      return false;
    }

    return true;
  }

  get name() {
    return super.name || 'org.opencast.paella.data.relatedVideosDataPlugin';
  }

  get context() { return this.config.context || ['relatedVideos'] }

  async read(_context: string, _key: string): Promise<RelatedVideosDataResponse> {
    const noneEvents: RelatedVideosDataResponse = {
      total: 0,
      skip: 0,
      limit: 0,
      items: []
    }

    try {
      const ocPlayer = this.player as OpencastPaellaPlayer;
      const metadata = ocPlayer.getEvent().metadata;
      if (metadata?.series == null) {
        return noneEvents;
      }
      const limit = this.config.maxCount ?? 5;
      const eventsRes = await this.getCommonEventsFromSearchAPI({ series: metadata?.series, limit });

      const items = eventsRes.map((event) => {
        return {
          id: event.id,
          title: event.metadata?.title ?? '',
          previewUrl: this.getPreview(event),
          presenter: event.metadata?.presenters?.join(', '),
          startDate: event.metadata?.startDate,
          duration: event.metadata?.duration,
          url: `?id=${event.id}`
        };
      });

      return {
        total: items.length,
        skip: 0,
        limit: limit,
        items: items
      }
    }
    catch (_e) {
      return noneEvents;
    }
  }


  async getCommonEventsFromSearchAPI({ episodeId, series, limit }: { episodeId?: string, series?: string, limit?: number } = {}): Promise<Event[]> {
    const ocPlayer = this.player as OpencastPaellaPlayer;
    const url = ocPlayer.getUrlFromOpencastServer(`/search/episode.json?id=${episodeId ?? ''}&sid=${series ?? ''}&limit=${limit ?? 100}&sort=created%20desc`);
    if (url === null) {
      this.player.log.warn('Opencast server URL not set', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
      return [];
    }

    const events = await fetch(url)
      .then(async response => await response.json())
      .then(data => {
        if (data['search-results'] !== undefined) {
          // legacy search API (OC < 16.x)
          if (data['search-results']?.total === 0) {
            return [];
          }

          return ensureArray(data['search-results'].result)
            .map(e => opencastSearchResultToOpencastPaellaEvent(e));
        }
        if (data?.result !== undefined) {
          // New Opencast format. OC >= 16.x
          if (data.total === 0) {
            return [];
          }
          return data.result.map((e: any) => opencastSearchResultToOpencastPaellaEvent(e));
        }
        this.player.log.error('Opencast format not recognized. Cannot convert!', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
        return [];
      });


    return events;
  }



  getPreview(event: Event): string {
    const attachments = event.attachments ?? [];
    const playerPreviewAttachmentsFlavours = this.config.playerPreviewAttachmentsFlavours ?? ['presenter/player+preview', 'presentation/player+preview'];
    const potentialPreviewImages = playerPreviewAttachmentsFlavours
      .map((flavor) => {
        return attachments.find(attachment => attachment.flavor === flavor);
      })
      .filter(x => x != undefined);

    return potentialPreviewImages[0]?.url ?? '';
  }
}
