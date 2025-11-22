import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },

  define: {
    global: "globalThis", // important pour randombytes
    "process.env": {}, // évite "process is not defined"
    "process.browser": "true",
  },

  resolve: {
    alias: {
      util: "util/",
      events: "events/",
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },

  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
      output: {
        // Split intelligent des chunks pour supprimer les warnings
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["axios", "@tanstack/react-query"],
          motion: ["framer-motion"],
          ui: ["lucide-react"],
          charts: ["recharts"],
        },
      },
    },

    minify: "esbuild", // Plus rapide et plus léger
    sourcemap: false,
    chunkSizeWarningLimit: 1600, // Évite les warnings de taille de bundle
    commonjsOptions: {
      include: [/node_modules/],
    },
  },

  optimizeDeps: {
    include: [
      "axios",
      "@tanstack/react-query",
      "zustand",
      "date-fns",
      "framer-motion",
      "lucide-react",
      "react-hot-toast",
      "react-router-dom",
    ],
  },
});
