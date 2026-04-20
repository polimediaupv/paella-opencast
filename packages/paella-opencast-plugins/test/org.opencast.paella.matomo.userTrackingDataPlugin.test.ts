import { beforeEach, describe, expect, test, vi } from 'vitest'
import OpencastMatomoUserTrackingDataPlugin from '../src/plugins/org.opencast.paella.matomo.userTrackingDataPlugin';
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import { runDataPluginTests, runPluginOnlyInOpencastTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';

// Mock del módulo de plugins
vi.mock('../src/plugins/OpencastPaellaPluginsModule', () => ({
  default: {
    Get: vi.fn(() => ({}))
  }
}));

// Mock del plugin base de Matomo
vi.mock('@asicupv/paella-user-tracking', () => ({
  MatomoUserTrackingDataPlugin: class {

    player: any;
    config: any = { logUserId: true };
    
    constructor(player: any) {
      this.player = player;
    }
    
    async isEnabled() {
      return true;
    }
  }
}));

describe('OpencastMatomoUserTrackingDataPlugin', () => {
  let plugin: OpencastMatomoUserTrackingDataPlugin;
  let mockOcPlayer: any;

  beforeEach(() => {
    mockOcPlayer = {
      ...createMockOCPlayer(),
      opencastAuth: {
        getLoggedUserName: vi.fn().mockResolvedValue('testuser')
      }
    };
    Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);

    plugin = new OpencastMatomoUserTrackingDataPlugin(mockOcPlayer);
  });

  runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);
  
  runDataPluginTests(() => plugin, () => mockOcPlayer);

  test('should have correct plugin name', () => {
    expect(plugin.name).toBe('org.opencast.paella.matomo.userTrackingDataPlugin');
  });

  describe('isEnabled', () => {    
    test('should call super.isEnabled for Opencast player', async () => {
    //   plugin.player = mockOcPlayer;
      Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);
      
      // Mock super.isEnabled
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
        .mockResolvedValue(true);
      
      const result = await plugin.isEnabled();
      
      expect(result).toBe(true);
      expect(mockOcPlayer.log.warn).not.toHaveBeenCalled();
    });
  });  

  test('should get current user id', async () => {
    // Mock config with logUserId enabled
    vi.spyOn(plugin, 'config', 'get').mockReturnValue({ logUserId: true });
    
    const userId = await plugin.getCurrentUserId();
    
    expect(mockOcPlayer.opencastAuth.getLoggedUserName).toHaveBeenCalled();
    expect(plugin.opencastUserName).toBe('testuser');
  });

  test('should return null and not call auth when logUserId is false', async () => {
    vi.spyOn(plugin, 'config', 'get').mockReturnValue({ logUserId: false });

    const userId = await plugin.getCurrentUserId();

    expect(userId).toBeNull();
    expect(mockOcPlayer.opencastAuth.getLoggedUserName).not.toHaveBeenCalled();
  });

  test('should log error and return null when getLoggedUserName throws', async () => {
    vi.spyOn(plugin, 'config', 'get').mockReturnValue({ logUserId: true });
    mockOcPlayer.opencastAuth.getLoggedUserName.mockRejectedValue(new Error('auth error'));

    const userId = await plugin.getCurrentUserId();

    expect(userId).toBeNull();
    expect(mockOcPlayer.log.error).toHaveBeenCalledWith(
      'Error getting opencast username',
      expect.stringContaining('[org.opencast.paella.matomo.userTrackingDataPlugin]')
    );
  });

  test('should cache opencastUserName and avoid fetching it on second call', async () => {
    vi.spyOn(plugin, 'config', 'get').mockReturnValue({ logUserId: true });

    const userId1 = await plugin.getCurrentUserId();
    const userId2 = await plugin.getCurrentUserId();

    expect(userId1).toBe('testuser');
    expect(userId2).toBe('testuser');
    expect(mockOcPlayer.opencastAuth.getLoggedUserName).toHaveBeenCalledTimes(1);
  });

  test('should get plugin module instance', () => {
    const moduleInstance = plugin.getPluginModuleInstance();
    expect(moduleInstance).toBeDefined();
  });

  test('should initialize with undefined opencast user name', () => {
    expect(plugin.opencastUserName).toBeUndefined();
  });
});
