import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("city-of-habits")
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  })
})

test("creates a foundation and checks in from its detail page", async ({ page }) => {
  await page.getByRole("link", { name: /enter the city/i }).first().click()
  await page.getByRole("link", { name: /build your first foundation/i }).click()
  await page.getByLabel("What do you want to repeat?").fill("Read before bed")
  await page.getByRole("button", { name: /place the foundation/i }).click()
  await expect(page).toHaveURL(/\/habit\/?\?id=/)
  await page.getByRole("button", { name: /check in/i }).click()
  await expect(page.getByText(/building grew a little/i)).toBeVisible()
  await expect(page.getByText(/the first rooms are open/i)).toBeVisible()
})

test("keeps the landing page crawlable and explains the privacy promise", async ({ page }) => {
  await expect(page).toHaveTitle(/City of Habits/i)
  await expect(page.getByRole("heading", { name: /see the life you are building/i })).toBeVisible()
  await expect(page.getByText(/no account · works offline · export anytime/i)).toBeVisible()
})

test("renders every public route without serious accessibility violations", async ({ page }) => {
  for (const route of ["/city", "/habit/new", "/habit?id=missing", "/district?id=body", "/report", "/settings", "/offline"]) {
    await page.goto(route)
    await expect(page.locator("h1").first()).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical"), `${route} has serious accessibility issues`).toEqual([])
  }
})
