import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/form-builder-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "form-builder-dashboard.element.js",
    },
    outDir: "../wwwroot/App_Plugins/SplatDev.FormBuilder/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
