import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/twofactor-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "twofactor-dashboard.element.js",
    },
    outDir: "../App_Plugins/2fa/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
