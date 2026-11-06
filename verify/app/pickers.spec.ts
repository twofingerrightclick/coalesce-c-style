import { expect, test, type Locator } from "@playwright/test";
import { normalizeColors } from "../lib/computed";
import { gotoScheme } from "../lib/page";

// M14 pickers (canon §4 C Date family, Slider, Color Picker), on `/c-style`.

function style(el: Locator, props: string[]) {
  return el.evaluate((node, props) => {
    const s = getComputedStyle(node);
    return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
  }, props);
}

test.describe("M14 pickers", () => {
  test.beforeEach(async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    await page.locator('[data-picker="date"]').waitFor();
  });

  test("calendar: 40px day cells, radius 8, ~no gap, ink days; selected = ink fill; no MD header", async ({ page }) => {
    const cal = page.locator('[data-picker="date"]');
    await expect(cal.locator(".v-picker__header")).toHaveCount(0);
    const days = cal.locator(".v-date-picker-month__day-btn");
    const a = (await days.nth(0).boundingBox())!;
    const b = (await days.nth(1).boundingBox())!;
    expect([a.width, a.height]).toEqual([40, 40]);
    // Columns are 1fr; Vuetify's month/year controls row is a little wider
    // than Canon's 280px grid, so cells sit ≈ 41 apart.
    expect(b.x - a.x).toBeGreaterThanOrEqual(40);
    expect(b.x - a.x).toBeLessThan(42);
    await expect(days.nth(0)).toHaveCSS("border-top-left-radius", "8px");
    expect((await normalizeColors(page, await style(days.nth(0), ["color"]))).color).toBe("#18181b");
    const sel = cal.locator(".v-date-picker-month__day--selected .v-btn");
    const s = await style(sel, ["background-color", "color"]);
    expect(await normalizeColors(page, { bg: s["background-color"], fg: s.color })).toEqual({ bg: "#18181b", fg: "#ffffff" });
    const arrow = cal.locator(".v-date-picker-controls .v-btn").first();
    expect((await normalizeColors(page, await style(arrow, ["color"]))).color).toBe("#18181b");
  });

  test("slider: 5px zinc-200 track, ink fill, 18px thumb = 5px ink ring around white", async ({ page }) => {
    const slider = page.locator('[data-picker="slider"]');
    const bg = slider.locator(".v-slider-track__background").first();
    const fill = slider.locator(".v-slider-track__fill");
    const t = await style(bg, ["background-color", "opacity", "height"]);
    const f = await style(fill, ["background-color", "height"]);
    expect(await normalizeColors(page, { track: t["background-color"], fill: f["background-color"] })).toEqual({ track: "#e4e4e7", fill: "#18181b" });
    expect([t.opacity, t.height, f.height]).toEqual(["1", "5px", "5px"]);
    const thumb = slider.locator(".v-slider-thumb__surface");
    const th = await style(thumb, ["width", "border-top-width", "border-top-color", "background-color"]);
    expect([th.width, th["border-top-width"]]).toEqual(["18px", "5px"]);
    expect(await normalizeColors(page, { ring: th["border-top-color"], centre: th["background-color"] })).toEqual({ ring: "#18181b", centre: "#ffffff" });
  });

  test("color picker: panel radius 12", async ({ page }) => {
    await expect(page.locator('[data-picker="color"]')).toHaveCSS("border-top-left-radius", "12px");
  });
});
