import { beforeEach, describe, expect, test, vi } from 'vitest'
import LoginPlugin from '../src/plugins/org.opencast.paella.loginPlugin';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import { runButtonPluginTests, runPluginOnlyInOpencastTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';

// Mock del icono SVG
vi.mock('../src/plugins/icons/account.svg?raw', () => ({
  default: '<svg>account-icon</svg>'
}));

// Mock del objeto window
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/video.html',
  },
  writable: true,
});

describe('LoginPlugin', () => {
  let plugin: LoginPlugin;
  let mockOcPlayer: any;
  // let mockOpencastAuth: any;

  beforeEach(() => {
    // // Mock del opencast auth
    // mockOpencastAuth = {
    //   isAnonymous: vi.fn()
    // };

    mockOcPlayer = createMockOCPlayer();
    // // Mock del player básico
    // mockPlayer = {
    //   log: {
    //     warn: vi.fn()
    //   },
    //   getCustomPluginIcon: vi.fn(),
    // };

    // // Mock del OpencastPaellaPlayer
    // mockOcPlayer = {
    //   ...mockPlayer,
    //   opencastAuth: mockOpencastAuth
    // };

    plugin = new LoginPlugin(mockOcPlayer);
  });

  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);

  describe('ButtonPluginTests', () => {
    runButtonPluginTests(() => plugin, () => mockOcPlayer);
  });
  
  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.loginPlugin');
  });




  describe('isEnabled', () => {    
    test('should return true when super.isEnabled is true and user is anonymous', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled to return true
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(true);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(true);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
      expect(mockOcPlayer.log.warn).not.toHaveBeenCalled();
    });

    test('should return false when super.isEnabled is true but user is authenticated', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled to return true
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      mockOcPlayer.opencastAuth.isAnonymous.mockResolvedValue(false);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
      expect(mockOcPlayer.opencastAuth.isAnonymous).toHaveBeenCalled();
    });

    test('should return false when opencastAuth throws an error', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled to return true
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      mockOcPlayer.opencastAuth.isAnonymous.mockRejectedValue(new Error('Auth error'));
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
    });

    test('should return false when super.isEnabled throws an error', async () => {
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled to throw error
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockRejectedValue(new Error('Super error'));
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('action', () => {
    test('should redirect to authentication URL with current location as redirect parameter', async () => {
      const complexUrl = 'http://localhost:3000/video.html?id=123&param=value with spaces';
      window.location.href = complexUrl;
      
      await plugin.action();      
      expect(mockOcPlayer.opencastAuth.auth).toHaveBeenCalled();      
    });
  });
});
