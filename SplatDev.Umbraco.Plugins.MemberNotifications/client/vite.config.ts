import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/membernotifications-settings.element.ts",
      formats: ["es"],
      fileName: () => "settings.js",
    },
    outDir: "../App_Plugins/SplatDev.MemberNotifications/dist",
    emptyOutDir: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
