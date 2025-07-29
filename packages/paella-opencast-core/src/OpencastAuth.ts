import type { OpencastPaellaPlayer, OpencastPaellaConfig } from './OpencastPaellaPlayer';
import { ensureArray } from './utils';

const OC_PAELLA8_BASE_URL = import.meta.env.OC_PAELLA8_BASE_URL || '/paella8/ui';

export interface OpencastAuth {
    getLoggedUserName: () => Promise<string | null>

    isAnonymous: () => Promise<boolean>
    canRead: () => Promise<boolean>
    canWrite: () => Promise<boolean>

    auth: (redirectUrl?: string) => Promise<void>
}

export class OpencastAuthDefaultImpl implements OpencastAuth {
    #player: OpencastPaellaPlayer | null = null;
    #userInfo: any = null;

    get player(): OpencastPaellaPlayer | null {
        return this.#player;
    }

    set player(player: OpencastPaellaPlayer) {
        this.#player = player;
    }

    constructor(player?: OpencastPaellaPlayer) {
        this.#player = player ?? null;
    }

    private async getUserInfo() {
        try {
            if (this.#userInfo === null) {
                const ocPresentationUrl = this.#player?.opencastPresentationUrl;
                if (ocPresentationUrl != null) {
                    const url = this.#player?.getUrlFromOpencastServer('/info/me.json');                    
                    if (url) {
                        this.#player?.log.info(`Fetching opencast user from ${url}`, '@asicupv/paella-opencast-core');
                        this.#userInfo = await fetch(url).then(async response => await response.json());
                    }
                }
            }
        }
        catch (err: any) {
            this.#player?.log.error(`Error fetching user info: ${err}`, '@asicupv/paella-opencast-core');
        }        

        return this.#userInfo;
    }

    async getLoggedUserName(){        
        const userInfo = await this.getUserInfo();

        if (userInfo?.userRole && (userInfo?.userRole != 'ROLE_USER_ANONYMOUS')) {
            return userInfo?.user?.username;
        }
        return null;
    }

    async isAnonymous() {
        const username = await this.getLoggedUserName();
        return (username == null);
    }

    async canRead() {
        return true;
    }

    async canWrite() {
        try {
            const userInfo = await this.getUserInfo();
            const currentEvent = this.#player?.getEvent();

            const acl = currentEvent?.acl;

            if (!userInfo || !acl) {
                return false;
            }

            const userRoles = ensureArray(userInfo.roles);
            

            let canWrite = false;
            if (acl) {                

                canWrite = userRoles.some(function(currentRole) {
                    // If the user is an admin, they can write
                    if (currentRole == userInfo.org.adminRole) {
                        return true;
                    }
                    else {
                        // Check if the user has write permissions in the ACL                        
                        return acl.some(function(currentAce) {
                            if (currentRole == currentAce.role) {
                                if (currentAce.action == 'write') {
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                });
            }
            return canWrite;
        }
        catch(err) {
            // If there is an error, we assume the user cannot write
            this.#player?.log.error(`Assuming user cannot write due to error: ${err}`, '@asicupv/paella-opencast-core');
            return false;
        }
    }

    async auth(redirectUrl?: string) {
        if (!this.#player) {
            throw new Error('OpencastAuthDefaultImpl: Player is not set');
        }

        redirectUrl = redirectUrl ?? window.location.href;
        let authUrl: string | null = (this.#player.config as OpencastPaellaConfig).opencast?.auth ?? `${OC_PAELLA8_BASE_URL}/auth.html`;
        if (authUrl.startsWith('http') == false) {
            authUrl = this.#player.getUrlFromOpencastServer(authUrl);
        }
        if (authUrl) {
            const authenticationUrl = `${authUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
            this.#player.log.info(`Redirecting to authentication URL: ${authenticationUrl}`, '@asicupv/paella-opencast-core');
            window.location.href = authenticationUrl;
        }
        else {
            throw new Error('OpencastAuthDefaultImpl: Authentication URL is not available');
        }
    }
}
