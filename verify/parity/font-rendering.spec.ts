import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const font of ["public-sans", "inter"]) {
  test(`${font}: browser-default smoothing reaches component text and remains overridable`, async ({ page }) => {
    await openStory(page, "foundations-chunkiness--chunkiness", { font });
    const title = page.locator('[data-side="vuetify"] .v-alert-title');
    await expect(title).toHaveCSS("font-weight", "500");

    // Unsupported vendor properties are ignored, so inspect only the ones
    // the browser implements. The Mac rendering change must be inherited
    // by actual text, not just present on the root stylesheet.
    const smoothing = await title.evaluate((el) => {
      const style = getComputedStyle(el);
      return ["-webkit-font-smoothing", "-moz-osx-font-smoothing"]
        .filter((property) => CSS.supports(property, "auto"))
        .map((property) => style.getPropertyValue(property));
    });
    expect(smoothing.every((value) => value === "auto")).toBe(true);

    // Keep application CSS in control; no !important or component-level
    // smoothing declarations should prevent an app choosing another mode.
    await page.addStyleTag({ content: "html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }" });
    const overridden = await title.evaluate((el) => {
      const style = getComputedStyle(el);
      return [
        ["-webkit-font-smoothing", "antialiased"],
        ["-moz-osx-font-smoothing", "grayscale"],
      ].filter(([property, value]) => CSS.supports(property, value))
        .map(([property, value]) => style.getPropertyValue(property) === value);
    });
    expect(overridden.every(Boolean)).toBe(true);
  });
}
