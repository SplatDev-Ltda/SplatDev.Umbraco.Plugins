import { defineConfig } from "vite";
export default defineConfig({build:{lib:{entry:{"adpreview-property-editor":"src/adpreview-property-editor.element.ts"},formats:["es"]},outDir:"../App_Plugins/AdPreview/dist",emptyOutDir:true,sourcemap:true,rollupOptions:{external:[/^@umbraco/]},},base:"/App_Plugins/AdPreview/dist/"});
