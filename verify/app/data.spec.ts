import { expect, test, type Locator, type Page } from "@playwright/test";
import { normalizeColors, textOffset } from "../lib/computed";
import { gotoScheme, shadowLayers, type Scheme } from "../lib/page";

// M12 data display (canon §4 D Table, Data Table, Pagination; §4 A Tag, Count, Avatar, Kbd), on `/c-style`.

async function open(page: Page, scheme: Scheme = "light") {
  await gotoScheme(page, "/c-style", scheme);
  await page.locator('[data-data="table"]').waitFor();
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

test.describe("M12 data display", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: table frame radius 12, edge ring, surface; header muted 500 on a rule`, async ({ page }) => {
      await open(page, scheme);
      const table = page.locator('[data-data="table"]');
      await expect(table).toHaveCSS("border-top-left-radius", "12px");
      const edge = scheme === "light" ? "rgba(0, 0, 0, 0.12) 0px 0px 0px 1px" : "rgba(255, 255, 255, 0.12) 0px 0px 0px 1px";
      expect(shadowLayers(await table.evaluate((el) => getComputedStyle(el).boxShadow))).toEqual([edge]);

      const th = table.locator("th").first();
      const h = await style(th, ["color", "font-weight", "text-transform", "white-space", "border-bottom-color", "border-bottom-width"]);
      const colors = await normalizeColors(page, { color: h.color, line: h["border-bottom-color"] });
      expect(colors.color).toBe(scheme === "light" ? "#71717a" : "#a1a1aa");
      expect(colors.line).toBe(scheme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)");
      expect([h["font-weight"], h["text-transform"], h["white-space"], h["border-bottom-width"]]).toEqual(["500", "none", "nowrap", "1px"]);
      expect((await th.boundingBox())!.height).toBe(40);
    });
  }

  test("rows: 56 default / 40 compact, cells 7/16 padding, 14/20 tabular, rule between rows, hover ≈ zinc-100", async ({ page }) => {
    await open(page);
    const table = page.locator('[data-data="table"]');
    const td = table.locator("tbody tr").first().locator("td").first();
    expect((await td.boundingBox())!.height).toBe(56);
    const c = await style(td, ["padding-top", "padding-left", "font-size", "line-height", "font-variant-numeric", "border-bottom-width"]);
    expect(c).toEqual({
      "padding-top": "7px",
      "padding-left": "16px",
      "font-size": "14px",
      "line-height": "20px",
      "font-variant-numeric": "tabular-nums",
      "border-bottom-width": "1px",
    });
    expect(await textOffset(td)).toBeCloseTo(16, 0);
    const compact = page.locator('[data-data="table-compact"] td').first();
    expect((await compact.boundingBox())!.height).toBe(40);

    await td.hover();
    const hover = await style(td, ["background-color"], "::after");
    const alpha = Number(hover["background-color"].match(/[\d.]+\)$/)![0].replace(")", ""));
    // Black at this alpha on white ≈ zinc-100 (244).
    expect(Math.abs(Math.round(255 * (1 - alpha)) - 244)).toBeLessThanOrEqual(2);
  });

  test("data table: same header and rows; sortable header goes to ink on hover", async ({ page }) => {
    await open(page);
    const dt = page.locator('[data-data="data-table"]');
    const th = dt.locator("th.v-data-table__th--sortable").first();
    const rest = await normalizeColors(page, await style(th, ["color"]));
    expect(rest.color).toBe("#71717a");
    await th.hover();
    await page.waitForTimeout(200);
    const hover = await normalizeColors(page, await style(th, ["color"]));
    expect(hover.color).toBe("#18181b");
    expect((await dt.locator("tbody tr").first().boundingBox())!.height).toBe(56);
  });

  test("pagination: neutral 40px squares 8 apart, radius 8; current = zinc-200 line, no fill; arrows muted", async ({ page }) => {
    await open(page);
    const pag = page.locator('[data-data="pagination"]');
    const items = pag.locator(".v-pagination__item .v-btn");
    const a = (await items.nth(0).boundingBox())!;
    const b = (await items.nth(1).boundingBox())!;
    expect([a.width, a.height]).toEqual([40, 40]);
    expect(b.x - (a.x + a.width)).toBe(8);
    const current = pag.locator(".v-pagination__item--is-active .v-btn");
    const s = await style(current, ["border-top-color", "border-top-left-radius", "color", "background-color"]);
    const overlay = await current.evaluate((el) => getComputedStyle(el.querySelector(".v-btn__overlay")!).opacity);
    const colors = await normalizeColors(page, { line: s["border-top-color"], fg: s.color, bg: s["background-color"] });
    expect(colors).toEqual({ line: "#e4e4e7", fg: "#18181b", bg: "rgba(0, 0, 0, 0)" });
    expect([s["border-top-left-radius"], overlay]).toEqual(["8px", "0"]);
    const arrow = pag.locator(".v-pagination__prev .v-icon");
    expect((await normalizeColors(page, await style(arrow, ["color"]))).color).toBe("#71717a");
  });

  test("tag: Canon's default sm, H 24, radius 2, 12/500, text 6 in, icon 16; neutral tint ≈ zinc-100; success label green-700", async ({ page }) => {
    await open(page);
    const chip = page.locator('[data-data="chip"]');
    expect((await chip.boundingBox())!.height).toBe(24);
    // Line-height is moot: a tag is one fixed-height line.
    const s = await style(chip, ["border-top-left-radius", "font-size", "font-weight"]);
    expect(s).toEqual({ "border-top-left-radius": "2px", "font-size": "12px", "font-weight": "500" });
    expect(await textOffset(chip)).toBeCloseTo(6, 0);
    const icon = (await page.locator('[data-data="chip-icon"] .v-icon').boundingBox())!;
    expect([icon.width, icon.height]).toEqual([16, 16]);
    const under = await chip.evaluate((el) => {
      const u = getComputedStyle(el.querySelector(".v-chip__underlay")!);
      return { bg: u.backgroundColor, opacity: Number(u.opacity) };
    });
    // Canon's neutral tag uses the inherited ink at 4.8%, not the intent tint.
    expect((await normalizeColors(page, { bg: under.bg })).bg).toBe("rgba(9, 9, 11, 0.94)");
    expect(under.opacity).toBeCloseTo(0.048, 3);
    const success = page.locator('[data-data="chip-success"]');
    expect((await normalizeColors(page, await style(success, ["color"]))).color).toBe("#15803d");
  });

  test("count 16px pill 10/600 on the danger solid; avatar fill + muted; kbd 10/600 caps", async ({ page }) => {
    await open(page);
    const badge = page.locator('[data-data="badge"] .v-badge__badge');
    const bb = (await badge.boundingBox())!;
    expect(bb.height).toBe(16);
    expect(bb.width).toBeGreaterThanOrEqual(16);
    const b = await style(badge, ["font-size", "font-weight", "background-color", "color"]);
    expect([b["font-size"], b["font-weight"]]).toEqual(["10px", "600"]);
    expect(await normalizeColors(page, { bg: b["background-color"], fg: b.color })).toEqual({ bg: "#dc2626", fg: "#ffffff" });

    const avatar = page.locator('[data-data="avatar"]');
    const a = await style(avatar, ["background-color", "color", "box-shadow"]);
    expect(await normalizeColors(page, { bg: a["background-color"], fg: a.color })).toEqual({ bg: "#f4f4f5", fg: "#71717a" });
    expect(shadowLayers(a["box-shadow"])).toEqual([]);

    const kbd = page.locator('[data-data="kbd"]');
    const k = await style(kbd, ["font-size", "font-weight", "text-transform", "padding-left", "border-top-left-radius"]);
    expect(k).toEqual({ "font-size": "10px", "font-weight": "600", "text-transform": "uppercase", "padding-left": "6px", "border-top-left-radius": "4px" });
  });

  // Canon avatar initials (canon §4 Avatar): 24 10/12, 32 12/16, 40 14/20,
  // 48 16/24, 56 16/24, 64 24/32, regular. Numeric sizes bare text; named
  // sizes (x-small … x-large = 24 … 56) through a span.
  const avatarType = [
    ["24", "x-small", 24, "10px", "12px"],
    ["32", "small", 32, "12px", "16px"],
    ["40", "default", 40, "14px", "20px"],
    ["48", "large", 48, "16px", "24px"],
    ["56", "x-large", 56, "16px", "24px"],
    ["64", null, 64, "24px", "32px"],
  ] as const;
  for (const scheme of ["light", "dark"] as const) {
    test(`${scheme}: avatar initials take Canon's type per size and sit inside the circle`, async ({ page }) => {
      await open(page, scheme);
      for (const [numeric, named, size, fontSize, lineHeight] of avatarType) {
        for (const key of named ? [numeric, named] : [numeric]) {
          const avatar = page.locator(`[data-avatar="${key}"]`);
          const m = await avatar.evaluate((node) => {
            const range = document.createRange();
            range.selectNodeContents(node.querySelector(":scope > span:not([class])") ?? node);
            const t = range.getBoundingClientRect();
            const a = node.getBoundingClientRect();
            const s = getComputedStyle(node.querySelector(":scope > span:not([class])") ?? node);
            const r = a.width / 2;
            // Glyph box: the text's width by its font size, centred on the line.
            const [hw, hh] = [t.width / 2, parseFloat(s.fontSize) / 2];
            const [cx, cy] = [t.left + t.width / 2 - (a.left + r), t.top + t.height / 2 - (a.top + r)];
            return {
              size: [a.width, a.height],
              type: [s.fontSize, s.lineHeight, s.fontWeight],
              corner: Math.hypot(Math.abs(cx) + hw, Math.abs(cy) + hh) / r,
            };
          });
          expect(m.size, key).toEqual([size, size]);
          expect(m.type, key).toEqual([fontSize, lineHeight, "400"]);
          expect(m.corner, key).toBeLessThan(1);
        }
      }
    });
  }
});
