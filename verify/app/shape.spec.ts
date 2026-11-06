import { expect, test } from "@playwright/test";
import { shadows } from "../lib/canon";
import { gotoScheme, probeClass, shadowLayers } from "../lib/page";

test.describe("M5 shape, depth, lines, focus, motion", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: elevations are edge + Canon shadow (canon §2.7)`, async ({ page }) => {
      await gotoScheme(page, "/admin", scheme);
      const s = shadows[scheme];
      const layers = async (cls: string) => shadowLayers((await probeClass(page, cls, ["box-shadow"]))["box-shadow"]);
      expect(await layers("elevation-2")).toEqual([s.edge, ...s.raised]);
      expect(await layers("elevation-5")).toEqual([s.edge, ...s.overlay]);
    });
  }

  test("radius ladder: rounded-lg is 12px (canon §2.3)", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    expect((await probeClass(page, "rounded-lg", ["border-top-left-radius"]))["border-top-left-radius"]).toBe("12px");
  });

  test("dividers are rule lines at 10% (canon §2.6)", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    await expect(page.locator(".v-divider").first()).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0.1)");
  });

  test("keyboard focus draws Canon's ring and hides Vuetify's (canon §2.8)", async ({ page }) => {
    await page.goto("/admin/Widget", { waitUntil: "networkidle" });
    const button = page.locator(".c-admin-table-toolbar .v-btn:not(.v-btn--icon)").first();
    await button.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    // Polled: the ring transitions in over 0.12s.
    await expect.poll(async () => shadowLayers(await button.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([
      "rgb(255, 255, 255) 0px 0px 0px 2px",
      "rgb(37, 99, 235) 0px 0px 0px 3px",
    ]);
    expect(await button.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("0");
  });

  test("clicking a button leaves no ripple", async ({ page }) => {
    await page.goto("/admin/Widget", { waitUntil: "networkidle" });
    const button = page.locator(".c-admin-table-toolbar .v-btn").first();
    await button.hover();
    await page.mouse.down();
    await expect(page.locator(".v-ripple__container")).toHaveCount(0);
    await page.mouse.up();
  });
});
