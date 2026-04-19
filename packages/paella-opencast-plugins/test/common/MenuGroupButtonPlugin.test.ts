import { describe, expect, test, vi } from 'vitest';
import MenuGroupButtonPlugin from '../../src/plugins/common/MenuGroupButtonPlugin';
import { createMockPlayer } from '../__mocks__/mockPlayer';

vi.mock('../../src/plugins/icons/download.svg?raw', () => ({
  default: '<svg>download-icon</svg>'
}));

describe('MenuGroupButtonPlugin', () => {
  test('should initialize with empty items', () => {
    const player = createMockPlayer();
    const plugin = new MenuGroupButtonPlugin(player as any, 'menu-group');

    expect(plugin.items).toEqual([]);
    expect((plugin as any)._buttonPlugins).toHaveLength(0);
  });

  test('should create nested MenuGroupButtonPlugin for items with data.items', () => {
    const player = createMockPlayer();
    const plugin = new MenuGroupButtonPlugin(player as any, 'menu-group', {}, [
      {
        id: 'parent',
        title: 'Parent',
        data: {
          items: [
            {
              id: 'child-1',
              title: 'Child 1',
              data: {
                url: 'https://example.com/child-1.mp4'
              }
            }
          ]
        }
      }
    ] as any);

    expect(plugin.items).toHaveLength(1);
    expect((plugin as any)._buttonPlugins).toHaveLength(1);
    expect((plugin as any)._buttonPlugins[0] instanceof MenuGroupButtonPlugin).toBe(true);
  });

  test('should create link plugin for items with data.url only', async () => {
    const player = createMockPlayer();
    const plugin = new MenuGroupButtonPlugin(player as any, 'menu-group', {}, [
      {
        id: 'download-track',
        title: 'Download track',
        data: {
          url: 'https://example.com/track.mp4'
        }
      }
    ] as any);

    expect((plugin as any)._buttonPlugins).toHaveLength(1);

    const linkPlugin = (plugin as any)._buttonPlugins[0];
    expect(linkPlugin.isAnchor).toBe(true);
    await expect(linkPlugin.getAnchorUrl()).resolves.toBe('https://example.com/track.mp4');
  });

  test('setter items should build _buttonPlugins for mixed groups and links', async () => {
    const player = createMockPlayer();
    const plugin = new MenuGroupButtonPlugin(player as any, 'menu-group');

    plugin.items = [
      {
        id: 'group-1',
        title: 'Group 1',
        data: {
          items: [
            {
              id: 'g1-item-1',
              title: 'Group item',
              data: {
                url: 'https://example.com/g1-item-1.mp4'
              }
            }
          ]
        }
      },
      {
        id: 'link-1',
        title: 'Link 1',
        data: {
          url: 'https://example.com/link-1.mp4'
        }
      }
    ] as any;

    expect(plugin.items).toHaveLength(2);
    expect((plugin as any)._buttonPlugins).toHaveLength(2);
    expect((plugin as any)._buttonPlugins[0] instanceof MenuGroupButtonPlugin).toBe(true);

    const secondPlugin = (plugin as any)._buttonPlugins[1];
    expect(secondPlugin.isAnchor).toBe(true);
    await expect(secondPlugin.getAnchorUrl()).resolves.toBe('https://example.com/link-1.mp4');
  });
});
