import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: narrow datetime confirmation follows the time controls`, async ({ page }) => {
    for (const width of [320, 390, 600]) {
      await page.setViewportSize({ width, height: 844 });
      await openStory(page, "coalesce-inputs-c-datetime-picker--narrow-viewport", { theme });
      const menu = page.locator(".c-datetime-picker__menu");
      const close = menu.locator(".c-datetime-picker__close-btn");
      await expect(close).toHaveCSS("width", "40px");
      await expect(close).toHaveCSS("height", "40px");
      const time = (await menu.locator(".c-time-picker").boundingBox())!;
      await close.scrollIntoViewIfNeeded();
      const button = (await close.boundingBox())!;
      const currentTime = (await menu.locator(".c-time-picker").boundingBox())!;
      expect(button.y - currentTime.y - time.height).toBeCloseTo(8, 1);
      // Moving the action into flow must retain VBtn's containing block;
      // otherwise its tonal underlay paints over the whole picker card.
      for (const layer of await close.locator(".v-btn__underlay, .v-btn__overlay").all()) {
        const bounds = (await layer.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(button.x);
        expect(bounds.y).toBeGreaterThanOrEqual(button.y);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(button.x + button.width);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(button.y + button.height);
      }
      const hour = menu.locator(".c-time-picker__item-hour").filter({ hasText: /^9$/ });
      await hour.click();
      await expect(hour).toHaveClass(/c-time-picker__item-active/);
      await close.hover();
      await close.click();
      await expect(menu).toBeHidden();
    }
  });
}
