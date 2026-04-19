import { beforeEach, describe, expect, test, vi } from 'vitest'
import MultiVideoDynamicLayout from '../src/plugins/org.opencast.paella.multiVideoDynamicLayout';
import { runUserInterfacePluginTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';

// Mock del módulo de plugins
vi.mock('../src/plugins/OpencastPaellaPluginsModule', () => ({
  default: {
    Get: vi.fn(() => ({}))
  }
}));

describe('MultiVideoDynamicLayout', () => {
  let layout: MultiVideoDynamicLayout;
  let mockOcPlayer: any;

  beforeEach(() => {
    mockOcPlayer = createMockOCPlayer();
    layout = new MultiVideoDynamicLayout(mockOcPlayer);
  });
  
  runUserInterfacePluginTests(() => layout, () => mockOcPlayer);

  test('should have correct plugin name', () => {
    expect(layout.name).toBe('org.opencast.paella.multiVideoDynamicLayout');
  });

  test('should have correct identifier', () => {
    expect(layout.identifier).toBe('multiple-video-dynamic');
  });

  test('should have correct layout type', () => {
    expect(layout.layoutType).toBe('dynamic');
  });

  test('should initialize with undefined current videos', () => {
    expect(layout._currentVideos).toBeUndefined();
  });

  test('should load successfully', async () => {
    await layout.load();
    expect(mockOcPlayer.log.debug).toHaveBeenCalledWith('Multi video layout loaded', expect.anything());
  });

  test('should get valid streams', () => {
    const mockStreamData = { id: 'test-stream' };
    const validStreams = layout.getValidStreams(mockStreamData as any);
    expect(validStreams).toEqual([mockStreamData]);
  });

  // test getLayoutStructure
  test('should get layout structure with valid content ids', () => {
    const mockStreamData = [{ content: 'test-content-1' }, { content: 'test-content-2' }];
    const layoutStructure = layout.getLayoutStructure(mockStreamData as any);
    
    expect(layoutStructure.id).toEqual("multiple-video-dynamic");
    expect(layoutStructure.videos).toEqual([
      {
        "content": "test-content-1",
        "rect": [],
        "size": 50,
        "visible": true,
      },
      {
        "content": "test-content-2",
        "rect": [],
        "size": 50,
        "visible": true,
      },
    ]);
  });

  test('should set size 100 when there is only one stream', () => {
    const mockStreamData = [{ content: 'single-content' }];
    const layoutStructure = layout.getLayoutStructure(mockStreamData as any);

    expect(layoutStructure.videos).toHaveLength(1);
    expect(layoutStructure.videos[0]).toMatchObject({
      content: 'single-content',
      size: 100,
      visible: true,
      rect: []
    });
  });

  test('should distribute size across three streams', () => {
    const mockStreamData = [
      { content: 'content-1' },
      { content: 'content-2' },
      { content: 'content-3' }
    ];
    const layoutStructure = layout.getLayoutStructure(mockStreamData as any);

    expect(layoutStructure.videos).toHaveLength(3);
    layoutStructure.videos.forEach((video) => {
      expect(video.size).toBeCloseTo(33.3333333333, 6);
      expect(video.visible).toBe(true);
    });
  });

  test('should return empty videos list when streamData is empty', () => {
    const layoutStructure = layout.getLayoutStructure([] as any);

    expect(layoutStructure.id).toBe('multiple-video-dynamic');
    expect(layoutStructure.videos).toEqual([]);
  });

  test('should keep cached videos on subsequent getLayoutStructure calls', () => {
    const firstStreams = [{ content: 'first-a' }, { content: 'first-b' }];
    const secondStreams = [{ content: 'second-a' }];

    const firstLayout = layout.getLayoutStructure(firstStreams as any);
    const secondLayout = layout.getLayoutStructure(secondStreams as any);

    expect(secondLayout.videos).toEqual(firstLayout.videos);
    expect(secondLayout.videos).toHaveLength(2);
    expect(secondLayout.videos[0].content).toBe('first-a');
    expect(secondLayout.videos[1].content).toBe('first-b');
  });
  
  test('should return the same valid content ids', () => {    
    const validContentIds = layout.getValidContentIds();
    
    expect(validContentIds).toEqual([]);
  });

});
