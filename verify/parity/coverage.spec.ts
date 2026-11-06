import { expect, test } from "@playwright/test";
import { fetchStories, openStory } from "../lib/storybook";

// M17 coverage sweep. Coverage reads the Overview page, which lists every
// `vuetify/components` export (transitions left out; sub-parts count through
// their parent) and every Coalesce `C*` component against the stories'
// `vuetify:` / `coalesce:` tags. The brand sweep renders every Parity story at
// each accent preset, light and dark.

const accents = ["canon", "violet", "emerald", "rose", "orange"];
const parity = (await fetchStories()).filter((s) => s.title.startsWith("Parity/"));

test("every Vuetify export and Coalesce component has a story", async ({ page }) => {
  const { errors } = await openStory(page, "overview-all-components--all-components-page");
  expect(errors).toEqual([]);
  await expect(page.locator(".sb-all__item").first()).toBeVisible();
  const missing = await page.locator(".sb-all__item--missing code").allInnerTexts();
  expect(missing).toEqual([]);
  expect(await page.locator(".sb-all__item").count()).toBeGreaterThan(200);
});

test.describe("brand sweep: Parity stories at every accent, light and dark", () => {
  for (const story of parity) {
    test(`${story.title} / ${story.name}`, async ({ page }) => {
      for (const theme of ["light", "dark"] as const) {
        for (const accent of accents) {
          const { errors } = await openStory(page, story.id, { theme, accent });
          expect(errors, `${story.id} ${theme} ${accent}`).toEqual([]);
        }
      }
    });
  }
});
