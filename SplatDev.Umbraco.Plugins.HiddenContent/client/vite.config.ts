import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "hiddencontent-dashboard.element": "src/hiddencontent-dashboard.element.ts",
        "hiddencontent-property-editor.element": "src/hiddencontent-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/HiddenContent/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
