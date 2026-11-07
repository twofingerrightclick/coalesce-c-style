import { expect, test, type Locator, type Page } from "@playwright/test";
import { shadows, white, zinc } from "../lib/canon";
import { normalizeColors } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// The public styling contract on an app component: the demo's
// OptionTiles.vue (styled with `coalesce-c-style/tokens` and `--cs-*` only) follows
// the theme, the accent, the font, and Canon's numbers for its states.

const blue = { 200: "191, 219, 254", 300: "147, 197, 253", 400: "96, 165, 250", 500: "59, 130, 246", 700: "29, 78, 216" };
const violet = { 200: "221, 214, 254", 400: "167, 139, 250", 700: "109, 40, 217" };
const grey = { 200: "228, 228, 231", 400: "161, 161, 170", 500: "113, 113, 122", 700: "63, 63, 70" };
const rgb = (c: string) => `rgb(${c})`;
const rgba = (c: string, a: number) => `rgba(${c}, ${a})`;

/** Canon §3.5 for a low-emphasis primary tile, per scheme. */
const canon = {
  light: {
    text: rgb(blue[700]),
    borderLow: rgb(blue[200]),
    tint1: rgba(blue[400], 0.08),
    tint2: rgba(blue[400], 0.15),
    neutralTint1: rgba(grey[400], 0.08),
    disabledFg: rgb(grey[400]),
    frame: rgb(grey[200]),
    muted: rgb(grey[500]),
    rule: "rgba(0, 0, 0, 0.1)",
    control: "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
    ring: [`${white} 0px 0px 0px 2px`, "rgb(37, 99, 235) 0px 0px 0px 3px"],
    surface: white,
  },
  dark: {
    text: rgb(blue[300]),
    borderLow: rgba(blue[300], 0.35),
    tint1: rgba(blue[500], 0.1),
    tint2: rgba(blue[500], 0.2),
    neutralTint1: rgba(grey[500], 0.1),
    disabledFg: rgb(grey[500]),
    frame: rgb(grey[700]),
    muted: rgb(grey[400]),
    rule: "rgba(255, 255, 255, 0.1)",
    control: "rgba(0, 0, 0, 0.3) 0px 1px 2px 0px",
    ring: [`${rgb("24, 24, 27")} 0px 0px 0px 2px`, `${rgb(blue[400])} 0px 0px 0px 3px`],
    surface: zinc[900],
  },
};

