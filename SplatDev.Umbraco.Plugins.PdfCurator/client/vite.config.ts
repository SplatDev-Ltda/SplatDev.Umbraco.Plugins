import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "pdfc-dashboard-wrapper.element":
          "src/pdfc-dashboard-wrapper.element.ts",
        "pdfc-library-wrapper.element": "src/pdfc-library-wrapper.element.ts",
        "pdfc-review-wrapper.element": "src/pdfc-review-wrapper.element.ts",
        "pdfc-reports-wrapper.element": "src/pdfc-reports-wrapper.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/PdfCurator/dist",
    emptyOutDir: true,
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
