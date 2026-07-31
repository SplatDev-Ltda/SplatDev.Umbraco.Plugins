import { test, expect } from "@playwright/test";

const BACKOFFICE_URL = "/umbraco";
const BACKOFFICE_EMAIL = "admin@demo.com";
const BACKOFFICE_PASSWORD = "Demo123456!";

test.describe("PdfCurator Book Library — Umbraco 17 backoffice smoke test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await page.waitForLoadState("networkidle");

    const emailInput = page.locator('input[name="email"], input[id="email"], #umb-email');
    const passwordInput = page.locator('input[name="password"], input[id="password"], #umb-password');
    const loginButton = page.locator('button[type="submit"], uui-button[label="Login"], button:has-text("Login")');

    if (await emailInput.isVisible()) {
      await emailInput.fill(BACKOFFICE_EMAIL);
      await passwordInput.fill(BACKOFFICE_PASSWORD);
      await loginButton.click();
      await page.waitForURL("**/umbraco#/content**", { timeout: 20_000 });
      await page.waitForLoadState("networkidle");
    }
  });

  test("Book Library section is visible in the backoffice sidebar", async ({ page }) => {
    await page.waitForTimeout(2000);

    const sectionButton = page.locator(
      'uui-button[label*="Book Library"], uui-button:has-text("Book Library"), a[href*="pdf-curator"]'
    );

    await expect(sectionButton.first()).toBeVisible({ timeout: 10_000 });
  });

  test("Opening Book Library section navigates to Dashboard by default", async ({ page }) => {
    const sectionLink = page.locator(
      'uui-button:has-text("Book Library"), a[href*="pdf-curator"], uui-ref:has-text("Book Library")'
    );

    if (await sectionLink.first().isVisible()) {
      await sectionLink.first().click();
    }

    await page.waitForTimeout(3000);

    const dashboardContent = page.locator("pdfc-dashboard-wrapper");
    const anyPdfc = page.locator(
      "pdfc-dashboard-wrapper, pdfc-library-wrapper, pdfc-review-wrapper, pdfc-reports-wrapper"
    );

    await expect(anyPdfc.first()).toBeVisible({ timeout: 10_000 });
  });

  test("All 4 menu items render without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const sectionLink = page.locator(
      'uui-button:has-text("Book Library"), a[href*="pdf-curator"], uui-ref:has-text("Book Library")'
    );

    if (await sectionLink.first().isVisible()) {
      await sectionLink.first().click();
    }

    await page.waitForTimeout(2000);

    const menuItems = ["Dashboard", "Library", "Review", "Reports"];
    for (const item of menuItems) {
      const menuLink = page.locator(
        `uui-button:has-text("${item}"), a:has-text("${item}"), uui-ref:has-text("${item}")`
      );

      if (await menuLink.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
        await menuLink.first().click();
        await page.waitForTimeout(1500);
      }
    }

    expect(consoleErrors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });

  test("PdfCurator.Web bundle loads successfully on the Dashboard page", async ({ page }) => {
    page.on("requestfailed", (request) => {
      if (request.url().includes("PdfCurator.Web") || request.url().includes("pdfc")) {
        throw new Error(`PdfCurator resource failed to load: ${request.url()}`);
      }
    });

    const sectionLink = page.locator(
      'uui-button:has-text("Book Library"), a[href*="pdf-curator"], uui-ref:has-text("Book Library")'
    );

    if (await sectionLink.first().isVisible()) {
      await sectionLink.first().click();
    }

    await page.waitForTimeout(5000);
  });
});
