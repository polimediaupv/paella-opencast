import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    resolve: { alias: { src: resolve('src/') } },
    build: {
        sourcemap: true,
        outDir: './dist',
        lib: {
            entry: './src/index.ts',
            formats: ['es', 'cjs', 'iife'],
            name: 'PaellaOpencastComponent',
            fileName: (format) => `paella-opencast-component.${format}.js`
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,                
                assetFileNames: 'paella-opencast-component.[ext]',
                chunkFileNames: "[name].[format].js"
            }
        },
        
    },
    
    plugins: [dts({
        outDir: 'dist/types',
        insertTypesEntry: true
    })],
    test: {
        environment: 'jsdom'        
    }
});
