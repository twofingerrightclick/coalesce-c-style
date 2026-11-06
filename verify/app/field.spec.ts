import { expect, test, type Locator, type Page } from "@playwright/test";
import { adminEditorURL, discoverAdminTypes } from "../lib/admin";
import { normalizeColors, textOffset } from "../lib/computed";
import { gotoScheme, shadowLayers } from "../lib/page";

// M8 text entry against canon §4 B (Text Input, Field, Label, Select), on the
// demo's `/c-style` fixture page and the Coalesce admin editor.

const zinc = { 50: "#fafafa", 200: "#e4e4e7", 400: "#a1a1aa", 500: "#71717a", 900: "#18181b" };
const controlShadow = "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px";

async function open(page: Page) {
  await gotoScheme(page, "/c-style", "light");
  await page.locator('[data-field="toolbar"]').waitFor();
}

const field = (page: Page, id: string) => page.locator(`[data-field="${id}"]`);

/** Frame line colour (the outline's end piece), fill and box-shadow of a `.v-field`. */
async function frame(input: Locator) {
  const f = input.locator(".v-field").first();
  const raw = await f.evaluate((el) => {
    const s = getComputedStyle(el);
    const line = getComputedStyle(el.querySelector(".v-field__outline__end")!);
    return { line: line.borderTopColor, lineStyle: line.borderTopStyle, lineWidth: line.borderTopWidth, bg: s.backgroundColor, fg: s.color, shadow: s.boxShadow };
  });
  const { lineStyle, lineWidth, shadow, ...colors } = raw;
  return { ...(await normalizeColors(f.page(), colors)), lineStyle, lineWidth, shadow: shadowLayers(shadow) };
}

/** Gap between the label's bottom and the frame's top. */
async function labelGap(input: Locator) {
  return input.evaluate((el) => {
    const label = el.querySelector(".v-field-label")!.getBoundingClientRect();
    return el.querySelector(".v-field")!.getBoundingClientRect().top - label.bottom;
  });
}

