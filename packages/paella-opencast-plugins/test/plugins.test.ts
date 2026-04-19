import { beforeEach, describe, expect, test, vi } from 'vitest'
import { 
  opencastPlugins,
  OpencastEventDetailsPlugin,
  OpencastDownloadsPlugin,
  OpencastEditorPlugin,  
  OpencastLoginPlugin,
  OpencastMultiVideoDynamicLayout,
  OpencastMatomoUserTrackingDataPlugin
} from '../src/index'

describe('Plugins', () => {
  test('should export opencastPlugins array', () => {
    expect(opencastPlugins).toBeDefined()
    expect(Array.isArray(opencastPlugins)).toBe(true)
    expect(opencastPlugins.length).toBeGreaterThan(0)
  })

  test('should have correct structure for each plugin configuration', () => {
    opencastPlugins.forEach((pluginConfig, index) => {
      expect(pluginConfig).toHaveProperty('plugin')
      expect(pluginConfig).toHaveProperty('config')
      expect(typeof pluginConfig.plugin).toBe('function')
      expect(typeof pluginConfig.config).toBe('object')
      expect(pluginConfig.config).toHaveProperty('enabled')
      expect(typeof pluginConfig.config.enabled).toBe('boolean')
    })
  })

  test('should export individual plugin classes', () => {
    expect(OpencastEventDetailsPlugin).toBeDefined()
    expect(OpencastDownloadsPlugin).toBeDefined()
    expect(OpencastEditorPlugin).toBeDefined()
    expect(OpencastLoginPlugin).toBeDefined()
    expect(OpencastMultiVideoDynamicLayout).toBeDefined()
    expect(OpencastMatomoUserTrackingDataPlugin).toBeDefined()
  })  

  test('should have all plugins with function constructors', () => {
    const pluginClasses = [
      OpencastEventDetailsPlugin,
      OpencastDownloadsPlugin,
      OpencastEditorPlugin,
      OpencastLoginPlugin,
      OpencastMultiVideoDynamicLayout,
      OpencastMatomoUserTrackingDataPlugin,
    ]

    pluginClasses.forEach(PluginClass => {
      expect(typeof PluginClass).toBe('function')
      expect(PluginClass.name).toBeDefined()
    })
  })

  test('should have correct number of plugins', () => {
    expect(opencastPlugins).toHaveLength(8)
  })
})
