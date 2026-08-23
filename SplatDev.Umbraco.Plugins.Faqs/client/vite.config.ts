import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "faqs-dashboard.element": "src/faqs-dashboard.element.ts",
        "faqs-picker.element": "src/faqs-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Faqs/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
