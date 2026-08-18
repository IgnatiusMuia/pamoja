import { expect, test } from "@playwright/test";

test("home shows featured companions and key nav links", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("header").getByRole("link", { name: "Find a Companion" })
  ).toBeVisible();
  await expect(
    page.locator("header").getByRole("link", { name: "Activities" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("search filters by city and opens a profile", async ({ page }) => {
  await page.goto("/search");
  await expect(page).toHaveURL(/\/search/);
  // typing a city auto-runs the search (debounced on state change)
  await page.getByLabel("City", { exact: true }).fill("Nairobi");
  const cards = page.locator("a[href^='/companions/']");
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  await expect(cards.first()).toContainText(/KSH|hour/);
  await cards.first().click();
  await expect(page).toHaveURL(/\/companions\/\d+/);
  await expect(page.getByText(/KSH\/hour/i)).toBeVisible();
  await expect(page.getByText("Reviews").first()).toBeVisible();
});

test("activities catalogue lists all 46", async ({ page }) => {
  await page.goto("/activities");
  await expect(page.getByText(/companion for everything/i)).toBeVisible();
  const grid = page.locator("div.grid.sm\\:grid-cols-2.lg\\:grid-cols-3");
  await expect(grid).toBeVisible();
  await expect(grid.locator("> div")).toHaveCount(46);
});

test("city landing page renders companions", async ({ page }) => {
  await page.goto("/cities/nairobi");
  await expect(page.locator("a[href^='/companions/']").first()).toBeVisible();
});