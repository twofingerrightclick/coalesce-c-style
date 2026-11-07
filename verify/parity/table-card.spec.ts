import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: full-width table cards share an inset without double-padding wrapped tables`, async ({ page }) => {
    await openStory(page, "coalesce-display-c-table--card-composition", { theme });
    for (const width of [400, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const inset of [20, 28]) {
        for (const composition of ["direct", "loader", "native"]) {
          const card = page.locator(`[data-composition="${composition}"]`);
          await card.evaluate((el, inset) => (el as HTMLElement).style.setProperty("--cs-card-pad", `${inset}px`), inset);
          await expect(card.locator(".v-toolbar__content")).toHaveCSS("padding", `${inset}px`);
          await expect(card.locator(":scope > .c-list-pagination")).toHaveCSS("padding", `${inset}px`);
          for (const row of await card.locator(".v-table tr").all()) {
            await expect(row.locator(":scope > :first-child")).toHaveCSS("padding-inline-start", `${inset}px`);
            await expect(row.locator(":scope > :last-child")).toHaveCSS("padding-inline-end", `${inset}px`);
          }
        }
      }
      for (const composition of ["padded", "standalone"]) {
        await expect(page.locator(`[data-composition="${composition}"] th`).first()).toHaveCSS("padding-inline-start", "16px");
      }
    }
  });
}
