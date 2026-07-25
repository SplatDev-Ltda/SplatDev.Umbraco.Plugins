import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/jsonrpc-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "jsonrpc-dashboard.element.js",
    },
    outDir: "../App_Plugins/JsonRpc/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
