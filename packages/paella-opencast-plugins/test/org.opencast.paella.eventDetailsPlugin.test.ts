import { beforeEach, describe, expect, test, vi } from 'vitest'
import EventDetailsPlugin from '../src/plugins/org.opencast.paella.eventDetailsPlugin';
import { runButtonPluginTests, runPluginOnlyInOpencastTests, runPopUpButtonPluginTests } from './utils/buttonPluginTests';
import { createMockOCPlayer, createMockPlayer } from './__mocks__/mockPlayer';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';


// Mock del icono SVG
vi.mock('../src/plugins/icons/info.svg?raw', () => ({
  default: '<svg>info-icon</svg>'
}));

// Mock del módulo de plugins
vi.mock('../src/plugins/OpencastPaellaPluginsModule', () => ({
  default: {
    Get: vi.fn(() => ({}))
  }
}));

describe('DescriptionPlugin', () => {
  let plugin: EventDetailsPlugin;
  let mockOcPlayer: any;

  beforeEach(() => {
    mockOcPlayer = {
      ...createMockOCPlayer(),
      episode: {
        description: 'Test episode description'
      },
      videoManifest: {
        metadata: {
          title: 'Test Episode Title',
          subject: 'Test Subject',
          description: 'Test Episode Description',
          language: 'en',
          rightsHolder: 'Test Rights Holder',
          license: 'Test License',
          series: 'test-series-id',
          seriesTitle: 'Test Series Title',
          presenters: ['John Doe', 'Jane Smith'],
          contributors: ['Contributor 1', 'Contributor 2'],
          startDate: new Date('2023-01-01'),
          duration: 3600,
          location: 'Test Location',
          id: 'test-episode-id'
        }
      }
    };
    Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);

    plugin = new EventDetailsPlugin(mockOcPlayer, 'org.opencast.paella.eventDetailsPlugin');
  });

  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);
  
  describe('shoud pass PopUpButtonPlugin Tests', () => {
    runPopUpButtonPluginTests(() => plugin, () => mockOcPlayer);
  });


  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.eventDetailsPlugin');
  });

  describe('applyTemplate()', () => {
    test('should replace simple variable', () => {
      const result = plugin.applyTemplate('/engage/ui/index.html?q=${q}', { q: 'speaker' });
      expect(result).toBe('/engage/ui/index.html?q=speaker');
    });

    test('should replace nested variables using dot notation', () => {
      const result = plugin.applyTemplate('/engage/ui/index.html?epFrom=${series.id}', {
        series: {
          id: 'series-123'
        }
      });
      expect(result).toBe('/engage/ui/index.html?epFrom=series-123');
    });

    test('should keep token when variable is not found', () => {
      const result = plugin.applyTemplate('/engage/ui/index.html?q=${missing}', { q: 'speaker' });
      expect(result).toBe('/engage/ui/index.html?q=${missing}');
    });

    test('should keep original text when template has no variables', () => {
      const input = '/engage/ui/index.html';
      const result = plugin.applyTemplate(input, { q: 'speaker' });
      expect(result).toBe(input);
    });
  });

  describe('getContentTableInfo()', () => {
    test('should return correct table information', async () => {
      const result = await plugin.getContentTableInfo();

      expect(result).toEqual({
        "table": [
          {
            "category": "Video information",
            "rows": [
              {
                "key": "UID",
                "value": "test-episode-id"
              },
              {
                "key": "Title",
                "value": "Test Episode Title"
              },
              {
                "key": "Subject",
                "value": "Test Subject"
              },
              {
                "key": "Description",
                "value": "Test Episode Description"
              },
              {
                "key": "Series",
                "value": "Test Series Title"
              }
            ]
          },
          {
            "category": "Details",
            "rows": [
              {
                "key": "Language",
                "value": "English"
              },
              {
                "key": "Start date",
                "value": "1/1/2023"
              },
              {
                "key": "Duration",
                "value": "01:00:00"
              },
              {
                "key": "Location",
                "value": "Test Location"
              }
            ]
          },
          {
            "category": "People & Rights",
            "rows": [
              {
                "key": "Presenter(s)",
                "value": "John Doe, Jane Smith"
              },
              {
                "key": "Contributor(s)",
                "value": "Contributor 1, Contributor 2"
              },
              {
                "key": "Rights",
                "value": "Test Rights Holder"
              },
              {
                "key": "License",
                "value": "Test License"
              }
            ]
          }
        ]
      });
    });

    test('should handle metadata null gracefully', async () => {
      Object.defineProperty(mockOcPlayer.videoManifest, 'metadata', {
        get: () => null
      });

      const result = await plugin.getContentTableInfo();
      expect(result).toEqual({
        table: [
          {
            category: 'Video information',
            rows: [
              { key: 'UID', value: '' },
              { key: 'Title', value: '' },
              { key: 'Subject', value: '' },
              { key: 'Description', value: '' },
              { key: 'Series', value: '' },
            ],
          },
          {
            category: 'Details',
            rows: [
              { key: 'Language', value: '' },
              { key: 'Start date', value: '' },
              { key: 'Duration', value: '' },
              { key: 'Location', value: '' },
            ],
          },
          {
            category: 'People & Rights',
            rows: [
              { key: 'Presenter(s)', value: '' },
              { key: 'Contributor(s)', value: '' },
              { key: 'Rights', value: '' },
              { key: 'License', value: '' },
            ],
          },
        ]
      });
    });

    test('should handle missing optional fields gracefully', async () => {
      mockOcPlayer.videoManifest.metadata = {
        ...mockOcPlayer.videoManifest.metadata,
        language: null,
        presenters: null,
        contributors: null
      };

      const result = await plugin.getContentTableInfo();
      expect(result).toEqual({
        "table": [
          {
            "category": "Video information",
            "rows": [
              {
                "key": "UID",
                "value": "test-episode-id"
              },
              {
                "key": "Title",
                "value": "Test Episode Title"
              },
              {
                "key": "Subject",
                "value": "Test Subject"
              },
              {
                "key": "Description",
                "value": "Test Episode Description"
              },
              {
                "key": "Series",
                "value": "Test Series Title"
              }
            ]
          },
          {
            "category": "Details",
            "rows": [
              {
                "key": "Language",
                "value": ""
              },
              {
                "key": "Start date",
                "value": "1/1/2023"
              },
              {
                "key": "Duration",
                "value": "01:00:00"
              },
              {
                "key": "Location",
                "value": "Test Location"
              }
            ]
          },
          {
            "category": "People & Rights",
            "rows": [
              {
                "key": "Presenter(s)",
                "value": ""
              },
              {
                "key": "Contributor(s)",
                "value": ""
              },
              {
                "key": "Rights",
                "value": "Test Rights Holder"
              },
              {
                "key": "License",
                "value": "Test License"
              }
            ]
          }
        ]
      });
    });

    test('should include opencast links in key fields when opencast URL is available', async () => {
      Object.defineProperty(mockOcPlayer, 'opencastPresentationUrl', {
        configurable: true,
        get: () => 'http://opencast.example.org'
      });

      const result = await plugin.getContentTableInfo();
      const table = result.table;

      const videoRows = table[0].rows;
      const peopleRows = table[2].rows;

      const uid = videoRows.find((r) => r.key === 'UID')?.value as string;
      const subject = videoRows.find((r) => r.key === 'Subject')?.value as string;
      const series = videoRows.find((r) => r.key === 'Series')?.value as string;
      const presenters = peopleRows.find((r) => r.key === 'Presenter(s)')?.value as string;
      const contributors = peopleRows.find((r) => r.key === 'Contributor(s)')?.value as string;

      expect(uid).toContain('<a href="?id=test-episode-id">test-episode-id</a>');
      expect(subject).toContain('<a href="/engage/ui/index.html?q=Test Subject">Test Subject</a>');
      expect(series).toContain('<a href="/engage/ui/index.html?epFrom=test-series-id">Test Series Title</a>');
      expect(presenters).toContain('<a href="/engage/ui/index.html?q=John Doe">John Doe</a>');
      expect(contributors).toContain('<a href="/engage/ui/index.html?q=Contributor 1">Contributor 1</a>');
    });
  });
});
