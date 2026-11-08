import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: a failed select request shows a centered error, not an empty result`, async ({ page }) => {
    await openStory(page, "coalesce-inputs-c-select--load-error", { theme });
    const menu = page.locator(".c-select__menu-content");
    const error = menu.getByRole("alert");
    await expect(error).toContainText("Mock failure for /Company/list.");
    await expect(error).toHaveCSS("text-align", "center");
    await expect(menu.getByText("No results found.")).toBeHidden();
  });

  test(`${theme}: an empty successful select still shows its empty message`, async ({ page }) => {
    await openStory(page, "coalesce-inputs-c-select--empty", { theme });
    await expect(page.locator(".c-select__menu-content").getByText("No results found.")).toBeVisible();
  });
}
