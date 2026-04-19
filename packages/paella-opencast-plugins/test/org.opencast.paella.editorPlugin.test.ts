import { beforeEach, describe, expect, test, vi } from 'vitest'
import EditorPlugin from '../src/plugins/org.opencast.paella.editorPlugin';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import { runButtonPluginTests, runPluginOnlyInOpencastTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';

// Mock del icono SVG
vi.mock('../src/plugins/icons/lead-pencil.svg?raw', () => ({
  default: '<svg>lead-pencil-icon</svg>'
}));

// Mock del módulo de plugins
vi.mock('../src/plugins/OpencastPaellaPluginsModule', () => ({
  default: {
    Get: vi.fn(() => ({}))
  }
}));

// Mock del objeto window
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/video.html',
  },
  writable: true,
});

describe('EditorPlugin', () => {
  let plugin: EditorPlugin;  
  let mockOcPlayer: any;
  // let mockOpencastAuth: any;

  beforeEach(() => {
    // Mock del opencast auth
    // mockOpencastAuth = {
    //   isAnonymous: vi.fn(),
    //   canWrite: vi.fn()
    // };

    // Mock del player básico    
    // mockPlayer = {
    //   log: {
    //     warn: vi.fn()
    //   },
    //   getCustomPluginIcon: vi.fn(),
    //   videoId: 'test-video-id'
    // };

    // Mock del OpencastPaellaPlayer
    mockOcPlayer = createMockOCPlayer();
    // mockOcPlayer = {
    //   ...mockPlayer,
    //   opencastAuth: mockOpencastAuth,
    //   episode: {
    //     id: 'test-episode-id'
    //   }
    // };

    plugin = new EditorPlugin(mockOcPlayer);
  });


  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);

  describe('ButtonPluginTests', () => {
    runButtonPluginTests(() => plugin, () => mockOcPlayer);
  });

  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.editorPlugin');
  });


  

  describe('isEnabled', () => {
    test('should return false and log warning when editorUrl is missing', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled to return true
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter to return empty config
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({});
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
      expect(mockOcPlayer.log.warn).toHaveBeenCalledWith(
        `Missing 'editorUrl' property in 'org.opencast.paella.editorPlugin' plugin. Plugin disabled!`,
        expect.anything()
      );
    });

    test('should return configured value for anonymous user when showIfAnonymous is true', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}',
        showIfAnonymous: true
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(true);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(true);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
    });

    test('should return false for anonymous user when showIfAnonymous is false', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}',
        showIfAnonymous: false
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(true);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
    });

    test('should check canWrite when showIfCanWrite is true for authenticated user', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}',
        showIfCanWrite: true
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(false);
      mockOcPlayer.opencastAuth.canWrite.mockResolvedValue(true);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(true);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
      expect(mockOcPlayer.opencastAuth.canWrite).toHaveBeenCalled();
    });

    test('should return false when user cannot write and showIfCanWrite is true', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}',
        showIfCanWrite: true
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(false);
      mockOcPlayer.opencastAuth.canWrite.mockResolvedValue(false);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
      expect(mockOcPlayer.opencastAuth.canWrite).toHaveBeenCalled();
    });

    test('should return true for authenticated user when showIfCanWrite is false', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}',
        showIfCanWrite: false
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(false);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(true);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
      expect(mockOcPlayer.opencastAuth.canWrite).not.toHaveBeenCalled();
    });

    test('should return false when authentication throws an error', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}'
      });
      
      mockOcPlayer.opencastAuth.isAnonymous.mockRejectedValue(new Error('Auth error'));
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
    });

    test('should return false when super.isEnabled throws an error', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockRejectedValue(new Error('Super error'));
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('action', () => {
    test('should redirect to editor URL with video ID replaced', async () => {
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}'
      });
      
      await plugin.action();
      
      const expectedUrl = 'http://editor.example.com/edit/test-video-id';
      expect(window.location.href).toBe(expectedUrl);
    });

    test('should handle complex editor URLs with multiple parameters', async () => {
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}?param=value&another=test'
      });
      
      await plugin.action();
      
      const expectedUrl = 'http://editor.example.com/edit/test-video-id?param=value&another=test';
      expect(window.location.href).toBe(expectedUrl);
    });

    test('should handle video IDs with special characters', async () => {
      mockOcPlayer.videoId = 'video-id-with-special@chars#123';
      
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/{id}'
      });
      
      await plugin.action();
      
      const expectedUrl = 'http://editor.example.com/edit/video-id-with-special@chars#123';
      expect(window.location.href).toBe(expectedUrl);
    });

    test('should handle URLs without {id} placeholder', async () => {
      // Mock config getter
      vi.spyOn(plugin, 'config', 'get').mockReturnValue({
        editorUrl: 'http://editor.example.com/edit/static-url'
      });
      
      await plugin.action();
      
      const expectedUrl = 'http://editor.example.com/edit/static-url';
      expect(window.location.href).toBe(expectedUrl);
    });
  });
});
