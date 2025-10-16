import { TableInfoPopUpPlugin, type ContentTableInfo } from '@asicupv/paella-core';
import { OpencastPaellaPlayer, secondsToTime, type Event } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';

import InfoIcon from './icons/info.svg?raw';




export default class OpencastEventDetailsPlugin extends TableInfoPopUpPlugin {

  getPluginModuleInstance() {
    return OpencastPaellaPluginsModule.Get();
  }

  get name() {
    return super.name || 'org.opencast.paella.eventDetailsPlugin';
  }

  getAriaLabel() {
      return this.player.translate('Show event details');
  }

  getDescription() {
      return this.getAriaLabel();
  }

  async getHelp() {
    return {
      title: this.player.translate('Event details'),
      description: this.player.translate('View detailed information about the event.')
    };
  }

  async load() {
    this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || InfoIcon;
  }

  async isEnabled() {
    const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
    if (!isOcPlayer) {
      this.player.log.warn(`${this.name} is only available in Opencast Paella Player`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
      return false;
    }

    return await super.isEnabled();
  }


  async getContentTableInfo(): Promise<ContentTableInfo> {
    const metadata = this.player.videoManifest.metadata as Event['metadata'];
    const hasOpencastUrl = (this.player as OpencastPaellaPlayer).opencastPresentationUrl != null;

    const presenters = metadata?.presenters
      ?.map((p) => (hasOpencastUrl ? `<a href="/engage/ui/index.html?q=${p}">${p}</a>` : p))
      ?.join(', ');
    const contributors = metadata?.contributors
      ?.map((p) => (hasOpencastUrl ? `<a href="/engage/ui/index.html?q=${p}">${p}</a>` : p))
      ?.join(', ');
    const language = metadata?.language
      ? new Intl.DisplayNames([metadata.language], { type: 'language' }).of(metadata.language) ?? ''
      : '';

    return {
      table: [
        {
          category: 'Video information',
          rows: [
            {
              key: 'UID',
              value: hasOpencastUrl
                ? `<a href="?id=${metadata?.id ?? ''}">${metadata?.id ?? ''}</a>`
                : metadata?.id ?? '',
            },
            { key: 'Title', value: metadata?.title ?? '' },
            {
              key: 'Subject',
              value: hasOpencastUrl
                ? `<a href="/engage/ui/index.html?q=${metadata?.subject}">${metadata?.subject ?? ''}</a>`
                : metadata?.subject ?? '',
            },
            { key: 'Description', value: metadata?.description ?? '' },
            {
              key: 'Series',
              value: hasOpencastUrl
                ? `<a href="/engage/ui/index.html?epFrom=${metadata?.series}">${metadata?.seriesTitle ?? ''}</a>`
                : metadata?.seriesTitle ?? '',
            },
          ],
        },
        {
          category: 'Details',
          rows: [
            { key: 'Language', value: language },
            { key: 'Start date', value: metadata?.startDate?.toLocaleDateString() ?? '' },
            { key: 'Duration', value: metadata?.duration ? secondsToTime(metadata.duration) : '' },
            { key: 'Location', value: metadata?.location ?? '' },
          ],
        },
        {
          category: 'People & Rights',
          rows: [
            { key: 'Presenter(s)', value: presenters ?? '' },
            { key: 'Contributor(s)', value: contributors ?? '' },
            { key: 'Rights', value: metadata?.rightsHolder ?? '' },
            { key: 'License', value: metadata?.license ?? '' },
          ],
        },
      ]
    };
  }




}

