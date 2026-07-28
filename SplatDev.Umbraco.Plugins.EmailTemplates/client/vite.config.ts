import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/email-templates-dashboard.element.ts",
      formats: ["es"],
      fileName: "email-templates-dashboard",
    },
    outDir: "../App_Plugins/SplatDev.EmailTemplates/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/SplatDev.EmailTemplates/dist/",
});
