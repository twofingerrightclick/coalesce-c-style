import { expect, test } from "@playwright/test";
import { pickerSpill, rowOverlaps } from "../lib/layout";
import { openStory } from "../lib/storybook";

// Every picker in the picker stories (date: single, range, multiple, month
// and year views, min/max, disabled; time; colour) keeps its content inside
// its own box, and neighbouring pickers don't overlap.
const stories = [
  "vuetify-pickers-date-and-time--date-picker",
  "vuetify-pickers-date-and-time--time-picker",
  "vuetify-pickers-sliders-color-rating--color-picker",
];

for (const id of stories) {
  for (const theme of ["light", "dark"] as const) {
    test(`${id} (${theme}): picker content fits, pickers apart`, async ({ page }) => {
      await openStory(page, id, { theme });
      expect(await page.locator(".v-picker, .v-color-picker").count()).toBeGreaterThan(0);
      expect(await pickerSpill(page.locator("#storybook-root"))).toEqual([]);
      expect(await rowOverlaps(page)).toEqual([]);
    });
  }
}

test("date picker: the 280px grid fills the 304px box, 12 in on both sides, cells 40 apart", async ({ page }) => {
  await openStory(page, stories[0]);
  for (const picker of await page.locator(".v-date-picker:has(.v-date-picker-month)").all()) {
    const box = (await picker.boundingBox())!;
    const grid = (await picker.locator(".v-date-picker-month__days").boundingBox())!;
    expect([grid.x - box.x, grid.width, box.x + box.width - grid.x - grid.width]).toEqual([12, 280, 12]);
    const days = picker.locator(".v-date-picker-month__day-btn");
    const [a, b] = [(await days.nth(0).boundingBox())!, (await days.nth(1).boundingBox())!];
    expect(b.x - a.x).toBe(40);
  }
});
