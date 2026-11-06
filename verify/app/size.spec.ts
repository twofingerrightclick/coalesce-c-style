import { expect, test, type Page } from "@playwright/test";
import { adminEditorURL, discoverAdminTypes } from "../lib/admin";

// M6, the chunkiness pass: Canon md controls are 40px with 20px icons (canon §2.3).

async function adminPages(page: Page) {
  const [type] = await discoverAdminTypes(page);
  return [`/admin/${type}`, await adminEditorURL(page, type), "/admin/audit"];
}

/** Heights of visible elements matching `selector`, keyed by a short label. */
function heights(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((els) =>
    els
      .map((el) => ({ el: (el.textContent ?? "").trim().slice(0, 24) || el.className, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0)
      .map(({ el, rect }) => ({ el, h: rect.height, w: rect.width })),
  );
}

test("icons are 20px boxes or smaller on the admin pages", async ({ page }) => {
  for (const path of await adminPages(page)) {
    await page.goto(path, { waitUntil: "networkidle" });
    // Raw `<i class="v-icon fa">` row actions are FontAwesome glyphs (M16).
    for (const { el, h, w } of await heights(page, ".v-icon:not(i.fa)")) {
      expect(Math.max(h, w), `${path} ${el}`).toBeLessThanOrEqual(20);
    }
    for (const { el, h, w } of await heights(page, ".v-icon--size-default:not(i.fa, .v-chip *)")) {
      expect([w, h], `${path} ${el}`).toEqual([20, 20]);
    }
    // Canon's default tag is sm: its icon is the 16px line height.
    for (const { el, h, w } of await heights(page, ".v-chip .v-icon--size-default")) {
      expect([w, h], `${path} ${el}`).toEqual([16, 16]);
    }
  }
});

test("controls are no taller than 40px; fields are 40 at every density", async ({ page }) => {
  const controls = ".v-btn, .v-selection-control, .v-list-item, .v-chip, .v-tab";
  for (const path of await adminPages(page)) {
    await page.goto(path, { waitUntil: "networkidle" });
    for (const { el, h } of await heights(page, controls)) {
      expect(h, `${path} ${el}`).toBeLessThanOrEqual(40);
    }
    for (const { el, h } of await heights(page, ".v-field")) {
      expect(h, `${path} ${el}`).toBe(40);
    }
  }
});

test("worded buttons have no minimum width and Canon's icon gap", async ({ page }) => {
  const [type] = await discoverAdminTypes(page);
  await page.goto(`/admin/${type}`, { waitUntil: "networkidle" });
  const buttons = page.locator(".c-admin-table-toolbar .v-btn:not(.v-btn--icon)");
  // Vuetify's min-width is `height × 16/9`; Canon buttons are as wide as their content.
  expect(["0px", "auto"]).toContain(await buttons.first().evaluate((el) => getComputedStyle(el).minWidth));
  const gaps = await buttons.evaluateAll((els) =>
    els.map((el) => {
      const icon = el.querySelector(".v-icon");
      const label = [...el.querySelector(".v-btn__content")!.childNodes].find(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim(),
      );
      if (!icon || !label) return null;
      const range = document.createRange();
      range.selectNodeContents(label);
      return range.getBoundingClientRect().left - icon.getBoundingClientRect().right;
    }),
  );
  for (const gap of gaps.filter((g) => g !== null)) expect(gap).toBeCloseTo(8, 0);
});

test("nav list items put 8px between icon and title (canon nav-list.css: button gap + label inset)", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "networkidle" });
  const item = page.locator(".v-navigation-drawer .v-list-item").first();
  const gap = await item.evaluate((el) =>
    el.querySelector(".v-list-item-title")!.getBoundingClientRect().left -
    el.querySelector(".v-icon")!.getBoundingClientRect().right,
  );
  expect(gap).toBeCloseTo(8, 0);
});
