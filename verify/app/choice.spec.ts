import { expect, test, type Page } from "@playwright/test";
import { normalizeColors } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// M9 choices against canon §4 C (Checkbox/Radio, Switch), on `/c-style`.

const zinc = { 100: "#f4f4f5", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 700: "#3f3f46", 800: "#27272a", 900: "#18181b" };

async function open(page: Page, scheme: Scheme = "light") {
  await gotoScheme(page, "/c-style", scheme);
  await page.locator('[data-choice="switch-on"]').waitFor();
}

const choice = (page: Page, id: string) => page.locator(`[data-choice="${id}"]`);

/** The glyph's drawn parts: box/circle stroke and fill, mark stroke/fill, all resolved. */
async function glyph(page: Page, id: string) {
  const raw = await choice(page, id).evaluate((el) => {
    const svg = el.querySelector("svg.cs-choice")!;
    const [shape, mark] = [...svg.children] as SVGElement[];
    const s = getComputedStyle(shape);
    const m = mark && getComputedStyle(mark);
    const box = svg.getBoundingClientRect();
    const shapeBox = shape.getBoundingClientRect();
    return {
      colors: { stroke: s.stroke, fill: s.fill, mark: m ? (m.stroke !== "none" ? m.stroke : m.fill) : "transparent" },
      size: [box.width, box.height],
      shape: [shapeBox.width, shapeBox.height],
      radius: shape.getAttribute("rx"),
    };
  });
  return { ...raw, colors: await normalizeColors(page, raw.colors) };
}

test.describe("M9 choices", () => {
  test("checkbox: 18px box in a 20px cell, radius 5, zinc-400 line; checked zinc-900 with a white mark", async ({ page }) => {
    await open(page);
    const off = await glyph(page, "checkbox-off");
    expect(off.size).toEqual([20, 20]);
    expect(off.shape).toEqual([17, 17]); // geometry box; the 1px stroke makes it 18
    expect(off.colors.stroke).toBe(zinc[400]);
    const on = await glyph(page, "checkbox-on");
    expect([on.shape, on.radius]).toEqual([[18, 18], "5"]);
    expect([on.colors.fill, on.colors.mark]).toEqual([zinc[900], "#ffffff"]);
    const mixed = await glyph(page, "checkbox-mixed");
    expect([mixed.colors.fill, mixed.colors.mark]).toEqual([zinc[900], "#ffffff"]);
  });

  test("radio: zinc-400 ring; checked zinc-900 with a 5px white dot", async ({ page }) => {
    await open(page);
    expect((await glyph(page, "radio-off")).colors.stroke).toBe(zinc[400]);
    const on = await glyph(page, "radio-on");
    expect([on.colors.fill, on.colors.mark]).toEqual([zinc[900], "#ffffff"]);
    const dot = await choice(page, "radio-on").evaluate((el) => el.querySelector("svg.cs-choice circle:last-child")!.getBoundingClientRect().width);
    expect(dot).toBe(5);
  });

  test("dark: checked is a white box with a zinc-900 mark; line zinc-500", async ({ page }) => {
    await open(page, "dark");
    const on = await glyph(page, "checkbox-on");
    expect([on.colors.fill, on.colors.mark]).toEqual(["#ffffff", zinc[900]]);
    expect((await glyph(page, "checkbox-off")).colors.stroke).toBe(zinc[500]);
  });

  test("label 14/20 ink, 8px from the control; hover halo 3px zinc-100 around the box", async ({ page }) => {
    await open(page);
    const el = choice(page, "checkbox-off");
    const m = await el.evaluate((node) => {
      const box = node.querySelector("svg.cs-choice")!.getBoundingClientRect();
      const label = node.querySelector(".v-label")!;
      const range = document.createRange();
      range.selectNodeContents(label);
      const s = getComputedStyle(label);
      return { gap: range.getBoundingClientRect().left - box.right, size: s.fontSize, lh: s.lineHeight, color: s.color, opacity: s.opacity };
    });
    expect(m.gap).toBeCloseTo(8, 0);
    expect([m.size, m.lh, m.opacity]).toEqual(["14px", "20px", "1"]);
    // Page ink: on-background (zinc-950), Canon's label is zinc-900.
    expect((await normalizeColors(page, { c: m.color })).c).toBe("#09090b");
    await el.locator(".v-label").hover();
    const halo = () => el.evaluate((n) => getComputedStyle(n.querySelector(".v-selection-control__input")!, "::before").boxShadow);
    await expect.poll(async () => shadowLayers(await halo())).toEqual(["rgb(244, 244, 245) 0px 0px 0px 3px"]);
    const before = await el.evaluate((n) => {
      const s = getComputedStyle(n.querySelector(".v-selection-control__input")!, "::before");
      return [s.width, s.height, s.borderTopLeftRadius];
    });
    expect(before).toEqual(["18px", "18px", "5px"]);
  });

  test("keyboard focus rings control + label (2px offset, 1px blue-600)", async ({ page }) => {
    await open(page);
    const input = choice(page, "checkbox-off").locator("input");
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const control = choice(page, "checkbox-off").locator(".v-selection-control");
    await expect.poll(async () => shadowLayers(await control.evaluate((n) => getComputedStyle(n).boxShadow))).toEqual([
      "rgb(255, 255, 255) 0px 0px 0px 2px",
      "rgb(37, 99, 235) 0px 0px 0px 3px",
    ]);
  });

  test("switch: 38×24 pill (34×20 + 2px ring), thumb 20 inset 2, off zinc-300 / on zinc-900 with white thumb, label 8px out", async ({ page }) => {
    await open(page);
    for (const [id, track, thumbX] of [["switch-off", zinc[300], 2], ["switch-on", zinc[900], 16]] as const) {
      const m = await choice(page, id).evaluate((el) => {
        const t = el.querySelector(".v-switch__track")!;
        const th = el.querySelector(".v-switch__thumb")!;
        const tr = t.getBoundingClientRect();
        const hr = th.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el.querySelector(".v-label")!);
        return {
          track: [tr.width, tr.height],
          thumb: [hr.width, hr.height, hr.left - tr.left, hr.top - tr.top],
          labelGap: range.getBoundingClientRect().left - tr.right,
          colors: { track: getComputedStyle(t).backgroundColor, thumb: getComputedStyle(th).backgroundColor },
        };
      });
      expect(m.track, id).toEqual([38, 24]);
      expect(m.thumb.slice(0, 2), id).toEqual([20, 20]);
      expect(m.thumb[2], id).toBeCloseTo(thumbX, 0);
      expect(m.thumb[3], id).toBeCloseTo(2, 0);
      expect(m.labelGap, id).toBeCloseTo(8, 0);
      expect(await normalizeColors(page, m.colors), id).toEqual({ track, thumb: "#ffffff" });
    }
  });

  test("dark switch: off zinc-700, on white with a zinc-900 thumb", async ({ page }) => {
    await open(page, "dark");
    const colors = (id: string) =>
      choice(page, id).evaluate((el) => ({
        track: getComputedStyle(el.querySelector(".v-switch__track")!).backgroundColor,
        thumb: getComputedStyle(el.querySelector(".v-switch__thumb")!).backgroundColor,
      }));
    expect((await normalizeColors(page, await colors("switch-off"))).track).toBe(zinc[700]);
    expect(await normalizeColors(page, await colors("switch-on"))).toEqual({ track: "#ffffff", thumb: zinc[900] });
  });
});
