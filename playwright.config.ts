import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";
process.env.MARKETLAB_ADMIN_PASSWORD =
  process.env.MARKETLAB_ADMIN_PASSWORD ?? randomUUID();
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    env: {
      MARKETLAB_DB_PATH: `/tmp/marketlab-e2e-${randomUUID()}.sqlite`,
      MARKETLAB_ADMIN_EMAIL: "admin@test.invalid",
      MARKETLAB_ADMIN_PASSWORD: process.env.MARKETLAB_ADMIN_PASSWORD,
    },
  },
});
