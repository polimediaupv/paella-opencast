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
            formats: ['es'],
            name: 'paella-opencast-plugins',
            fileName: (format) => `paella-opencast-plugins.${format}.js`
        },
        rollupOptions: {
            output: {
                assetFileNames: 'paella-opencast-plugins.[ext]'
            },
            external: [                
                '@asicupv/paella-opencast-core',
                '@asicupv/paella-user-tracking'
            ]
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
