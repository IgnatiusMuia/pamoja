import { expect, test } from "@playwright/test";

// Blocking a member from the chat pauses messaging for both directions and
// can be undone with one click.
test("block and unblock a member from the chat", async ({ page }) => {
  const base = process.env.E2E_BASE_URL || "http://localhost:3000";
  const apiBase = process.env.E2E_API_URL || "http://localhost:8000";
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("demo@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/dashboard/);

  const token = await page.evaluate(() => localStorage.getItem("pamoja_token"));
  expect(token).toBeTruthy();

  // ensure a conversation exists between demo traveler and Wanjiru (companion 3)
  const convRes = await page.request.post(`${apiBase}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { user_b_id: 3 },
  });
  expect(convRes.ok()).toBeTruthy();
  const conv = await convRes.json();

  await page.goto(`/dashboard/messages/${conv.id}`);
  await expect(page.getByRole("button", { name: "Block" })).toBeVisible();

  await page.getByRole("button", { name: "Block" }).click();
  await expect(page.getByText(/You've blocked Wanjiru Kamau/)).toBeVisible();
  await expect(page.getByPlaceholder("Messaging is paused")).toBeVisible();

  await page.getByRole("button", { name: "Unblock" }).click();
  await expect(page.getByText(/You've blocked Wanjiru Kamau/)).toBeHidden();
  await expect(page.getByPlaceholder("Write a message…")).toBeVisible();
});