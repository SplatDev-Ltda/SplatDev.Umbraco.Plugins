import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "rsvp-dashboard.element": "src/rsvp-dashboard.element.ts",
        "rsvp-picker.element": "src/rsvp-picker.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/Rsvp/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
