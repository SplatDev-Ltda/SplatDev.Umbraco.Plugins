import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dashboards/schema-export-dashboard.element.ts",
      formats: ["es"],
      fileName: "schema2yaml-dashboard",
    },
    outDir: "../wwwroot/App_Plugins/Schema2Yaml",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
