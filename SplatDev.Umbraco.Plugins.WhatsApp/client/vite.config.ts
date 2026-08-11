import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "wa-inbox.element": "src/wa-inbox.element.ts",
        "wa-send.element": "src/wa-send.element.ts",
        "wa-templates.element": "src/wa-templates.element.ts",
        "wa-status.element": "src/wa-status.element.ts",
        "wa-contacts.element": "src/wa-contacts.element.ts",
      },
      formats: ["es"],
    },
    outDir: "../App_Plugins/WhatsApp/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // The backoffice supplies these at runtime; bundling them would ship a
      // second copy of Lit and break context consumption.
      external: [/^@umbraco/],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
