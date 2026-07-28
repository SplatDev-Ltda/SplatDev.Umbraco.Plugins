import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/analytics-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "analytics-dashboard.element.js",
    },
    outDir: "../App_Plugins/Analytics/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
