import type { OpencastPaellaPlayer, OpencastPaellaConfig } from './OpencastPaellaPlayer';
import { ensureArray } from './utils';

const OC_PAELLA8_BASE_URL = import.meta.env.OC_PAELLA8_BASE_URL || '/paella8/ui';

export interface OpencastAuth {
    getLoggedUserName: () => Promise<string | null>

    isAnonymous: () => Promise<boolean>
    canRead: () => Promise<boolean>
    canWrite: () => Promise<boolean>

    auth: (redirectUrl?: string, redirectTimeoutMs?: number) => Promise<void>
}

export type OpencastAuthConfig = string | {
    url?: string;
};

export interface OpencastUserInfo {
  org?: OpencastOrg
  roles?: string[]
  userRole?: string
  user?: OpencastUser
}

export interface OpencastOrg {
  id?: string
  name?: string
  adminRole?: string
  anonymousRole?: string
  properties?: Record<string, string>
}

export interface OpencastUser {
  username?: string
  name?: string
  email?: string
  provider?: string
}

export class OpencastAuthDefaultImpl implements OpencastAuth {
    #player: OpencastPaellaPlayer | null = null;
    #userInfo: OpencastUserInfo | null = null;

    get player(): OpencastPaellaPlayer | null {
        return this.#player;
    }

    set player(player: OpencastPaellaPlayer) {
        this.#player = player;
    }

    constructor(player?: OpencastPaellaPlayer) {
        this.#player = player ?? null;
    }

    private async getUserInfo(): Promise<OpencastUserInfo | null> {
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

    async getLoggedUserName(): Promise<string | null> {
        const userInfo = await this.getUserInfo();

        if (userInfo?.userRole && (userInfo?.userRole != 'ROLE_USER_ANONYMOUS')) {
            return userInfo?.user?.username ?? null;
        }
        return null;
    }

    async isAnonymous(): Promise<boolean> {
        const username = await this.getLoggedUserName();
        return (username == null);
    }

    async canRead(): Promise<boolean> {
        return true;
    }

    async canAction(action: string): Promise<boolean> {
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
                    if (currentRole == userInfo?.org?.adminRole) {
                        return true;
                    }
                    else {
                        // Check if the user has write permissions in the ACL                        
                        return acl.some(function(currentAce) {
                            if (currentRole == currentAce.role) {
                                if (currentAce.action == action) {
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

    async canWrite(): Promise<boolean> {
        return this.canAction("write");
    }

    async auth(redirectUrl?: string, redirectTimeoutMs?: number): Promise<void> {
        if (!this.#player) {
            throw new Error('OpencastAuth: Player is not set');
        }

        redirectUrl = redirectUrl ?? window.location.href;
        redirectTimeoutMs = redirectTimeoutMs ?? 2000;
        const authConfig = (this.#player.config as OpencastPaellaConfig).opencast?.auth;
        let authUrl: string | null = typeof authConfig === 'string'
            ? authConfig
            : (authConfig?.url ?? `${OC_PAELLA8_BASE_URL}/auth.html`);
        if (authUrl.startsWith('http') == false) {
            authUrl = this.#player.getUrlFromOpencastServer(authUrl);
        }
        if (authUrl) {
            const authenticationUrl = `${authUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
            this.#player.log.info(`Redirecting to authentication URL: ${authenticationUrl}`, '@asicupv/paella-opencast-core');
            window.location.href = authenticationUrl;
            await new Promise(resolve => setTimeout(resolve, redirectTimeoutMs));
        }
        else {
            throw new Error('OpencastAuth: Authentication URL is not available');
        }
    }
}
