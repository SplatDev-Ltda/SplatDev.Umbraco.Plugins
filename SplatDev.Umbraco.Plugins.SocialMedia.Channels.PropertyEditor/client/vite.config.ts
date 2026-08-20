import { defineConfig } from "vite";
export default defineConfig({ build: { lib: { entry: "src/property-editor.ts", formats: ["es"], fileName: () => "property-editor.js" }, outDir: "../App_Plugins/SocialMediaChannels/dist", emptyOutDir: true, rollupOptions: { external: [/^@umbraco/] } } });
