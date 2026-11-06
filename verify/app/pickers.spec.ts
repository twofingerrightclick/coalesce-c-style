import { expect, test, type Locator } from "@playwright/test";
import { normalizeColors } from "../lib/computed";
import { pickerSpill } from "../lib/layout";
import { gotoScheme, type Scheme } from "../lib/page";

// M14 pickers (canon §4 C Date family, Slider, Color Picker), on `/c-style`
// and `/gallery`.

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

  test("calendar: 40px day cells, radius 8, no gap, ink days; selected = ink fill; no MD header", async ({ page }) => {
    const cal = page.locator('[data-picker="date"]');
    await expect(cal.locator(".v-picker__header")).toHaveCount(0);
    const days = cal.locator(".v-date-picker-month__day-btn");
    const a = (await days.nth(0).boundingBox())!;
    const b = (await days.nth(1).boundingBox())!;
    expect([a.width, a.height]).toEqual([40, 40]);
    expect(b.x - a.x).toBe(40);
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

for (const scheme of ["light", "dark"] as Scheme[]) {
  test(`pickers keep their content inside their box (${scheme})`, async ({ page }) => {
    await gotoScheme(page, "/c-style", scheme);
    const kitchen = page.locator('[data-kitchen="pickers"]');
    await kitchen.locator('[data-picker="date"]').waitFor();
    expect(await pickerSpill(kitchen)).toEqual([]);
    // The month and year views, opened from the controls row and closed again.
    for (const [toggle, view] of [["month", "months"], ["year", "years"]]) {
      const btn = kitchen.locator(`.v-date-picker-controls__only-${toggle}-btn`);
      await btn.click();
      await kitchen.locator(`.v-date-picker-${view}`).waitFor();
      expect(await pickerSpill(kitchen), view).toEqual([]);
      await btn.click();
      await kitchen.locator(".v-date-picker-month").waitFor();
    }
    await gotoScheme(page, "/gallery", scheme);
    const card = page.locator('[data-gallery="date"]');
    await card.locator(".v-date-picker").waitFor();
    expect(await pickerSpill(card)).toEqual([]);
  });
}

// WCAG contrast of two opaque `#rrggbb` colours.
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Waits out the CSS transitions under `el` (ripples and spinners run forever).
function settle(el: Locator) {
  return el.evaluate((node) =>
    Promise.all(node.getAnimations({ subtree: true }).filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
  );
}

const timeColors = {
  light: { fill: "#f4f4f5", card: "#ffffff", ink: "#18181b", fieldInk: "#18181b", muted: "#71717a" },
  dark: { fill: "#27272a", card: "#3f3f46", ink: "#f4f4f5", fieldInk: "#ffffff", muted: "#a1a1aa" },
};

for (const scheme of ["light", "dark"] as Scheme[]) {
  test(`time picker: chosen period and field = raised card in ink, the rest muted on the fill (${scheme})`, async ({ page }) => {
    const c = timeColors[scheme];
    await gotoScheme(page, "/c-style", scheme);
    const picker = page.locator('[data-picker="time"]');
    const track = picker.locator(".v-time-picker-controls__ampm");
    const am = track.locator(".v-time-picker-controls__ampm__am");
    const pm = track.locator(".v-time-picker-controls__ampm__pm");
    const fields = picker.locator(".v-time-picker-controls__time__field");

    const colors = async (el: Locator, props = ["background-color", "color", "box-shadow"]) => {
      const s = await style(el, props);
      const n = await normalizeColors(page, { bg: s["background-color"], fg: s.color });
      return { ...n, shadow: s["box-shadow"] };
    };
    const expectPeriods = async (chosen: Locator, other: Locator) => {
      await settle(track);
      const on = await colors(chosen);
      const off = await colors(other);
      expect({ bg: on.bg, fg: on.fg }).toEqual({ bg: c.card, fg: c.ink });
      expect(on.shadow).not.toBe("none");
      expect({ bg: off.bg, fg: off.fg }).toEqual({ bg: "rgba(0, 0, 0, 0)", fg: c.muted });
      expect(contrast(on.fg, on.bg)).toBeGreaterThan(contrast(off.fg, c.fill) + 3);
    };

    expect((await colors(track)).bg).toBe(c.fill);
    expect((await track.boundingBox())!.height).toBe((await fields.first().locator(".v-field").boundingBox())!.height);
    await expectPeriods(am, pm);

    // The field the clock edits (hour at rest) is the card; the other muted on the fill.
    const hour = await colors(fields.nth(0).locator(".v-field"));
    const minute = await colors(fields.nth(1).locator(".v-field"));
    expect({ bg: hour.bg, fg: (await colors(fields.nth(0).locator("input"))).fg }).toEqual({ bg: c.card, fg: c.fieldInk });
    expect({ bg: minute.bg, fg: (await colors(fields.nth(1).locator("input"))).fg }).toEqual({ bg: c.fill, fg: c.muted });
    expect(hour.shadow).not.toBe("none");

    await pm.click();
    await page.mouse.move(0, 0);
    await expect(pm).toHaveClass(/v-btn--active/);
    await expectPeriods(pm, am);

    // Focusing the minute field makes it the card, with the text input's focus line and halo.
    await fields.nth(1).locator("input").focus();
    await expect(fields.nth(1)).toHaveClass(/__field--active/);
    await settle(picker);
    expect((await colors(fields.nth(1).locator("input"))).fg).toBe(c.fieldInk);
    expect((await colors(fields.nth(0).locator("input"))).fg).toBe(c.muted);
    expect(await style(fields.nth(1).locator(".v-field"), ["box-shadow"])).toEqual({
      "box-shadow": expect.stringContaining("inset"),
    });

    // Keyboard focus on the chosen period: the button ring replaces the card shadow.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(pm).toBeFocused();
    await settle(track);
    expect((await style(pm, ["box-shadow"]))["box-shadow"]).toMatch(/0px 0px 0px 2px, .* 0px 0px 0px 3px$/);
  });
}

test("time picker input variant: each field takes typing, incl. seconds", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const picker = page.locator('[data-picker="time-input"]');
  await expect(picker).toHaveAttribute("data-value", "09:30:15");
  const inputs = picker.locator(".v-time-picker-controls__time__field input");
  await expect(inputs).toHaveCount(3);

  for (const [i, typed, model] of [
    [0, "11", "11:30:15"],
    [1, "45", "11:45:15"],
    [2, "07", "11:45:07"],
  ] as const) {
    await inputs.nth(i).fill("");
    await inputs.nth(i).pressSequentially(typed);
    await inputs.nth(i).press("Tab");
    await expect(inputs.nth(i)).toHaveValue(typed);
    await expect(picker).toHaveAttribute("data-value", model);
  }
});
