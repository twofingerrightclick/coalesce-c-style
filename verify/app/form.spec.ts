import { expect, test } from "@playwright/test";
import { gotoScheme } from "../lib/page";

// Applications own form composition; selection groups own their internal spacing.

test("the Widget example explicitly spaces its compact field stack", async ({ page }) => {
  await gotoScheme(page, "/widget/1", "light");
  const inputs = page.locator("[data-widget-fields] > .v-input");
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

test("radio groups retain their internal pitch while standalone choices retain their own height", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const pitch = (sel: string) =>
    page.locator(sel).evaluateAll((els) => els.slice(1).map((e, i) => e.getBoundingClientRect().top - els[i].getBoundingClientRect().top));
  expect(await pitch('[data-choice="stacked-radios"] .v-radio')).toEqual([28, 28]);
  for (const group of ["stacked-checkboxes", "stacked-switches"]) {
    const controls = page.locator(`[data-choice="${group}"] .v-selection-control`);
    for (const control of await controls.all()) {
      expect((await control.boundingBox())!.height).toBe(40);
    }
  }
});

for (const width of [1440, 390]) {
  test(`VForm leaves app-owned input and action layouts unchanged at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoScheme(page, "/c-style", "light");
    const form = page.locator('[data-form-case="form"]');
    await expect(form).toHaveClass(/v-form/);
    await expect(form).not.toHaveClass(/cs-form/);
    const geometry = (context: string) => page.locator(`[data-form-case="${context}"]`).evaluate((root) => {
      return [...root.querySelectorAll<HTMLElement>("[data-layout]")].map((row) => {
        const origin = row.getBoundingClientRect();
        return [...row.querySelectorAll<HTMLElement>(".v-input, .v-btn")].map((el) => {
          const box = el.getBoundingClientRect();
          return {
            x: box.left - origin.left,
            y: box.top - origin.top,
            height: box.height,
            marginTop: getComputedStyle(el).marginTop,
          };
        });
      });
    });
    const plain = await geometry("plain");
    expect(await geometry("form")).toEqual(plain);
    expect(plain.flat().every((box) => box.marginTop === "0px")).toBe(true);
    // Direct horizontal siblings share the same top; neither receives an inferred stack gap.
    expect(plain[0][0].y).toBe(plain[0][1].y);
    for (const control of await form.locator('[data-layout="choices"] .v-selection-control').all()) {
      expect((await control.boundingBox())!.height).toBe(40);
    }
    // Coalesce passes through the native details policy too.
    const details = form.locator('[data-layout="wrapped"] .v-input__details');
    expect((await details.boundingBox())!.height).toBeGreaterThan(0);
  });
}

test("native message space and explicit details policies survive validation messages", async ({ page }) => {
  await gotoScheme(page, "/c-style", "light");
  const families = ["text", "checkbox", "radio", "switch"];
  const details = (name: string) => page.locator(`[data-details="${name}"] .v-input__details`);
  const height = async (name: string) => (await details(name).boundingBox())!.height;
  const reserved: Record<string, number> = {};
  for (const family of families) {
    reserved[family] = await height(`${family}-native`);
    expect(reserved[family]).toBeGreaterThan(0);
    expect(await height(`${family}-reserve`)).toBe(reserved[family]);
    await expect.poll(() => height(`${family}-auto`)).toBe(0);
    await expect(details(`${family}-hidden`)).toHaveCount(0);
  }
  await expect.poll(() => height("scoped-auto")).toBe(0);
  expect(await height("scoped-reserve")).toBeGreaterThan(0);

  await page.locator("[data-details-toggle]").click();
  for (const family of families) {
    for (const mode of ["native", "auto", "reserve"]) {
      await expect(details(`${family}-${mode}`)).toContainText("Check this value");
      await expect(details(`${family}-${mode}`)).toBeVisible();
    }
    expect(await height(`${family}-native`)).toBe(reserved[family]);
    await expect(details(`${family}-hidden`)).toHaveCount(0);
  }
  await page.locator("[data-details-toggle]").click();
  for (const family of families) {
    await expect.poll(() => height(`${family}-auto`)).toBe(0);
    expect(await height(`${family}-native`)).toBe(reserved[family]);
  }
});
