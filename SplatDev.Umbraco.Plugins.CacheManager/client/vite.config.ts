import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/cache-manager-dashboard.element.ts",
      formats: ["es"],
      fileName: "cache-manager",
    },
    outDir: "../App_Plugins/CacheManager/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/CacheManager/dist/",
});
