import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/property-editors/index.ts",
      formats: ["es"],
      fileName: "formsclone-property-editors",
    },
    outDir: "../App_Plugins/SplatDev.FormsClone/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/SplatDev.FormsClone/dist/",
});
