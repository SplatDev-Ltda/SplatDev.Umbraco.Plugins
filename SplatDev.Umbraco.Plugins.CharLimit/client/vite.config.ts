import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Two entries: the dashboard, and the property editor UI. The editor had no entry
      // at all on Umbraco 17 — the schema was registered with no UI to render it, so a
      // Character Limit property fell back to a plain text box and enforced nothing.
      entry: {
        "charlimit-dashboard": "src/dashboards/charlimit-dashboard.element.ts",
        "charlimit-property-editor.element": "src/charlimit-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/CharLimit",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
