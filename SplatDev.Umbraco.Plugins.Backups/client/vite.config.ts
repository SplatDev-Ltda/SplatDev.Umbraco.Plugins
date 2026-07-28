import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/backups-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "backups-dashboard.element.js",
    },
    outDir: "../App_Plugins/Backups/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
