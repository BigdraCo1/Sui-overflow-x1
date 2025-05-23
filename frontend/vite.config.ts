import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/blockchain-retriever': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('%c[PROXY ERROR]', 'background:red;color:white', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('%c[PROXY REQUEST]', 'background:blue;color:white', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('%c[PROXY RESPONSE]', 'background:green;color:white', 
              req.url, proxyRes.statusCode);
          });
        },
      },
      '/api': {
        target: 'https://aggregator.walrus-testnet.walrus.space/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
