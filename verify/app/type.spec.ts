import { expect, test } from "@playwright/test";
import { probeClass } from "../lib/page";

test.describe("M4 typography (canon §2.9)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
  });

  test("Inter is the body font and is loaded", async ({ page }) => {
    const family = await page.locator(".v-application").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/^InterVariable\b/);
    expect(await page.evaluate(() => document.fonts.check("500 14px InterVariable"))).toBe(true);
  });

  test("stylistic alternates are on and live", async ({ page }) => {
    const features = await page.locator(".v-application").evaluate((el) => getComputedStyle(el).fontFeatureSettings);
    expect(features).toContain('"ss01"');
    // cv11 swaps Inter's double-storey a for the single-storey one, which is narrower.
    const widths = await page.evaluate(() =>
      ["normal", '"cv11"'].map((features) => {
        const span = document.createElement("span");
        span.style.cssText = `font: 400 64px InterVariable; font-feature-settings: ${features}; position: absolute`;
        span.textContent = "aaaa";
        document.body.append(span);
        const width = span.getBoundingClientRect().width;
        span.remove();
        return width;
      }),
    );
    expect(widths[0]).not.toBe(widths[1]);
  });

  test("type roles follow Canon's ramp", async ({ page }) => {
    const props = ["font-size", "line-height", "letter-spacing", "font-weight"];
    expect(await probeClass(page, "text-body-medium", props)).toEqual({
      "font-size": "14px", "line-height": "20px", "letter-spacing": "-0.084px", "font-weight": "400",
    });
    expect(await probeClass(page, "text-headline-medium", props)).toMatchObject({
      "font-size": "24px", "line-height": "32px", "font-weight": "600",
    });
  });
});
