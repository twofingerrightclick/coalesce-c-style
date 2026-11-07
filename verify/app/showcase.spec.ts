import { expect, test, type Locator, type Page } from "@playwright/test";
import { normalizeColors } from "../lib/computed";
import { gotoScheme } from "../lib/page";
import { adminEditorURL } from "../lib/admin";

// Fixes for the showcase pages' findings (docs/progress.md "Fixes: showcase
// findings"), measured on /gallery, /dashboard, /workspace/39, /settings,
// the admin table and the /c-style kitchen.

function box(el: Locator) {
  return el.boundingBox().then((b) => b!);
}

function style(el: Locator, props: string[], pseudo?: string) {
  return el.evaluate(
    (node, { props, pseudo }) => {
      const s = getComputedStyle(node, pseudo);
      return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
    },
    { props, pseudo },
  );
}

async function colors(page: Page, el: Locator, props: string[]) {
  return normalizeColors(page, await style(el, props));
}

/** Distance from the outer left edge of `el`'s tag to the start of `text` inside `el`. */
function textOffset(el: Locator, text: string) {
  return el.evaluate((node, text) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode()) && !n.textContent!.includes(text));
    const range = document.createRange();
    range.selectNodeContents(n!);
    return range.getBoundingClientRect().left - node.closest(".v-chip")!.getBoundingClientRect().left;
  }, text);
}

const gallery = (page: Page, scheme: "light" | "dark" = "light") => gotoScheme(page, "/gallery", scheme);

