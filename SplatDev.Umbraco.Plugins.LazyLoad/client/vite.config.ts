import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/lazyload-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "lazyload-dashboard.element.js",
    },
    outDir: "../App_Plugins/LazyLoad/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/LazyLoad/dist/",
});
