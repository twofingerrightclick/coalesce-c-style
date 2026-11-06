import { expect, test } from "@playwright/test";
import { white, zinc } from "../lib/canon";
import { gotoScheme } from "../lib/page";

const rootVar = (name: string) =>
  `getComputedStyle(document.documentElement).getPropertyValue("${name}").replace(/\\s/g, "")`;

test.describe("M3 colour foundation", () => {
  for (const [scheme, canvas, surface, primaryText] of [
    ["light", zinc[50], white, "29,78,216"],
    ["dark", zinc[950], zinc[900], "147,197,253"],
  ] as const) {
    test(`${scheme}: canvas, surfaces and accent roles (canon §3.4, §3.5)`, async ({ page }) => {
      await gotoScheme(page, "/admin/Widget", scheme);
      await expect(page.locator(".v-application")).toHaveCSS("background-color", canvas);
      await expect(page.locator(".v-card").first()).toHaveCSS("background-color", surface);
      expect(await page.evaluate(rootVar("--v-theme-primary"))).toBe("37,99,235");
      expect(await page.evaluate(rootVar("--v-primary-text"))).toBe(primaryText);
    });
  }
});
