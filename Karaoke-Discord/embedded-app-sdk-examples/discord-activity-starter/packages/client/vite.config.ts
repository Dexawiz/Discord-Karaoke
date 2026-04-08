import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	envDir: '../../',
	server: {
		allowedHosts: true,
		port: 3000,
		strictPort: true,
		proxy: {
            '/api-ws': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api-ws/, '')
            }
        },
		hmr: {
			protocol: 'wss',    
     		host: 'virtual-dark-being-java.trycloudflare.com',
			port: 443,
		},
	},
});
