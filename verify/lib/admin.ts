import { expect, type Page } from "@playwright/test";

/** Model type names linked from the demo's `/admin` index, in page order. */
export async function discoverAdminTypes(page: Page): Promise<string[]> {
  await page.goto("/admin");
  const links = page.locator('a[href^="/admin/"]:not([href="/admin/audit"])');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")!),
  );
  return [...new Set(hrefs.map((href) => href.split("/")[2]))];
}

/** Opens `/admin/<type>` and waits for the table body to hold at least one row. */
export async function openAdminTable(page: Page, type: string) {
  await page.goto(`/admin/${type}`);
  const rows = page.locator(".c-admin-table tbody tr");
  await expect(rows.first()).toBeVisible();
  return rows;
}

/**
 * URL of an editor page for `type`: the first table row's editor, or the
 * create editor after saving a new row when the table is empty.
 */
export async function adminEditorURL(page: Page, type: string): Promise<string> {
  await page.goto(`/admin/${type}`, { waitUntil: "networkidle" });
  const editLink = page.locator(`.c-admin-table tbody a[href*="/admin/${type}/edit/"]`);
  if (await editLink.count()) return (await editLink.first().getAttribute("href"))!;

  await page.goto(`/admin/${type}/edit`);
  await page.locator(".c-admin-editor input").first().fill("Baseline row");
  // The starter editor autosaves once its required category is populated.
  await page.getByRole("combobox", { name: "Category", exact: true }).press("ArrowDown");
  await page.getByRole("option").first().click();
  await page.waitForURL(new RegExp(`/admin/${type}/edit/.+`));
  return new URL(page.url()).pathname;
}
