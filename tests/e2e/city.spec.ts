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
    .getByRole("link", { name: /start building your city/i })
    .first()
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
    page.getByRole("heading", { name: /a city that stays yours/i }),
  ).toBeVisible();
  await expect(page.getByText("No account").first()).toBeVisible();
  await expect(page.getByText("Works offline").first()).toBeVisible();
  await expect(page.getByText("Export anytime").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /start building your city/i }),
  ).toHaveAttribute("href", /\/habit\/new\/?$/);
  await expect(
    page.getByRole("link", { name: /start building for free/i }),
  ).toHaveAttribute("href", /\/habit\/new\/?$/);
  await expect(
    page.getByRole("link", { name: /explore features/i }),
  ).toHaveAttribute("href", "#features");
  for (const district of [
    "Work",
    "Mind",
    "Body",
    "Recovery",
    "Connection",
    "Creative",
  ]) {
    await expect(page.locator(`[data-district-label="${district}"]`)).toHaveCount(1);
  }
  const landingImages = page.locator('main img[src^="/images/landing/"]');
  await expect(landingImages).toHaveCount(3);
  await landingImages.last().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      landingImages.evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
    )
    .toBe(true);
  const landingText = await page.locator("main").innerText();
  expect(landingText).not.toMatch(/pricing|log\s*in|newsletter|50,000|notion|spotify|rating|stars/i);
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
  await expect(
    page.getByLabel("Main navigation").getByRole("link", { name: "Why cities", exact: true }),
  ).toHaveAttribute("href", "#why-cities");
  await expect(
    page.getByLabel("Main navigation").getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("href", "#about");
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

test("renders the landing page without browser console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
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
    { width: 1024, height: 900 },
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

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const districtGeometry = await page.locator("[data-district-label]").evaluateAll((labels) =>
    labels.map((label) => {
      const bounds = label.getBoundingClientRect();
      return {
        visible: getComputedStyle(label).display !== "none",
        inViewport: bounds.left >= 0 && bounds.right <= window.innerWidth,
        hasSize: bounds.width > 0 && bounds.height > 0,
      };
    }),
  );
  expect(districtGeometry).toHaveLength(6);
  expect(districtGeometry.every(({ visible, inViewport, hasSize }) => visible && inViewport && hasSize)).toBe(true);

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
    await page.goto("/report");

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

test("renders the immersive city workspace with the map-only layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/city");

  await expect(page.getByRole("heading", { name: "My City" })).toBeVisible();
  await expect(page.getByLabel("Search habits")).toBeVisible();
  await expect(page.locator('[data-city-toolbar]').getByRole("link", { name: "Add habit" })).toHaveAttribute(
    "href",
    /\/habit\/new\/?$/,
  );
  await expect(page.locator('[data-city-mode="immersive"]')).toBeVisible();
  await expect(page.locator('[data-city-renderer="3d"]')).toBeVisible();
  await expect(page.getByRole("region", { name: "Browse buildings" })).toHaveCount(0);
  await expect(page.getByText("This week", { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-city-map-surface]')).toBeVisible();

  await page.getByRole("button", { name: /explore a sample city/i }).click();
  await expect(page.locator('[data-city-habit-count="6"]')).toBeVisible();
  await expect(page.getByText("Your city is alive", { exact: true })).toBeVisible();
});

test("keeps city search and district filtering available on the map-only layout", async ({
  page,
}) => {
  await page.goto("/city");
  await page.getByRole("button", { name: /explore a sample city/i }).click();

  await page.getByLabel("Search habits").fill("walk");
  await expect(page.locator('[data-city-query="walk"]')).toBeVisible();

  await page.getByRole("button", { name: /show body district/i }).click();
  await expect(page.locator('[data-city-district="body"]')).toBeVisible();
  await expect(page.getByRole("region", { name: "Browse buildings" })).toHaveCount(0);
});

test("keeps the draggable city map usable across supported breakpoints", async ({
  page,
}) => {
  const viewports = [
    { width: 360, height: 800, tier: "mobile" },
    { width: 390, height: 844, tier: "mobile" },
    { width: 768, height: 900, tier: "tablet" },
    { width: 1024, height: 900, tier: "desktop" },
    { width: 1440, height: 900, tier: "desktop" },
    { width: 1572, height: 1000, tier: "desktop" },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/city");

    const map = page.locator('[data-city-renderer="3d"]');
    const mapSurface = page.locator("[data-city-map-surface]");
    await expect(map).toHaveAttribute("data-render-tier", viewport.tier);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height);

    const geometry = await mapSurface.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });
    expect(geometry.right).toBeGreaterThanOrEqual(geometry.viewportWidth - 1);
    expect(geometry.bottom).toBeGreaterThanOrEqual(geometry.viewportHeight - 1);
    expect(geometry.width).toBeGreaterThan(geometry.viewportWidth * 0.8);
    expect(geometry.height).toBeGreaterThan(geometry.viewportHeight * 0.6);
  }

  const map = page.locator('[data-city-renderer="3d"]');
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(map).toHaveAttribute("data-last-map-command", "zoom-in");
  await page.getByRole("button", { name: "Zoom out" }).click();
  await expect(map).toHaveAttribute("data-last-map-command", "zoom-out");
  await page.getByRole("button", { name: "Center city" }).click();
  await expect(map).toHaveAttribute("data-last-map-command", "center");
  await page.getByRole("button", { name: "Reset map" }).click();
  await expect(map).toHaveAttribute("data-last-map-command", "reset");
});

test("loads local 3D models and textures without browser errors", async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const firstModelResponse = page.waitForResponse(
    (response) => response.url().includes("/models/city/") && response.url().endsWith(".glb") && response.ok(),
    { timeout: 15_000 },
  );

  await page.goto("/city");
  await firstModelResponse;
  await page.getByRole("button", { name: /explore a sample city/i }).click();
  await expect(page.locator('[data-city-habit-count="6"]')).toBeVisible();
  await page.waitForTimeout(750);

  const textureResponse = await request.get(
    "/models/city/suburban/Textures/colormap.png",
  );
  expect(textureResponse.ok()).toBeTruthy();
  expect(consoleErrors).toEqual([]);
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
    await page.waitForTimeout(800);
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
