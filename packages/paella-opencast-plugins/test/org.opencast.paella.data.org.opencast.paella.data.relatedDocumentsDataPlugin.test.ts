import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { runPluginOnlyInOpencastTests, runDataPluginTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';
import RelatedDocuments from '../src/plugins/org.opencast.paella.data.relatedDocumentsDataPlugin';


describe('RelatedDocuments', () => {
  let plugin: RelatedDocuments;
  let mockOcPlayer: any;

  beforeEach(() => {
    mockOcPlayer = createMockOCPlayer();
    plugin = new RelatedDocuments(mockOcPlayer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);

  describe('shoud pass DataPlugin Tests', () => {
    runDataPluginTests(() => plugin, () => mockOcPlayer);
  });

  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.data.relatedDocumentsDataPlugin');
  });

  describe('read', () => {
    test('should return empty list and log error when docs config is missing', async () => {
      Object.defineProperty(mockOcPlayer, 'metadata', {
        configurable: true,
        get: () => ({
          ocEvent: {
            attachments: [],
            tracks: []
          }
        })
      });

      Object.defineProperty(plugin as any, 'config', {
        configurable: true,
        get: () => ({})
      });

      const result = await plugin.read('file.content', 'ignored');

      expect(result).toEqual([]);
      expect(mockOcPlayer.log.error).toHaveBeenCalledWith(
        'Plugin not configured correctly: No files section configured',
        expect.stringContaining('[org.opencast.paella.data.relatedDocumentsDataPlugin]')
      );
    });

    test('should return content and media when configured docs match event attachments/tracks', async () => {
      Object.defineProperty(mockOcPlayer, 'metadata', {
        configurable: true,
        get: () => ({
          ocEvent: {
            attachments: [
              {
                id: 'att-1',
                flavor: 'dublincore/episode',
                url: 'http://example.com/episode.txt',
                mimetype: 'text/plain',
                tags: []
              }
            ],
            tracks: [
              {
                id: 'trk-1',
                flavor: 'presenter/delivery',
                url: 'http://example.com/video.mp4',
                mimetype: 'video/mp4',
                tags: []
              }
            ]
          }
        })
      });

      Object.defineProperty(plugin as any, 'config', {
        configurable: true,
        get: () => ({
          docs: [
            {
              title: 'Episode Notes',
              content: {
                flavor: 'dublincore/episode'
              }
            },
            {
              title: 'Video Source',
              media: {
                flavor: 'presenter/delivery'
              }
            },
            {
              title: 'Not found',
              content: {
                flavor: 'no/match'
              }
            }
          ]
        })
      });

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('DOC_CONTENT')
        })
      ));

      const result = await plugin.read('file.content', 'ignored');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        title: 'Episode Notes',
        content: {
          data: 'DOC_CONTENT',
          mimeType: 'text/plain'
        }
      });
      expect(result[1]).toMatchObject({
        title: 'Video Source',
        media: {
          url: 'http://example.com/video.mp4',
          mimeType: 'video/mp4'
        }
      });
    });

    test('should not include content when attachment fetch fails with non-ok response', async () => {
      Object.defineProperty(mockOcPlayer, 'metadata', {
        configurable: true,
        get: () => ({
          ocEvent: {
            attachments: [
              {
                id: 'att-1',
                flavor: 'dublincore/episode',
                url: 'http://example.com/episode.txt',
                mimetype: 'text/plain',
                tags: []
              }
            ],
            tracks: []
          }
        })
      });

      Object.defineProperty(plugin as any, 'config', {
        configurable: true,
        get: () => ({
          docs: [
            {
              title: 'Episode Notes',
              content: {
                flavor: 'dublincore/episode'
              }
            }
          ]
        })
      });

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve('IGNORED')
        })
      ));

      const result = await plugin.read('file.content', 'ignored');
      expect(result).toEqual([]);
    });

    test('should include both content and media when same doc matches attachment and track', async () => {
      Object.defineProperty(mockOcPlayer, 'metadata', {
        configurable: true,
        get: () => ({
          ocEvent: {
            attachments: [
              {
                id: 'att-1',
                flavor: 'notes/source',
                url: 'http://example.com/notes.txt',
                mimetype: 'text/plain',
                tags: []
              }
            ],
            tracks: [
              {
                id: 'trk-1',
                flavor: 'video/source',
                url: 'http://example.com/video.mp4',
                mimetype: 'video/mp4',
                tags: []
              }
            ]
          }
        })
      });

      Object.defineProperty(plugin as any, 'config', {
        configurable: true,
        get: () => ({
          docs: [
            {
              title: 'Combined Doc',
              content: {
                flavor: 'notes/source'
              },
              media: {
                flavor: 'video/source'
              }
            }
          ]
        })
      });

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('COMBINED_CONTENT')
        })
      ));

      const result = await plugin.read('file.content', 'ignored');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        title: 'Combined Doc',
        content: {
          data: 'COMBINED_CONTENT',
          mimeType: 'text/plain'
        },
        media: {
          url: 'http://example.com/video.mp4',
          mimeType: 'video/mp4'
        }
      });
    });
  });

});