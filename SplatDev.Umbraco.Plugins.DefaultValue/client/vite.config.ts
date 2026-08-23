import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/defaultvalue-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "defaultvalue-dashboard.element.js",
    },
    outDir: "../App_Plugins/DefaultValue/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
