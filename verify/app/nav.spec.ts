import { expect, test, type Locator } from "@playwright/test";
import { normalizeColors, textOffset } from "../lib/computed";
import { gotoScheme, shadowLayers } from "../lib/page";

// M13 navigation and shell (canon §4 D App Shell, Nav List, Tabs, Breadcrumb).
// The shell is the demo's own app bar and drawer; tabs and breadcrumbs are on `/c-style`.

function style(el: Locator, props: string[]) {
  return el.evaluate((node, props) => {
    const s = getComputedStyle(node);
    return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
  }, props);
}

test.describe("M13 navigation and shell", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: app bar and sidebar are flat surfaces over a rule-faint hairline; sidebar 264`, async ({ page }) => {
      await gotoScheme(page, "/", scheme);
      const bar = page.locator(".v-app-bar");
      const b = await style(bar, ["background-color", "box-shadow", "border-bottom-width", "border-bottom-color", "border-top-width"]);
      const drawer = page.locator(".v-navigation-drawer");
      const d = await style(drawer, ["background-color", "border-right-width", "border-right-color", "width"]);
      const line = scheme === "light" ? "rgba(0, 0, 0, 0.07)" : "rgba(255, 255, 255, 0.08)";
      const surface = scheme === "light" ? "#ffffff" : "#18181b";
      expect(await normalizeColors(page, { bar: b["background-color"], barLine: b["border-bottom-color"], side: d["background-color"], sideLine: d["border-right-color"] })).toEqual({
        bar: surface,
        barLine: line,
        side: surface,
        sideLine: line,
      });
      expect(shadowLayers(b["box-shadow"])).toEqual([]);
      expect([b["border-bottom-width"], b["border-top-width"], d["border-right-width"], d.width]).toEqual(["1px", "0px", "1px", "264px"]);
    });
  }

  test("nav items: H 40, radius 8, icon 10 in, small gap apart; current = zinc-100 fill, 500, ink icon; rest icon muted", async ({ page }) => {
    await gotoScheme(page, "/", "light");
    const items = page.locator(".v-navigation-drawer .v-list-item");
    const current = items.first();
    const next = items.nth(1);
    const a = (await current.boundingBox())!;
    const b = (await next.boundingBox())!;
    expect(a.height).toBe(40);
    const gap = await current.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--cs-gap-sm")));
    expect(b.y - (a.y + a.height)).toBe(gap);
    const headingGaps = await page.locator(".v-navigation-drawer .v-list-subheader").first().evaluate((el) => {
      const heading = el.getBoundingClientRect();
      return {
        above: heading.top - el.previousElementSibling!.getBoundingClientRect().bottom,
        below: el.nextElementSibling!.getBoundingClientRect().top - heading.bottom,
      };
    });
    expect(headingGaps).toEqual({ above: 2 * gap, below: 0 });
    await expect(current).toHaveCSS("border-top-left-radius", "8px");
    const iconLeft = await current.evaluate((el) => el.querySelector(".v-icon")!.getBoundingClientRect().left - el.getBoundingClientRect().left);
    expect(iconLeft).toBeCloseTo(10, 0);

    const c = await current.evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      overlay: getComputedStyle(el.querySelector(".v-list-item__overlay")!).opacity,
      weight: getComputedStyle(el.querySelector(".v-list-item-title")!).fontWeight,
      icon: getComputedStyle(el.querySelector(".v-list-item__prepend")!).opacity,
    }));
    expect((await normalizeColors(page, { bg: c.bg })).bg).toBe("#f4f4f5");
    expect([c.overlay, c.weight]).toEqual(["0", "500"]);
    const restWeight = await next.evaluate((el) => getComputedStyle(el.querySelector(".v-list-item-title")!).fontWeight);
    expect(restWeight).toBe("400");
  });

  test("nav divider: the small spacing token separates both sides", async ({ page }) => {
    await gotoScheme(page, "/", "light");
    const nav = page.locator(".v-navigation-drawer .v-list--nav");
    const measure = () => nav.evaluate((el) => {
      const divider = el.querySelector(".v-divider")!;
      const above = divider.previousElementSibling!.getBoundingClientRect();
      const line = divider.getBoundingClientRect();
      const below = divider.nextElementSibling!.getBoundingClientRect();
      return { above: line.top - above.bottom, below: below.top - line.bottom };
    });
    const gap = await nav.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--cs-gap-sm")));
    expect(await measure()).toEqual({ above: gap, below: gap });

    // Both sides must follow an app's token override, not a fixed length.
    await nav.evaluate((el) => (el as HTMLElement).style.setProperty("--cs-gap-sm", "12px"));
    expect(await measure()).toEqual({ above: 12, below: 12 });
  });

  test("tabs: a 40px zinc-100 track, radius 10, 34px tabs radius 7, 2 apart; selected = bright card, ink; rest muted", async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    const tabs = page.locator('[data-nav="tabs"]');
    const t = await style(tabs, ["background-color", "border-top-left-radius", "box-shadow"]);
    expect((await normalizeColors(page, { bg: t["background-color"] })).bg).toBe("#f4f4f5");
    expect([t["border-top-left-radius"], t["box-shadow"]]).toEqual(["10px", "none"]);
    expect((await tabs.boundingBox())!.height).toBe(40);

    const all = tabs.locator(".v-tab");
    const sel = all.nth(0);
    const rest = all.nth(1);
    const s = (await sel.boundingBox())!;
    const r = (await rest.boundingBox())!;
    expect(s.height).toBe(34);
    expect(r.x - (s.x + s.width)).toBe(2);
    expect(await textOffset(sel)).toBeCloseTo(10, 0);
    await expect(sel).toHaveCSS("border-top-left-radius", "7px");
    const slider = sel.locator(".v-tab__slider");
    const sl = await style(slider, ["background-color", "box-shadow", "opacity"]);
    expect((await normalizeColors(page, { bg: sl["background-color"] })).bg).toBe("#ffffff");
    expect(shadowLayers(sl["box-shadow"])[0]).toBe("rgba(0, 0, 0, 0.06) 0px 0px 0px 1px");
    const colors = await normalizeColors(page, { sel: (await style(sel, ["color"])).color, rest: (await style(rest, ["color"])).color });
    expect(colors).toEqual({ sel: "#18181b", rest: "#71717a" });
    const font = await style(sel, ["font-size", "font-weight"]);
    expect(font).toEqual({ "font-size": "14px", "font-weight": "500" });
  });

  test("breadcrumb: a 40px row flush left, 14px; links muted, current and separators quieter", async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    const bc = page.locator('[data-nav="breadcrumbs"]');
    expect((await bc.boundingBox())!.height).toBe(40);
    expect(await textOffset(bc)).toBeCloseTo(0, 0);
    const link = bc.locator(".v-breadcrumbs-item--link").first();
    const current = bc.locator(".v-breadcrumbs-item--disabled");
    const divider = bc.locator(".v-breadcrumbs-divider").first();
    const c = await normalizeColors(page, {
      link: (await style(link, ["color"])).color,
      current: (await style(current, ["color"])).color,
      divider: (await style(divider, ["color"])).color,
    });
    expect(c).toEqual({ link: "#71717a", current: "#a1a1aa", divider: "#a1a1aa" });
    await expect(current).toHaveCSS("opacity", "1");
    await expect(link).toHaveCSS("font-size", "14px");
  });
});
