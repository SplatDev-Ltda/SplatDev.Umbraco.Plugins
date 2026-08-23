import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/membertypes-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "membertypes-dashboard.element.js",
    },
    outDir: "../App_Plugins/MemberTypes/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
