import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/exif-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "exif-dashboard.element.js",
    },
    outDir: "../App_Plugins/Exif/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
