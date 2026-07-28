import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/slider-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "slider-dashboard.element.js",
    },
    outDir: "../App_Plugins/Slider/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
