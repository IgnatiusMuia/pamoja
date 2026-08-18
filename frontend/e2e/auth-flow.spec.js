import { expect, test } from "@playwright/test";

const PASSWORD = "password123";

test("register a new traveler then log out", async ({ page }) => {
  const email = `e2e-${Date.now()}@pamoja.ke`;
  await page.goto("/register");
  await page.getByText("Traveller", { exact: true }).click();
  await page.getByPlaceholder("e.g. Kevin Otieno").fill("E2E Traveler");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /create account|join|sign up/i }).click();

  await expect(page).toHaveURL(/\/search/, { timeout: 15_000 });
  await expect(page.locator("header").getByText(/hi, e2e/i)).toBeVisible();

  await page.locator("header").getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("header").getByRole("link", { name: "Log in" })).toBeVisible();
});

test("registration is blocked without the 18+ confirmation", async ({ page }) => {
  await page.goto("/register");
  await page.getByText("Traveller", { exact: true }).click();
  await page.getByPlaceholder("e.g. Kevin Otieno").fill("E2E Minor");
  await page.getByPlaceholder("you@example.com").fill(`minor-${Date.now()}@pamoja.ke`);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.getByRole("button", { name: /create account|join|sign up/i }).click();
  await expect(page).toHaveURL(/\/register/); // blocked client-side, no navigation
  await expect(page).not.toHaveURL(/\/search/);
});

test("login rejects wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("demo@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(/incorrect email or password/i)).toBeVisible({ timeout: 15_000 });
});

test("demo traveler login lands on dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("demo@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.locator("header").getByText(/hi, demo/i)).toBeVisible();
});

test("admin login redirects to admin panel", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("admin@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill("admin123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
});