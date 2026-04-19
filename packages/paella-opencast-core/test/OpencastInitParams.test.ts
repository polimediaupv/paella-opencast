import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { defaultGetVideoIdFunc, defaultLoadConfigFunc, defaultLoadVideoManifestFunc, OpencastPaellaPlayer } from '../src';
import { Config } from '@asicupv/paella-core';
import searchEvent from './mock/episodes/dual.json'
import externalEvent from './mock/episodes/api.json';

const testConfig: Partial<Config> = {
  fallbackId: "test-fallback-id",
}

describe('OpencastInitParams', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('defaultLoadConfigFunc', () => {
    test('should auto-fetch config from URL when no paellaConfig is provided', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      expect(ocPlayer).toBeDefined();

      // Mock de fetch
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({})
        })
      ));

      const config = await defaultLoadConfigFunc('/config.json', ocPlayer)
      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    test('should parse config from JSON string when paellaConfig is provided as text', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { paellaConfig: JSON.stringify(testConfig) } });
      expect(ocPlayer).toBeDefined();

      const config = await defaultLoadConfigFunc('/config.json', ocPlayer)
      expect(config).toBeDefined();
      expect(config).toEqual(testConfig);
    });

    test('should use config object directly when paellaConfig is provided as object', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { paellaConfig: testConfig } });
      expect(ocPlayer).toBeDefined();

      const config = await defaultLoadConfigFunc('/config.json', ocPlayer)
      expect(config).toBeDefined();
      expect(config).toEqual(testConfig);
    });

    test('should throw error when paellaConfig string has invalid JSON format', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { paellaConfig: "invalid-json" } });
      expect(ocPlayer).toBeDefined();

      await expect(async () => await defaultLoadConfigFunc('/config.json', ocPlayer)).rejects.toThrowError();
    });

    test('should throw error when paellaConfig is neither string nor object', async () => {
      const elem: HTMLElement = document.createElement('div');
      const invalidConfig: any = 10;
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { paellaConfig: invalidConfig } });
      expect(ocPlayer).toBeDefined();

      await expect(async () => await defaultLoadConfigFunc('/config.json', ocPlayer)).rejects.toThrowError();
    });

    test('should handle fetch errors gracefully', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      await expect(async () => await defaultLoadConfigFunc('/config.json', ocPlayer)).rejects.toThrowError();
    });

    test('should handle malformed JSON response from fetch', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      ));

      await expect(async () => await defaultLoadConfigFunc('/config.json', ocPlayer)).rejects.toThrowError();
    });

    test('should construct correct URL when loading from Opencast server', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: { presentationUrl: 'http://opencast.example.com' }
      });

      const getUrlSpy = vi.spyOn(ocPlayer, 'getUrlFromOpencastServer').mockReturnValue('http://opencast.example.com/config.json');

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({})
        })
      ));

      await defaultLoadConfigFunc('/config.json', ocPlayer);

      expect(getUrlSpy).toHaveBeenCalledWith('/config.json');
    });

    test('should log appropriate messages during config loading', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { paellaConfig: testConfig } });

      const logSpy = vi.spyOn(ocPlayer.log, 'info').mockImplementation(() => {});

      await defaultLoadConfigFunc('/config.json', ocPlayer);

      expect(logSpy).toHaveBeenCalledWith(
        'Using paella config from object',
        '@asicupv/paella-opencast-core'
      );
    });
  });

  describe('defaultGetVideoIdFunc', () => {
    test('should return video ID from opencast init params when provided', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { videoId: "test-video-id" } });
      expect(ocPlayer).toBeDefined();

      const videoId = await defaultGetVideoIdFunc({} as Config, ocPlayer)

      expect(videoId).toBeDefined();
      expect(videoId).toBe("test-video-id");
    });

    test('should return fallback ID from config when no video ID is provided in params', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      expect(ocPlayer).toBeDefined();

      const videoId = await defaultGetVideoIdFunc({ fallbackId: "test-fallback-id" } as Config, ocPlayer)

      expect(videoId).toBeDefined();
      expect(videoId).toBe("test-fallback-id");
    });

    test('should throw error when no video ID is provided and no fallback exists', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});
      expect(ocPlayer).toBeDefined();

      await expect(async () => await defaultGetVideoIdFunc({} as Config, ocPlayer)).rejects.toThrowError();
    });

    test('should prioritize opencast videoId over URL parameters', async () => {
      // Mock URL parameters
      Object.defineProperty(window, 'location', {
        value: { search: '?id=url-video-id', hash: '' },
        writable: true
      });

      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { videoId: "param-video-id" } });

      const videoId = await defaultGetVideoIdFunc({} as Config, ocPlayer);

      expect(videoId).toBe("param-video-id");
    });

    test('should extract video ID from URL hash parameters when no opencast videoId', async () => {
      Object.defineProperty(window, 'location', {
        value: { search: '', hash: '#id=hash-video-id' },
        writable: true
      });

      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      const videoId = await defaultGetVideoIdFunc({} as Config, ocPlayer);

      expect(videoId).toBe("hash-video-id");
    });

    test('should extract video ID from URL search parameters when no opencast videoId or hash', async () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?id=search-video-id', hash: '' },
        writable: true
      });

      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      const videoId = await defaultGetVideoIdFunc({} as Config, ocPlayer);

      expect(videoId).toBe("search-video-id");
    });

    test('should throw error when video ID is empty string', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { videoId: "" } });

      await expect(async () => await defaultGetVideoIdFunc({} as Config, ocPlayer)).rejects.toThrowError();
    });
  });

  describe('defaultLoadVideoManifestFunc', () => {
    test('should throw error when episode string has invalid JSON format', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { episode: "invalid-json" } });
      expect(ocPlayer).toBeDefined();

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError();
    });

    test('should throw error when episode is valid JSON but has incorrect structure', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { episode: "{}" } });
      expect(ocPlayer).toBeDefined();

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError();
    });

    test('should throw error when fetched episode has invalid JSON response', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });
      expect(ocPlayer).toBeDefined();

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      // Mock de fetch
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve("invalid-format")
        })
      ));

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError();
    });

    test('should throw error when fetched episode has invalid manifest structure', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });
      expect(ocPlayer).toBeDefined();

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      // Mock de fetch
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({})
        })
      ));

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError();
    });

    test('should successfully parse episode with Opencast search result format', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });
      expect(ocPlayer).toBeDefined();

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      // Mock de fetch
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(searchEvent)
        })
      ));

      const result = await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);
      expect(result).toBeDefined();
      expect(Array.isArray(result.streams)).toBe(true);
      expect(result.streams.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.duration).toBeGreaterThan(0);
    });

    test('should successfully parse episode with Opencast external API format', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });
      expect(ocPlayer).toBeDefined();

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      // Mock de fetch
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(externalEvent)
        })
      ));

      const result = await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);
      expect(result).toBeDefined();
      expect(Array.isArray(result.streams)).toBe(true);
      expect(result.streams.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    test('should throw error when presentationUrl is not set and no episode provided', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {});

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError('opencast-presentation-url or video-id not defined.');
    });

    test('should throw error when videoId is not set and no episode provided', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com' } });

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError('opencast-presentation-url or video-id not defined.');
    });

    test('should handle fetch network errors gracefully', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError('Error fetching opencast episode');
    });

    test('should parse episode from opencast episode parameter correctly', async () => {
      const elem: HTMLElement = document.createElement('div');
      const validEpisodeJson = JSON.stringify(searchEvent);
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { episode: validEpisodeJson } });

      const result = await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);
      expect(result).toBeDefined();
      expect(Array.isArray(result.streams)).toBe(true);
      expect(result.streams.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    test('should construct correct URL for episode fetching', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'test-video-id',
        writable: false,
      });

      const getUrlSpy = vi.spyOn(ocPlayer, 'getUrlFromOpencastServer')
        .mockReturnValue('http://example.com/search/episode.json?id=test-video-id&limit=1');

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(searchEvent)
        })
      ));

      await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);

      expect(getUrlSpy).toHaveBeenCalledWith('/search/episode.json?id=test-video-id&limit=1');
    });

    test('should log appropriate messages during manifest loading', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'test-video-id',
        writable: false,
      });

      const logSpy = vi.spyOn(ocPlayer.log, 'info').mockImplementation(() => {});

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(searchEvent)
        })
      ));

      await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);

      expect(logSpy).toHaveBeenCalledWith(
        '================== loadVideoManifest ==================',
        '@asicupv/paella-opencast-core'
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fetching opencast episode'),
        '@asicupv/paella-opencast-core'
      );
    });

    test('should handle wrapped search results correctly', async () => {
      const wrappedSearchEvent = {
        "search-results": searchEvent
      };

      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(wrappedSearchEvent)
        })
      ));

      const result = await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer);
      expect(result).toBeDefined();
      expect(Array.isArray(result.streams)).toBe(true);
      expect(result.streams.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    test('should throw error when getUrlFromOpencastServer returns null', async () => {
      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, { opencast: { presentationUrl: 'http://example.com', videoId: "test-id" } });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'test-video-id',
        writable: false,
      });

      vi.spyOn(ocPlayer, 'getUrlFromOpencastServer').mockReturnValue(null);

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError('Error getting opencast episode URL. opencast-presentation-url is not set.');
    });

    test('should fail and trigger auth flow when wrapped search-results has total 0', async () => {
      const wrappedSearchEventWithNoResults = {
        "search-results": {
          total: 0,
          result: []
        }
      };

      const authMock = {
        getLoggedUserName: vi.fn(async () => null),
        isAnonymous: vi.fn(async () => true),
        canRead: vi.fn(async () => true),
        canWrite: vi.fn(async () => false),
        auth: vi.fn(async () => undefined)
      };

      const elem: HTMLElement = document.createElement('div');
      const ocPlayer = new OpencastPaellaPlayer(elem, {
        opencast: {
          presentationUrl: 'http://example.com',
          videoId: 'test-id',
          auth: authMock
        }
      });

      Object.defineProperty(ocPlayer, 'videoId', {
        value: 'mocked-id',
        writable: false,
      });

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(wrappedSearchEventWithNoResults)
        })
      ));

      const currentHref = window.location.href;

      await expect(async () => await defaultLoadVideoManifestFunc("", {} as Config, ocPlayer)).rejects.toThrowError('Error loading video manifest.');
      expect(authMock.getLoggedUserName).toHaveBeenCalledTimes(1);
      expect(authMock.auth).toHaveBeenCalledWith(currentHref);
    });
  });
});