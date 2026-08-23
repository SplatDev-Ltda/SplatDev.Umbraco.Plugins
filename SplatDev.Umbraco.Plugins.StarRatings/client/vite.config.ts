import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "star-ratings-dashboard.element": "src/star-ratings-dashboard.element.ts",
        "starratings-property-editor.element": "src/starratings-property-editor.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/StarRatings/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
