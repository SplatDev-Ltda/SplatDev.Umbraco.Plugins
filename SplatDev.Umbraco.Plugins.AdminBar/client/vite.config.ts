import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/adminbar-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "adminbar-dashboard.element.js",
    },
    outDir: "../App_Plugins/AdminBar/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