test.describe("M8 text entry", () => {
  test("frame at rest: H 40, 1px zinc-200, radius 8, white, control shadow, text 16px in at 14/20 (canon §4 B)", async ({ page }) => {
    await open(page);
    const f = field(page, "text").locator(".v-field");
    expect((await f.boundingBox())!.height).toBe(40);
    await expect(f).toHaveCSS("border-top-left-radius", "8px");
    expect(await frame(field(page, "text"))).toMatchObject({ line: zinc[200], lineWidth: "1px", bg: "#ffffff", shadow: [controlShadow] });
    const input = field(page, "no-label").locator("input");
    await expect(input).toHaveCSS("font-size", "14px");
    await expect(input).toHaveCSS("line-height", "20px");
    await expect(input).toHaveCSS("font-weight", "400");
    expect(await textOffset(field(page, "select").locator(".v-field__input"))).toBeCloseTo(16, 0);
  });

  test("hover zinc-400; focus blue-600 with a 3px blue-100 halo (canon §3.5 field recipe)", async ({ page }) => {
    await open(page);
    const input = field(page, "text");
    await input.locator(".v-field").hover();
    await expect.poll(async () => (await frame(input)).line).toBe(zinc[400]);
    await input.locator("input").focus();
    await expect.poll(async () => frame(input)).toMatchObject({ line: "#2563eb", lineWidth: "1px", shadow: ["rgb(219, 234, 254) 0px 0px 0px 3px"] });
  });

  test("error: red-400 line, focus red-600 + red-100 halo; label stays ink", async ({ page }) => {
    await open(page);
    const input = field(page, "error");
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await frame(input)).line).toBe("#f87171");
    await input.locator("input").focus();
    await expect.poll(async () => frame(input)).toMatchObject({ line: "#dc2626", shadow: ["rgb(254, 226, 226) 0px 0px 0px 3px"] });
    await expect(input.locator(".v-field-label")).toHaveCSS("color", "rgb(24, 24, 27)");
  });

  test("disabled: zinc-50 fill, zinc-400 text, no shadow; readonly: dashed line", async ({ page }) => {
    await open(page);
    expect(await frame(field(page, "disabled"))).toMatchObject({ bg: zinc[50], fg: zinc[400], shadow: [] });
    await expect(field(page, "disabled").locator(".v-field")).toHaveCSS("opacity", "1");
    expect((await frame(field(page, "readonly"))).lineStyle).toBe("dashed");
  });

  test("label sits 6px above the frame at 14/20/500, flush left (decision 15)", async ({ page }) => {
    await open(page);
    for (const id of ["text", "icon", "select", "autocomplete", "combobox", "textarea", "number"]) {
      const input = field(page, id);
      expect(await labelGap(input), id).toBeCloseTo(6, 0);
      const label = input.locator(".v-field-label");
      await expect(label, id).toBeVisible();
      await expect(label).toHaveCSS("font-size", "14px");
      await expect(label).toHaveCSS("line-height", "20px");
      await expect(label).toHaveCSS("font-weight", "500");
      const dx = await input.evaluate(
        (el) => el.querySelector(".v-field-label")!.getBoundingClientRect().left - el.querySelector(".v-field")!.getBoundingClientRect().left,
      );
      expect(dx, id).toBeCloseTo(0, 0);
      expect((await input.locator(".v-field").boundingBox())!.height, id).toBe(40);
    }
    // Typing doesn't move it.
    const input = field(page, "text");
    await input.locator("input").fill("Ada");
    expect(await labelGap(input)).toBeCloseTo(6, 0);
  });

  test("message 8px under the frame at 12/16, ink at .6 (≈ zinc-500), flush left", async ({ page }) => {
    await open(page);
    const input = field(page, "text");
    const m = await input.evaluate((el) => {
      const f = el.querySelector(".v-field")!.getBoundingClientRect();
      const msg = el.querySelector(".v-messages__message")!;
      const r = msg.getBoundingClientRect();
      const s = getComputedStyle(msg);
      const opacity = getComputedStyle(el.querySelector(".v-messages")!).opacity;
      return { gap: r.top - f.bottom, dx: r.left - f.left, size: s.fontSize, lh: s.lineHeight, color: s.color, opacity };
    });
    expect(m.gap).toBeCloseTo(8, 0);
    expect(m.dx).toBeCloseTo(0, 0);
    expect([m.size, m.lh]).toEqual(["12px", "16px"]);
    // Ink at medium emphasis (.6) ≈ zinc-500 on a surface.
    expect((await normalizeColors(page, { color: m.color })).color).toBe("#09090b");
    expect(m.opacity).toBe("0.6");
  });

  test("empty label reserves no row; toolbar fields keep the label inside", async ({ page }) => {
    await open(page);
    const top = (sel: Locator) => sel.evaluate((el) => el.querySelector(".v-field")!.getBoundingClientRect().top - el.getBoundingClientRect().top);
    expect(await top(field(page, "no-label"))).toBe(0);
    const toolbar = field(page, "toolbar");
    expect(await top(toolbar)).toBe(0);
    const inside = await toolbar.evaluate((el) => {
      const l = el.querySelector(".v-field-label")!.getBoundingClientRect();
      const f = el.querySelector(".v-field")!.getBoundingClientRect();
      return l.top >= f.top && l.bottom <= f.bottom;
    });
    expect(inside).toBe(true);
  });

  test("one-row textarea is 40", async ({ page }) => {
    await open(page);
    expect((await field(page, "textarea").locator(".v-field").boundingBox())!.height).toBe(40);
  });

  test("Coalesce admin editor: fields are 40, top edge at the input's top, Canon frame", async ({ page }) => {
    const [type] = await discoverAdminTypes(page);
    await page.goto(await adminEditorURL(page, type), { waitUntil: "networkidle" });
    const inputs = page.locator(".c-admin-editor .v-input:has(.v-field--variant-outlined)");
    expect(await inputs.count()).toBeGreaterThan(0);
    for (const input of await inputs.all()) {
      const f = input.locator(".v-field").first();
      expect((await f.boundingBox())!.height).toBe(40);
      expect(await input.evaluate((el) => el.querySelector(".v-field")!.getBoundingClientRect().top - el.getBoundingClientRect().top)).toBe(0);
      const fr = await frame(input);
      if (!(await input.evaluate((el) => el.classList.contains("v-input--readonly") || el.classList.contains("v-input--disabled")))) {
        expect(fr.shadow).toEqual([controlShadow]);
      }
    }
  });
});
