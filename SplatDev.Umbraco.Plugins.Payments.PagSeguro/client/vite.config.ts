import { defineConfig } from "vite";
export default defineConfig({
  build: {
    lib: {
      entry: "src/pagseguro-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
    },
    outDir: "../App_Plugins/PagSeguro/dist",
    emptyOutDir: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
