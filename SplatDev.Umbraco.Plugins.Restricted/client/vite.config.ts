import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Two entries: the dashboard listing restricted nodes, and the property editor that
      // restricts the page you are on. The plugin shipped only the first, so protecting a
      // page meant leaving it to go and find it in a list.
      entry: {
        "restricted-dashboard.element": "src/restricted-dashboard.element.ts",
        "restricted-property-editor.element": "src/restricted-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Restricted/dist",
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
