import { expect, test, type Locator, type Page } from "@playwright/test";
import { normalizeColors } from "../lib/computed";
import { gotoScheme, type Scheme } from "../lib/page";

// c-style's Canon Time components (docs/research/canon-time.md) on `/c-style`
// (the kitchen's "Time (Canon)" section) and `/settings`: the keyboard model,
// form integration, ARIA, and Canon's measurements in light and dark.
// Interactive states are compared with Canon's own frame in
// verify/parity/time.spec.ts.

const field = (page: Page, id: string) => page.locator(`[data-time="${id}"]`);
const cell = (root: Locator, type: string, index = 0) => root.locator(`.cs-time-cell[data-type="${type}"]`).nth(index);
const value = (root: Locator, type: string, index = 0) => cell(root, type, index).locator(".cs-time-value");
const model = (root: Locator) => root.getAttribute("data-value");
const focusedType = (page: Page) => page.evaluate(() => (document.activeElement?.parentElement as HTMLElement | null)?.dataset.type ?? null);
const messages = (root: Locator) => root.locator(".v-messages");

test.describe("Canon Time: keyboard", () => {
  test.beforeEach(async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    await field(page, "basic").scrollIntoViewIfNeeded();
  });

  test("typing fills a cell and moves on; the model is HH:mm", async ({ page }) => {
    const basic = field(page, "basic");
    await value(basic, "hour").click();
    await page.keyboard.type("17");
    expect(await focusedType(page)).toBe("minute");
    await page.keyboard.type("45");
    await expect(basic).toHaveAttribute("data-value", "17:45");
    // A first digit that can't take a second is the whole hour.
    await value(basic, "hour").click();
    await page.keyboard.type("7");
    expect(await focusedType(page)).toBe("minute");
    await expect(basic).toHaveAttribute("data-value", "07:45");
    await expect(value(basic, "hour")).toHaveText("07");
  });

  test("Up / Down step and wrap; minutes carry nothing into the hour", async ({ page }) => {
    const basic = field(page, "basic");
    await value(basic, "minute").click();
    await page.keyboard.press("End");
    await expect(basic).toHaveAttribute("data-value", "08:59");
    await page.keyboard.press("ArrowUp");
    await expect(basic).toHaveAttribute("data-value", "08:00");
    await page.keyboard.press("ArrowDown");
    await expect(basic).toHaveAttribute("data-value", "08:59");
    await page.keyboard.press("ArrowLeft");
    expect(await focusedType(page)).toBe("hour");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await expect(basic).toHaveAttribute("data-value", "23:59");
    await page.keyboard.press("PageDown");
    await expect(basic).toHaveAttribute("data-value", "17:59");
    await page.keyboard.press("PageUp");
    await page.keyboard.press("PageUp");
    await expect(basic).toHaveAttribute("data-value", "05:59");
  });

  test("Left / Right and Tab / Shift+Tab move between cells; the step buttons are not tab stops", async ({ page }) => {
    const basic = field(page, "basic");
    await value(basic, "hour").click();
    await page.keyboard.press("ArrowRight");
    expect(await focusedType(page)).toBe("minute");
    await page.keyboard.press("ArrowRight");
    expect(await focusedType(page)).toBe("minute");
    await page.keyboard.press("Shift+Tab");
    expect(await focusedType(page)).toBe("hour");
    await page.keyboard.press("Tab");
    expect(await focusedType(page)).toBe("minute");
    await page.keyboard.press("Tab");
    // Next stop: the empty field's hour, not a step button.
    await expect(value(field(page, "empty"), "hour")).toBeFocused();
  });

  test("Backspace clears, then goes back; Delete clears in place; leaving incomplete is invalid", async ({ page }) => {
    const basic = field(page, "basic");
    await value(basic, "minute").click();
    await page.keyboard.press("Backspace");
    await expect(value(basic, "minute")).toHaveText("--");
    await expect(basic).not.toHaveAttribute("data-value");
    // The hour keeps its value while another cell is empty.
    await expect(value(basic, "hour")).toHaveText("08");
    await page.keyboard.press("Backspace");
    expect(await focusedType(page)).toBe("hour");
    await page.keyboard.press("Delete");
    await expect(value(basic, "hour")).toHaveText("--");
    expect(await focusedType(page)).toBe("hour");
    await page.keyboard.type("9");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(messages(basic)).toHaveText("Enter a complete time.");
    await expect(basic.locator(".cs-time")).toHaveClass(/cs-time--error/);
    // Completing it clears the error.
    await value(basic, "minute").click();
    await page.keyboard.type("15");
    await expect(basic).toHaveAttribute("data-value", "09:15");
    await expect(basic.locator(".cs-time")).not.toHaveClass(/cs-time--error/);
  });

  test("12-hour: A / P choose the period; the model stays 24-hour", async ({ page }) => {
    const ampm = field(page, "ampm");
    await expect(value(ampm, "hour")).toHaveText("02");
    await expect(value(ampm, "period")).toHaveText("PM");
    await value(ampm, "hour").click();
    await page.keyboard.type("0915");
    expect(await focusedType(page)).toBe("period");
    await page.keyboard.press("a");
    await expect(ampm).toHaveAttribute("data-value", "09:15");
    await page.keyboard.press("p");
    await expect(ampm).toHaveAttribute("data-value", "21:15");
    await page.keyboard.press("ArrowUp");
    await expect(ampm).toHaveAttribute("data-value", "09:15");
    await value(ampm, "hour").click();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(value(ampm, "hour")).toHaveText("01");
  });

  test("step 900 moves minutes by 15; an off-step time is invalid", async ({ page }) => {
    const step = field(page, "step");
    await value(step, "minute").click();
    await page.keyboard.press("ArrowUp");
    await expect(step).toHaveAttribute("data-value", "09:45");
    await page.keyboard.press("ArrowUp");
    await expect(step).toHaveAttribute("data-value", "09:00");
    await page.keyboard.type("07");
    await expect(step).toHaveAttribute("data-value", "09:07");
    await expect(messages(step)).toHaveText("Enter a time in steps of 15 minutes.");
  });

  test("seconds: a third cell and HH:mm:ss", async ({ page }) => {
    const seconds = field(page, "seconds");
    await expect(seconds.locator(".cs-time-cell")).toHaveCount(3);
    await value(seconds, "second").click();
    await page.keyboard.press("ArrowDown");
    await expect(seconds).toHaveAttribute("data-value", "00:04:36");
  });

  test("range: an end before the start is invalid unless overnight", async ({ page }) => {
    const range = field(page, "range");
    await value(range, "hour", 1).click();
    await page.keyboard.type("06");
    await expect(range).toHaveAttribute("data-value", "08:00-06:30");
    await expect(messages(range)).toHaveText("The end time is before the start time.");
    await expect(field(page, "overnight").locator(".cs-time")).not.toHaveClass(/cs-time--error/);
    await expect(field(page, "overnight")).toHaveAttribute("data-value", "22:00-06:00");
  });

  test("pointer: a press focuses the cell; its arrows step without taking focus", async ({ page }) => {
    const basic = field(page, "basic");
    const hour = cell(basic, "hour");
    await hour.click();
    await expect(value(basic, "hour")).toBeFocused();
    const up = hour.locator('.cs-time-step[data-direction="up"]');
    await page.waitForTimeout(250);
    await up.click();
    await expect(basic).toHaveAttribute("data-value", "09:00");
    await expect(value(basic, "hour")).toBeFocused();
    await hour.locator('.cs-time-step[data-direction="down"]').click();
    await hour.locator('.cs-time-step[data-direction="down"]').click();
    await expect(basic).toHaveAttribute("data-value", "07:00");
    // A press on the label goes to the first empty cell, else the hour.
    await field(page, "empty").locator(".cs-time-field__label").click();
    await expect(value(field(page, "empty"), "hour")).toBeFocused();
  });

  test("paste fills every cell", async ({ page }) => {
    const basic = field(page, "basic");
    await value(basic, "hour").click();
    await value(basic, "hour").evaluate((el) => {
      const data = new DataTransfer();
      data.setData("text", "2:30 pm");
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(basic).toHaveAttribute("data-value", "14:30");
  });

  test("disabled leaves the tab order; readonly is focusable but fixed", async ({ page }) => {
    await expect(value(field(page, "disabled"), "hour")).toHaveAttribute("tabindex", "-1");
    await expect(value(field(page, "disabled"), "hour")).toHaveAttribute("aria-disabled", "true");
    const readonly = field(page, "readonly");
    await value(readonly, "hour").focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.type("1");
    await expect(value(readonly, "hour")).toHaveText("08");
    await expect(value(readonly, "hour")).toHaveAttribute("aria-readonly", "true");
    await expect(cell(readonly, "hour")).toHaveCSS("height", "40px");
    await expect(cell(readonly, "hour").locator(".cs-time-step").first()).toBeHidden();
  });
});

test.describe("Canon Time: forms and ARIA", () => {
  test.beforeEach(async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    await field(page, "form").scrollIntoViewIfNeeded();
  });

  test("VForm: a rule fails on submit; Enter in a cell submits the form", async ({ page }) => {
    await field(page, "submit").click();
    await expect(messages(field(page, "required"))).toHaveText("Required");
    await expect(field(page, "required").locator(".cs-time")).toHaveClass(/cs-time--error/);
    const required = field(page, "required");
    await value(required, "hour").click();
    await page.keyboard.type("0930");
    await expect(required).toHaveAttribute("data-value", "09:30");
    await expect(messages(required)).toHaveText("");
    await page.keyboard.press("Enter");
    await expect(field(page, "submitted")).toBeVisible();
  });

  test("spinbuttons: names, limits, value text; the group is named by the label", async ({ page }) => {
    const basic = field(page, "basic");
    const hour = value(basic, "hour");
    await expect(hour).toHaveAttribute("role", "spinbutton");
    await expect(hour).toHaveAttribute("aria-label", "Hours");
    await expect(hour).toHaveAttribute("aria-valuemin", "0");
    await expect(hour).toHaveAttribute("aria-valuemax", "23");
    await expect(hour).toHaveAttribute("aria-valuenow", "8");
    await expect(hour).toHaveAttribute("aria-valuetext", "8");
    await expect(value(field(page, "empty"), "minute")).toHaveAttribute("aria-valuetext", "Empty");
    await expect(value(field(page, "empty"), "minute")).not.toHaveAttribute("aria-valuenow", /.*/);
    await expect(value(field(page, "ampm"), "hour")).toHaveAttribute("aria-valuemax", "12");
    await expect(value(field(page, "ampm"), "period")).toHaveAttribute("aria-valuetext", "PM");
    const group = basic.locator(".cs-time-segments");
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAccessibleName("Starts at");
    await expect(basic.locator(".cs-time-step").first()).toHaveAttribute("tabindex", "-1");
    await expect(basic.locator(".cs-time-step").first()).toHaveAttribute("aria-label", "Later hour");
    const range = field(page, "range");
    await expect(range.locator(".cs-time")).toHaveAccessibleName("Shift");
    await expect(range.locator('.cs-time-segments[data-part="end"]')).toHaveAccessibleName("End");
    await expect(field(page, "error").locator(".cs-time-segments")).toHaveAttribute("aria-invalid", "true");
  });
});

