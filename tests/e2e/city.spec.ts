import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("city-of-habits");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
});

test("creates a foundation and checks in from its detail page", async ({
  page,
}) => {
  await page
    .getByRole("link", { name: /enter the city/i })
    .first()
    .click();
  await page
    .getByRole("link", { name: /build your first foundation/i })
    .click();
  await page.getByLabel("What do you want to repeat?").fill("Read before bed");
  await page.getByRole("button", { name: /place the foundation/i }).click();
  await expect(page).toHaveURL(/\/habit\/?\?id=/);
  await page.getByRole("button", { name: /check in/i }).click();
  await expect(page.getByText(/building grew a little/i)).toBeVisible();
  await expect(page.getByText(/the first rooms are open/i)).toBeVisible();
});

test("keeps the landing page crawlable and explains the privacy promise", async ({
  page,
}) => {
  await expect(page).toHaveTitle(/City of Habits/i);
  await expect(
    page.getByRole("heading", {
      name: /turn your habits into a city you.?re proud of/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /the map is yours to keep/i }),
  ).toBeVisible();
  await expect(page.getByText("No account").first()).toBeVisible();
  await expect(page.getByText("Works offline").first()).toBeVisible();
  await expect(page.getByText("Export anytime").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /start building your city/i }),
  ).toHaveAttribute("href", /\/habit\/new\/?$/);
  const cityLinks = page.locator('a[href^="/city"]');
  expect(await cityLinks.count()).toBeGreaterThanOrEqual(3);
});

test("keeps the landing palette fixed and exposes landing viewport metadata", async ({
  page,
}) => {
  const palettes = [] as Array<{
    colorScheme: string;
    backgroundColor: string;
    foregroundColor: string;
    primaryBackground: string;
    themeColor: string;
    landingBackground: string;
  }>;

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");

    const landing = page.locator('[data-landing-theme="light"]');
    await expect(landing).toBeVisible();
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
      "content",
      "light",
    );

    const palette = await landing.evaluate((element) => {
      const styles = getComputedStyle(element);
      const primaryLink =
        element.querySelector<HTMLAnchorElement>('a[href^="/city"]');
      const primaryStyles = primaryLink
        ? getComputedStyle(primaryLink)
        : styles;
      const themeMeta = Array.from(
        document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
      ).find((meta) => !meta.media);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      const normalizeColor = (value: string) => {
        if (!context || !value) return "";
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data).join(",");
      };

      return {
        colorScheme: styles.colorScheme,
        backgroundColor: styles.backgroundColor,
        foregroundColor: styles.color,
        primaryBackground: primaryStyles.backgroundColor,
        themeColor: normalizeColor(themeMeta?.content ?? ""),
        landingBackground: normalizeColor(styles.backgroundColor),
      };
    });

    expect(palette.colorScheme).toBe("light");
    expect(palette.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(palette.themeColor).toMatch(/^\d+,\d+,\d+,\d+$/);
    const themeChannels = palette.themeColor.split(",").map(Number);
    const landingChannels = palette.landingBackground.split(",").map(Number);
    expect(
      Math.max(
        ...themeChannels
          .slice(0, 3)
          .map((channel, index) => Math.abs(channel - landingChannels[index])),
      ),
    ).toBeLessThanOrEqual(8);
    palettes.push(palette);
  }

  expect(palettes[0]).toEqual(palettes[1]);
});

test("connects landing navigation to its sections with smooth scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "How it works", exact: true }).first(),
  ).toHaveAttribute("href", "#how-it-works");
  await expect(
    page.getByRole("link", { name: "Features", exact: true }),
  ).toHaveAttribute("href", "#features");
  await expect(
    page.getByRole("link", { name: "Privacy", exact: true }).first(),
  ).toHaveAttribute("href", "#privacy");
  await expect
    .poll(() =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    )
    .toBe("smooth");

  await page.getByRole("link", { name: "Features", exact: true }).click();
  await expect(page).toHaveURL(/#features$/);
  await expect(page.locator("#features")).toBeInViewport();
});

test("keeps content visible and scrolling immediate when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    )
    .toBe("auto");
  await expect
    .poll(() =>
      page
        .locator("[data-reveal]")
        .evaluateAll((elements) =>
          elements.every(
            (element) =>
              getComputedStyle(element).opacity === "1" &&
              element.getAnimations({ subtree: true }).length === 0,
          ),
        ),
    )
    .toBe(true);
});

