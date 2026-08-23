import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/customlogin-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "customlogin-dashboard.element.js",
    },
    outDir: "../App_Plugins/CustomLogin/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
