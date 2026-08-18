import { expect, test } from "@playwright/test";

const PASSWORD = "password123";

test("companion pays the listing fee and sees payment history", async ({ page }) => {
  const email = `bill-${Date.now()}@pamoja.ke`;
  await page.goto("/register?role=companion");
  await page.getByText("Companion", { exact: true }).click();
  await page.getByPlaceholder("e.g. Kevin Otieno").fill("Billing Companion");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /create .*account/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/dashboard/billing");
  await expect(page.getByText("Monthly listing fee")).toBeVisible();
  await expect(page.getByText("Listing inactive")).toBeVisible();

  await page.getByPlaceholder("M-Pesa number e.g. 0712345678").fill("0712345678");
  await page.getByRole("button", { name: /pay/i }).click();

  await expect(page.getByText(/payment received \(test mode\)/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Listing live", { exact: true })).toBeVisible();
  await expect(page.getByText("Listing active until")).toBeVisible();
  await expect(page.getByText("Listing fee (MPESA)")).toBeVisible();
  await expect(page.getByText(/due — settle with pamoja/i).first()).toHaveCount(0);
});