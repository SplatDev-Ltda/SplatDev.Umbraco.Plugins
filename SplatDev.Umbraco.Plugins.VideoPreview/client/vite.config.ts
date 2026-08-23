import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "dashboard": "src/dashboard.element.ts",
        "videopreview-property-editor.element": "src/videopreview-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/VideoPreview/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
