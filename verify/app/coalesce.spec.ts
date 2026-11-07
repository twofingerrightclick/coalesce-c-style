import { expect, test, type Locator, type Page } from "@playwright/test";
import { adminEditorURL } from "../lib/admin";
import { normalizeColors } from "../lib/computed";
import { gotoScheme, shadowLayers } from "../lib/page";

// M16 Coalesce components (plan §3e): the demo's Widget table and editor and /admin/audit.

function style(el: Locator, props: string[], pseudo?: string) {
  return el.evaluate(
    (node, { props, pseudo }) => {
      const s = getComputedStyle(node, pseudo);
      return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
    },
    { props, pseudo },
  );
}

async function expectCardHeader(page: Page, toolbar: Locator) {
  await expect(toolbar).toBeVisible();
  const t = await style(toolbar, ["box-shadow", "background-color", "border-bottom-width", "border-bottom-color"]);
  expect(shadowLayers(t["box-shadow"])).toEqual([]);
  expect(await normalizeColors(page, { bg: t["background-color"], line: t["border-bottom-color"] })).toEqual({
    bg: "#ffffff",
    line: "rgba(0, 0, 0, 0.1)",
  });
  expect(t["border-bottom-width"]).toBe("1px");
  // Table headers use the 20px card inset above controls and an 8px gap
  // before the extension; editor/method toolbars retain 8px on both sides.
  const tableHeader = await toolbar.evaluate((el) => el.classList.contains("c-admin-table-toolbar"));
  expect((await toolbar.locator(":scope > .v-toolbar__content").boundingBox())!.height).toBe(tableHeader ? 68 : 56);
  const extension = toolbar.locator(":scope > .v-toolbar__extension");
  if (await extension.count()) expect((await extension.boundingBox())!.height).toBe(48);
  const title = toolbar.locator(".v-toolbar-title").first();
  expect(await style(title, ["font-size", "line-height", "font-weight"])).toEqual({ "font-size": "16px", "line-height": "24px", "font-weight": "600" });
}