test("keeps the landing composition inside the viewport", async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1440, height: 900 },
    { width: 1572, height: 912 },
  ]) {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /turn your habits into a city you.?re proud of/i,
      }),
    ).toBeVisible();

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - window.innerWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(0);
    expect(overflow.body).toBeLessThanOrEqual(0);
  }

  const resolvedLandingPalettes: Array<{
    background: string;
    foreground: string;
    primary: string;
  }> = [];

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    resolvedLandingPalettes.push(
      await page.locator('[data-landing-theme="light"]').evaluate((element) => {
        const styles = getComputedStyle(element);
        const primary =
          element.querySelector<HTMLAnchorElement>('a[href^="/city"]');
        return {
          background: styles.backgroundColor,
          foreground: styles.color,
          primary: primary ? getComputedStyle(primary).backgroundColor : "",
        };
      }),
    );
  }

  expect(resolvedLandingPalettes[0]).toEqual(resolvedLandingPalettes[1]);
});

test("keeps application theming independent from the fixed landing page", async ({
  page,
}) => {
  await page.evaluate(() => localStorage.removeItem("theme"));

  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/city");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator('[data-landing-theme="light"]')).toHaveCount(0);
  const darkApplicationBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/city");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const lightApplicationBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  expect(darkApplicationBackground).not.toBe(lightApplicationBackground);
});

test("keeps the application headers aligned across sidebar states and viewports", async ({
  page,
}) => {
  for (const viewport of [
    { width: 768, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/city");

    const geometry = await page.evaluate(() => {
      const sidebarHeader = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-header"]',
      );
      const pageHeader = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-inset"] > header',
      );

      if (!sidebarHeader || !pageHeader) {
        throw new Error("Application headers are missing");
      }

      return {
        sidebarBottom: sidebarHeader.getBoundingClientRect().bottom,
        pageBottom: pageHeader.getBoundingClientRect().bottom,
        sidebarHeaderHeight: sidebarHeader.getBoundingClientRect().height,
        pageHeaderHeight: pageHeader.getBoundingClientRect().height,
      };
    });

    expect(
      Math.abs(geometry.sidebarBottom - geometry.pageBottom),
    ).toBeLessThanOrEqual(1);
    expect(geometry.sidebarHeaderHeight).toBe(64);
    expect(geometry.pageHeaderHeight).toBe(64);

    await page.locator('[data-sidebar="trigger"]').click();
    await expect(
      page.getByRole("link", { name: "City of Habits" }),
    ).toBeVisible();

    const collapsedOverflow = await page
      .locator('[data-slot="sidebar-header"]')
      .evaluate((element) => {
        const header = element as HTMLElement;
        return header.scrollWidth - header.clientWidth;
      });

    expect(collapsedOverflow).toBeLessThanOrEqual(0);

    const collapsedGeometry = await page.evaluate(() => {
      const sidebarHeader = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-header"]',
      );
      const pageHeader = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-inset"] > header',
      );

      if (!sidebarHeader || !pageHeader) {
        throw new Error("Application headers are missing after collapse");
      }

      return {
        sidebarBottom: sidebarHeader.getBoundingClientRect().bottom,
        pageBottom: pageHeader.getBoundingClientRect().bottom,
      };
    });

    expect(
      Math.abs(collapsedGeometry.sidebarBottom - collapsedGeometry.pageBottom),
    ).toBeLessThanOrEqual(1);
  }
});

test("keeps the mobile brand and query-string route navigation usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/city");
  await page.locator('[data-sidebar="trigger"]').click();

  await expect(
    page.getByRole("link", { name: "City of Habits" }),
  ).toBeVisible();
  await expect(page.locator('[data-slot="sidebar-header"]')).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "City of Habits" })).toBeHidden();
});

test("marks query-string routes active in the desktop sidebar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await page.goto("/district?id=all");
  await expect(page.getByRole("link", { name: "Districts" })).toHaveAttribute(
    "data-active",
  );
});

test("renders every public route without serious accessibility violations", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/city",
    "/habit/new",
    "/habit?id=missing",
    "/district?id=body",
    "/report",
    "/settings",
    "/offline",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    if (route === "/") {
      await expect
        .poll(() =>
          page
            .locator("main > section")
            .first()
            .locator("[data-reveal]")
            .evaluateAll((elements) =>
              elements.every((element) => {
                const bounds = element.getBoundingClientRect();
                const isInInitialViewport =
                  bounds.top >= 0 && bounds.bottom <= window.innerHeight;

                return (
                  !isInInitialViewport ||
                  getComputedStyle(element).opacity === "1"
                );
              }),
            ),
        )
        .toBe(true);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      ),
      `${route} has serious accessibility issues`,
    ).toEqual([]);
  }
});
