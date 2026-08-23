import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/tweets-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "tweets-dashboard.element.js",
    },
    outDir: "../App_Plugins/Tweets/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