test.describe("M16 Coalesce", () => {
  test("admin table: toolbar is a card header; c-table header 40 muted, rows ≥ 56; row actions are Lucide masks at 20", async ({ page }) => {
    await gotoScheme(page, "/admin/Widget", "light");
    await page.locator(".c-admin-table tbody tr").first().waitFor();
    await expectCardHeader(page, page.locator(".c-admin-table-toolbar"));

    const th = page.locator(".c-table th").first();
    expect((await th.boundingBox())!.height).toBe(40);
    expect((await normalizeColors(page, await style(th, ["color"]))).color).toBe("#71717a");
    expect((await page.locator(".c-table tbody tr").first().boundingBox())!.height).toBeGreaterThanOrEqual(56);

    const glyph = page.locator(".c-admin-table--actions i.fa").first();
    const box = (await glyph.boundingBox())!;
    expect([box.width, box.height]).toEqual([20, 20]);
    const before = await style(glyph, ["content", "mask-image", "background-color"], "::before");
    expect(before.content).toBe('""');
    expect(before["mask-image"]).toMatch(/^url\("data:image\/svg\+xml/);
    // Neutral row actions: the icon is muted.
    expect((await normalizeColors(page, { c: before["background-color"] })).c).toBe("#71717a");
  });

  test("pagination: 14/20 muted text; prev/next neutral (no accent), frameless", async ({ page }) => {
    await gotoScheme(page, "/admin/Widget", "light");
    const pag = page.locator(".c-admin-table > .v-card-text .c-list-pagination, .c-admin-table .c-list-pagination").last();
    await expect(pag).toBeVisible();
    const p = await style(pag, ["font-size", "line-height", "color"]);
    expect([p["font-size"], p["line-height"]]).toEqual(["14px", "20px"]);
    expect((await normalizeColors(page, { c: p.color })).c).toBe("#71717a");
    const next = pag.locator(".c-list-page .v-btn").last();
    const n = await style(next, ["color", "border-top-color"]);
    // Canon pagination arrows have no frame (showcase.spec checks their size).
    expect(await normalizeColors(page, { fg: n.color, line: n["border-top-color"] })).toEqual({
      fg: await next.isDisabled() ? "#a1a1aa" : "#71717a",
      line: "rgba(0, 0, 0, 0)",
    });
  });

  test("editor: card-header toolbar; label column 14/20/500 ink, first line level with the field's", async ({ page }) => {
    const url = await adminEditorURL(page, "Widget");
    await gotoScheme(page, url, "light");
    await expectCardHeader(page, page.locator(".c-admin-editor--toolbar"));
    const row = page.locator(".c-admin-editor--row").first();
    const label = row.locator(".c-admin-editor--label-col");
    const l = await style(label, ["font-size", "line-height", "font-weight", "color"]);
    expect([l["font-size"], l["line-height"], l["font-weight"]]).toEqual(["14px", "20px", "500"]);
    // Top of the label's first 20px line box.
    const text = await label.evaluate((el) => el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop));
    const field = (await row.locator(".v-field").first().boundingBox())!;
    expect(text - field.y).toBeCloseTo(10, 0);
    const desc = page.locator(".c-admin-page--description");
    expect((await normalizeColors(page, await style(desc, ["color"]))).color).toBe("#71717a");
  });

  test("audit log: neutral card-header toolbar (not accent-filled)", async ({ page }) => {
    await gotoScheme(page, "/admin/audit", "light");
    await expectCardHeader(page, page.locator(".c-admin-audit-log-page .c-admin-table-toolbar"));
  });

  // The demo keeps the starter template's routes: `color: "primary"` on every
  // admin page and the audit page's own "primary" default. Adoption is zero-touch.
  test("admin toolbars given color=primary still render neutral", async ({ page }) => {
    for (const path of ["/admin/Widget", "/admin/audit"]) {
      await gotoScheme(page, path, "light");
      const toolbar = page.locator(".c-admin-table-toolbar").first();
      await expect(toolbar).toHaveClass(/bg-primary/);
      const t = await style(toolbar, ["background-color", "color"]);
      expect(await normalizeColors(page, { bg: t["background-color"], fg: t.color }), path).toEqual({ bg: "#ffffff", fg: "#18181b" });
    }
  });

  test("audit: the Entity Type filter shows its label while it shows no value", async ({ page }) => {
    await gotoScheme(page, "/admin/audit", "light");
    const fields = page.locator(".c-admin-table-toolbar .v-toolbar__extension .v-field");
    await expect(fields.first()).toBeVisible();
    const shown = await fields.evaluateAll((els) =>
      els.map((f) => {
        const label = f.querySelector(".v-field-label");
        const labelShown = !!label && getComputedStyle(label).visibility == "visible" && !!label.textContent?.trim();
        const value = [...f.querySelectorAll("input:not([type=hidden]), [class$='__selection-text']")].some((e) =>
          ((e as HTMLInputElement).value ?? e.textContent ?? "").trim(),
        );
        return labelShown || value;
      }),
    );
    expect(shown.every(Boolean), JSON.stringify(shown)).toBe(true);
  });

  test("dark: admin toolbar surface zinc-900, rule white 10%", async ({ page }) => {
    await gotoScheme(page, "/admin/Widget", "dark");
    const t = await style(page.locator(".c-admin-table-toolbar"), ["background-color", "border-bottom-color"]);
    expect(await normalizeColors(page, { bg: t["background-color"], line: t["border-bottom-color"] })).toEqual({
      bg: "#18181b",
      line: "rgba(255, 255, 255, 0.1)",
    });
  });

  // Canon toolbar controls sit 8px from the card edge at both ends of a row;
  // the search icon then lines up with the title text above it.
  for (const [scheme, width] of [["light", 1440], ["dark", 1440], ["light", 400]] as const) {
    test(`table toolbar: search 8 from the start edge like the row end (${scheme}, ${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoScheme(page, "/admin/Widget", scheme);
      const toolbar = page.locator(".c-admin-table-toolbar");
      await expect(toolbar).toBeVisible();
      const card = (await toolbar.boundingBox())!;
      const search = (await toolbar.locator(".c-admin-table-toolbar--search .v-field").boundingBox())!;
      const size = (await toolbar.locator(".c-list-page-size").boundingBox())!;
      expect(search.x - card.x).toBe(8);
      expect(card.x + card.width - (size.x + size.width)).toBe(8);
      if (width < 600) {
        // Coalesce's `hidden-xs-only` title and dividers hide on phones.
        await expect(toolbar.locator(".hidden-xs-only:visible")).toHaveCount(0);
      } else {
        const icon = (await toolbar.locator(".c-admin-table-toolbar--search .v-field__prepend-inner .v-icon").boundingBox())!;
        const title = (await toolbar.locator(".v-toolbar-title__placeholder").boundingBox())!;
        expect(icon.x).toBe(title.x);
      }
    });
  }

  test("audit toolbar: filters 8 from the start edge", async ({ page }) => {
    await gotoScheme(page, "/admin/audit", "light");
    const toolbar = page.locator(".c-admin-table-toolbar");
    const card = (await toolbar.boundingBox())!;
    const first = (await toolbar.locator(".c-audit-logs--filters .v-field").first().boundingBox())!;
    expect(first.x - card.x).toBe(8);
  });

  // Canon data table edit cell: the frame hides at rest, shows the field
  // line under the pointer and the focus frame while typing; values sit
  // under their header text; rows stay control + 16.
  for (const scheme of ["light", "dark"] as const) {
    test(`editable c-table: cell fields frameless at rest, line on hover, focus frame; text under headers; rows 56 (${scheme})`, async ({ page }) => {
      await gotoScheme(page, "/admin/Widget", scheme);
      await page.locator(".c-admin-table-toolbar--button-editable").click();
      const row = page.locator(".c-table--editable tbody tr").first();
      const fields = row.locator("td .v-field");
      await expect(fields.first()).toBeVisible();

      const frames = () =>
        fields.evaluateAll((els) =>
          els.map((f) => {
            const s = getComputedStyle(f);
            return { line: getComputedStyle(f.querySelector(".v-field__outline")!).color, bg: s.backgroundColor, shadow: s.boxShadow };
          }),
        );
      for (const f of await frames()) expect(f).toEqual({ line: "rgba(0, 0, 0, 0)", bg: "rgba(0, 0, 0, 0)", shadow: "none" });

      await fields.first().hover();
      await expect
        .poll(async () => (await normalizeColors(page, { c: (await frames())[0].line })).c)
        .toBe(scheme == "light" ? "#e4e4e7" : "#3f3f46");
      const [, ...rest] = await frames();
      for (const f of rest) expect(f.line).toBe("rgba(0, 0, 0, 0)");

      await row.locator("td input").first().focus();
      await page.mouse.move(0, 0);
      await expect.poll(async () => shadowLayers((await frames())[0].shadow).length).toBe(1);

      // Value text starts where its header's text does.
      const offsets = await page.locator(".c-table--editable").evaluate((table) => {
        const ths = [...table.querySelectorAll("thead th")];
        const tr = table.querySelector("tbody tr") as HTMLTableRowElement;
        const textLeft = (el: Element) => {
          const r = document.createRange();
          const node = [...el.querySelectorAll("*"), el]
            .flatMap((e) => [...e.childNodes])
            .find((n) => n.nodeType == Node.TEXT_NODE && n.textContent!.trim());
          if (!node) return null;
          r.selectNodeContents(node);
          return Math.round(r.getBoundingClientRect().left);
        };
        return ths.map((th, i) => {
          const td = tr.cells[i];
          if (td.classList.contains("c-admin-table--actions")) return null;
          const input = td.querySelector<HTMLInputElement>("input:not([type=hidden])");
          const value = input
            ? Math.round(input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft))
            : textLeft(td);
          return value == null ? null : [th.textContent!.trim(), textLeft(th), value];
        });
      });
      const compared = offsets.filter(Boolean);
      expect(compared.length).toBeGreaterThanOrEqual(5);
      for (const o of compared) expect(o![2], o![0] as string).toBe(o![1]);

      const heights = await page.locator(".c-table--editable tbody tr").evaluateAll((rows) => rows.map((r) => r.getBoundingClientRect().height));
      expect(new Set(heights)).toEqual(new Set([56]));
    });
  }
});
