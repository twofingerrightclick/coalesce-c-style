import { expect, test } from "@playwright/test";
import { discoverAdminTypes, openAdminTable } from "../lib/admin";

test("admin table renders rows", async ({ page }) => {
  const [type] = await discoverAdminTypes(page);
  expect(type).toBeTruthy();
  const rows = await openAdminTable(page, type);
  expect(await rows.count()).toBeGreaterThan(0);
});
