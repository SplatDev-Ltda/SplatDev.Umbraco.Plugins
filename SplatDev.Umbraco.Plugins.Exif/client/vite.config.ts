import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Two entries: the dashboard, and the EXIF tab that appears on a media item.
      // A single-entry config would have left the workspace view unbuilt while its
      // manifest entry pointed confidently at a file vite never emitted.
      entry: {
        "exif-dashboard.element": "src/exif-dashboard.element.ts",
        "exif-media-view.element": "src/exif-media-view.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Exif/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js" },
    },
  },
});
