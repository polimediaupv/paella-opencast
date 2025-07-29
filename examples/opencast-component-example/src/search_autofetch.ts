import '@asicupv/paella-opencast-component';
import '@asicupv/paella-opencast-component/paella-opencast-component.css';
import paellaConfig from './paella_config.json'




window.onload = async () => {
    const playerElement = document.getElementsByTagName('paella-opencast-player')[0];
    playerElement.setAttribute('paella-config', JSON.stringify(paellaConfig));
}