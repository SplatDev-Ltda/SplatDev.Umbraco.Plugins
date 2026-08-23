import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/memberlogin-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "memberlogin-dashboard.element.js",
    },
    outDir: "../App_Plugins/MemberLogin/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
