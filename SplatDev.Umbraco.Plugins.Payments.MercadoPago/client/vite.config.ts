import { defineConfig } from "vite";
export default defineConfig({
  build: {
    lib: {
      entry: "src/mercadopago-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
    },
    outDir: "../App_Plugins/MercadoPago/dist",
    emptyOutDir: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
