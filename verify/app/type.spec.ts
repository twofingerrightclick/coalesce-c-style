import { expect, test } from "@playwright/test";
import { probeClass } from "../lib/page";

test.describe("M4 typography (canon §2.9)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
  });

  test("Public Sans, bundled by c-style, is the body font and is loaded", async ({ page }) => {
    const family = await page.locator(".v-application").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/^"Public Sans Variable"/);
    for (const weight of [400, 500, 600]) {
      expect(await page.evaluate((w) => document.fonts.check(`${w} 14px "Public Sans Variable"`), weight)).toBe(true);
    }
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status == "loaded").map((f) => f.family.replace(/"/g, "")),
    );
    expect(loaded).toContain("Public Sans Variable");
  });

  test("Inter's alternates are off for Public Sans", async ({ page }) => {
    const features = await page.locator(".v-application").evaluate((el) => getComputedStyle(el).fontFeatureSettings);
    expect(features).toBe("normal");
  });

  test("no font comes from a CDN at run time", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      if (/fonts\.googleapis|fonts\.gstatic|fontshare|rsms\.me/.test(r.url())) external.push(r.url());
    });
    await page.goto("/admin/audit", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    expect(external).toEqual([]);
  });

  test("type roles follow Canon's ramp", async ({ page }) => {
    const props = ["font-size", "line-height", "letter-spacing", "font-weight"];
    expect(await probeClass(page, "text-body-medium", props)).toEqual({
      "font-size": "14px", "line-height": "20px", // Canon's −0.006em at Public Sans' 0.5 tracking scale.
      "letter-spacing": "-0.042px", "font-weight": "400",
    });
    const headline = await probeClass(page, "text-headline-medium", props);
    expect(headline).toMatchObject({
      "font-size": "24px", "font-weight": "600",
    });
    expect(parseFloat(headline["line-height"])).toBeCloseTo(32, 2);
  });
});
