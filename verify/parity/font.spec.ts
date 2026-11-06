import { expect, test, type Frame, type Page } from "@playwright/test";
import { openStory } from "../lib/storybook";

// The Font toolbar global (storybook/src/fonts.ts → applyCStyleFont).
const ramp = "foundations-typography--ramp";

async function appFont(frame: Page | Frame) {
  return frame.evaluate(async () => {
    await document.fonts.ready;
    const style = getComputedStyle(document.querySelector(".v-application")!);
    const family = style.fontFamily.split(",")[0].replace(/"/g, "");
    return {
      family,
      features: style.fontFeatureSettings,
      weights: [400, 500, 600].filter((w) => document.fonts.check(`${w} 14px "${family}"`) && [...document.fonts].some((f) => f.family.replace(/"/g, "") == family && f.status == "loaded")),
    };
  });
}

test("Public Sans, bundled by c-style, is the default", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await openStory(page, ramp);
  await expect.poll(() => appFont(page)).toEqual({ family: "Public Sans Variable", features: "normal", weights: [400, 500, 600] });
  expect(requests.filter((u) => /fonts\.googleapis|fontshare/.test(u))).toEqual([]);
});

test("font:inter loads c-style's opt-in Inter with Canon's alternates", async ({ page }) => {
  await openStory(page, ramp, { font: "inter" });
  await expect.poll(() => appFont(page)).toMatchObject({ family: "InterVariable", features: expect.stringContaining('"ss01"') });
});

for (const [value, family] of [
  ["plex", "IBM Plex Sans"],
  ["satoshi", "Satoshi"],
  ["general-sans", "General Sans"],
  ["work-sans", "Work Sans"],
  ["Space+Grotesk", "Space Grotesk"],
  ["fontshare+cabinet-grotesk", "Cabinet Grotesk"],
]) {
  test(`font:${value} loads ${family} at 400/500/600 without Inter's alternates`, async ({ page }) => {
    const { errors } = await openStory(page, ramp, { font: value });
    expect(errors).toEqual([]);
    await expect.poll(() => appFont(page)).toEqual({ family, features: "normal", weights: [400, 500, 600] });
  });
}

test("the font choice persists when moving to another story", async ({ page }) => {
  await page.goto(`/?path=/story/${ramp}&globals=font:plex`);
  await page.frameLocator("#storybook-preview-iframe").locator(".v-application").waitFor();
  // Navigate the way a user does: the sidebar search, then the result.
  await page.locator("#storybook-explorer-searchfield").fill("VBtn States");
  await page.getByRole("option", { name: "States Vuetify / Buttons / VBtn" }).click();
  const preview = page.frameLocator("#storybook-preview-iframe");
  await preview.locator(".v-btn").first().waitFor();
  const frame = page.frame({ url: /iframe\.html/ })!;
  await expect.poll(async () => (await appFont(frame)).family).toBe("IBM Plex Sans");
  expect(page.url()).toContain("font:plex");
});
