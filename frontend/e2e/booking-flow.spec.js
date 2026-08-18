import { expect, test } from "@playwright/test";

// Books the first Nairobi companion on a weekday 2+ weeks out. Every run use a
// fresh day if the previous one is already fully booked (persistent DB), and
// always picks the earliest offered start slot.

function nextDay(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1);
  return x.toISOString().split("T")[0];
}

async function bookedRedirect(page, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (/\/dashboard\/bookings\/\d+\?created=1/.test(page.url())) return true;
    await page.waitForTimeout(150);
  }
  return false;
}

test("search → book → request visible in dashboard bookings", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("demo@pamoja.ke");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  const base = new Date();
  base.setDate(base.getDate() + 14);

  // pick the first Nairobi companion from public search
  await page.goto("/search");
  await page.getByLabel(/City/i).first().fill("Nairobi");
  const card = page.locator("a[href^='/companions/']").first();
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  await expect(page).toHaveURL(/\/companions\/\d+/);
  const href = page.url();
  const id = href.match(/\/companions\/(\d+)/)[1];

  await page.getByRole("link", { name: /request|book/i }).first().click();
  await expect(page).toHaveURL(new RegExp(`/book/${id}`));

  await page.getByLabel(/what would you like to do/i).selectOption({ index: 1 });

  const startSelect = page.getByLabel("Start time");
  const dateInput = page.getByLabel("Date *");
  const submit = page.getByRole("button", { name: /send booking request/i });

  // Spread attempts over dates (permuted, weekdays only) and every offered
  // slot, so repeated runs / parallel workers don't starve a single date.
  const order = [2, 6, 0, 4, 8, 1, 5, 9, 3, 7];
  let booked = false;
  let date = null;
  outer: for (const i of order) {
    date = nextDay(base, i);
    await dateInput.fill(date);
    const n = await startSelect.locator("option").count();
    for (let s = 1; s < n && !booked; s++) {
      await startSelect.selectOption(await startSelect.locator("option").nth(s).getAttribute("value"));
      await submit.click();
      booked = await bookedRedirect(page, 2500);
      if (booked) break outer;
    }
  }
  await expect(booked).toBe(true);
  await expect(page.getByText(/pending/i).first()).toBeVisible();

  await page.getByRole("link", { name: "Bookings" }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/bookings$/);
  const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  await expect(page.getByText(formatted).first()).toBeVisible();
});