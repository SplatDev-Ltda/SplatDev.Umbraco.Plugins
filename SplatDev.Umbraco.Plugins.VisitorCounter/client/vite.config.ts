import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/visitor-counter-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "visitor-counter-dashboard.element.js",
    },
    outDir: "../App_Plugins/VisitorCounter/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
