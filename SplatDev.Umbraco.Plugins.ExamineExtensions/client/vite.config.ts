import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/examine-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "examine-dashboard.element.js",
    },
    outDir: "../App_Plugins/ExamineExtensions/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
