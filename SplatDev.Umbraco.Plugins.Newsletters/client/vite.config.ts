import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/newsletters-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "newsletters-dashboard.element.js",
    },
    outDir: "../App_Plugins/Newsletters/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
