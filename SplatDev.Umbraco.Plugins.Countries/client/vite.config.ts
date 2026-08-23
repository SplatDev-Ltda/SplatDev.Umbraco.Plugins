import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/countries-property-editor.element.ts",
      formats: ["es"],
      fileName: () => "countries-property-editor.element.js",
    },
    outDir: "../App_Plugins/Countries/dist",
    emptyOutDir: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
