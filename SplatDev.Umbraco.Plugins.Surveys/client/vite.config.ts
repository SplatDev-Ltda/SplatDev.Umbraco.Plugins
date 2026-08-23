import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "surveys-dashboard.element": "src/surveys-dashboard.element.ts",
        "surveys-picker.element": "src/surveys-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Surveys/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
