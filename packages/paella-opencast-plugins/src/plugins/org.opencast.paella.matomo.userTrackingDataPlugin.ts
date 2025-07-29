import { MatomoUserTrackingDataPlugin, type MatomoUserTrackingDataPluginConfig } from '@asicupv/paella-user-tracking';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';


export type OpencastMatomoUserTrackingDataPluginConfig = MatomoUserTrackingDataPluginConfig & {
    logUserId?: boolean;
};

export default class OpencastMatomoUserTrackingDataPlugin extends MatomoUserTrackingDataPlugin<OpencastMatomoUserTrackingDataPluginConfig> {
    public opencastUserName: string | null | undefined;

    getPluginModuleInstance() {
        return OpencastPaellaPluginsModule.Get();
    }

    get name() {
        return super.name || 'org.opencast.paella.matomo.userTrackingDataPlugin';
    }

     

    async isEnabled() {
        const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
        if (!isOcPlayer) {
            this.player.log.warn('This plugin is only available in Opencast Paella Player', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
            return false;
        }

        return await super.isEnabled();
    }

    async getCurrentUserId() {
        const ocPlayer: OpencastPaellaPlayer = this.player as OpencastPaellaPlayer;        
        try {
            if ((this.config.logUserId) && (this.opencastUserName === undefined)) {
                this.opencastUserName = await ocPlayer.opencastAuth.getLoggedUserName();
            }
        }
        catch (e) {
            this.player.log.error('Error getting opencast username', `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
        }

        return this.opencastUserName ?? null;
    }
}
