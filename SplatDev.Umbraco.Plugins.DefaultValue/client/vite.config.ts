import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "defaultvalue-dashboard.element": "src/defaultvalue-dashboard.element.ts",
        "defaultvalue-property-editor.element": "src/defaultvalue-property-editor.element.ts",
      },
      formats: ["es"],
      fileName: (_f, name) => `${name}.js`,
    },
    outDir: "../App_Plugins/DefaultValue/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
