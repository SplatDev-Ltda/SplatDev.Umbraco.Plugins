import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/membergroups-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "membergroups-dashboard.element.js",
    },
    outDir: "../App_Plugins/MemberGroups/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
