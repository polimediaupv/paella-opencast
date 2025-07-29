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
            formats: ['es', 'cjs'],
            fileName: (format) => `paella-opencast-skin.${format}.js`
        },                
        rollupOptions: {            
            output: {
                assetFileNames: 'paella-opencast-skin.[ext]'
            }
        }
    },
    plugins: [dts({
        outDir: 'dist/types',
        insertTypesEntry: true
    })]
});
