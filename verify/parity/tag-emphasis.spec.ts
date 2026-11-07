import { expect, test, type Frame } from "@playwright/test";
import { openStory } from "../lib/storybook";

function colors(frame: Frame, root: string) {
  return frame.evaluate((root) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const pixel = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    return [...document.querySelectorAll(`${root} [data-parity^="tag-"]`)].map((el) => {
      const style = getComputedStyle(el);
      const foreground = pixel(getComputedStyle(el.querySelector(".v-chip__content, .canon-tag-label")!).color);
      const border = pixel(el.getAttribute("data-parity") === "tag-low" ? style.borderTopColor : "transparent");
      pixel(style.backgroundColor);
      const underlay = el.querySelector(".v-chip__underlay");
      if (underlay) {
        const s = getComputedStyle(underlay);
        ctx.fillStyle = s.backgroundColor;
        ctx.globalAlpha = Number(s.opacity);
        ctx.fillRect(0, 0, 1, 1);
      }
      return { id: el.getAttribute("data-parity"), fill: [...ctx.getImageData(0, 0, 1, 1).data], foreground, border };
    });
  }, root);
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: neutral chip emphasis paints match Canon and follow inherited ink`, async ({ page }) => {
    await openStory(page, "parity-data--tag", { theme });
    const canon = page.frames().find((frame) => frame !== page.mainFrame())!;
    await canon.locator(".canon-tag").first().waitFor();
    for (const ink of [null, "rgb(3, 105, 161)"]) {
      if (ink) {
        await page.locator('[data-side="vuetify"] .v-chip').first().evaluate((el, ink) => (el.parentElement as HTMLElement).style.color = ink, ink);
        await canon.locator(".canon-tag").first().evaluate((el, ink) => (el.parentElement as HTMLElement).style.color = ink, ink);
      }
      const ours = await colors(page.mainFrame(), '[data-side="vuetify"]');
      const theirs = await colors(canon, "body");
      expect(ours.map((tag) => tag.id)).toEqual(theirs.map((tag) => tag.id));
      for (let i = 0; i < ours.length; i++) {
        for (const property of ["fill", "foreground", "border"] as const) {
          ours[i][property].forEach((channel, c) => expect(Math.abs(channel - theirs[i][property][c]), `${ours[i].id} ${property} channel ${c}`).toBeLessThanOrEqual(1));
        }
      }
    }
  });
}
