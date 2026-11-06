import { expect, test, type Page } from "@playwright/test";
import { adminEditorURL, discoverAdminTypes } from "../lib/admin";

/** Demo pages c-style must render: an admin table, its editor, and the audit log. */
async function adminPages(page: Page) {
  const [type] = await discoverAdminTypes(page);
  return [`/admin/${type}`, await adminEditorURL(page, type), "/admin/audit"];
}

/** Loads `path` and returns the console errors it logged. */
async function load(page: Page, path: string) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(path, { waitUntil: "networkidle" });
  return errors;
}

test("admin pages render without console errors", async ({ page }) => {
  for (const path of await adminPages(page)) {
    expect(await load(page, path), path).toEqual([]);
  }
});

// c-admin-table renders its row actions as raw `<i class="v-icon fa …">`, which
// no icon set can reach; they stay FontAwesome until M16.
const rawFaIcon = "i.v-icon.fa";

test("every v-icon on the admin pages is Lucide", async ({ page }) => {
  for (const path of await adminPages(page)) {
    await load(page, path);
    const icons = page.locator(`.v-icon:not(${rawFaIcon})`);
    expect(await icons.count(), path).toBeGreaterThan(0);
    const notLucide = await icons.evaluateAll((els) =>
      els.filter((el) => !el.querySelector(":scope > svg.lucide")).map((el) => el.className),
    );
    expect(notLucide, path).toEqual([]);
  }
});

test("Lucide icons draw a 1.5px non-scaling stroke", async ({ page }) => {
  await load(page, "/admin/audit");
  const svg = page.locator(".v-icon > svg.lucide").first();
  await expect(svg).toHaveAttribute("stroke-width", "1.5");
  await expect(svg.locator(":scope > *").first()).toHaveAttribute(
    "vector-effect",
    "non-scaling-stroke",
  );
});

test("first <style> on the page declares Vuetify's layer order", async ({ page }) => {
  await load(page, "/");
  const first = await page.evaluate(() => document.querySelectorAll("style")[0]?.textContent ?? "");
  expect(first.replace(/\s+/g, "")).toContain("@layervuetify-core{@layerreset,base;}");
});

// c-style/settings sets $border-radius-root 8px (Vuetify: 4px). If Sass loads a
// second copy of vuetify/settings, none of c-style's settings apply and this fails.
test("c-style SASS settings reach Vuetify's component CSS", async ({ page }) => {
  const [type] = await discoverAdminTypes(page);
  await load(page, `/admin/${type}`);
  const button = page.locator(".v-btn:not(.v-btn--icon)").first();
  await expect(button).toHaveCSS("border-top-left-radius", "8px");
});
