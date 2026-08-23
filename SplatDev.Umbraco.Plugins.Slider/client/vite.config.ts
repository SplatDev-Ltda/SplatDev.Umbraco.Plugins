import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "slider-dashboard.element": "src/slider-dashboard.element.ts",
        "slider-picker.element": "src/slider-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Slider/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
