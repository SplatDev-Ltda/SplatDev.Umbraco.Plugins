import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "photogallery-dashboard.element": "src/photogallery-dashboard.element.ts",
        "photogallery-picker.element": "src/photogallery-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/PhotoGallery/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
