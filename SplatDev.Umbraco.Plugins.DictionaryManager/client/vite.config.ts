import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dictionarymanager-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "dictionarymanager-dashboard.element.js",
    },
    outDir: "../App_Plugins/DictionaryManager/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