async function tile(el: Locator) {
  const raw = await el.evaluate((node) => {
    const s = getComputedStyle(node);
    return { bg: s.backgroundColor, fg: s.color, border: s.borderTopColor, shadow: s.boxShadow, radius: s.borderTopLeftRadius };
  });
  const { shadow, radius, ...colors } = raw;
  const normalized = await normalizeColors(el.page(), colors);
  // Opaque colours normalise to hex; spell them as rgb() like the rest.
  for (const key of Object.keys(normalized) as (keyof typeof normalized)[]) {
    const hex = normalized[key].match(/^#(..)(..)(..)$/);
    if (hex) normalized[key] = rgb(hex.slice(1).map((h) => parseInt(h, 16)).join(", "));
  }
  return { ...normalized, shadow: shadowLayers(shadow), radius };
}

async function textOf(el: Locator) {
  return el.evaluate((node) => {
    const s = getComputedStyle(node);
    return { size: s.fontSize, line: s.lineHeight, weight: s.fontWeight, tracking: s.letterSpacing, family: s.fontFamily.split(",")[0] };
  });
}

const group = (page: Page, intent: string) => page.locator(`[data-tokens="${intent}"]`);
const option = (page: Page, value: string) => page.locator(`[data-option="${value}"]`);

for (const scheme of ["light", "dark"] as const) {
  const c = canon[scheme];

  test(`${scheme}: surface, hairline and type roles (canon §2.6, §2.9, §3.4)`, async ({ page }) => {
    await gotoScheme(page, "/c-style", scheme);
    const panel = group(page, "primary");
    await expect(panel).toHaveCSS("background-color", c.surface);
    await expect(panel).toHaveCSS("border-top-left-radius", "12px");
    expect(shadowLayers(await panel.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([shadows[scheme].edge, ...shadows[scheme].raised]);

    const header = panel.locator(".option-tiles__header");
    await expect(header).toHaveCSS("border-bottom-width", "1px");
    await expect(header).toHaveCSS("border-bottom-color", c.rule);

    expect(await textOf(panel.locator(".option-tiles__title"))).toMatchObject({ size: "14px", line: "20px", weight: "600" });
    const hint = panel.locator(".option-tiles__hint");
    expect(await textOf(hint)).toMatchObject({ size: "12px", line: "16px", weight: "400" });
    await expect(hint).toHaveCSS("color", c.muted);
    const amount = option(page, "team").locator(".option-tile__amount");
    expect(await textOf(amount)).toMatchObject({ size: "20px", line: "28px", weight: "600", tracking: "-0.15px" });
  });

  test(`${scheme}: low-emphasis tiles at rest, selected, hover, pressed and disabled (canon §3.5)`, async ({ page }) => {
    await gotoScheme(page, "/c-style", scheme);
    const rest = option(page, "starter");
    expect(await tile(rest)).toEqual({ bg: "rgba(0, 0, 0, 0)", fg: c.text, border: c.borderLow, shadow: [c.control], radius: "8px" });
    expect(await textOf(rest.locator(".option-tile__title"))).toMatchObject({ size: "14px", line: "20px", weight: "500", tracking: "-0.042px" });
    await expect(rest.locator(".option-tile__description")).toHaveCSS("color", c.muted);
    await expect(rest.locator(".option-tile__check")).toHaveCSS("opacity", "0");

    const selected = option(page, "team");
    await expect(selected).toHaveAttribute("aria-checked", "true");
    expect(await tile(selected)).toMatchObject({ bg: c.tint2, fg: c.text, border: c.borderLow });
    await expect(selected.locator(".option-tile__check")).toHaveCSS("opacity", "1");
    await expect(selected.locator(".option-tile__check")).toHaveCSS("width", "20px");

    await rest.hover();
    await expect.poll(async () => (await tile(rest)).bg).toBe(c.tint1);
    await page.mouse.down();
    await expect.poll(async () => (await tile(rest)).bg).toBe(c.tint2);
    await expect.poll(async () => (await tile(rest)).shadow).toEqual([]);
    await page.mouse.up();
    await expect(rest).toHaveAttribute("aria-checked", "true");
    await expect(selected).toHaveAttribute("aria-checked", "false");

    const disabled = option(page, "enterprise");
    await expect(disabled).toBeDisabled();
    expect(await tile(disabled)).toMatchObject({ bg: "rgba(0, 0, 0, 0)", fg: c.disabledFg, border: c.frame, shadow: [] });
    await expect(disabled.locator(".option-tile__description")).toHaveCSS("color", c.disabledFg);

    // Neutral intent: the same recipe from the neutral ladder.
    const neutral = option(page, "us");
    await neutral.hover();
    await expect.poll(async () => (await tile(neutral)).bg).toBe(c.neutralTint1);
    await expect(neutral).toHaveCSS("border-top-color", c.frame);
  });

  test(`${scheme}: keyboard focus draws Canon's ring on the hover rung (canon §2.8)`, async ({ page }) => {
    await gotoScheme(page, "/c-style", scheme);
    // The region group has no selection, so its first tile is the tab stop.
    const target = option(page, "us");
    await option(page, "team").focus();
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
    await expect.poll(async () => (await tile(target)).shadow).toEqual(c.ring);
    expect((await tile(target)).bg).toBe(c.neutralTint1);
    await expect(target).toHaveCSS("outline-style", "solid");
    await expect(target).toHaveCSS("outline-offset", "2px");
  });

  test(`${scheme}: control-box(sm) and interactive(neutral, minimal) on the clear button`, async ({ page }) => {
    await gotoScheme(page, "/c-style", scheme);
    const clear = group(page, "primary").locator(".option-tiles__clear");
    await expect(clear).toBeEnabled();
    expect(await clear.boundingBox()).toMatchObject({ height: 32 });
    await expect(clear).toHaveCSS("border-top-left-radius", "4px");
    await expect(clear).toHaveCSS("padding-left", "7px");
    expect(await textOf(clear)).toMatchObject({ size: "12px", line: "16px", weight: "500", tracking: "-0.042px" });
    expect(await clear.evaluate((el) => getComputedStyle(el).getPropertyValue("--cs-icon"))).toBe("16px");
    expect(await tile(clear)).toMatchObject({ bg: "rgba(0, 0, 0, 0)", border: "rgba(0, 0, 0, 0)", shadow: [] });
    await clear.click();
    await expect(clear).toBeDisabled();
    await expect(option(page, "team")).toHaveAttribute("aria-checked", "false");
  });
}

test("the tiles are a radio group: one tab stop, arrows move the selection", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  await expect(group(page, "primary").getByRole("radiogroup")).toHaveAccessibleName("Plan");
  await expect(group(page, "primary").getByRole("radio")).toHaveCount(4);
  await expect(option(page, "team")).toHaveAttribute("tabindex", "0");
  await expect(option(page, "starter")).toHaveAttribute("tabindex", "-1");
  await option(page, "team").focus();
  await page.keyboard.press("ArrowRight");
  await expect(option(page, "business")).toBeFocused();
  await expect(option(page, "business")).toHaveAttribute("aria-checked", "true");
  // Enterprise is disabled, so the next step wraps to the first tile.
  await page.keyboard.press("ArrowDown");
  await expect(option(page, "starter")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(option(page, "business")).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await expect(option(page, "starter")).toHaveAttribute("aria-checked", "true");
});

test("an unlayered app :root override of a size token wins, even parsed first", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const height = await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = ":root { --cs-control-height: 36px; }";
    document.head.prepend(style);
    return getComputedStyle(document.documentElement).getPropertyValue("--cs-control-height");
  });
  expect(height).toBe("36px");
});

