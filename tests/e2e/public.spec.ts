import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("home shows Browse Tools and navigates to /tools", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /browse tools/i })).toBeVisible();
    await page.getByRole("link", { name: /browse tools/i }).click();
    await expect(page).toHaveURL(/\/tools\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: /^tools$/i })).toBeVisible();
  });

  test("tools index opens JSON Formatter", async ({ page }) => {
    await page.goto("/tools");
    await page.getByRole("link", { name: /json formatter/i }).first().click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });

  test("browser back returns from tool to tools index", async ({ page }) => {
    await page.goto("/tools");
    await page.getByRole("link", { name: /json formatter/i }).first().click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
    await page.goBack();
    await expect(page).toHaveURL(/\/tools\/?$/);
  });
});
