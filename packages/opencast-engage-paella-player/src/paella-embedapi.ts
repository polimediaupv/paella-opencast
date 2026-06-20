import {type VideoIdToUrlCallback} from '@asicupv/paella-embedapi';

declare global {  
  interface Window {    
    paellaVideoIdToUrl?: VideoIdToUrlCallback;
  }
}

const currentScript: any = document.currentScript;


// This is an example implementation of the paellaVideoIdToUrl callback function
// This function allways returns the same video URL regardless of the video ID requested
function paellaVideoIdToUrl (id: string) : string {
    console.debug(`paellaVideoIdToUrl called with id: ${id}`);

    try {
        const scriptUrl = new URL(currentScript?.src);
        const videoUrl = `${scriptUrl.protocol}//${scriptUrl.host}/play/${id}`;

        return videoUrl;
    }
    catch (e) {
        throw new Error(`Error constructing video URL: ${e}`);
    }
}



window.paellaVideoIdToUrl = paellaVideoIdToUrl;