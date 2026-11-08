import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const story of [
  { id: "coalesce-inputs-c-datetime-picker--open-date", open: false },
  { id: "coalesce-inputs-c-input--dates", open: true },
  { id: "coalesce-inputs-c-datetime-picker--narrow-viewport", open: false },
  { id: "coalesce-inputs-c-datetime-picker--narrow-date", open: false },
]) {
  test(`${story.id}: year selection stays open`, async ({ page }) => {
    if (story.id.includes("narrow")) await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, story.id);
    if (story.open) await page.locator(".c-datetime-picker .v-field__append-inner .v-icon").first().click();
    const menu = page.locator(".c-datetime-picker__menu:visible");
    await expect(menu).toBeVisible();
    await menu.getByTestId("year-btn").click();
    await expect(menu.locator(".v-date-picker-years")).toBeVisible();
    await menu.locator(".v-date-picker-years button").filter({ hasText: "1961" }).first().click();
    await expect(menu).toBeVisible();
    await expect(menu.getByTestId("year-btn")).toContainText("1961");
  });
}