test.describe("showcase fixes", () => {
  for (const [scheme, rest, hover] of [
    ["light", "#2563eb", "#1d4ed8"],
    ["dark", "#60a5fa", "#93c5fd"],
  ] as const) {
    test(`${scheme}: app links are Canon links (accent, line only on hover, text step on hover)`, async ({ page }) => {
      await gotoScheme(page, "/dashboard", scheme);
      const link = page.locator(".v-data-table tbody a").first();
      await link.waitFor();
      const r = await colors(page, link, ["color"]);
      expect(r.color).toBe(rest);
      expect((await style(link, ["text-decoration-line"]))["text-decoration-line"]).toBe("none");
      await link.hover();
      await page.waitForTimeout(200);
      const h = await colors(page, link, ["color"]);
      expect(h.color).toBe(hover);
      expect(await style(link, ["text-decoration-line", "text-decoration-thickness"])).toEqual({
        "text-decoration-line": "underline",
        "text-decoration-thickness": "1px",
      });
    });
  }

  test("dark: tonal avatars, alerts and cards use the intent's text step on its tint", async ({ page }) => {
    await gallery(page, "dark");
    const avatar = page.locator('[data-gallery="avatars"] .v-avatar.text-success');
    const a = await colors(page, avatar, ["color"]);
    expect(a.color).toBe("#86efac"); // green-300
    const u = avatar.locator(".v-avatar__underlay");
    expect(await colors(page, u, ["background-color"])).toEqual({ "background-color": "#22c55e" }); // green-500
    expect((await style(u, ["opacity"])).opacity).toBe("0.2");

    const alert = page.locator('[data-gallery="alerts"] .v-alert--variant-tonal');
    expect((await colors(page, alert, ["color"])).color).toBe("#93c5fd"); // blue-300

    const card = page.locator('[data-gallery="slides"] .v-card.text-primary');
    expect((await colors(page, card, ["color"])).color).toBe("#93c5fd");
  });

  test("light: tonal avatar initials at step 700 on the 400 tint", async ({ page }) => {
    await gallery(page);
    const avatar = page.locator('[data-gallery="avatars"] .v-avatar.text-success');
    expect((await colors(page, avatar, ["color"])).color).toBe("#15803d"); // green-700
    const u = avatar.locator(".v-avatar__underlay");
    expect(await colors(page, u, ["background-color"])).toEqual({ "background-color": "#4ade80" }); // green-400
    expect((await style(u, ["opacity"])).opacity).toBe("0.15");
  });

  test("chips: small is Canon's sm (24, 12px, radius 2), large md (32, 14px, radius 4); remove icon at the icon size", async ({ page }) => {
    await gotoScheme(page, "/dashboard", "light");
    const small = page.locator(".v-data-table .v-chip--size-small").first();
    await small.waitFor();
    expect((await box(small)).height).toBe(24);
    expect(await style(small, ["font-size", "border-radius"])).toEqual({ "font-size": "12px", "border-radius": "2px" });

    await gallery(page);
    const large = page.locator('[data-gallery="chips"] .v-chip--size-large');
    expect((await box(large)).height).toBe(32);
    expect(await style(large, ["font-size", "border-radius"])).toEqual({ "font-size": "14px", "border-radius": "4px" });
    const close = page.locator('[data-gallery="chips"] .v-chip__close .v-icon');
    expect(await box(close)).toMatchObject({ width: 16, height: 16 });

    await gotoScheme(page, "/settings", "light");
    const fields = page.locator(".v-field:has(.v-chip)");
    expect(await fields.count()).toBeGreaterThan(0);
    for (const field of await fields.all()) {
      expect((await box(field)).height).toBe(40);
      const chip = field.locator(".v-chip").first();
      expect((await box(chip)).height).toBe(24);
      expect(await box(chip.locator(".v-chip__close .v-icon"))).toMatchObject({ width: 16, height: 16 });
    }
  });

  for (const [scheme, ink, tint, alpha] of [
    ["light", "#1d4ed8", "#60a5fa", "0.15"], // blue-700 on blue-400 @ .15
    ["dark", "#93c5fd", "#3b82f6", "0.2"], // blue-300 on blue-500 @ .2
  ] as const) {
    test(`${scheme}: an avatar in a tag is the line height, 4 in, 4 before the label; initials 0.4 of it, regular`, async ({ page }) => {
      await gallery(page, scheme);
      const chip = page.locator('[data-gallery="chips"] .v-chip', { hasText: "Grace" });
      const avatar = chip.locator(".v-avatar");
      const [c, a] = [await box(chip), await box(avatar)];
      expect([c.height, a.width, a.height]).toEqual([24, 16, 16]);
      expect(a.x - c.x).toBe(4);
      expect(a.y - c.y).toBeCloseTo(4, 1);
      expect((await textOffset(chip.locator(".v-chip__content"), "Grace")) - (a.x + a.width - c.x)).toBeCloseTo(4, 1);
      expect(await style(avatar, ["font-size", "font-weight"])).toEqual({ "font-size": "6.4px", "font-weight": "400" });
      expect((await colors(page, avatar, ["color"])).color).toBe(ink);
      const u = avatar.locator(".v-avatar__underlay");
      expect(await colors(page, u, ["background-color"])).toEqual({ "background-color": tint });
      expect((await style(u, ["opacity"])).opacity).toBe(alpha);
    });
  }

  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: dashboard "Modified" initials are Canon's 24px avatar type, inside the circle`, async ({ page }) => {
      await gotoScheme(page, "/dashboard", scheme);
      const avatar = page.locator(".v-data-table tbody .v-avatar").first();
      await avatar.waitFor();
      const initials = avatar.locator("> span:not([class])");
      const [a, t] = [await box(avatar), await box(initials)];
      expect([a.width, a.height]).toEqual([24, 24]);
      expect(await style(initials, ["font-size", "line-height", "font-weight"])).toEqual({
        "font-size": "10px",
        "line-height": "12px",
        "font-weight": "400",
      });
      expect(t.width).toBeLessThan(a.width - 4);
      expect(Math.abs(t.x + t.width / 2 - (a.x + a.width / 2))).toBeLessThan(1);
      expect(Math.abs(t.y + t.height / 2 - (a.y + a.height / 2))).toBeLessThan(1);
    });
  }

  test("tabs heading a card sit at the card padding, 16 above the body", async ({ page }) => {
    await gotoScheme(page, "/dashboard", "light");
    const tabs = page.locator(".v-card > .v-tabs").first();
    const card = await box(tabs.locator("xpath=.."));
    const t = await box(tabs);
    expect(t.x - card.x).toBe(20);
    expect(t.y - card.y).toBe(20);
    expect((await style(tabs, ["margin-bottom"]))["margin-bottom"]).toBe("16px");
  });

  test("pagination: 40 squares 8 apart, no margin outside them (a 40 row)", async ({ page }) => {
    await gallery(page);
    const pag = page.locator('[data-gallery="pagination"] .v-pagination').first();
    expect((await box(pag)).height).toBe(40);
    const items = await pag.locator(".v-pagination__list > li").all();
    expect(items.length).toBeGreaterThanOrEqual(3);
    const [a, b] = [await box(items[0]), await box(items[1])];
    expect(b.x - (a.x + a.width)).toBe(8);
    expect((await style(items[0], ["margin-left"]))["margin-left"]).toBe("0px");
  });

  test("c-list-pagination: prev/next are 40 frameless squares level with the page field", async ({ page }) => {
    const editorURL = await adminEditorURL(page, "Widget");
    await gotoScheme(page, `/workspace/${editorURL.split("/").pop()}`, "light");
    const pager = page.locator(".c-list-page");
    const field = await box(pager.locator(".v-field"));
    for (const btn of await pager.locator("> .v-btn").all()) {
      const b = await box(btn);
      expect([b.width, b.height]).toEqual([40, 40]);
      expect(b.y).toBe(field.y);
      const s = await style(btn, ["border-top-color", "box-shadow", "border-top-left-radius"]);
      expect(s["border-top-color"]).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(s["box-shadow"]).toBe("none");
      expect(s["border-top-left-radius"]).toBe("8px");
      expect(await box(btn.locator(".v-icon"))).toMatchObject({ width: 20, height: 20 });
    }
  });

  test("radio group label is flush with its radios, 16 above them", async ({ page }) => {
    await gotoScheme(page, "/settings", "light");
    for (const group of await page.locator(".v-radio-group").all()) {
      const label = await box(group.locator(".v-input__control > .v-label"));
      const control = await box(group.locator(".v-selection-control").first());
      expect(label.x).toBe(control.x);
      expect(control.y - (label.y + label.height)).toBe(16);
    }
  });

  test("multi-select menu: option checkbox sits 8 before its title", async ({ page }) => {
    await gotoScheme(page, "/settings", "light");
    await page.locator(".v-autocomplete", { hasText: "Reviewers" }).locator(".v-field").first().click();
    const option = page.locator(".v-overlay--active .v-list-item").first();
    await option.waitFor();
    const check = await box(option.locator(".v-selection-control"));
    const title = await box(option.locator(".v-list-item-title"));
    expect(Math.round(title.x - (check.x + check.width))).toBe(8);
  });

  test("standalone list: no slab, rows rounded 8 and inset 4, current row the fill at 500", async ({ page }) => {
    await gallery(page);
    const list = page.locator('[data-gallery="lists"] .v-list');
    expect((await style(list, ["background-color"]))["background-color"]).toBe("rgba(0, 0, 0, 0)");
    const l = await box(list);
    const item = list.locator("> .v-list-item").first();
    const i = await box(item);
    expect(i.x - l.x).toBe(4);
    expect(l.x + l.width - (i.x + i.width)).toBe(4);
    expect((await style(item, ["border-top-left-radius"]))["border-top-left-radius"]).toBe("8px");
    const active = list.locator(".v-list-item--active");
    expect((await colors(page, active, ["background-color"]))["background-color"]).toBe("#f4f4f5");
    expect((await style(active.locator(".v-list-item-title"), ["font-weight"]))["font-weight"]).toBe("500");
  });

  test("stepper: the current step's badge is the ink solid, upcoming ones grey and faded", async ({ page }) => {
    await gallery(page);
    const current = page.locator(".v-stepper-item--selected .v-avatar");
    expect(await colors(page, current, ["background-color", "color"])).toEqual({ "background-color": "#18181b", color: "#ffffff" });
    const upcoming = page.locator(".v-stepper-item:not(.v-stepper-item--selected)").last();
    expect((await colors(page, upcoming.locator(".v-avatar"), ["background-color"]))["background-color"]).not.toBe("#18181b");
    expect((await style(upcoming, ["opacity"])).opacity).toBe("0.6");
  });

  test("FAB: icon-only and extended share the button radius", async ({ page }) => {
    await gallery(page);
    const icon = page.locator('[data-gallery="fab"] .v-fab:not(.v-fab--extended) .v-btn');
    const extended = page.locator('[data-gallery="fab"] .v-fab--extended .v-btn');
    expect((await style(icon, ["border-top-left-radius"]))["border-top-left-radius"]).toBe("8px");
    expect((await style(extended, ["border-top-left-radius"]))["border-top-left-radius"]).toBe("8px");
  });

  for (const [scheme, fill] of [
    ["light", "#f4f4f5"],
    ["dark", "#18181b"],
  ] as const) {
    test(`${scheme}: banner is Canon's strip: fill, 8px block padding, 20px icon, small actions centred on the row`, async ({ page }) => {
      await gallery(page, scheme);
      const banner = page.locator(".v-banner");
      expect((await colors(page, banner, ["background-color"]))["background-color"]).toBe(fill);
      expect(await style(banner, ["padding-top", "padding-bottom"])).toEqual({ "padding-top": "8px", "padding-bottom": "8px" });
      const b = await box(banner);
      const icon = await box(banner.locator(".v-banner__prepend"));
      expect(icon.width).toBe(20);
      const actions = await box(banner.locator(".v-banner-actions"));
      // Centred on the row inside the bottom rule (half-pixel rounding).
      const mid = b.y + b.height / 2;
      expect(Math.abs(actions.y + actions.height / 2 - mid)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(icon.y + icon.height / 2 - mid)).toBeLessThanOrEqual(1.5);
      for (const btn of await banner.locator(".v-banner-actions .v-btn").all()) {
        expect((await box(btn)).height).toBe(32);
        expect(await btn.getAttribute("class")).toContain("text-neutral");
      }
    });
  }

  test("datetime picker menu that doesn't fit below its field opens above, inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const editorURL = await adminEditorURL(page, "Widget");
    await gotoScheme(page, `/workspace/${editorURL.split("/").pop()}`, "light");
    const field = await box(page.locator(".v-card .c-datetime-picker .v-field").first());
    await page.locator(".v-card .c-datetime-picker .v-field__append-inner .v-icon").first().click();
    const menu = page.locator(".c-datetime-picker__menu");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(400);
    const m = await box(menu);
    // 384 tall: below the field it would end at 899, past the 12px viewport margin.
    expect(m.y + m.height).toBeLessThanOrEqual(field.y);
    expect(m.y).toBeGreaterThanOrEqual(12);
  });

  test("admin toolbar: the active-filter count is not clipped", async ({ page }) => {
    await gotoScheme(page, "/admin/Widget?filter.category=1", "light");
    const badge = page.locator(".c-list-filters .v-badge__badge");
    await expect(badge).toBeVisible();
    const clipped = await badge.evaluate((el) => {
      const b = el.getBoundingClientRect();
      for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.overflowX === "visible" && s.overflowY === "visible") continue;
        const r = e.getBoundingClientRect();
        if (b.top < r.top || b.left < r.left || b.bottom > r.bottom || b.right > r.right) return e.className;
      }
      return null;
    });
    expect(clipped).toBeNull();
  });

  test("coalesce-c-style/icons: csIcon with a re-exported Lucide icon renders at 20px and a 1.5 stroke", async ({ page }) => {
    await gotoScheme(page, "/c-style", "light");
    const svg = page.locator('[data-data="cs-icon"] svg.lucide');
    await expect(svg).toHaveCount(1);
    expect(await box(svg)).toMatchObject({ width: 20, height: 20 });
    expect(await svg.getAttribute("stroke-width")).toBe("1.5");
  });
});
