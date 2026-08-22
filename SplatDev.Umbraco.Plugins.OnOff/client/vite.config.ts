import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Two entries: the Feature Toggles dashboard, and the on/off property editor UI.
      // The editor used to have no entry at all — its markup existed but nothing built
      // or registered it.
      entry: {
        "onoff-dashboard.element": "src/onoff-dashboard.element.ts",
        "onoff-property-editor.element": "src/onoff-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/OnOff/dist",
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
