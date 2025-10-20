import { TableInfoPopUpPlugin, type ContentTableInfo, type PopUpButtonPluginConfig } from '@asicupv/paella-core';
import { OpencastPaellaPlayer, secondsToTime, type Event } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';

import InfoIcon from './icons/info.svg?raw';



export type OpencastEventDetailsPluginConfig = PopUpButtonPluginConfig & {
    engageQueryUrl?: string;
    engageSeriesUrl?: string;
};

const DEFAULT_ENGAGE_QUERY_URL = '/engage/ui/index.html?q=${q}';
const DEFAULT_ENGAGE_SERIES_URL = '/engage/ui/index.html?epFrom=${series}';

export default class OpencastEventDetailsPlugin extends TableInfoPopUpPlugin<OpencastEventDetailsPluginConfig> {

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


  applyTemplate(txt: string, templateVars: Record<string, any>): string {    
    return txt.replace(/\${[^{]*}/g, (t: string): string =>{
      // 1. Extract the key path: removes the first two characters ("${") and the last one ("}")
      const keyPath: string = t.substring(2, t.length - 1);
      // 2. Split the key path into parts to handle nesting
      const parts: string[] = keyPath.split(".");
      // 3. Navigate the templateVars object using reduce
      // The accumulator (a) starts as templateVars
      const value: any = parts.reduce((accumulator: any, part: string) => {
          // Safety check: If the accumulator is null/undefined or the property doesn't exist,
          // we return undefined to stop navigation and prevent errors.
          if (accumulator && accumulator.hasOwnProperty(part)) {
              return accumulator[part];
          }
          // Return undefined to ensure the final value is undefined if the path is invalid.
          return undefined;
      }, templateVars);

      // 4. Return the found value (converted to string) or the original match 't'
      // if the value was not found (undefined or null).
      return (value !== undefined && value !== null) ? String(value) : t;      
    });
  };

  async getContentTableInfo(): Promise<ContentTableInfo> {
    const metadata = this.player.videoManifest.metadata as Event['metadata'];
    const hasOpencastUrl = (this.player as OpencastPaellaPlayer).opencastPresentationUrl != null;

    const engageQueryUrl = this.config.engageQueryUrl || DEFAULT_ENGAGE_QUERY_URL;
    const engageSeriesUrl = this.config.engageSeriesUrl || DEFAULT_ENGAGE_SERIES_URL;
    
    const presenters = metadata?.presenters
      ?.map((p) => (hasOpencastUrl ? `<a href="${this.applyTemplate(engageQueryUrl, { q: p })}">${p}</a>` : p))
      ?.join(', ');
    const contributors = metadata?.contributors
      ?.map((p) => (hasOpencastUrl ? `<a href="${this.applyTemplate(engageQueryUrl, { q: p })}">${p}</a>` : p))
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
                ? `<a href="${this.applyTemplate(engageSeriesUrl, { series: metadata?.series })}">${metadata?.seriesTitle ?? ''}</a>`
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

