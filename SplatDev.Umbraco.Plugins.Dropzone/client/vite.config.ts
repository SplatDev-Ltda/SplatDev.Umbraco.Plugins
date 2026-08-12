import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: { "dropzone-dashboard": "src/dropzone-dashboard.element.ts" },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Dropzone/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js" },
    },
  },
});
