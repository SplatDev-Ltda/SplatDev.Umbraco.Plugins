import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/member/member.ts",
      formats: ["es"],
      fileName: () => "member.js",
    },
    outDir: "../App_Plugins/PdfCurator/dist-member",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
        manualChunks: (id) => {
          if (id.includes("pdfjs-dist")) return "reader-vendor";
          if (id.includes("member/components/pdfc-reader")) return "reader";
        },
      },
    },
  },
});