test("the tokens re-resolve under a nested dark theme", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const colors = await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="nested" class="v-theme--dark"><span style="background: var(--cs-surface); color: var(--cs-primary-text)"></span></div>',
    );
    const s = getComputedStyle(document.querySelector("#nested > span")!);
    return { bg: s.backgroundColor, fg: s.color };
  });
  expect(colors).toEqual({ bg: zinc[900], fg: canon.dark.text });
});

test("the tokens follow a run-time theme switch", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const selected = option(page, "team");
  expect(await tile(selected)).toMatchObject({ bg: canon.light.tint2, fg: canon.light.text });
  await page.locator(".v-app-bar .v-list-item", { hasText: "Settings" }).click();
  await page.getByLabel("Dark Mode").click();
  await page.keyboard.press("Escape");
  await expect(group(page, "primary")).toHaveCSS("background-color", zinc[900]);
  // Polled: the colours settle over --cs-duration-state.
  await expect.poll(() => tile(selected)).toMatchObject({ bg: canon.dark.tint2, fg: canon.dark.text, border: canon.dark.borderLow });
});

test("the tokens follow applyCStyleColors without a reload", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  await page.locator('[data-accent="violet"]').click();
  const selected = option(page, "team");
  await expect.poll(async () => (await tile(selected)).bg).toBe(rgba(violet[400], 0.15));
  expect(await tile(selected)).toMatchObject({ fg: rgb(violet[700]), border: rgb(violet[200]) });
  // The ring is the accent too.
  await option(page, "team").focus();
  await page.keyboard.press("Tab");
  await expect.poll(async () => (await tile(option(page, "us"))).shadow).toEqual([`${white} 0px 0px 0px 2px`, "rgb(124, 58, 237) 0px 0px 0px 3px"]);
  await page.locator('[data-accent="canon"]').click();
  await expect.poll(async () => (await tile(selected)).bg).toBe(canon.light.tint2);
});

test("the tokens follow applyCStyleFont without a reload", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const title = option(page, "team").locator(".option-tile__title");
  expect(await textOf(title)).toMatchObject({ family: '"Public Sans Variable"', tracking: "-0.042px" });
  await page.locator('[data-font="system-ui"]').click();
  // Tracking 0 for a font c-style doesn't know; Chrome serialises 0 as `normal`.
  await expect(title).toHaveCSS("letter-spacing", "normal");
  expect((await textOf(title)).family).toBe("system-ui");
  await page.locator('[data-font="public-sans"]').click();
  await expect(title).toHaveCSS("letter-spacing", "-0.042px");
});
