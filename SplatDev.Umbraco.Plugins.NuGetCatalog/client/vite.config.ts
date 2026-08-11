import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: { "nuget-catalog.element": "src/nuget-catalog.element.ts" },
      formats: ["es"],
    },
    outDir: "../App_Plugins/NuGetCatalog/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // The backoffice supplies these at runtime; bundling them would ship a second
      // copy of Lit and break context consumption.
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js" },
    },
  },
});
