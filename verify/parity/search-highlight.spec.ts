import { expect, test } from "@playwright/test";
import { openStory } from "../lib/storybook";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: Coalesce search highlights retain the themed fill and selection state`, async ({ page }) => {
    await openStory(page, "coalesce-inputs-c-input--many-to-many", { theme });
    const input = page.getByRole("combobox", { name: "Person Tags" });
    await input.fill("spe");
    const result = page.getByRole("option", { name: "Speaker" });
    await expect(result).toHaveClass(/pending-selection/);
    await expect(result).toHaveAttribute("aria-selected", "false");
    await expect.poll(() => result.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("0");
    await expect.poll(() => result.evaluate((el) => {
      const opacity = getComputedStyle(el.querySelector(".v-list-item__overlay")!).opacity;
      const style = getComputedStyle(el);
      return Number(opacity) === Number(style.getPropertyValue("--v-focus-opacity")) * Number(style.getPropertyValue("--v-theme-overlay-multiplier"));
    })).toBe(true);

    const radius = await result.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(parseFloat(radius)).toBeGreaterThan(0);
    await input.fill("men");
    const selected = page.getByRole("option", { name: "Mentor" });
    await expect(selected).toHaveClass(/pending-selection/);
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(selected.locator('input[type="checkbox"]')).toBeChecked();
    await expect.poll(() => selected.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("1");
    await expect.poll(() => selected.evaluate((el) => getComputedStyle(el.querySelector(".v-list-item__overlay")!).opacity)).toBe(await selected.evaluate((el) => {
      const style = getComputedStyle(el);
      return String(Number(style.getPropertyValue("--v-focus-opacity")) * Number(style.getPropertyValue("--v-theme-overlay-multiplier")));
    }));
    await expect(selected).toHaveCSS("border-radius", radius);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: selected single-choice checkmark matches the option text`, async ({ page }) => {
    await openStory(page, "coalesce-inputs-c-input--reference", { theme });
    await page.getByRole("combobox", { name: "Company" }).click();
    const selected = page.getByRole("option", { name: "Northwind Traders" });
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => selected.evaluate((el) => {
      const row = getComputedStyle(el);
      const tick = getComputedStyle(el, "::after");
      return { color: tick.backgroundColor, text: row.color, opacity: tick.opacity };
    })).toEqual(await selected.evaluate((el) => {
      const color = getComputedStyle(el).color;
      return { color, text: color, opacity: "1" };
    }));
  });
}
