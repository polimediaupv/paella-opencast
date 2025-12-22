import { type Config, Paella } from '@asicupv/paella-core';
import { theme as defaultOpencastSkin } from '@asicupv/paella-opencast-skin';
import { type OpencastAuth, OpencastAuthDefaultImpl } from './OpencastAuth';
import type { ConversionConfig } from './EventConversor/EventConversor';
import type { Event } from './Event';
import type { OpencastInitParams } from './OpencastInitParams';
import {  getUrlFromBase } from './utils';
import defaultDictionaries from "./i18n/all";
import packageJson from '../package.json';

import '@asicupv/paella-opencast-skin/opencast-paella-skin.css'

// import { allPlugins as basicPlugins } from 'paella-basic-plugins';
// import { allPlugins as slidePlugins } from 'paella-slide-plugins';
// import { allPlugins as zoomPlugins } from 'paella-zoom-plugin';
// import { allPlugins as userTrackingPlugins } from 'paella-user-tracking';
// import { allPlugins as webglPlugins } from 'paella-webgl-plugins';
// import { allPlugins as opencastPlugins } from './plugins';
// import CookieConsentPlugin from './plugins/org.opencast.paella.cookieconsent';

export interface OpencastPaellaConfig extends Config {
    opencast?: {
        auth?: string;
        conversionConfig?: ConversionConfig;
        theme?: string
    }
};




export class OpencastPaellaPlayer extends Paella {
    readonly opencastPresentationUrl: string | null;
    readonly opencastAuth: OpencastAuth;

    constructor(containerElement: HTMLElement | string, opencastParams: OpencastInitParams = {}) {
        super(containerElement, opencastParams);

        this.opencastPresentationUrl = opencastParams?.opencast?.presentationUrl ?? null;
        this.opencastAuth = opencastParams?.opencast?.auth ?? new OpencastAuthDefaultImpl(this);


        // Add dictionaries
        Object.entries(defaultDictionaries).forEach(([lang, dictionary]) => {
            this.addDictionary(lang, dictionary);
        });        
    }        

    get detailedVersion() {
        const player = packageJson?.version || 'unknown';
        const coreLibrary = this.version;
        const pluginModules = this.pluginModules.map(m => `${m.moduleName}: ${m.moduleVersion}`);
        return {
            player,
            coreLibrary,
            pluginModules
        };
    }
    

    getUrlFromOpencastServer(url: string): string | null {
        if (this.opencastPresentationUrl == null) {
            return null;
        }

        return getUrlFromBase(this.opencastPresentationUrl, url);        
    }

    getEvent(): Event {
        const event = this.videoManifest?.metadata?.ocEvent as Event;
        return event;
    }
    

    async applyOpencastTheme() {        
        let ocThemeLoaded = false;

        try {
            const paellaOpencastConfig = await this.initParams?.loadConfig!(this.initParams.configUrl!, this) as OpencastPaellaConfig;
            if (paellaOpencastConfig?.opencast?.theme) { 
                this.log.info(`Try to load opencast theme "${paellaOpencastConfig.opencast.theme}"`, '@asicupv/paella-opencast-core');
                const themeUrl = this.getUrlFromOpencastServer(`${this.initParams.configResourcesUrl}${paellaOpencastConfig.opencast.theme}/theme.json`);
                if (themeUrl) {
                    await this.skin.loadSkin(themeUrl);
                    ocThemeLoaded = true;
                    this.log.info(`Opencast theme "${paellaOpencastConfig.opencast.theme}" loaded`, '@asicupv/paella-opencast-core');
                }                                
            }
        }
        catch (err) {
            this.log.error(`Error loading Opencast theme from config`, '@asicupv/paella-opencast-core');
        }

        if (!ocThemeLoaded) {         
            this.log.info('Loading default opencast theme', '@asicupv/paella-opencast-core');
            // Load default opencast theme
            await this.skin.loadSkin(defaultOpencastSkin);
        }
    }    
}
