import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { OpencastPaellaPlayer, OpencastAuthDefaultImpl } from '../src';
import packageJson from '../package.json';


describe('OpencastPaellaPlayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and initialization', () => {
    test('should create a player without initialization parameters', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      expect(ocPlayer).toBeDefined();
      expect(ocPlayer.opencastPresentationUrl).toBeNull();
      expect(ocPlayer.opencastAuth).toBeDefined();
    });

    test('should create a player with opencast presentation URL', () => {
      const elem: HTMLElement = document.createElement('div');
      const presentationUrl = 'https://opencast.example.com';
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl }
      });

      expect(ocPlayer.opencastPresentationUrl).toBe(presentationUrl);
    });

    test('should create a player with custom auth implementation', () => {
      const elem: HTMLElement = document.createElement('div');
      const customAuth = new OpencastAuthDefaultImpl();
      
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { auth: customAuth }
      });

      expect(ocPlayer.opencastAuth).toBe(customAuth);
    });

    test('should use default auth implementation when none provided', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      expect(ocPlayer.opencastAuth).toBeDefined();
      expect(ocPlayer.opencastAuth.constructor.name).toBe('OpencastAuthDefaultImpl');
    });

    test('should handle string container element', () => {
      // Create a div with ID for testing
      const testDiv = document.createElement('div');
      testDiv.id = 'test-container';
      document.body.appendChild(testDiv);

      expect(() => {
        new OpencastPaellaPlayer('test-container', {});
      }).not.toThrow();

      // Cleanup
      document.body.removeChild(testDiv);
    });
  });

  describe('detailedVersion property', () => {
    test('should return correct detailed version information', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      expect(ocPlayer.detailedVersion).toMatchObject({
        "player": packageJson.version,
        "coreLibrary": ocPlayer.version,
        "pluginModules": [],
      });
    });

    test('should include plugin modules in detailed version when available', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      // Mock plugin modules
      vi.spyOn(ocPlayer, 'pluginModules', 'get').mockReturnValue([
        { moduleName: 'test-plugin-1', moduleVersion: '1.0.0' },
        { moduleName: 'test-plugin-2', moduleVersion: '2.1.0' }
      ] as any);

      const detailedVersion = ocPlayer.detailedVersion;

      expect(detailedVersion.pluginModules).toEqual([
        'test-plugin-1: 1.0.0',
        'test-plugin-2: 2.1.0'
      ]);
    });

    test('should handle missing version information gracefully', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      // Mock undefined version
      Object.defineProperty(packageJson, 'version', { value: undefined, configurable: true });

      const detailedVersion = ocPlayer.detailedVersion;

      expect(detailedVersion.player).toBe('unknown');
    });
  });

  describe('getUrlFromOpencastServer method', () => {
    test('should return null when no presentation URL is configured', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      expect(ocPlayer.getUrlFromOpencastServer('')).toBeNull();
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBeNull();
      expect(ocPlayer.getUrlFromOpencastServer('relative/path')).toBeNull();
    });

    test('should construct URLs correctly with relative presentation URL', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: '/' }
      });
      
      expect(ocPlayer.getUrlFromOpencastServer('')).toBe('/');
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBe('/test');
      expect(ocPlayer.getUrlFromOpencastServer('relative/path')).toBe('/relative/path');
    });

    test('should construct URLs correctly with absolute presentation URL', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: 'https://example.com/opencast' }
      });
      
      expect(ocPlayer.getUrlFromOpencastServer('')).toBe('https://example.com/opencast');
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBe('https://example.com/opencast/test');
      expect(ocPlayer.getUrlFromOpencastServer('api/endpoint')).toBe('https://example.com/opencast/api/endpoint');
    });

    test('should handle presentation URL with trailing slash', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: 'https://example.com/opencast/' }
      });
      
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBe('https://example.com/opencast/test');
      expect(ocPlayer.getUrlFromOpencastServer('test')).toBe('https://example.com/opencast/test');
    });

    test('should handle complex URL paths', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: 'https://api.opencast.org/v1' }
      });
      
      expect(ocPlayer.getUrlFromOpencastServer('/search/episode.json?id=123'))
        .toBe('https://api.opencast.org/v1/search/episode.json?id=123');
    });

    test('should handle localhost URLs with ports', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: 'http://localhost:8080/opencast' }
      });
      
      expect(ocPlayer.getUrlFromOpencastServer('/api/info/me.json'))
        .toBe('http://localhost:8080/opencast/api/info/me.json');
    });
  });

  describe('getEvent method', () => {
    test('should return undefined when no video manifest is loaded', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      expect(ocPlayer.getEvent()).toBeUndefined();
    });

    test('should return undefined when video manifest has no metadata', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      // Mock videoManifest with no metadata
      vi.spyOn(ocPlayer, 'videoManifest', 'get').mockReturnValue({
        metadata: null
      } as any);
      
      expect(ocPlayer.getEvent()).toBeUndefined();
    });

    test('should return event when video manifest contains ocEvent', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      const mockEvent = {
        id: 'test-event-id',
        metadata: { title: 'Test Event' }
      };
      
      // Mock videoManifest with ocEvent
      vi.spyOn(ocPlayer, 'videoManifest', 'get').mockReturnValue({
        metadata: {
          ocEvent: mockEvent
        }
      } as any);
      
      expect(ocPlayer.getEvent()).toBe(mockEvent);
    });
  });

  describe('applyOpencastTheme method', () => {
    test('should apply theme from config successfully', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      // Mock loadConfig to return a config with theme
      const mockConfig = {
        opencast: {
          theme: 'custom-theme'
        }
      };
      
      vi.spyOn(ocPlayer, 'initParams', 'get').mockReturnValue({
        loadConfig: vi.fn().mockResolvedValue(mockConfig),
        configUrl: '/config.json',
        configResourcesUrl: '/resources/'
      } as any);
      
      // Mock getUrlFromOpencastServer
      const getUrlSpy = vi.spyOn(ocPlayer, 'getUrlFromOpencastServer').mockReturnValue('https://example.com/resources/custom-theme/theme.json');
      
      // Mock skin.loadSkin method
      const loadSkinSpy = vi.spyOn(ocPlayer.skin, 'loadSkin').mockResolvedValue();
      
      await ocPlayer.applyOpencastTheme();
      
      expect(getUrlSpy).toHaveBeenCalledWith('/resources/custom-theme/theme.json');
      expect(loadSkinSpy).toHaveBeenCalledWith('https://example.com/resources/custom-theme/theme.json');
    });

    test('should apply default opencast theme successfully', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      // Mock skin.loadSkin method
      const loadSkinSpy = vi.spyOn(ocPlayer.skin, 'loadSkin').mockResolvedValue();
      
      await ocPlayer.applyOpencastTheme();
      
      expect(loadSkinSpy).toHaveBeenCalledWith(expect.any(Object));
    });

    test('should handle theme loading errors gracefully', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      
      // Mock skin.loadSkin to throw error
      vi.spyOn(ocPlayer.skin, 'loadSkin').mockRejectedValue(new Error('Theme not found'));
      
      // Should not throw
      await expect(ocPlayer.applyOpencastTheme()).resolves.toBeUndefined();
    });
  });


  describe('Integration tests', () => {
    test('should properly initialize all components together', () => {
      const elem: HTMLElement = document.createElement('div');
      const authServer = new OpencastAuthDefaultImpl()
      const initParams = {
        opencast: {
          presentationUrl: 'https://opencast.example.com',
          videoId: 'test-video-123',
          auth: authServer
        }
      };
      
      const ocPlayer = new OpencastPaellaPlayer(elem, initParams);
      authServer.player = ocPlayer; // Set player reference in auth server
      
      expect(ocPlayer.opencastPresentationUrl).toBe('https://opencast.example.com');
      expect(ocPlayer.opencastAuth).toBe(initParams.opencast.auth);
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBe('https://opencast.example.com/test');
      expect(ocPlayer.detailedVersion).toBeDefined();
    });

    test('should handle empty opencast configuration', () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: {} });
      
      expect(ocPlayer.opencastPresentationUrl).toBeNull();
      expect(ocPlayer.opencastAuth).toBeDefined();
      expect(ocPlayer.getUrlFromOpencastServer('/test')).toBeNull();
    });
  });
});