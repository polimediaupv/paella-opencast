import { ButtonPlugin } from '@asicupv/paella-core';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';
import AccountIcon from './icons/account.svg?raw';

export default class OpencastLoginPlugin extends ButtonPlugin {
    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    get name() {
        return super.name || 'org.opencast.paella.loginPlugin';
    }

    getAriaLabel() {
        return this.player.translate('Login');
    }

    getDescription() {
        return this.getAriaLabel();
    }

    async getHelp() {
        return {
            title: this.player.translate('Login'),
            description: this.player.translate('Log in to access additional features and personalized content.')
        };
    }

    async load() {
        this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || AccountIcon;
    }

    async isEnabled() {
        const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
        if (!isOcPlayer) {
            this.player.log.warn('This plugin is only available in Opencast Paella Player', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
            return false;
        }
        const ocPlayer: OpencastPaellaPlayer = this.player as OpencastPaellaPlayer;
        try {
            if (!(await super.isEnabled())) {
                return false;
            }
            else {
                const isAnonymous = await ocPlayer.opencastAuth.isAnonymous();
                return isAnonymous;
            }
        }
        catch (_e) {
            return false;
        }
    }

    async action() {        
        const ocPlayer: OpencastPaellaPlayer = this.player as OpencastPaellaPlayer;
        await ocPlayer.opencastAuth.auth();
    }
}

