import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/photogallery-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "photogallery-dashboard.element.js",
    },
    outDir: "../App_Plugins/PhotoGallery/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
