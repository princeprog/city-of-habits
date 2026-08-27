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

test("keeps the application headers aligned across sidebar states and viewports", async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/city")

    const geometry = await page.evaluate(() => {
      const sidebarHeader = document.querySelector<HTMLElement>('[data-slot="sidebar-header"]')
      const pageHeader = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"] > header')

      if (!sidebarHeader || !pageHeader) {
        throw new Error("Application headers are missing")
      }

      return {
        sidebarBottom: sidebarHeader.getBoundingClientRect().bottom,
        pageBottom: pageHeader.getBoundingClientRect().bottom,
        sidebarHeaderHeight: sidebarHeader.getBoundingClientRect().height,
        pageHeaderHeight: pageHeader.getBoundingClientRect().height,
      }
    })

    expect(Math.abs(geometry.sidebarBottom - geometry.pageBottom)).toBeLessThanOrEqual(1)
    expect(geometry.sidebarHeaderHeight).toBe(64)
    expect(geometry.pageHeaderHeight).toBe(64)

    await page.locator('[data-sidebar="trigger"]').click()
    await expect(page.getByRole("link", { name: "City of Habits" })).toBeVisible()

    const collapsedOverflow = await page.locator('[data-slot="sidebar-header"]').evaluate((element) => {
      const header = element as HTMLElement
      return header.scrollWidth - header.clientWidth
    })

    expect(collapsedOverflow).toBeLessThanOrEqual(0)

    const collapsedGeometry = await page.evaluate(() => {
      const sidebarHeader = document.querySelector<HTMLElement>('[data-slot="sidebar-header"]')
      const pageHeader = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"] > header')

      if (!sidebarHeader || !pageHeader) {
        throw new Error("Application headers are missing after collapse")
      }

      return {
        sidebarBottom: sidebarHeader.getBoundingClientRect().bottom,
        pageBottom: pageHeader.getBoundingClientRect().bottom,
      }
    })

    expect(Math.abs(collapsedGeometry.sidebarBottom - collapsedGeometry.pageBottom)).toBeLessThanOrEqual(1)
  }
})

test("keeps the mobile brand and query-string route navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/city")
  await page.locator('[data-sidebar="trigger"]').click()

  await expect(page.getByRole("link", { name: "City of Habits" })).toBeVisible()
  await expect(page.locator('[data-slot="sidebar-header"]')).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(page.getByRole("link", { name: "City of Habits" })).toBeHidden()
})

test("marks query-string routes active in the desktop sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 })
  await page.goto("/district?id=all")
  await expect(page.getByRole("link", { name: "Districts" })).toHaveAttribute("data-active")
})

test("renders every public route without serious accessibility violations", async ({ page }) => {
  for (const route of ["/city", "/habit/new", "/habit?id=missing", "/district?id=body", "/report", "/settings", "/offline"]) {
    await page.goto(route)
    await expect(page.locator("h1").first()).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical"), `${route} has serious accessibility issues`).toEqual([])
  }
})
