import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "quick-poll-dashboard.element": "src/quick-poll-dashboard.element.ts",
        "quickpoll-picker.element": "src/quickpoll-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/QuickPoll/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
