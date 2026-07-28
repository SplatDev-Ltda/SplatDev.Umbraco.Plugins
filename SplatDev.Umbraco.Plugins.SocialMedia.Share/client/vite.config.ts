import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/dashboard.element.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
    },
    outDir: "../App_Plugins/SocialMediaShare/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
