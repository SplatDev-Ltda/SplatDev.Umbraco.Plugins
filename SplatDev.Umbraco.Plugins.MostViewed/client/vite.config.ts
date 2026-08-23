import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/most-viewed-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "most-viewed-dashboard.element.js",
    },
    outDir: "../App_Plugins/MostViewed/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
