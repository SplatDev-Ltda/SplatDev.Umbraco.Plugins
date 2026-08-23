import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/passwordsettings-dashboard.element.ts",
      formats: ["es"],
      fileName: () => "passwordsettings-dashboard.element.js",
    },
    outDir: "../App_Plugins/PasswordSettings/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
