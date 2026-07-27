import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/d4sign-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "d4sign-dashboard.element.js",
    },
    outDir: "../App_Plugins/D4Sign/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
