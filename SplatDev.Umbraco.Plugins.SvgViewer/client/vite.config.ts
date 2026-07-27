import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "svg-viewer-dashboard": "src/svg-viewer-dashboard.element.ts",
        "svg-viewer-property-editor": "src/svg-viewer-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/SvgViewer/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/SvgViewer/dist/",
});
