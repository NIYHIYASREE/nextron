import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/*
  PERFORMANCE OPTIMISATIONS FOR RENDER.COM
  ─────────────────────────────────────────
  1. Manual chunk splitting — vendor libs cached separately from app code.
     Browser re-downloads only the changed chunk, not the whole bundle.

  2. esbuild minifier (built-in, zero install) — drops dead code, mangles
     names, removes console.* — significantly smaller JS on first load.

  3. Asset inlining threshold 8KB — small images/icons inlined as base64
     instead of separate HTTP requests.

  4. CSS code-splitting enabled (default) — each lazy page chunk gets only
     the CSS it needs, not the entire stylesheet.

  5. Chunk size warning at 400KB so we see if any chunk grows too large.

  6. Source maps disabled in production — smaller files, no info leaked.
*/

export default defineConfig({
  plugins: [react()],

  build: {
    /* esbuild is Vite's built-in minifier — fast, no extra dependency */
    minify: "esbuild",

    /* Inline assets smaller than 8KB as base64 (saves HTTP round trips) */
    assetsInlineLimit: 8192,

    /* Warn if any chunk exceeds 400KB */
    chunkSizeWarningLimit: 400,

    /* No source maps in production */
    sourcemap: false,

    /* esbuild options: drop console/debugger, target modern browsers */
    esbuildOptions: {
      drop: ["console", "debugger"],
      target: ["es2020", "chrome80", "firefox78", "safari14"],
    },

    rollupOptions: {
      output: {
        /*
          Manual chunk strategy:
          ┌─ vendor-react   → react + react-dom + react-router-dom (largest, rarely changes)
          ├─ vendor-motion  → framer-motion (heavy, only changes on upgrades)
          ├─ vendor-icons   → lucide-react (medium, static)
          └─ app chunks     → one per lazy page (tiny, changes often)

          Result: on a re-deploy only the changed app chunks are re-downloaded.
          Vendor chunks stay cached in the browser.
        */
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("/react/")
            ) {
              return "vendor-react";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("firebase") || id.includes("@firebase")) {
              return "vendor-firebase";
            }
            /* All other node_modules → one shared vendor chunk */
            return "vendor-misc";
          }
        },

        /* Predictable, cache-friendly filenames with content hash */
        entryFileNames:  "assets/[name]-[hash].js",
        chunkFileNames:  "assets/[name]-[hash].js",
        assetFileNames:  "assets/[name]-[hash][extname]",
      },
    },
  },

  /* Render.com serves from root — no base path needed */
  base: "/",

  /* Pre-bundle these so Vite doesn't re-analyse on every cold start */
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "firebase/app",
      "firebase/firestore",
      "qrcode",
    ],
  },
});
