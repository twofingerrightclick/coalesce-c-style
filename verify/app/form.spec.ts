import { expect, test } from "@playwright/test";
import { gotoScheme } from "../lib/page";

// Form layout and grouped choices (canon §4 B Form Layout, §4 C Fieldset); fixes from the M8/M11 checkpoints.

test("stacked fields in a form sit a 16px form gap apart (/widget)", async ({ page }) => {
  await gotoScheme(page, "/widget/1", "light");
  const inputs = page.locator(".v-form .v-input");
  await expect(inputs.nth(2)).toBeVisible();
  // Bottom of one input to the top of the next one's label row.
  const gap = await inputs.evaluateAll((els) => {
    const [a, b] = els;
    return b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;
  });
  expect(gap).toBe(16);
});

test("fields in a toolbar row get no form gap (audit filters stay 40 tall)", async ({ page }) => {
  await gotoScheme(page, "/admin/audit", "light");
  const fields = page.locator(".c-admin-table-toolbar .v-toolbar__extension .v-field");
  await expect(fields.first()).toBeVisible();
  const tops = await fields.evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().top), e.getBoundingClientRect().height]));
  expect(new Set(tops.map((t) => t[0])).size).toBe(1);
  expect(tops.every((t) => t[1] === 40)).toBe(true);
});

test("inline radio group lines up with checkboxes; items 24 apart, labels clear", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const centre = (sel: string) =>
    page.locator(sel).evaluate((el) => {
      const r = el.querySelector(".v-selection-control__input")!.getBoundingClientRect();
      return r.top + r.height / 2;
    });
  expect(await centre('[data-choice="radio-off"]')).toBeCloseTo(await centre('[data-choice="checkbox-off"]'), 0);
  const gap = await page.locator('[data-choice="radios"]').evaluate((el) => {
    const [a, b] = el.querySelectorAll(".v-radio");
    return b.getBoundingClientRect().left - a.querySelector(".v-label")!.getBoundingClientRect().right;
  });
  expect(gap).toBeCloseTo(24, 0);
});

test("stacked choices sit Canon's fieldset pitch: 28 (checkboxes in a form, radio group), 32 (switches)", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const pitch = (sel: string) =>
    page.locator(sel).evaluateAll((els) => els.slice(1).map((e, i) => e.getBoundingClientRect().top - els[i].getBoundingClientRect().top));
  const checkboxes = '[data-choice="stacked-checkboxes"] .v-checkbox';
  await expect(page.locator(checkboxes).first()).toBeVisible();
  expect(await pitch(checkboxes)).toEqual([28, 28]);
  expect(await pitch('[data-choice="stacked-radios"] .v-radio')).toEqual([28, 28]);
  expect(await pitch('[data-choice="stacked-switches"] .v-switch')).toEqual([32]);
  // A lone checkbox in a row keeps the 40px row, level with fields.
  expect((await page.locator('[data-choice="checkbox-off"] .v-selection-control').boundingBox())!.height).toBe(40);
});
