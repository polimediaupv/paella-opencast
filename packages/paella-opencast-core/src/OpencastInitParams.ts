import { Paella, type InitParams, type Manifest } from '@asicupv/paella-core';
import { type OpencastAuth } from './OpencastAuth';
import type { OpencastPaellaConfig, OpencastPaellaPlayer } from './OpencastPaellaPlayer';
import { ensureArray, getHashOrUrlParameter } from './utils';
import type { ConversionConfig } from './EventConversor/EventConversor';
import { opencastSearchResultToPaellaManifest } from './EventConversor/EngageEventConversor';
import { opencastExternalAPIEventToPaellaManifest } from './EventConversor/APIEventConversor';


export interface OpencastInitParams extends InitParams {
    opencast?: {        
        presentationUrl?: string | null
        auth?: OpencastAuth | null
        // **
        videoId?: string | null
        paellaConfig?: string | Partial<OpencastPaellaConfig> | null
        episode?: string | null
    }
};


export async function defaultLoadConfigFunc(configUrl: string, player: Paella): Promise<OpencastPaellaConfig> {
    const ocPlayer = player as OpencastPaellaPlayer;
    const ocInitParams = ocPlayer.initParams as OpencastInitParams;     

    let paellaConfig: OpencastPaellaConfig;
    if (ocInitParams.opencast?.paellaConfig) {        
        // If paellaConfig is a string, parse it as JSON.
        if (typeof ocInitParams.opencast.paellaConfig === 'string') {
            try {
                ocPlayer.log.info('Parsing paella config from string', '@asicupv/paella-opencast-core');
                paellaConfig = JSON.parse(ocInitParams.opencast?.paellaConfig);
            }
            catch (err: any) {
               throw new Error(`Error parsing paella config: ${err}`);
            }
        }
        // If paellaConfig is an object, use it directly.
        else if (typeof ocInitParams.opencast.paellaConfig === 'object') {
            ocPlayer.log.info('Using paella config from object', '@asicupv/paella-opencast-core');
            paellaConfig = ocInitParams.opencast.paellaConfig;
        }
        else {
            throw new Error('Error getting paella config. paellaConfig is not a string or an Config object.');
        }
    }    
    else {
        let configFileUrl: string = configUrl;
        if (!(configUrl.startsWith('http://') || configUrl.startsWith('https://'))) {
            configFileUrl = ocPlayer.getUrlFromOpencastServer(configUrl) ?? configUrl
        }
        ocPlayer.log.info(`Loading paella config from URL: ${configFileUrl}`, '@asicupv/paella-opencast-core');
        
        const response = await fetch(configFileUrl);
        paellaConfig = await response.json();
    }

    return paellaConfig;
}


export async function defaultGetVideoIdFunc(config: OpencastPaellaConfig, player: Paella): Promise<string | null> {   
    const ocPlayer = player as OpencastPaellaPlayer;
    const ocInitParams = ocPlayer.initParams as OpencastInitParams;

    const videoId = ocInitParams.opencast?.videoId ?? getHashOrUrlParameter('id') ?? config?.fallbackId ?? null;
    if ((videoId === null) || (videoId === '')) {
        throw new Error(player.translate('No video ID provided'));
    }
    return videoId;
}

export async function defaultLoadVideoManifestFunc(_manifestUrl: string, _config: OpencastPaellaConfig, player: Paella): Promise<Manifest> {
    player.log.info('================== loadVideoManifest ==================', '@asicupv/paella-opencast-core');
    const ocPlayer = player as OpencastPaellaPlayer;
    const ocInitParams = ocPlayer.initParams as OpencastInitParams;
    const conversionConfig = {};
    
    
    let opencastEvent = null;
    // Load episode from attribute. Will autodiscover is it is a serarch API or an External API response.
    if (ocInitParams.opencast?.episode) {        
        player.log.info('Loading episode from opencast episode attribute', '@asicupv/paella-opencast-core');
        try {
            opencastEvent = JSON.parse(ocInitParams.opencast.episode);
        }
        catch (err: any) {
            throw new Error(`Error parsing opencast episode: ${err}`);
        }
    }
    // Load episode from videoId. Will autodiscover if it is a serarch API or an External API response.
    else {        
        // Try to auto-fetch episode if opencast-presentaion-url and opencast-video-id are set.
        if ((ocPlayer.opencastPresentationUrl === null) || (player.videoId === null)) {
            throw new Error('opencast-presentation-url or video-id not defined.');
        }

        const url = ocPlayer.getUrlFromOpencastServer(`/search/episode.json?id=${player.videoId ?? ''}&limit=1`);
        if (url === null) {
            throw new Error('Error getting opencast episode URL. opencast-presentation-url is not set.');
        }
        player.log.info(`Fetching opencast episode '${player.videoId}' from '${url}'`, '@asicupv/paella-opencast-core');
        try {
            opencastEvent = await fetch(url)
            .then(async response => await response.json())
        }
        catch {
            throw new Error('Error fetching opencast episode');
        }
    }
    
    const paellaEpisode = await getPaellaManifestFromOpencastEvent(ocPlayer, opencastEvent, conversionConfig);
    if (paellaEpisode === null) {
        const userName = await ocPlayer.opencastAuth.getLoggedUserName();        
        if (userName === null) {
            ocPlayer.log.info('User not authenticated. Redirecting to authentication...', '@asicupv/paella-opencast-core');
            await ocPlayer.opencastAuth.auth(window.location.href);
        }
        throw new Error('Error loading video manifest.');
    }
    return paellaEpisode;
}

async function getPaellaManifestFromOpencastEvent(player: Paella, episode: any, config?: ConversionConfig): Promise<Manifest | null> {
    // Check if the episode is a search result or an external API event        
    if (episode["search-results"]) {
        player.log.info('opencastEpisodeToManifest: convert!!!!!!!!!!!!', '@asicupv/paella-opencast-core');
        episode = episode["search-results"];
        episode.result = ensureArray(episode.result);
    }
    if (episode?.total === 1 && episode?.result) {
        player.log.info('opencastEpisodeToManifest: Episode is an Opencast search result. Converting to paella manifest!', '@asicupv/paella-opencast-core');
        return await opencastSearchResultToPaellaManifest(player, episode.result[0], config);
    }
    // Check if the episode is an Opencast external API event
    else if (episode.identifier && episode.publications) {
        player.log.info('opencastEpisodeToManifest: Episode is an Opencast external API Event result. Converting to paella manifest!', '@asicupv/paella-opencast-core');
        return opencastExternalAPIEventToPaellaManifest(player, episode, config);
    }
    
    player.log.info('opencastEpisodeToManifest: unknown episode format. Cannot convert to paella manifest!', '@asicupv/paella-opencast-core');
    return null;
}


export const opencastInitParamsDefaultImpl: OpencastInitParams = {
    configResourcesUrl: '/ui/config/paella8/',
    configUrl: '/ui/config/paella8/config.json',
    // repositoryUrl: '',
    // manifestFileName: '',

    loadConfig: defaultLoadConfigFunc,
    getVideoId: defaultGetVideoIdFunc,
    loadVideoManifest: defaultLoadVideoManifestFunc
}