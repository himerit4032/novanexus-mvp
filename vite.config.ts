// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // Tailwind CSS v4 (Vite ì „ìš© í”ŒëŸ¬ê·¸ì¸)
    tailwindcss(),
    // SvelteKit
    sveltekit(),
  ],

  server: {
    port: 5173,
    strictPort: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  // Vitest ì„¤ì • (ë‹¨ìœ„í…ŒìŠ¤íŠ¸/ì»´í¬ë„ŒíŠ¸ í…ŒìŠ¤íŠ¸)
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
  },
});

