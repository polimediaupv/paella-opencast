import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      reporter: ['text', 'html'],
      reportOnFailure: true,
      exclude: [
        'node_modules/',
        '**/dist/',
        '**/test/',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/__tests__/**',
        '.vitepress/',
        '**/types/**',
        '**.local',
        '**/vite.config.*',
        'vitest.config.ts',
        '**/vitest.config.*',
        'coverage/**',
        '**/coverage/**',
        'doc/**'
      ]
    },
  },
})