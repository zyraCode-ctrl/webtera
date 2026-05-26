import { test, expect, type Page } from "@playwright/test";

/** Matches first row in `app/[entry]/[sub]/route.ts` — issues funnel cookie when secret is set. */
const FUNNEL_ENTRY_PATH = "/VKDU7gv2CPJ/FuadqNngBkNmWt12K3k";

async function gotoGoOrSkip(page: Page) {
  await page.goto(FUNNEL_ENTRY_PATH, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (!page.url().includes("/go")) {
    test.skip(
      true,
      "Funnel not active: entry link did not reach /go. Add IG_FUNNEL_SECRET to .env.local and restart the dev server."
    );
  }
}

test.describe("Funnel /go", () => {
  test("entry link reaches /go when funnel is configured", async ({ page }) => {
    await gotoGoOrSkip(page);
    await expect(page.getByRole("heading", { name: /helpful resources/i })).toBeVisible();
    await expect(page.getByPlaceholder(/enter post number/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^next$/i })).toHaveCount(0);
  });

  test("search syncs ?search= and pagination; back from help restores params", async ({
    page,
  }) => {
    await gotoGoOrSkip(page);

    const input = page.getByPlaceholder(/enter post number/i);
    await input.fill("34");

    await expect
      .poll(() => new URL(page.url()).searchParams.get("search"), { timeout: 8000 })
      .toBe("34");

    await expect(page).toHaveURL(/page=4/);

    await page.getByRole("link", { name: /^full video$/i }).first().click();
    await page.waitForURL(/\/help\/34/, { timeout: 35_000 });

    await page.goBack();
    await expect(page).toHaveURL(/\/go/);
    await expect(page).toHaveURL(/search=34/);
    await expect(page).toHaveURL(/page=4/);
    await expect(input).toHaveValue("34");
    await expect(page.getByRole("button", { name: /^next$/i })).toBeVisible();
  });

  test("pagination Next / Previous updates ?page= (after list unlocks)", async ({ page }) => {
    await gotoGoOrSkip(page);

    await expect(page.getByRole("button", { name: /^next$/i })).toHaveCount(0);

    const input = page.getByPlaceholder(/enter post number/i);
    await input.fill("1");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("search"), { timeout: 8000 })
      .toBe("1");

    await page.getByRole("link", { name: /^full video$/i }).first().click();
    await page.waitForURL(/\/help\/1/, { timeout: 35_000 });
    await page.goBack();

    await expect(page.getByRole("button", { name: /^next$/i })).toBeVisible();
    await page.getByRole("button", { name: /^next$/i }).click();
    await expect(page).toHaveURL(/page=2/);

    await page.getByRole("button", { name: /^previous$/i }).click();
    await expect(page).not.toHaveURL(/page=2/);
  });
});
