import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dashboards/yaml2schema-dashboard.element.ts",
      formats: ["es"],
      fileName: "yaml2schema-dashboard",
    },
    outDir: "../wwwroot/App_Plugins/Yaml2Schema",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
