import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/enotassina-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "enotassina-dashboard.element.js",
    },
    outDir: "../App_Plugins/ENotAssina/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
