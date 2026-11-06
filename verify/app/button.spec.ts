import { expect, test, type Page } from "@playwright/test";
import { adminEditorURL, discoverAdminTypes } from "../lib/admin";
import { buttonColors, textOffset } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// M7 buttons against Canon's tone matrix (canon §3.5, §4 A Button), on the
// demo's `/c-style` fixture page. Intent "default" = the accent.

const blue = { 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" };
const red = { 200: "#fecaca", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c" };
const zinc = { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 400: "#a1a1aa", 700: "#3f3f46", 800: "#27272a", 900: "#18181b" };
const white = "#ffffff";
const clear = "rgba(0, 0, 0, 0)";

/** Canon's per-intent values in light mode. */
const light = {
  default: { solid: [blue[600], blue[500], blue[700]], text: blue[700], tint: blue[400], low: blue[200], on: white },
  neutral: { solid: [zinc[900], zinc[800], zinc[700]], text: zinc[900], tint: zinc[400], low: zinc[200], on: white },
  error: { solid: [red[600], red[500], red[700]], text: red[700], tint: red[400], low: red[200], on: white },
};
const lightTints = [0.08, 0.15, 0.2, 0.25];
const controlShadow = "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px";

async function open(page: Page, scheme: Scheme = "light") {
  await gotoScheme(page, "/c-style", scheme);
  await page.locator("[data-btn-group]").waitFor();
}

const btn = (page: Page, id: string) => page.locator(`[data-btn="${id}"]`);

/** Rest, hover and press (mouse held down) colours of one button. */
async function states(page: Page, id: string) {
  const b = btn(page, id);
  await page.mouse.move(0, 0);
  const rest = await buttonColors(b);
  await b.hover();
  // Colours transition over 0.12s.
  await page.waitForTimeout(200);
  const hover = await buttonColors(b);
  await page.mouse.down();
  await page.waitForTimeout(200);
  const active = await buttonColors(b);
  await page.mouse.up();
  return [rest, hover, active];
}

test.describe("M7 buttons", () => {
  for (const [intent, c] of Object.entries(light)) {
    test(`${intent}: emphasis × state colours (canon §3.5 tone matrix)`, async ({ page }) => {
      await open(page);

      const high = await states(page, `flat-${intent}-default`);
      expect(high.map((s) => s.bg)).toEqual(c.solid);
      for (const s of high) expect(s.fg).toBe(c.on);

      const medium = await states(page, `tonal-${intent}-default`);
      for (const s of medium) expect([s.fg, s.bg, s.underlay]).toEqual([c.text, clear, c.tint]);
      expect(medium.map((s) => s.underlayOpacity)).toEqual(lightTints.slice(1));

      const low = await states(page, `outlined-${intent}-default`);
      for (const s of low) expect([s.fg, s.border, s.underlay]).toEqual([c.text, c.low, c.tint]);
      expect(low.map((s) => s.underlayOpacity)).toEqual([0, ...lightTints.slice(0, 2)]);
      expect(low.map((s) => s.shadow)).toEqual([controlShadow, controlShadow, "none"]);

      const minimal = await states(page, `text-${intent}-default`);
      for (const s of minimal) expect([s.fg, s.border]).toEqual([c.text, clear]);
      expect(minimal.map((s) => s.underlayOpacity)).toEqual([0, ...lightTints.slice(0, 2)]);
    });
  }

  test("dark: labels flip to step 300, tints to step 500, neutral high inverts", async ({ page }) => {
    await open(page, "dark");
    const tonal = await buttonColors(btn(page, "tonal-default-default"));
    expect([tonal.fg, tonal.underlay, tonal.underlayOpacity]).toEqual([blue[300], blue[500], 0.2]);
    const neutralHigh = await buttonColors(btn(page, "flat-neutral-default"));
    expect([neutralHigh.bg, neutralHigh.fg]).toEqual([white, zinc[900]]);
    const neutralLow = await buttonColors(btn(page, "outlined-neutral-default"));
    expect([neutralLow.fg, neutralLow.border]).toEqual([zinc[100], zinc[700]]);
    const lowAccent = await buttonColors(btn(page, "outlined-default-default"));
    // tone-300 at 35%
    expect(lowAccent.border).toBe("rgba(147, 197, 253, 0.35)");
  });

  test("disabled is grey whatever the emphasis (canon §3.5 Disabled)", async ({ page }) => {
    await open(page);
    for (const variant of ["flat", "tonal", "outlined", "text"]) {
      const c = await buttonColors(btn(page, `${variant}-disabled`));
      expect(c.fg, variant).toBe(zinc[400]);
      expect(c.bg, variant).toBe(variant === "flat" || variant === "tonal" ? zinc[50] : clear);
      if (variant !== "flat") expect(c.underlayOpacity, variant).toBe(0);
      if (variant === "outlined") expect(c.border).toBe(zinc[200]);
    }
  });

  // Canon's tracking (for Inter) at the default font's scale, Public Sans 0.5 (`fontVariables`).
  const trackingScale = 0.5;
  for (const [size, h, x, radius, font, lh, tracking] of [
    ["small", 32, 12, 4, 12, 16, -0.084],
    ["default", 40, 16, 8, 14, 20, -0.084],
    ["large", 48, 20, 12, 16, 24, -0.064],
  ] as const) {
    test(`${size}: H ${h}, text at ${x}px, radius ${radius}, type ${font}/${lh} 500 (canon §4 A Button)`, async ({ page }) => {
      await open(page);
      for (const variant of ["flat", "tonal", "outlined", "text"]) {
        const b = btn(page, `${variant}-default-${size}`);
        const box = (await b.boundingBox())!;
        expect(box.height, variant).toBe(h);
        expect(await textOffset(b), variant).toBeCloseTo(x, 0);
        const s = await b.evaluate((el) => {
          const c = getComputedStyle(el);
          return [c.borderTopLeftRadius, c.fontSize, c.lineHeight, c.fontWeight, c.letterSpacing, c.minWidth];
        });
        expect(s.slice(0, 4), variant).toEqual([`${radius}px`, `${font}px`, `${lh}px`, "500"]);
        expect(parseFloat(s[4])).toBeCloseTo(tracking * trackingScale, 2);
      }
    });
  }

  test("icon-only buttons are square with the control radius; prepend icon at 10px, 8px to the label", async ({ page }) => {
    await open(page);
    const icon = btn(page, "icon");
    const box = (await icon.boundingBox())!;
    expect([box.width, box.height]).toEqual([40, 40]);
    await expect(icon).toHaveCSS("border-top-left-radius", "8px");
    const gaps = await btn(page, "prepend").evaluate((el) => {
      const i = el.querySelector(".v-icon")!.getBoundingClientRect();
      return [i.left - el.getBoundingClientRect().left];
    });
    expect(gaps[0]).toBeCloseTo(10, 0);
    expect(await textOffset(btn(page, "prepend")) - gaps[0] - 20).toBeCloseTo(8, 0);
  });

  test("neutral icons are muted (zinc-500) until pressed", async ({ page }) => {
    await open(page);
    const icon = btn(page, "icon-neutral").locator(".v-icon");
    await expect(icon).toHaveCSS("color", "rgb(113, 113, 122)");
    await btn(page, "icon-neutral").hover();
    await page.mouse.down();
    await expect(icon).toHaveCSS("color", "rgb(24, 24, 27)");
    await page.mouse.up();
  });

  test("a focused button shows its hover rung (canon §2.8)", async ({ page }) => {
    await open(page);
    const b = btn(page, "tonal-default-default");
    await b.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(b).toBeFocused();
    await expect.poll(async () => (await buttonColors(b)).underlayOpacity).toBe(0.2);
  });

  test("button group: outer radius only, 1px zinc-200 dividers, pressed fill ≈ zinc-100 (canon §4 A Button Group)", async ({ page }) => {
    await open(page);
    const group = page.locator("[data-btn-group]");
    await expect(group).toHaveCSS("border-top-left-radius", "8px");
    expect(shadowLayers(await group.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([controlShadow]);
    const buttons = group.locator(".v-btn");
    const radii = await buttons.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderRightWidth, s.boxShadow];
      }),
    );
    expect(radii.map((r) => r.slice(0, 3))).toEqual([
      ["8px", "0px", "1px"],
      ["0px", "0px", "1px"],
      ["0px", "8px", "1px"],
    ]);
    for (const r of radii) expect(r[3]).toBe("none");
    const pressed = await buttonColors(buttons.nth(1));
    expect([pressed.fg, pressed.border, pressed.underlay, pressed.underlayOpacity]).toEqual([zinc[900], zinc[200], zinc[400], 0.15]);
  });

  test("card actions are medium emphasis at full padding (plan §8.1 R3)", async ({ page }) => {
    await open(page);
    const b = btn(page, "card-action");
    await expect(b).toHaveClass(/v-btn--variant-tonal/);
    expect(await textOffset(b)).toBeCloseTo(16, 0);
  });

  test("Coalesce toolbar, table and field buttons are neutral; the accent is opt-in", async ({ page }) => {
    const [type] = await discoverAdminTypes(page);
    for (const path of [`/admin/${type}`, await adminEditorURL(page, type), "/admin/audit"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      const accented = await page
        .locator(":is(.v-toolbar, .v-table, .v-field, .v-list) .v-btn:is(.text-primary, .bg-primary)")
        .count();
      expect(accented, path).toBe(0);
    }
  });
});
