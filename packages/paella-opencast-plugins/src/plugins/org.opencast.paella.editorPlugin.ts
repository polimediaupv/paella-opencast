import { ButtonPlugin, type ButtonPluginConfig } from '@asicupv/paella-core';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';
import LeadPencilIcon from './icons/lead-pencil.svg?raw';

export type OpencastEditorPluginConfig = ButtonPluginConfig & {
    editorUrl?: string;
    showIfAnonymous?: boolean;
    showIfCanWrite?: boolean;
};


export default class OpencastEditorPlugin extends ButtonPlugin {
    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    get name() {
        return super.name || 'org.opencast.paella.editorPlugin';
    }

    get config(): OpencastEditorPluginConfig {
        return super.config as OpencastEditorPluginConfig;
    }    

    getAriaLabel() {
        return this.player.translate('Open video editor');
    }

    getDescription() {
        return this.getAriaLabel();
    }

    async getHelp() {
        return {
            title: this.player.translate('Open video editor'),
            description: this.player.translate('Access the video editor to modify and enhance your video content.')
        };
    }

    async load() {
        this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || LeadPencilIcon;
    }

    async isEnabled() {        
        const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
        if (!isOcPlayer) {
            this.player.log.warn('This plugin is only available in Opencast Paella Player', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
            return false;
        }
        try {
            if (!(await super.isEnabled())) {
                return false;
            }
            else {
                if (this.config.editorUrl) {
                    const ocPlayer: OpencastPaellaPlayer = this.player as OpencastPaellaPlayer;
                    const isAnonymous = await ocPlayer.opencastAuth.isAnonymous();
                    if (isAnonymous) {
                        return (this.config.showIfAnonymous === true);
                    }
                    else if (this.config.showIfCanWrite === true) {
                        const canWrite =  await ocPlayer.opencastAuth.canWrite();
                        return canWrite;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    this.player.log.warn(`Missing 'editorUrl' property in '${this.name}' plugin. Plugin disabled!`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`)
                }
                return false;
            }
        }
        catch (_e) {
            return false;
        }
    }

    async action() {
        const editorUrl  = this.config.editorUrl as string;
        window.location.href = editorUrl.replace('{id}', this.player.videoId);        
    }
}

