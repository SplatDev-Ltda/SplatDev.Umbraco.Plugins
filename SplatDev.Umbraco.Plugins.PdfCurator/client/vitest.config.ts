import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/member/__tests__/setup.ts"],
    include: ["src/member/__tests__/*.test.ts"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
