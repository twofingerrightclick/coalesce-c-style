import { expect, test } from "@playwright/test";
import { fetchStories, openStory } from "../lib/storybook";

// Rendering a component alone cannot detect a missing Canon reference.
const stories = (await fetchStories()).filter((story) => /^(Vuetify|Coalesce|c-style)\//.test(story.title));
for (const story of stories) {
  test(`Canon reference: ${story.title} / ${story.name}`, async ({ page }) => {
    await openStory(page, story.id);
    const comparison = page.locator("[data-canon-comparison]");
    await expect(comparison).toBeVisible();
    await expect(comparison.locator("[data-canon-loading]")).toHaveCount(0);
    await expect(comparison.locator("[data-canon-error]")).toHaveCount(0);
    if (await comparison.getAttribute("data-reference-match") === "none") {
      await expect(comparison.locator(".story-comparison__note").first()).not.toBeEmpty();
    } else {
      const frames = comparison.locator("iframe.canon-frame");
      await expect(frames.first()).toBeVisible();
      for (const frame of await frames.all()) {
        await expect(frame.contentFrame().locator(".ref-section").first()).toBeVisible();
        await expect(frame.contentFrame().locator('[class*="canon-"]').first()).toBeAttached();
      }
    }
  });
}
