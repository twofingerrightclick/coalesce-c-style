import { defineConfig } from "@playwright/test";

export const appURL = process.env.APP_URL ?? "https://localhost:48110";
export const storybookURL = process.env.STORYBOOK_URL ?? "http://localhost:6006";

export default defineConfig({
  outputDir: "test-results",
  reporter: [["list"]],
  // The demo app shares one dev server and database; parallel workers only add flake.
  workers: 1,
  timeout: 60_000,
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "app",
      testDir: "app",
      use: { baseURL: appURL, ignoreHTTPSErrors: true },
    },
    {
      name: "storybook",
      testDir: "parity",
      use: { baseURL: storybookURL },
    },
    {
      // Skipped unless CAPTURE=1 (`pnpm baseline`); writes screenshots, asserts nothing.
      name: "capture",
      testDir: "capture",
      use: { baseURL: appURL, ignoreHTTPSErrors: true },
    },
  ],
});
