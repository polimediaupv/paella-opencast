import { OpencastAuthDefaultImpl, stringToBoolean, OpencastPaellaPlayer, type OpencastInitParams, opencastInitParamsDefaultImpl } from '@asicupv/paella-opencast-core';
import { basicPlugins } from '@asicupv/paella-basic-plugins';
import { slidePlugins } from '@asicupv/paella-slide-plugins';
import { zoomPlugins } from '@asicupv/paella-zoom-plugin';
import { webglPlugins } from '@asicupv/paella-webgl-plugins';
import { videoPlugins } from '@asicupv/paella-video-plugins';
import { extraPlugins } from '@asicupv/paella-extra-plugins';
// import { aiToolsPlugins } from '@asicupv/paella-ai-plugins';
import { opencastPlugins } from '@asicupv/paella-opencast-plugins';


import '@asicupv/paella-core/paella-core.css';
import '@asicupv/paella-basic-plugins/paella-basic-plugins.css';
import '@asicupv/paella-slide-plugins/paella-slide-plugins.css';
import '@asicupv/paella-zoom-plugin/paella-zoom-plugin.css';
// import '@asicupv/paella-webgl-plugins/paella-webgl-plugins.css';
// import '@asicupv/paella-video-plugins/paella-video-plugins.css';
// import '@asicupv/paella-opencast-plugins/paella-opencast-plugins.css';
import '@asicupv/paella-extra-plugins/paella-extra-plugins.css';
// import '@asicupv/paella-ai-plugins/paella-ai-plugins.css';
import '@asicupv/paella-opencast-core/paella-opencast-core.css';

import './css/OpencastPaellaHTMLElement.css';


class OpencastPaellaHTMLElementAuthImpl extends OpencastAuthDefaultImpl {
    readonly #elem: OpencastPaellaHTMLElement;

    constructor(elem: OpencastPaellaHTMLElement) {
        super();
        this.#elem = elem;
    }

    async getLoggedUserName() {        
        return this.#elem.getAttribute('opencast-user-name') ?? await super.getLoggedUserName();
    }

    async canWrite() {
        const att = this.#elem.getAttribute('opencast-user-canWrite');

        return (att !== null)
            ? stringToBoolean(att)
            : super.canWrite();
    }
}

export class OpencastPaellaHTMLElement extends HTMLElement {
    private _paella: OpencastPaellaPlayer | null = null;
    private _isUpdating = false;
    private _hasPendingUpdate = false;
    private debouncedUpdate: () => void;


    static get observedAttributes() {
        return [
            'video-id', // Required
            'opencast-presentation-url', // Optional
            'paella-resources-url', // Optional, Default to: /ui/config/paella8/
            'paella-config', // If not defined, it will be fetched ${opencast-presentation-url}${paella-resources-url}config.json
            'opencast-episode', // If not defined, it will be fetched using the search API: ${opencast-presentation-url}/search/episode.json?id=${video-id}
            'opencast-user-name', // If not defined, it will be fetched from: ${opencast-presentation-url}/info/me.json
            'opencast-user-canWrite' // If not defined, it will be fetched using the serach API: ${opencast-presentation-url}/search/episode.json?id=${video-id} or series API ${opencast-presentation-url}/series/${series}/acl.json
        ];
    }

    get paella() { return this._paella; }

    constructor() {
        super();
        this.debouncedUpdate = this.debounce(() => this.enqueueUpdate(), 50);
    }


    private debounce(fn: () => void, delay: number) {
        let timer: NodeJS.Timeout | undefined;
        return (...args: unknown[]) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply<this, unknown[], void>(this, args), delay);
        };
    }    
    private async enqueueUpdate() {
        if (this._isUpdating) {
            this._hasPendingUpdate = true;
            return;
        }

        this._isUpdating = true;
        do {
            this._hasPendingUpdate = false;
            await this.update();
        } while (this._hasPendingUpdate);
        this._isUpdating = false;
    }

    /**
     * Updates the Opencast Paella Player based on the current attributes.
     * This method initializes the player, applies the theme, and loads the manifest.
     */
    private async update() {
        const videoId = this.getAttribute('video-id');
        if (!videoId) {
            console.warn('No video-id attribute found. Opencast Paella Player Component will not be updated.');
            return;
        }

        console.debug(`Updating Opencast Paella Player Component...`);
        const configResourcesUrl = this.getAttribute('paella-resources-url') ?? '/ui/config/paella8/';
        const ocPresentationUrl = this.getAttribute('opencast-presentation-url') ?? null;
        // const paellaSkinUrl = this.getAttribute('paella-skin-url') ?? (
        //     (ocPresentationUrl != null)
        //         ? getUrlFromBase(ocPresentationUrl, '/paella7/ui/default_theme/theme.json')
        //         : null
        // );
        try {
            this.innerHTML = '';

            const auth = new OpencastPaellaHTMLElementAuthImpl(this);
            const initParams: OpencastInitParams = {
                ...opencastInitParamsDefaultImpl,
                configResourcesUrl: configResourcesUrl,
                configUrl: `${configResourcesUrl}config.json`,
                plugins: [
                    ...basicPlugins,
                    ...slidePlugins,
                    ...zoomPlugins,
                    ...videoPlugins,
                    ...webglPlugins,
                    ...extraPlugins,
                    // ...aiToolsPlugins,
                    ...opencastPlugins
                ],
                opencast: {
                    presentationUrl: ocPresentationUrl,
                    videoId: this.getAttribute('video-id'),
                    episode: this.getAttribute('opencast-episode'),
                    paellaConfig: this.getAttribute('paella-config'),
                    auth,

                }
            };

            this._paella = new OpencastPaellaPlayer(this, initParams);
            auth.player = this._paella;

            await this._paella.applyOpencastTheme();
            await this._paella.loadManifest();
        }
        catch (error) {
            console.error(error);
        }   
        console.debug(`[END] Updating Opencast Paella Player Component...`);
    }

    connectedCallback(): void {
        console.debug('Opencast Paella Player Component connected to the DOM.');
        this.debouncedUpdate();
    }

    async attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue) {
            console.debug(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);
            this.debouncedUpdate();
        }
    }    

    // disconnectedCallback(): void {
    //     console.debug('Opencast Paella Player Component disconnected from the DOM.');
    //     // Clean up resources here if needed
    // }

    // adoptedCallback(oldDocument: Document, newDocument: Document): void {
    //     console.debug('Opencast Paella Player Component adopted from one document to another');
    //     // Optionally re-initialize context if needed
    // }

}