import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5174,
  },

  build: {
    outDir: "dist",
    sourcemap: false,           // no sourcemaps in production build
    minify: "esbuild",
    target: "es2020",
    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching
        manualChunks: {
          react:    ["react", "react-dom"],
          router:   ["react-router-dom"],
          ui:       ["lucide-react"],
        },
      },
    },
    // Warn if any chunk exceeds 600 kB
    chunkSizeWarningLimit: 600,
  },

  // Expose only VITE_* prefixed vars — never server-side secrets
  envPrefix: "VITE_",
}));
