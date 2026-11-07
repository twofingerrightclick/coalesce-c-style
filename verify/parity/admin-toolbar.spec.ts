import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: admin table outer top and bottom insets match`, async ({ page }) => {
    await openStory(page, "coalesce-admin-c-admin-table--page-with-methods", { theme });
    const card = page.locator(".c-admin-table");
    for (const width of [400, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const inset of [20, 28]) {
        await card.evaluate((el, inset) => (el as HTMLElement).style.setProperty("--cs-card-pad", `${inset}px`), inset);
        await expect.poll(() => card.evaluate((el) => {
          const bounds = el.getBoundingClientRect();
          const button = el.querySelector(".c-admin-table-toolbar--button-reload")!.getBoundingClientRect();
          const extension = el.querySelector(".v-toolbar__extension")!.getBoundingClientRect();
          const footer = el.querySelector(".c-list-pagination")!.getBoundingClientRect();
          const search = el.querySelector(".c-admin-table-toolbar--search")!.getBoundingClientRect();
          return { top: button.top - bounds.top, bottom: bounds.bottom - footer.bottom, gap: extension.top - button.bottom, search: search.left - bounds.left };
        })).toEqual({ top: inset, bottom: inset, gap: 8, search: 8 });
      }
    }
  });

  test(`${theme}: compact admin actions are square with centered icons`, async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await openStory(page, "coalesce-admin-c-admin-table--toolbar", { theme });
    const toolbar = page.locator(".c-admin-table-toolbar").nth(1);
    const buttons = toolbar.locator(".c-admin-table-toolbar--button-create, .c-admin-table-toolbar--button-reload, .c-admin-table-toolbar--button-editable");
    await expect(buttons).toHaveCount(3);

    for (const width of [400, 800, 839, 840, 960, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const button of await buttons.all()) {
        const label = button.locator(".hidden-sm-and-down");
        if (width >= 840) {
          await expect(label).toBeVisible();
          expect((await button.boundingBox())!.width).toBeGreaterThan(40);
        } else {
          await expect(label).toBeHidden();
          await expect(button).toHaveCSS("width", "40px");
          await expect(button).toHaveCSS("height", "40px");
          const box = (await button.boundingBox())!;
          const icon = (await button.locator(".v-icon").boundingBox())!;
          expect(icon.x + icon.width / 2).toBeCloseTo(box.x + box.width / 2, 1);
        }
      }
    }
  });
}
