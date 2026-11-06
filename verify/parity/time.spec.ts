import { expect, test, type Frame, type Locator, type Page } from "@playwright/test";
import { openStory } from "../lib/storybook";

// Canon Time's interactive states, measured against Canon's own frame in
// Parity/Time (the parity gate covers the resting pairs): the focused cell's
// growth, halo and step arrows, and a hovered cell, light and dark. Both
// sides get the same pointer or focus.

const props = ["block-size", "inline-size", "margin-top", "border-top-color", "box-shadow", "z-index", "border-radius", "background-color"];

async function read(el: Locator, pseudo?: string) {
  return el.evaluate(
    (node, [props, pseudo]) => {
      const s = getComputedStyle(node, pseudo);
      const r = node.getBoundingClientRect();
      if (pseudo) return { "background-color": s.backgroundColor, opacity: s.opacity, "mask-size": s.getPropertyValue("mask-size") };
      return Object.fromEntries(props.map((p) => [p, p == "block-size" ? r.height : p == "inline-size" ? r.width : s.getPropertyValue(p)]));
    },
    [props, pseudo] as const,
  );
}

async function canonFrame(page: Page): Promise<Frame> {
  const frame = (await page.locator("iframe.canon-frame").elementHandle())!.contentFrame();
  const f = (await frame)!;
  await f.waitForFunction(() => !!document.querySelector(".canon-time-cell"));
  return f;
}

/** Normalises colour syntax (`color(srgb …)` vs `rgb()`) through the page's canvas. */
async function normalise(page: Page, value: Record<string, unknown>) {
  return page.evaluate((v) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    const colour = (c: string) => {
      const srgb = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
      if (srgb) c = c.replace(srgb[0], `rgba(${srgb.slice(1, 4).map((n) => Math.round(Number(n) * 255)).join(", ")}, ${srgb[4] ?? 1})`);
      return c.replace(/rgba?\([^)]*\)/g, (m) => {
        ctx.fillStyle = "#000";
        ctx.fillStyle = m;
        return ctx.fillStyle;
      });
    };
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x == "string" ? colour(x) : Math.round((x as number) * 2) / 2]));
  }, value);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`Canon Time states (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await openStory(page, "parity-time--time", { theme });
    });

    test("focused cell: grows 12 up and down to 64, focus line and halo, raised; step arrows 12 tall, 3 in", async ({ page }) => {
      const canon = await canonFrame(page);
      const ours = page.locator('[data-side="vuetify"] [data-parity="time-cell"] .cs-time-cell[data-type="hour"]');
      const theirs = canon.locator('[data-parity="time-cell"] .canon-time-cell[data-type="hour"]');
      // Focus is one per page: measure each side while it holds it.
      await ours.locator(".cs-time-value").focus();
      await page.waitForTimeout(400);
      const a = await normalise(page, await read(ours));
      const sa = await normalise(page, await read(ours.locator('.cs-time-step[data-direction="up"]')));
      const after = await normalise(page, await read(ours.locator('.cs-time-step[data-direction="up"]'), "::after"));
      // Neighbours don't move: the minute cell keeps its 40px box.
      const minute = page.locator('[data-side="vuetify"] [data-parity="time-cell"] .cs-time-cell[data-type="minute"]');
      expect((await minute.boundingBox())!.height).toBe(40);
      await theirs.locator(".canon-time-value").focus();
      await page.waitForTimeout(400);
      const b = await normalise(page, await read(theirs));
      const sb = await normalise(page, await read(theirs.locator('.canon-time-step[data-direction="up"]')));
      const afterCanon = await normalise(page, await read(theirs.locator('.canon-time-step[data-direction="up"]'), "::after"));
      expect(a).toEqual(b);
      expect(a["block-size"]).toBe(64);
      expect(a["margin-top"]).toBe("-12px");
      expect(sa).toEqual(sb);
      expect(sa["block-size"]).toBe(12);
      expect(after).toEqual(afterCanon);
    });

    test("hovered cell: darker line and tabs, no growth", async ({ page }) => {
      const canon = await canonFrame(page);
      const ours = page.locator('[data-side="vuetify"] [data-parity="time-cell"] .cs-time-cell[data-type="minute"]');
      const theirs = canon.locator('[data-parity="time-cell"] .canon-time-cell[data-type="minute"]');
      await ours.hover();
      const a = await normalise(page, await read(ours));
      const at = await normalise(page, await read(ours.locator(".cs-time-step").first()));
      await theirs.hover();
      const b = await normalise(page, await read(theirs));
      const bt = await normalise(page, await read(theirs.locator(".canon-time-step").first()));
      expect(a).toEqual(b);
      expect(at).toEqual(bt);
      expect(a["block-size"]).toBe(40);
    });

    test("error cell focused: error line and halo", async ({ page }) => {
      const canon = await canonFrame(page);
      const ours = page.locator('[data-side="vuetify"] [data-parity="time-error"] .cs-time-cell[data-type="hour"]');
      const theirs = canon.locator('[data-parity="time-error"] .canon-time-cell[data-type="hour"]');
      await ours.locator(".cs-time-value").focus();
      await page.waitForTimeout(400);
      const a = await normalise(page, await read(ours));
      await theirs.locator(".canon-time-value").focus();
      await page.waitForTimeout(400);
      expect(a).toEqual(await normalise(page, await read(theirs)));
    });
  });
}
