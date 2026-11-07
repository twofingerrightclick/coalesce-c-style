import { expect, test, type Page } from "@playwright/test";
import { shadows } from "../lib/canon";
import { normalizeColors } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// M10 surfaces and feedback (canon §4 A Card, Accordion, Spinner; §4 E Alert,
// Banner, Toast), on `/c-style`.

async function open(page: Page, scheme: Scheme = "light") {
  await gotoScheme(page, "/c-style", scheme);
  await page.locator('[data-surface="card"]').waitFor();
}

const surface = (page: Page, id: string) => page.locator(`[data-surface="${id}"]`);

test.describe("M10 surfaces and feedback", () => {
  test("card: radius 12, padding 20, title 16/24/600, muted description 4px under it, edge + raised", async ({ page }) => {
    await open(page);
    const card = surface(page, "card");
    await expect(card).toHaveCSS("border-top-left-radius", "12px");
    expect(shadowLayers(await card.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([shadows.light.edge, ...shadows.light.raised]);
    const m = await card.evaluate((el) => {
      const c = el.getBoundingClientRect();
      const title = el.querySelector(".v-card-title")!;
      const sub = el.querySelector(".v-card-subtitle")!;
      const text = el.querySelector(".v-card-text")!;
      const t = title.getBoundingClientRect();
      const s = sub.getBoundingClientRect();
      const ts = getComputedStyle(title);
      const ss = getComputedStyle(sub);
      return {
        titleInset: [t.left - c.left, t.top - c.top],
        title: [ts.fontSize, ts.lineHeight, ts.fontWeight],
        // The description's line box starts at its padding edge.
        subGap: s.top + parseFloat(getComputedStyle(sub).paddingTop) - t.bottom,
        sub: [ss.fontSize, ss.lineHeight, ss.opacity],
        bodyGap: text.getBoundingClientRect().top + parseFloat(getComputedStyle(text).paddingTop) - s.bottom,
        bodyBottom: c.bottom - text.getBoundingClientRect().bottom + parseFloat(getComputedStyle(text).paddingBottom),
      };
    });
    expect(m.titleInset).toEqual([20, 20]);
    expect(m.title).toEqual(["16px", "24px", "600"]);
    expect(m.subGap).toBeCloseTo(4, 0);
    expect(m.sub).toEqual(["14px", "20px", "0.6"]);
    expect(m.bodyGap).toBeCloseTo(16, 0);
    expect(m.bodyBottom).toBeCloseTo(20, 0);
  });

  test("expansion row: H 44 with 12px block padding, title 14/20/500", async ({ page }) => {
    await open(page);
    const title = surface(page, "expansion").locator(".v-expansion-panel-title");
    expect((await title.boundingBox())!.height).toBe(44);
    await expect(title).toHaveCSS("padding-top", "12px");
    await expect(title).toHaveCSS("padding-bottom", "12px");
    await expect(title).toHaveCSS("font-size", "14px");
    await expect(title).toHaveCSS("line-height", "20px");
    await expect(title).toHaveCSS("font-weight", "500");
  });

  for (const [scheme, surfaceColor, bar, icon] of [
    ["light", "#ffffff", "#ef4444", "#dc2626"],
    ["dark", "#18181b", "#f87171", "#dc2626"],
  ] as const) {
    test(`${scheme}: alert is a neutral surface with a 4px intent-500 start bar and a step-600 icon`, async ({ page }) => {
      await open(page, scheme);
      const alert = surface(page, "alert-error");
      await expect(alert).toHaveCSS("border-top-left-radius", "12px");
      await expect(alert).toHaveCSS("padding-top", "12px");
      const m = await alert.evaluate((el) => {
        const b = el.querySelector(".v-alert__border")!;
        const i = el.querySelector(".v-alert__prepend .v-icon")!;
        const title = el.querySelector(".v-alert-title")!;
        const bs = getComputedStyle(b);
        return {
          colors: { bg: getComputedStyle(el).backgroundColor, bar: bs.borderInlineStartColor, icon: getComputedStyle(i).color, title: getComputedStyle(title).color },
          barWidth: bs.borderInlineStartWidth,
          iconSize: i.getBoundingClientRect().width,
          titleWeight: getComputedStyle(title).fontWeight,
          text: [getComputedStyle(el).fontSize, getComputedStyle(el).lineHeight],
        };
      });
      const c = await normalizeColors(page, m.colors);
      expect(c.bg).toBe(surfaceColor);
      expect(c.bar).toBe(bar);
      // Vuetify's `error` role is step 600 in both modes (decision 6b); Canon's dark icon is 400.
      expect(c.icon).toBe(icon);
      expect(c.title).toBe(scheme === "light" ? "#18181b" : "#ffffff");
      expect([m.barWidth, m.iconSize, m.titleWeight, ...m.text]).toEqual(["4px", 20, "500", "14px", "20px"]);
    });
  }

  test("banner: zinc-100 strip with a rule line (no intent)", async ({ page }) => {
    await open(page);
    const m = await surface(page, "banner").evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, line: s.borderBottomColor };
    });
    expect(await normalizeColors(page, m)).toEqual({ bg: "#f4f4f5", line: "rgba(0, 0, 0, 0.1)" });
  });

  test("snackbar = Canon toast: white / zinc-800, radius 12, edge + floating, 14/20 ink, 12px in", async ({ page }) => {
    for (const [scheme, bg] of [["light", "#ffffff"], ["dark", "#27272a"]] as const) {
      await open(page, scheme);
      await page.locator('[data-btn="snackbar"]').click();
      const wrapper = page.locator('[data-surface="snackbar"] .v-snackbar__wrapper');
      await expect(wrapper).toBeVisible();
      await page.waitForTimeout(400);
      const m = await wrapper.evaluate((el) => {
        const s = getComputedStyle(el);
        const content = getComputedStyle(el.querySelector(".v-snackbar__content")!);
        return { colors: { bg: s.backgroundColor }, radius: s.borderTopLeftRadius, shadow: s.boxShadow, font: [content.fontSize, content.lineHeight, content.paddingTop, content.paddingLeft] };
      });
      expect((await normalizeColors(page, m.colors)).bg, scheme).toBe(bg);
      expect(m.radius).toBe("12px");
      expect(shadowLayers(m.shadow)[0]).toBe(shadows[scheme].edge);
      expect(shadowLayers(m.shadow)).toHaveLength(3);
      expect(m.font).toEqual(["14px", "20px", "12px", "12px"]);
      expect((await wrapper.boundingBox())!.height).toBeCloseTo(46, 1);
    }
  });

  test("intent toast = surface + 4px bar in the tone's bar step, icon in the intent, ink text", async ({ page }) => {
    for (const [scheme, bar] of [["light", "rgb(34, 197, 94)"], ["dark", "rgb(74, 222, 128)"]] as const) {
      await open(page, scheme);
      await page.locator('[data-btn="snackbar"]').click();
      const wrapper = page.locator('[data-surface="snackbar-success"] .v-snackbar__wrapper');
      await expect(wrapper).toBeVisible();
      await page.waitForTimeout(400);
      const m = await wrapper.evaluate((el) => ({
        bg: getComputedStyle(el).backgroundColor,
        shadow: getComputedStyle(el).boxShadow,
        icon: getComputedStyle(el.querySelector(".v-snackbar__prepend .v-icon")!).color,
        text: getComputedStyle(el.querySelector(".v-snackbar__content")!).color,
      }));
      expect(shadowLayers(m.shadow)[0], scheme).toBe(`${bar} -4px 0px 0px 0px`);
      expect(shadowLayers(m.shadow).slice(1)[0]).toBe(shadows[scheme].edge);
      expect(await normalizeColors(page, { bg: m.bg, icon: m.icon, text: m.text }), scheme).toEqual(
        scheme == "light" ? { bg: "#ffffff", icon: "#16a34a", text: "#18181b" } : { bg: "#27272a", icon: "#16a34a", text: "#ffffff" },
      );
    }
  });

  test("spinner: 20px ring, currentColor stroke; linear progress 4px", async ({ page }) => {
    await open(page);
    const spinner = surface(page, "spinner");
    const box = (await spinner.boundingBox())!;
    expect([box.width, box.height]).toEqual([20, 20]);
    const stroke = await spinner.evaluate((el) => {
      const c = el.querySelector(".v-progress-circular__overlay")!;
      return [getComputedStyle(c).stroke, getComputedStyle(el).color];
    });
    expect(stroke[0]).toBe(stroke[1]);
    expect((await surface(page, "linear").boundingBox())!.height).toBe(4);
  });
});
