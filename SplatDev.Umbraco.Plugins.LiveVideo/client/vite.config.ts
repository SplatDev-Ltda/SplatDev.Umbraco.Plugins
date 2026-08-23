import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "dashboard": "src/dashboard.element.ts",
        "livevideo-property-editor.element": "src/livevideo-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/LiveVideo/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
