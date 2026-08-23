import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/memberregistration-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "memberregistration-dashboard.element.js",
    },
    outDir: "../App_Plugins/MemberRegistration/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
