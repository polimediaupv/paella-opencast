import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { Event, OpencastAuthServer, OpencastPaellaPlayer } from '../src';



describe('OpencastAuth', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('should initialize with default values when no player is provided', async () => {
        const auth = new OpencastAuthServer();
        
        expect(auth).toBeDefined();
        expect(auth.player).toBeNull();        
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(await auth.canWrite()).toBe(false);
    });

    test('should allow setting player after instantiation', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {});
        const auth = new OpencastAuthServer();
        
        expect(auth.player).toBeNull();
        
        auth.player = ocPlayer;
        
        expect(auth.player).toBe(ocPlayer);
    });

    test('should initialize with player when provided in constructor', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {});
        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(auth.player).toBe(ocPlayer);
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(await auth.canWrite()).toBe(false);
    });

    test('should handle anonymous user with ROLE_ANONYMOUS correctly', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "org": {
                "anonymousRole": "ROLE_ANONYMOUS",
                "name": "Opencast Project",
                "adminRole": "ROLE_ADMIN",
                "id": "mh_default_org",
                "properties": {
                    "org.opencastproject.admin.help.documentation.url": "https://docs.opencast.org",
                    "org.opencastproject.oaipmh.server.hosturl": "",
                    "org.opencastproject.admin.mediamodule.url": "/engage/ui",
                    "org.opencastproject.admin.help.restdocs.url": "/rest_docs.html"
                }
            },
            "roles": [
                "ROLE_ANONYMOUS"
            ],
            "userRole": "ROLE_USER_ANONYMOUS",
            "user": {
                "username": "anonymous"
            }
        };

        // Mock de fetch
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(auth.player).toBe(ocPlayer);
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(await auth.canWrite()).toBe(false);
    });

    test('should handle authenticated admin user correctly', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "org": {
                "anonymousRole": "ROLE_ANONYMOUS",
                "name": "Opencast Project",
                "adminRole": "ROLE_ADMIN",
                "id": "mh_default_org",
                "properties": {
                    "org.opencastproject.admin.help.documentation.url": "https://docs.opencast.org",
                    "org.opencastproject.oaipmh.server.hosturl": "",
                    "org.opencastproject.admin.mediamodule.url": "/engage/ui",
                    "org.opencastproject.admin.help.restdocs.url": "/rest_docs.html"
                }
            },
            "roles": [
                "ROLE_USER",
                "ROLE_GROUP_MH_DEFAULT_ORG_SYSTEM_ADMINS",
                "ROLE_ADMIN",
                "ROLE_SUDO",
                "ROLE_USER_ADMIN",
                "ROLE_ANONYMOUS",
                "ROLE_OAUTH_USER"
            ],
            "userRole": "ROLE_USER_ADMIN",
            "user": {
                "provider": "opencast",
                "name": "Administrator",
                "username": "admin"
            }
        };

        // Mock de fetch
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(auth.player).toBe(ocPlayer);
        expect(await auth.getLoggedUserName()).toBe('admin');
        expect(await auth.isAnonymous()).toBe(false);
        expect(await auth.canWrite()).toBe(false);
    });

    test('should handle regular authenticated user correctly', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "org": {
                "anonymousRole": "ROLE_ANONYMOUS",
                "name": "Opencast Project",
                "adminRole": "ROLE_ADMIN",
                "id": "mh_default_org"
            },
            "roles": [
                "ROLE_USER",
                "ROLE_ANONYMOUS"
            ],
            "userRole": "ROLE_USER",
            "user": {
                "provider": "opencast",
                "name": "John Doe",
                "username": "johndoe"
            }
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(await auth.getLoggedUserName()).toBe('johndoe');
        expect(await auth.isAnonymous()).toBe(false);
        expect(await auth.canWrite()).toBe(false);
    });

    test('should handle network errors gracefully', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        // Mock fetch to reject
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.reject(new Error('Network error'))
        ));

        // Mock log.error
        const logErrorSpy = vi.spyOn(ocPlayer.log, 'error').mockImplementation(() => {});

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(await auth.canWrite()).toBe(false);
        expect(logErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error fetching user info'),
            '@asicupv/paella-opencast-core'
        );
    });

    test('should handle invalid JSON response gracefully', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        // Mock fetch to return invalid JSON
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.reject(new Error('Invalid JSON'))
            })
        ));

        const logErrorSpy = vi.spyOn(ocPlayer.log, 'error').mockImplementation(() => {});

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(logErrorSpy).toHaveBeenCalled();
    });

    test('should not fetch user info when presentation URL is not set', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {});

        const fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    test('should cache user info and not refetch on subsequent calls', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "userRole": "ROLE_USER",
            "user": {
                "username": "testuser"
            }
        };

        const fetchSpy = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        );
        vi.stubGlobal('fetch', fetchSpy);

        const auth = new OpencastAuthServer(ocPlayer);        
        
        // First call
        const username1 = await auth.getLoggedUserName();
        expect(username1).toBe('testuser');
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        
        // Second call should use cached data
        const username2 = await auth.getLoggedUserName();
        expect(username2).toBe('testuser');
        expect(fetchSpy).toHaveBeenCalledTimes(1); // No additional fetch
    });

    test('should handle missing user object in response', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "userRole": "ROLE_USER"
            // Missing user object
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        const auth = new OpencastAuthServer(ocPlayer);        
        
        expect(await auth.getLoggedUserName()).toBeNull();
        expect(await auth.isAnonymous()).toBe(true);
    });


    test('should log info message when fetching user data', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "userRole": "ROLE_USER",
            "user": {
                "username": "testuser"
            }
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        const logInfoSpy = vi.spyOn(ocPlayer.log, 'info').mockImplementation(() => {});

        const auth = new OpencastAuthServer(ocPlayer);        
        
        await auth.getLoggedUserName();
        
        expect(logInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('Fetching opencast user from'),
            '@asicupv/paella-opencast-core'
        );
    });

    test('should return true for canWrite when user has write permissions', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "roles": ["ROLE_USER", "ROLE_WRITER"],
            "org": {
                "adminRole": "ROLE_ADMIN"
            },
            "user": {
                "username": "writer"
            }
        };

        const fakeEvent: Event = {
            id: "event-123",
            acl: [
                { role: "ROLE_WRITER", action: "write", allow: false },
                { role: "ROLE_USER", action: "read", allow: false }
            ]
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        vi.spyOn(ocPlayer, 'getEvent').mockReturnValue(fakeEvent);

        const auth = new OpencastAuthServer(ocPlayer);

        expect(await auth.canWrite()).toBe(true);
    });

    test('should return false for canWrite when user lacks write permissions', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "roles": ["ROLE_USER"],
            "org": {
                "adminRole": "ROLE_ADMIN"
            },
            "user": {
                "username": "reader"
            }
        };

        const fakeEvent: Event = {
            id: "event-123",
            acl: [
                { role: "ROLE_WRITER", action: "write", allow: false },
                { role: "ROLE_USER", action: "read", allow: false }
            ]
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        vi.spyOn(ocPlayer, 'getEvent').mockReturnValue(fakeEvent);

        const auth = new OpencastAuthServer(ocPlayer);

        expect(await auth.canWrite()).toBe(false);
    });

    test('should return true for canWrite when user is an admin', async () => {
        const elem: HTMLElement = document.createElement('div');
        const ocPlayer = new OpencastPaellaPlayer(elem, {
            opencast: {
                presentationUrl: '/'
            }
        });

        const fakeData = {
            "roles": ["ROLE_ADMIN"],
            "org": {
                "adminRole": "ROLE_ADMIN"
            },
            "user": {
                "username": "admin"
            }
        };

        const fakeEvent: Event = {
            id: "event-123",
            acl: [
                { role: "ROLE_WRITER", action: "write", allow: false },
                { role: "ROLE_USER", action: "read", allow: false }
            ]
        };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeData)
            })
        ));

        vi.spyOn(ocPlayer, 'getEvent').mockReturnValue(fakeEvent);

        const auth = new OpencastAuthServer(ocPlayer);

        expect(await auth.canWrite()).toBe(true);
    });
});