import { test, type Page } from "@playwright/test";
import { adminEditorURL, discoverAdminTypes } from "../lib/admin";

const outDir = process.env.CAPTURE_DIR ?? "screenshots/baseline";

test.skip(!process.env.CAPTURE, "set CAPTURE=1 (pnpm baseline) to write screenshots");

async function shoot(page: Page, url: string, name: string) {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    // The demo persists its theme switch in localStorage; clear it so the scheme decides.
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("theme"));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/${name}-${scheme}.png`, fullPage: true });
  }
}

test("baseline screenshots", async ({ page }) => {
  const [type] = await discoverAdminTypes(page);
  const editor = await adminEditorURL(page, type);
  await shoot(page, "/", "home");
  await shoot(page, "/widget/1", "widget");
  await shoot(page, "/admin", "admin");
  await shoot(page, `/admin/${type}`, "admin-table");
  await shoot(page, editor, "admin-editor");
  await shoot(page, "/admin/audit", "admin-audit");
  // c-style's fixture page; absent from the pre-c-style baseline.
  if (outDir !== "screenshots/baseline") await shoot(page, "/c-style", "kitchen");
});
