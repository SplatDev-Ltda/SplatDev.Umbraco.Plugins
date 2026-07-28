import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/newsletter-dashboard.element.ts",
      formats: ["es"],
      fileName: "newsletter-dashboard",
    },
    outDir: "../App_Plugins/SplatDev.Newsletter/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/SplatDev.Newsletter/dist/",
});
