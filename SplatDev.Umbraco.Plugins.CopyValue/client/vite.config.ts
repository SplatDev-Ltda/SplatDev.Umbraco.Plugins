import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Two entries: the Copy Value dashboard, and the property editor UI. The editor
      // had no entry at all — the plugin is named for it and never shipped one.
      entry: {
        "copyvalue-dashboard.element": "src/copyvalue-dashboard.element.ts",
        "copyvalue-property-editor.element": "src/copyvalue-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/CopyValue/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
