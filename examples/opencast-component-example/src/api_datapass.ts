import '@asicupv/paella-opencast-component';
import '@asicupv/paella-opencast-component/paella-opencast-component.css';
import paellaConfig from './paella_config.json';

const VIDEO_ID = 'ID-cats';

async function getEventFromExternalAPI(videoId: string) {
    const headersList = {
        Accept: '*/*',
        Authorization: 'Basic YWRtaW46b3BlbmNhc3Q=',
    };

    const response = await fetch(
        `https://stable.opencast.org/api/events/${videoId}?withacl=true&withmetadata=true&withpublications=true`,
        {
            method: 'GET',
            headers: headersList,
        },
    );

    const data = await response.text();
    return data;
}

window.onload = async () => {
    const playerElement = document.getElementsByTagName('paella-opencast-player')[0];

    playerElement.setAttribute('paella-config', JSON.stringify(paellaConfig));
    playerElement.setAttribute('opencast-episode', await getEventFromExternalAPI(VIDEO_ID));
    playerElement.setAttribute('video-id', VIDEO_ID);
};