const tokens = {
  light: { line: "#e4e4e7", hover: "#a1a1aa", bg: "#ffffff", ink: "#18181b", tab: "#f4f4f5", quiet: "#a1a1aa", focus: "#2563eb", halo: "#dbeafe", press: "#d4d4d8", error: "#f87171", disabledBg: "#fafafa", disabledFg: "#a1a1aa" },
  dark: { line: "#3f3f46", hover: "#71717a", bg: "#18181b", ink: "#ffffff", tab: "#27272a", quiet: "#71717a", focus: "#60a5fa", halo: "#1e3a8a", press: "#52525b", error: "#ef4444", disabledBg: "#27272a", disabledFg: "#71717a" },
} satisfies Record<Scheme, Record<string, string>>;

const css = (el: Locator, props: string[], pseudo?: string) =>
  el.evaluate((node, [props, pseudo]) => Object.fromEntries(props.map((p) => [p, getComputedStyle(node, pseudo).getPropertyValue(p)])), [props, pseudo] as const);

for (const scheme of ["light", "dark"] as const) {
  test.describe(`Canon Time: measurements (${scheme})`, () => {
    const t = tokens[scheme];
    test.beforeEach(async ({ page }) => {
      await gotoScheme(page, "/c-style", scheme);
      await field(page, "basic").scrollIntoViewIfNeeded();
    });

    test("cells: 40 squares 4 apart around a quiet colon, radius 8, Text Input frame, 4px tabs", async ({ page }) => {
      const basic = field(page, "basic");
      const [h, m] = [await cell(basic, "hour").boundingBox(), await cell(basic, "minute").boundingBox()];
      expect([h!.width, h!.height]).toEqual([40, 40]);
      const colon = (await basic.locator(".cs-time-literal").boundingBox())!;
      expect(colon.x - (h!.x + h!.width)).toBe(4);
      expect(m!.x - (colon.x + colon.width)).toBe(4);
      const s = await css(cell(basic, "hour"), ["border-top-width", "border-top-color", "border-top-left-radius", "background-color", "color", "font-size", "line-height", "font-variant-numeric"]);
      expect(s["border-top-width"]).toBe("1px");
      expect(s["border-top-left-radius"]).toBe("8px");
      expect([s["font-size"], s["line-height"]]).toEqual(["14px", "20px"]);
      expect(s["font-variant-numeric"]).toBe("tabular-nums");
      expect(await normalizeColors(page, { line: s["border-top-color"], bg: s["background-color"], ink: s.color })).toEqual({ line: t.line, bg: t.bg, ink: t.ink });
      const tab = cell(basic, "hour").locator(".cs-time-step").first();
      const tb = (await tab.boundingBox())!;
      expect([tb.height, tb.width]).toEqual([4, 34]);
      expect((await normalizeColors(page, { tab: (await css(tab, ["background-color"]))["background-color"] })).tab).toBe(t.tab);
      const literal = (await css(basic.locator(".cs-time-literal"), ["color"])).color;
      expect((await normalizeColors(page, { literal })).literal).toBe(t.quiet);
      const empty = (await css(value(field(page, "empty"), "hour"), ["color"])).color;
      expect((await normalizeColors(page, { empty })).empty).toBe(t.quiet);
    });

    test("label 6px above the cells at 14/20/500", async ({ page }) => {
      const basic = field(page, "basic");
      const label = basic.locator(".cs-time-field__label");
      const [l, c] = [(await label.boundingBox())!, (await cell(basic, "hour").boundingBox())!];
      expect(c.y - (l.y + l.height)).toBe(6);
      expect(l.x).toBe(c.x);
      const s = await css(label, ["font-size", "line-height", "font-weight"]);
      expect(s).toEqual({ "font-size": "14px", "line-height": "20px", "font-weight": "500" });
    });

    test("active: 64 tall over its neighbours, focus line + 3px halo; pressed arrow", async ({ page }) => {
      const basic = field(page, "basic");
      const hour = cell(basic, "hour");
      const before = (await hour.boundingBox())!;
      await hour.click();
      await page.waitForTimeout(300);
      const after = (await hour.boundingBox())!;
      expect(after.height).toBe(64);
      expect(after.y).toBe(before.y - 12);
      expect((await cell(basic, "minute").boundingBox())!.y).toBe(before.y);
      const s = await css(hour, ["border-top-color", "box-shadow"]);
      const n = await normalizeColors(page, { line: s["border-top-color"], halo: s["box-shadow"].match(/rgba?\([^)]*\)|color\([^)]*\)/)![0] });
      expect(n).toEqual({ line: t.focus, halo: t.halo });
      expect(s["box-shadow"]).toContain("0px 0px 0px 3px");
      const up = hour.locator('.cs-time-step[data-direction="up"]');
      const ub = (await up.boundingBox())!;
      // 3px inside the 1px line.
      expect([ub.height, ub.width, ub.y - after.y]).toEqual([12, 32, 4]);
      await up.hover();
      await page.mouse.down();
      await page.waitForTimeout(200);
      const pressed = (await css(up, ["background-color"]))["background-color"];
      await page.mouse.up();
      expect((await normalizeColors(page, { pressed })).pressed).toBe(t.press);
    });

    test("hover line; error, disabled and readonly cells", async ({ page }) => {
      const minute = cell(field(page, "basic"), "minute");
      await minute.hover();
      await page.waitForTimeout(200);
      expect((await normalizeColors(page, { c: (await css(minute, ["border-top-color"]))["border-top-color"] })).c).toBe(t.hover);
      const err = await css(cell(field(page, "error"), "hour"), ["border-top-color"]);
      expect((await normalizeColors(page, { c: err["border-top-color"] })).c).toBe(t.error);
      const dis = await css(cell(field(page, "disabled"), "hour"), ["border-top-color", "background-color", "color", "box-shadow"]);
      expect(await normalizeColors(page, { line: dis["border-top-color"], bg: dis["background-color"], fg: dis.color })).toEqual({ line: t.line, bg: t.disabledBg, fg: t.disabledFg });
      expect(dis["box-shadow"]).toBe("none");
      await expect(cell(field(page, "readonly"), "hour")).toHaveCSS("border-top-style", "dashed");
    });

    test("sizes: cells 32 / 40 / 48, radius 4 / 8 / 12, gap 4 / 4 / 6, type 12 / 14 / 16", async ({ page }) => {
      for (const [size, b, r, gap, font] of [["small", 32, 4, 4, 12], ["default", 40, 8, 4, 14], ["large", 48, 12, 6, 16]] as const) {
        const f = field(page, `size-${size}`);
        const box = (await cell(f, "hour").boundingBox())!;
        expect([box.width, box.height]).toEqual([b, b]);
        await expect(cell(f, "hour")).toHaveCSS("border-top-left-radius", `${r}px`);
        await expect(cell(f, "hour")).toHaveCSS("font-size", `${font}px`);
        const colon = (await f.locator(".cs-time-literal").boundingBox())!;
        expect(colon.x - (box.x + box.width)).toBe(gap);
      }
    });

    test("range arrow 20px, 8 from the cells; 12-hour period cell", async ({ page }) => {
      const range = field(page, "range");
      const arrow = (await range.locator(".cs-time-arrow").boundingBox())!;
      expect([arrow.width, arrow.height]).toEqual([20, 20]);
      const startEnd = (await cell(range, "minute", 0).boundingBox())!;
      const endStart = (await cell(range, "hour", 1).boundingBox())!;
      expect(arrow.x - (startEnd.x + startEnd.width)).toBe(8);
      expect(endStart.x - (arrow.x + arrow.width)).toBe(8);
      const period = cell(field(page, "ampm"), "period");
      expect((await period.boundingBox())!.height).toBe(40);
      await expect(period).toHaveCSS("padding-left", "5px");
    });
  });
}

test.describe("Canon Time on /settings", () => {
  test("digest time and overnight quiet hours", async ({ page }) => {
    await gotoScheme(page, "/settings", "light");
    const digest = page.locator('[data-settings="digest-time"]');
    await digest.scrollIntoViewIfNeeded();
    await expect(value(digest, "hour")).toHaveText("08");
    await expect(digest.locator(".v-messages")).toHaveText("Monday morning, in 15-minute slots.");
    const quiet = page.locator('[data-settings="quiet-hours"]');
    // No `format`: Vuetify's `en` locale is a 12-hour clock, so each time has an AM/PM cell.
    await expect(quiet.locator(".cs-time-cell")).toHaveCount(6);
    await expect(value(quiet, "period", 0)).toHaveText("PM");
    await expect(quiet.locator(".cs-time")).not.toHaveClass(/cs-time--error/);
    await value(digest, "minute").click();
    await page.keyboard.press("ArrowUp");
    await expect(value(digest, "minute")).toHaveText("15");
  });
});
