import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: chip fields wrap with visible gaps and retain a 40px single row`, async ({ page }) => {
    await openStory(page, "vuetify-text-entry-vautocomplete--wrapped-chips", { theme });
    const fields = page.locator(".v-input:has(.v-chip)");
    await expect(fields).toHaveCount(9);
    for (const field of await fields.all()) {
      const chips = field.locator(".v-chip");
      await expect(chips).toHaveCount(2);
      const first = (await chips.nth(0).boundingBox())!;
      const second = (await chips.nth(1).boundingBox())!;
      expect(second.y - first.y - first.height).toBeCloseTo(8, 1);

      await field.evaluate((el) => (el as HTMLElement).style.width = "640px");
      await expect(field.locator(".v-field")).toHaveCSS("height", "40px");
      const a = (await chips.nth(0).boundingBox())!;
      const b = (await chips.nth(1).boundingBox())!;
      expect(b.y).toBe(a.y);
      expect(b.x - a.x - a.width).toBeCloseTo(8, 1);
    }
  });
}
