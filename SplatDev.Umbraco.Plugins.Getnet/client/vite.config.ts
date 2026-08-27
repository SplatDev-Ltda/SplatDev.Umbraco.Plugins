import { defineConfig } from "vite";
export default defineConfig({
  build: {
    lib: {
      entry: "src/getnet-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
    },
    outDir: "../App_Plugins/Getnet/dist",
    emptyOutDir: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
