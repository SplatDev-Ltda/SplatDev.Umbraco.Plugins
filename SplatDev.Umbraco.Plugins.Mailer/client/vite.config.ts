import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/mailer-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "mailer-dashboard.element.js",
    },
    outDir: "../App_Plugins/Mailer/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
