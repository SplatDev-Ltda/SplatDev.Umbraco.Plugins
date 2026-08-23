import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/forums-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "forums-dashboard.element.js",
    },
    outDir: "../App_Plugins/Forums/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
