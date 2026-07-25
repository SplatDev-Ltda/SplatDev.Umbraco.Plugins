import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dashboards/charlimit-dashboard.element.ts",
      formats: ["es"],
      fileName: "charlimit-dashboard",
    },
    outDir: "../App_Plugins/CharLimit",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
