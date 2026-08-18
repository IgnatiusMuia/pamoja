import { expect, test } from "@playwright/test";

test("admin dashboard renders stats, companions and reports", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("admin@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill("admin123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });

  await expect(page.getByRole("heading", { name: "Admin panel" })).toBeVisible();
  await expect(page.getByText("Travellers", { exact: true })).toBeVisible();
  await expect(page.getByText("Companions", { exact: true })).toBeVisible();
  await expect(page.getByText("Open reports", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /companion approvals/i })).toBeVisible();

  const companionCards = page.locator("div.space-y-3 > div");
  await page.getByRole("button", { name: "approved", exact: true }).click();
  await expect(companionCards.first()).toBeVisible();

  await page.getByRole("button", { name: /^Reports/ }).click();
  await expect(page.getByText(/report/i).first()).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Admin", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
});