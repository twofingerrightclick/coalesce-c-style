import { expect, test } from "@playwright/test";

// Check the text-bearing children: the general parity suite excludes type
// differences on these components' containers.
for (const theme of ["light", "dark"]) {
  for (const font of ["public-sans", "inter"]) {
    test.describe(`${theme}, ${font}`, () => {
      test("fieldset heading matches Canon without thickening individual choices", async ({ page }) => {
        await page.goto(`/iframe.html?id=parity-choices--radio&viewMode=story&globals=theme:${theme};font:${font}`, { waitUntil: "domcontentloaded" });
        const choices = page.locator('[data-side="vuetify"]');
        await expect(choices.locator(".v-radio-group > .v-input__control > .v-label")).toHaveCSS("font-weight", "500");
        for (const label of await choices.locator(".v-radio .v-label").all()) {
          await expect(label).toHaveCSS("font-weight", "400");
        }
        const canon = page.frameLocator("iframe.canon-frame");
        await expect(canon.locator(".canon-fieldset-legend")).toHaveCSS("font-weight", "500");
        await expect(canon.locator(".canon-choice-label").first()).toHaveCSS("font-weight", "400");
      });

      test("short toast messages match Canon's title weight", async ({ page }) => {
        await page.goto(`/iframe.html?id=parity-surfaces--toast&viewMode=story&globals=theme:${theme};font:${font}`, { waitUntil: "domcontentloaded" });
        const messages = page.locator('[data-side="vuetify"] .v-snackbar__content');
        await expect(messages).toHaveCount(3);
        for (const message of await messages.all()) {
          await expect(message).toHaveCSS("font-weight", "500");
        }
        await expect(page.frameLocator("iframe.canon-frame").locator(".canon-toast-title").first()).toHaveCSS("font-weight", "500");
      });

      test("a separate snackbar title is medium and its description stays regular", async ({ page }) => {
        await page.goto(`/iframe.html?id=vuetify-surfaces-vsnackbar--snackbars&viewMode=story&globals=theme:${theme};font:${font}`, { waitUntil: "domcontentloaded" });
        const title = page.locator(".v-snackbar__title", { hasText: "Invoice saved" });
        await expect(title).toHaveCSS("font-weight", "500");
        const content = title.locator("..");
        await expect(content).toContainText("Changes apply to new invoices only.");
        await expect(content).toHaveCSS("font-weight", "400");
      });

      test("table text weights distinguish column headers, body labels, totals and captions", async ({ page }) => {
        await page.goto(`/iframe.html?id=vuetify-data-vtable--semantics&viewMode=story&globals=theme:${theme};font:${font}`, { waitUntil: "domcontentloaded" });
        const table = page.locator(".v-table > .v-table__wrapper > table");
        await expect(table.locator("caption")).toHaveCSS("font-weight", "600");
        await expect(table.locator("thead th").first()).toHaveCSS("font-weight", "500");
        await expect(table.locator("tbody th").first()).toHaveCSS("font-weight", "400");
        await expect(table.locator("tbody td").first()).toHaveCSS("font-weight", "400");
        await expect(table.locator("tfoot th")).toHaveCSS("font-weight", "500");
        await expect(table.locator("tfoot td")).toHaveCSS("font-weight", "500");
        await expect(table.locator("tbody th.font-weight-medium")).toHaveCSS("font-weight", "500");
      });

      test("explicit banner title uses the label role while its description remains body text", async ({ page }) => {
        await page.goto(`/iframe.html?id=vuetify-surfaces-vbanner--title-and-description&viewMode=story&globals=theme:${theme};font:${font}`, { waitUntil: "domcontentloaded" });
        const text = page.locator(".v-banner-text");
        await expect(text.locator("strong")).toHaveCSS("font-weight", "500");
        await expect(text.locator("span")).toHaveCSS("font-weight", "400");
      });
    });
  }
}
