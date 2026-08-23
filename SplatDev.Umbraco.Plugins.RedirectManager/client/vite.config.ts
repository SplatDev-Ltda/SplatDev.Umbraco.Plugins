import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/redirect-manager-dashboard.element.ts",
      formats: ["es"],
      fileName: "redirect-manager",
    },
    outDir: "../App_Plugins/RedirectManager/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/RedirectManager/dist/",
});
