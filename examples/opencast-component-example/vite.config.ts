import { type Connect, defineConfig, type ViteDevServer } from 'vite';
import { resolve } from 'path';




export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        search_autofetch: resolve(__dirname, 'search_autofetch.html'),
        search_datapass: resolve(__dirname, 'search_datapass.html'),
        api_datapass: resolve(__dirname, 'api_datapass.html'),
      }
    },    
  }
});