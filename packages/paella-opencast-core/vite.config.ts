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
            name: 'paella-opencast-core',
            fileName: (format) => `paella-opencast-core.${format}.js`
        },
        rollupOptions: {
            output: {
                assetFileNames: 'paella-opencast-core.[ext]'
            },
            external: [ "@asicupv/paella-core" ]
        }
    },
    plugins: [dts({
        outDir: 'dist/types',
        insertTypesEntry: true
    })],
    test: {
        environment: 'jsdom'
    }
});
