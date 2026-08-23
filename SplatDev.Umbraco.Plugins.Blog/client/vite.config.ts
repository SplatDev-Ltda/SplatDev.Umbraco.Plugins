import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/blog-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "blog-dashboard.element.js",
    },
    outDir: "../App_Plugins/Blog/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
