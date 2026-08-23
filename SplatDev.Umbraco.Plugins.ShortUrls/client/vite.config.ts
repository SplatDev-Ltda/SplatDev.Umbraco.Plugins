import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/short-urls-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "short-urls-dashboard.element.js",
    },
    outDir: "../App_Plugins/ShortUrls/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
