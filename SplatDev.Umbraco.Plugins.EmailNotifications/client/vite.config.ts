import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/email-notifications-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "email-notifications-dashboard.element.js",
    },
    outDir: "../App_Plugins/SplatDev.EmailNotifications/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
