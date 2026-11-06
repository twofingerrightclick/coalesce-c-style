import { expect, test, type Page } from "@playwright/test";
import { shadows } from "../lib/canon";
import { normalizeColors, textOffset } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// M11 overlays and lists (canon §4 E Menu, Tooltip, Dialog, Popups), on `/c-style`.

const floating = {
  light: ["rgba(0, 0, 0, 0.08) 0px 8px 24px 0px", "rgba(0, 0, 0, 0.06) 0px 2px 6px 0px"],
  dark: ["rgba(0, 0, 0, 0.5) 0px 8px 24px 0px", "rgba(0, 0, 0, 0.3) 0px 2px 6px 0px"],
};

async function open(page: Page, scheme: Scheme = "light") {
  await gotoScheme(page, "/c-style", scheme);
  await page.locator('[data-btn="menu"]').waitFor();
}

async function openMenu(page: Page) {
  await page.locator('[data-btn="menu"]').click();
  const menu = page.locator('[data-overlay="menu"]');
  await expect(menu).toBeVisible();
  await page.waitForTimeout(300);
  return menu;
}

test.describe("M11 overlays and lists", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: menu panel radius 12, padding 4, edge + floating`, async ({ page }) => {
      await open(page, scheme);
      const menu = await openMenu(page);
      // Vuetify puts the menu's radius and elevation on the list inside it.
      await expect(menu).toHaveCSS("border-top-left-radius", "12px");
      expect(shadowLayers(await menu.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([shadows[scheme].edge, ...floating[scheme]]);
      await expect(menu).toHaveCSS("padding-top", "4px");
      await expect(menu).toHaveCSS("padding-left", "4px");
    });
  }

  test("menu item: H 40, radius 8, text 16 in, hover fill ≈ zinc-100; chosen = 500 + trailing tick, no fill", async ({ page }) => {
    await open(page);
    const menu = await openMenu(page);
    const item = menu.locator('[data-overlay="item"]');
    expect((await item.boundingBox())!.height).toBe(40);
    await expect(item).toHaveCSS("border-top-left-radius", "8px");
    expect(await textOffset(item)).toBeCloseTo(16, 0);
    await item.hover();
    await page.waitForTimeout(250);
    // currentColor overlay at the theme's hover opacity, composited on white.
    const overlay = await item.evaluate((el) => {
      const o = getComputedStyle(el.querySelector(".v-list-item__overlay")!);
      return Number(o.opacity);
    });
    const composite = Math.round(255 - overlay * (255 - 9));
    expect(Math.abs(composite - 244)).toBeLessThanOrEqual(3);

    const chosen = menu.locator('[data-overlay="item-active"]');
    const m = await chosen.evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return {
        weight: getComputedStyle(el.querySelector(".v-list-item-title")!).fontWeight,
        fill: getComputedStyle(el.querySelector(".v-list-item__overlay")!).opacity,
        tick: [after.width, after.height, after.opacity, after.position, after.maskImage.startsWith("url(")],
      };
    });
    expect(m).toEqual({ weight: "500", fill: "0", tick: ["20px", "20px", "1", "static", true] });
  });

  test("subheader: 10/16/600 caps, muted, a 32px row", async ({ page }) => {
    await open(page);
    const menu = await openMenu(page);
    const sub = menu.locator(".v-list-subheader");
    const s = await sub.evaluate((el) => {
      const c = getComputedStyle(el);
      return [c.fontSize, c.lineHeight, c.fontWeight, c.textTransform, el.getBoundingClientRect().height];
    });
    expect(s).toEqual(["10px", "16px", "600", "uppercase", 32]);
  });

  test("select picker: chosen option ticked, popup motion is cs-popup (fade + 97% scale)", async ({ page }) => {
    await open(page);
    await page.locator('[data-field="select"] .v-field').click();
    const chosen = page.locator(".v-overlay__content .v-list-item--active");
    await expect(chosen).toBeVisible();
    expect(await chosen.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("1");
    const rule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        const walk = (rules: CSSRuleList): string | undefined => {
          for (const r of rules) {
            if ("cssRules" in r && (r as CSSGroupingRule).cssRules.length && !(r as CSSStyleRule).selectorText) {
              const found = walk((r as CSSGroupingRule).cssRules);
              if (found) return found;
            } else if ((r as CSSStyleRule).selectorText?.includes(".cs-popup-enter-from")) return r.cssText;
          }
        };
        try {
          const found = walk(sheet.cssRules);
          if (found) return found;
        } catch {}
      }
    });
    // A transform, which Vuetify undoes when it measures the panel (showcase.spec, datetime menu).
    expect(rule).toContain("transform: scale(0.97)");
    expect(rule).toContain("opacity: 0");
  });

  test("tooltip: white, 1px zinc-200 line, radius 4, 12/16, padding 4/6, raised shadow", async ({ page }) => {
    await open(page);
    await page.locator('[data-btn="tooltip"]').hover();
    const tip = page.locator(".v-tooltip > .v-overlay__content");
    await expect(tip).toBeVisible({ timeout: 3000 });
    const m = await tip.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        colors: { bg: s.backgroundColor, border: s.borderTopColor, fg: s.color },
        box: [s.borderTopWidth, s.borderTopLeftRadius, s.fontSize, s.lineHeight, s.paddingTop, s.paddingLeft],
        shadow: s.boxShadow,
      };
    });
    expect(await normalizeColors(page, m.colors)).toEqual({ bg: "#ffffff", border: "#e4e4e7", fg: "#18181b" });
    expect(m.box).toEqual(["1px", "4px", "12px", "16px", "4px", "6px"]);
    expect(shadowLayers(m.shadow)).toEqual(shadows.light.raised);
  });

  for (const [scheme, scrim] of [
    ["light", "rgba(255, 255, 255, 0.85)"],
    ["dark", "rgba(9, 9, 11, 0.75)"],
  ] as const) {
    test(`${scheme}: dialog radius 24, 72px header over a rule, 24px body, footer 23/24/24 over a rule; scrim wash + 4px blur`, async ({ page }) => {
      await open(page, scheme);
      await page.locator('[data-btn="dialog"]').click();
      const card = page.locator('[data-overlay="dialog"]');
      await expect(card).toBeVisible();
      await page.waitForTimeout(400);
      await expect(card).toHaveCSS("border-top-left-radius", "24px");
      const m = await card.evaluate((el) => {
        const h = el.querySelector(".v-card-title")!;
        const t = el.querySelector(".v-card-text")!;
        const f = el.querySelector(".v-card-actions")!;
        const hs = getComputedStyle(h);
        const fs = getComputedStyle(f);
        return {
          header: [h.getBoundingClientRect().height, hs.borderBottomWidth, hs.paddingLeft],
          body: getComputedStyle(t).padding,
          footer: [fs.paddingTop, fs.paddingRight, fs.paddingBottom, fs.borderTopWidth],
          rules: { header: hs.borderBottomColor, footer: fs.borderTopColor },
        };
      });
      expect(m.header).toEqual([72, "1px", "24px"]);
      expect(m.body).toBe("24px");
      expect(m.footer).toEqual(["23px", "24px", "24px", "1px"]);
      const rule = scheme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
      expect(await normalizeColors(page, m.rules)).toEqual({ header: rule, footer: rule });
      const s = await page.locator(".v-overlay--active .v-overlay__scrim").evaluate((el) => {
        const c = getComputedStyle(el);
        return { bg: c.backgroundColor, opacity: c.opacity, blur: c.backdropFilter };
      });
      expect((await normalizeColors(page, { bg: s.bg })).bg).toBe(scrim);
      expect([s.opacity, s.blur]).toEqual(["1", "blur(4px)"]);
    });
  }
});
