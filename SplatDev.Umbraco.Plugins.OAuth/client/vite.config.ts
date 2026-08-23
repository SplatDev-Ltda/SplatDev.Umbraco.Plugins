import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/oauth-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "oauth-dashboard.element.js",
    },
    outDir: "../App_Plugins/OAuth/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
