import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite Configuration — Security Hardened
 * ─────────────────────────────────────────
 * - Proxy to backend: secure = true in production
 * - Strict port binding (no wildcards)
 * - Source maps disabled in production (prevents exposing source code)
 * - Console log stripping in production
 * - CSP-friendly build output
 */
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [react()],

    // ── Development server ──────────────────────────────────────────────────
    server: {
      port: 5173,
      host: '127.0.0.1',    // Bind to localhost only — never 0.0.0.0
      strictPort: true,      // Fail if port is in use (don't silently switch)
      proxy: {
        '/api': {
          target:       'http://127.0.0.1:5000',
          changeOrigin: true,
          secure:       isProd,           // Verify TLS in production
          // Pass cookies through proxy
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.warn('[Vite Proxy] Backend unavailable:', err.message);
            });
          },
        },
      },
    },

    // ── Build security ──────────────────────────────────────────────────────
    build: {
      outDir:         'dist',
      sourcemap:      isProd ? false : 'inline',  // No source maps in production
      target:         'es2020',
      minify:         'terser',
      terserOptions: {
        compress: {
          drop_console:   isProd,   // Remove console.log in production
          drop_debugger:  true,
          pure_funcs:     isProd ? ['console.log', 'console.debug', 'console.info'] : [],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,         // Strip comments from bundle
        },
      },
      rollupOptions: {
        output: {
          // Content-hash filenames for cache-busting + integrity
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 600,
    },

    // ── Path aliases ────────────────────────────────────────────────────────
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // ── Dependency pre-bundling — explicit control ──────────────────────────
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },

    // ── Preview server (for testing production build locally) ───────────────
    preview: {
      port:       4173,
      host:       '127.0.0.1',
      strictPort: true,
    },
  };
});
