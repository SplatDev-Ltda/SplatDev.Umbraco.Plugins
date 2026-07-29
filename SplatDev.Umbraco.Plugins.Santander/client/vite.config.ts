import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/santander-banking-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "santander-banking-dashboard.element.js",
    },
    outDir: "../App_Plugins/SplatDev.Santander/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
