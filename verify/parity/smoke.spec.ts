import { expect, test } from "@playwright/test";
import { compareBox, compareParity } from "../lib/measure";
import { fetchStories } from "../lib/storybook";

// M2 harness check. A default-prop Vuetify button is not a Canon button, so
// the comparison must report differences; if it reports none, the harness is
// not measuring.
test("Parity/Smoke reports the expected button differences", async ({ page }) => {
  const diffs = await compareParity(page, "parity-smoke--smoke", ["btn"]);
  test.info().annotations.push({ type: "diffs", description: JSON.stringify(diffs) });
  expect(diffs.length).toBeGreaterThan(0);
  expect(diffs.map((d) => d.prop)).toContain("background-color");
});

test("compareBox measures both sides", async ({ page }) => {
  const diffs = await compareBox(page, "parity-smoke--smoke", ["btn"]);
  for (const d of diffs) {
    expect(parseFloat(d.vuetify!)).toBeGreaterThan(0);
    expect(parseFloat(d.canon!)).toBeGreaterThan(0);
  }
});

test("the preview declares Vuetify's layer order before any layered CSS", async ({ page }) => {
  await page.goto("/iframe.html?id=parity-smoke--smoke&viewMode=story");
  const styles = await page.evaluate(() => [...document.querySelectorAll("style, link[rel='stylesheet']")].map((s) =>
    s.tagName === "LINK" ? "external-css" : s.textContent ?? "",
  ));
  const order = styles.findIndex((s) => s.includes("@layer vuetify-core{@layer reset,base;}"));
  const firstLayered = styles.findIndex((s, i) => i != order && (s === "external-css" || /@layer\s+vuetify-[a-z]+\s*\{/.test(s)));
  expect(order).toBeGreaterThanOrEqual(0);
  expect(order).toBeLessThan(firstLayered);
});

// Every `data-parity` id on the Vuetify side of a Parity story has a Canon
// partner, so later milestones' assertions can rely on the pairs.

for (const story of (await fetchStories()).filter((s) => s.title.startsWith("Parity/") || s.title == "Foundations/Chunkiness")) {
  test(`pairs resolve: ${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator('[data-side="vuetify"] [data-parity]').first().waitFor();
    const ids = await page.$$eval('[data-side="vuetify"] [data-parity]', (els) => [...new Set(els.map((e) => e.getAttribute("data-parity")!))]);
    const diffs = await compareBox(page, story.id, ids);
    test.info().annotations.push({ type: "box diffs", description: JSON.stringify(diffs) });
  });
}
