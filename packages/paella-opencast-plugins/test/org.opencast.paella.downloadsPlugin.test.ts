import { beforeEach, describe, expect, test, vi } from 'vitest'
import DownloadsPlugin from '../src/plugins/org.opencast.paella.downloadsPlugin';
import { runPluginOnlyInOpencastTests, runPopUpButtonPluginTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';

// Mock del módulo de plugins
// vi.mock('../src/plugins/OpencastPaellaPluginsModule', () => ({
//   default: {
//     Get: vi.fn(() => ({}))
//   }
// }));

// Mock del icono SVG
vi.mock('../src/plugins/icons/tag.svg?raw', () => ({
  default: '<svg>tag-icon</svg>'
}));

describe('DownloadsPlugin', () => {
  let plugin: DownloadsPlugin;
  let mockOcPlayer: any;

  const setConfig = (config: any) => {
    Object.defineProperty(plugin as any, 'config', {
      configurable: true,
      get: () => config
    });
  };

  const setMetadata = (metadata: any) => {
    Object.defineProperty(mockOcPlayer, 'metadata', {
      configurable: true,
      get: () => metadata
    });
  };

  beforeEach(() => {
    mockOcPlayer = createMockOCPlayer();
    plugin = new DownloadsPlugin(mockOcPlayer);
    vi.restoreAllMocks();
  });

  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);

  describe('shoud pass PopUpButtonPlugin Tests', () => {
    runPopUpButtonPluginTests(() => plugin, () => mockOcPlayer);
  });


  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.downloadsPlugin');
  });

  // test('menuAction should trigger download', async () => {

  // });

  test('getDownloadableContent should return correct items', async () => {
    const mockEvent = {
      tracks: [
        { id: 'track1', flavor: 'video/mp4', mimetype: 'video/mp4', url: 'https://example.com/track1.mp4', video: { width: 1920, height: 1080, framerate: 30 } },
        { id: 'track2', flavor: 'audio/mp3', mimetype: 'audio/mp3', url: 'https://example.com/track2.mp3', audio: { channels: 2, samplingrate: 44100 } }
      ],
      attachments: [
        { id: 'attachment1', flavor: 'captions/en', mimetype: 'text/vtt', url: 'https://example.com/captions.vtt', tags: ['captions', 'lang:en'] }
      ]
    };

    mockOcPlayer.getEvent = vi.fn(() => mockEvent);

    const downloadableContent = await plugin.getDownloadableContent();

    expect(downloadableContent).toEqual([
      {
        "id": "tracks",
        "title": "Tracks",
        "data": {
          "items": [
            {
              "id": "video/mp4",
              "title": "video/mp4",
              "data": {
                "items": [
                  {
                    "id": "track1",
                    "title": "[video/mp4] 1920x1080 30fps",
                    "data": {
                      "url": "https://example.com/track1.mp4"
                    }
                  }
                ]
              }
            },
            {
              "id": "audio/mp3",
              "title": "audio/mp3",
              "data": {
                "items": [
                  {
                    "id": "track2",
                    "title": "[audio/mp3] 2 channels 44100Hz",
                    "data": {
                      "url": "https://example.com/track2.mp3"
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "id": "attachments",
        "title": "Attachments",
        "data": {
          "items": [
            {
              "id": "captions/en",
              "title": "captions/en",
              "data": {
                "items": [
                  {
                    "id": "attachment1",
                    "title": "[text/vtt] English",
                    "data": {
                      "url": "https://example.com/captions.vtt"
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]);
  });

  describe('filterElements', () => {
    const elements = [
      { id: '1', flavor: 'presenter/delivery', mimetype: 'video/mp4', tags: ['download', 'tag-a'], url: 'https://example.com/1' },
      { id: '2', flavor: 'presentation/delivery', mimetype: 'video/mp4', tags: ['tag-b'], url: 'https://example.com/2' },
      { id: '3', flavor: 'captions/vtt+en', mimetype: 'text/vtt', tags: ['captions', 'lang:en'], url: 'https://example.com/3' }
    ];

    test('should return all elements when no filter config is provided', () => {
      const filtered = plugin.filterElements(elements as any, {});
      expect(filtered).toHaveLength(3);
    });

    test('should filter by flavor', () => {
      const filtered = plugin.filterElements(elements as any, {
        downloadFlavors: ['presenter/delivery']
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    test('should filter by tags', () => {
      const filtered = plugin.filterElements(elements as any, {
        downloadTags: ['captions']
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });

    test('should filter by mime type', () => {
      const filtered = plugin.filterElements(elements as any, {
        downloadMimeTypes: ['text/vtt']
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });

    test('should apply AND logic for combined filters', () => {
      const filtered = plugin.filterElements(elements as any, {
        downloadFlavors: ['presenter/delivery', 'presentation/delivery'],
        downloadTags: ['tag-a'],
        downloadMimeTypes: ['video/mp4']
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    test('should exclude all elements when filter arrays are empty', () => {
      const filtered = plugin.filterElements(elements as any, {
        downloadFlavors: []
      });
      expect(filtered).toHaveLength(0);
    });
  });

  describe('convertToDownloadableContent', () => {
    test('should convert video tracks with resolution and fps in title', () => {
      const items = plugin.convertToDownloadableContent([
        {
          id: 'v1',
          flavor: 'presenter/delivery',
          mimetype: 'video/mp4',
          url: 'https://example.com/v1.mp4',
          video: { width: 1920, height: 1080, framerate: 30 }
        }
      ] as any);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('presenter/delivery');
      expect(items[0].data?.items?.[0].title).toBe('[video/mp4] 1920x1080 30fps');
    });

    test('should convert audio tracks with channels and sample rate', () => {
      const items = plugin.convertToDownloadableContent([
        {
          id: 'a1',
          flavor: 'presentation/delivery',
          mimetype: 'audio/mp3',
          url: 'https://example.com/a1.mp3',
          audio: { channels: 2, samplingrate: 44100 }
        }
      ] as any);

      expect(items[0].data?.items?.[0].title).toBe('[audio/mp3] 2 channels 44100Hz');
    });

    test('should convert captions using language description', () => {
      const items = plugin.convertToDownloadableContent([
        {
          id: 'c1',
          flavor: 'captions/vtt+en',
          mimetype: 'text/vtt',
          url: 'https://example.com/c1.vtt',
          tags: []
        }
      ] as any);

      expect(items[0].data?.items?.[0].title).toContain('[text/vtt]');
    });

    test('should fallback to mimetype or Unknown type', () => {
      const withMime = plugin.convertToDownloadableContent([
        {
          id: 'u1',
          flavor: 'other/flavor',
          mimetype: 'application/octet-stream',
          url: 'https://example.com/u1'
        }
      ] as any);
      expect(withMime[0].data?.items?.[0].title).toBe('application/octet-stream');

      const withoutMime = plugin.convertToDownloadableContent([
        {
          id: 'u2',
          flavor: 'other/flavor-2',
          url: 'https://example.com/u2'
        }
      ] as any);
      expect(withoutMime[0].data?.items?.[0].title).toBe('Unknown type');
    });

    test('should group multiple items by flavor', () => {
      const items = plugin.convertToDownloadableContent([
        {
          id: 'v1',
          flavor: 'presenter/delivery',
          mimetype: 'video/mp4',
          url: 'https://example.com/v1.mp4',
          video: { width: 1280, height: 720, framerate: 25 }
        },
        {
          id: 'v2',
          flavor: 'presenter/delivery',
          mimetype: 'video/mp4',
          url: 'https://example.com/v2.mp4',
          video: { width: 1920, height: 1080, framerate: 30 }
        }
      ] as any);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('presenter/delivery');
      expect(items[0].data?.items).toHaveLength(2);
    });
  });

  describe('isEnabled', () => {
    const forceBaseEnabled = () => {
      const baseProto = Object.getPrototypeOf(Object.getPrototypeOf(plugin));
      vi.spyOn(baseProto, 'isEnabled').mockResolvedValue(true);
    };

    test('should be enabled when license is allowed and downloadable content exists', async () => {
      forceBaseEnabled();
      setConfig({ enabled: true, enableOnLicenses: ['CC-BY-SA'] });
      setMetadata({ license: 'CC-BY-SA' });
      vi.spyOn(plugin, 'getDownloadableContent').mockResolvedValue([
        { id: 'tracks', title: 'Tracks', data: { items: [{ id: 'x', title: 't', data: { url: 'u' } }] } }
      ] as any);

      const enabled = await plugin.isEnabled();
      expect(enabled).toBe(true);
    });

    test('should be disabled when license is not allowed', async () => {
      forceBaseEnabled();
      setConfig({ enabled: true, enableOnLicenses: ['CC-BY'] });
      setMetadata({ license: 'CC-BY-SA' });
      const contentSpy = vi.spyOn(plugin, 'getDownloadableContent');

      const enabled = await plugin.isEnabled();
      expect(enabled).toBe(false);
      expect(contentSpy).not.toHaveBeenCalled();
    });

    test('should be enabled when write permission is required and canWrite is true', async () => {
      forceBaseEnabled();
      setConfig({ enabled: true, enableOnWritePermission: true, enableOnLicenses: ['NOT-MATCHING'] });
      setMetadata({ license: 'CC-BY-SA' });
      mockOcPlayer.opencastAuth.canWrite.mockResolvedValue(true);
      vi.spyOn(plugin, 'getDownloadableContent').mockResolvedValue([
        { id: 'tracks', title: 'Tracks', data: { items: [{ id: 'x', title: 't', data: { url: 'u' } }] } }
      ] as any);

      const enabled = await plugin.isEnabled();
      expect(enabled).toBe(true);
      expect(mockOcPlayer.opencastAuth.canWrite).toHaveBeenCalled();
    });

    test('should be disabled when write permission is required and canWrite is false', async () => {
      forceBaseEnabled();
      setConfig({ enabled: true, enableOnWritePermission: true, enableOnLicenses: ['NOT-MATCHING'] });
      setMetadata({ license: 'CC-BY-SA' });
      mockOcPlayer.opencastAuth.canWrite.mockResolvedValue(false);

      const enabled = await plugin.isEnabled();
      expect(enabled).toBe(false);
    });

    test('should be disabled when downloadable content is empty', async () => {
      forceBaseEnabled();
      setConfig({ enabled: true, enableOnLicenses: ['CC-BY-SA'] });
      setMetadata({ license: 'CC-BY-SA' });
      vi.spyOn(plugin, 'getDownloadableContent').mockResolvedValue([] as any);

      const enabled = await plugin.isEnabled();
      expect(enabled).toBe(false);
    });
  });

});