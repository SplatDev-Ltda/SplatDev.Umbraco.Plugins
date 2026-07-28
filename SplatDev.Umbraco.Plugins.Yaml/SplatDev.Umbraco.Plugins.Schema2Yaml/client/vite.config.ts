import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dashboards/schema-export-dashboard.element.ts",
      formats: ["es"],
      fileName: "schema2yaml-dashboard",
    },
    outDir: "../wwwroot/App_Plugins/Schema2Yaml/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/Schema2Yaml/dist/",
});
