import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/news-ticker-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "news-ticker-dashboard.element.js",
    },
    outDir: "../App_Plugins/NewsTicker/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
