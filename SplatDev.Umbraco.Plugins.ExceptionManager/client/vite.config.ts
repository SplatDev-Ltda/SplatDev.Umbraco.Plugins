import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/exception-manager-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "exception-manager-dashboard.element.js",
    },
    outDir: "../App_Plugins/ExceptionManager/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
