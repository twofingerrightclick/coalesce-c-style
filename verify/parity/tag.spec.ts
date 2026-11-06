import { expect, test, type Frame } from "@playwright/test";
import { openStory } from "../lib/storybook";

// Tag media geometry (canon §4 Tag), Vuetify vs Canon in `Parity/Data/Tag
// Media`: the avatar or icon at the line height (16 / 20 / 24), its start
// inset (4 / 6 / 8), the gap to the label text (4 / 8 / 12), and the remove
// icon's gap and end inset. The parity gate compares boxes, not positions.

function measure(frame: Frame, root: string) {
  return frame.evaluate((root) => {
    return [...document.querySelectorAll(`${root} [data-parity^="tag-"]`)].map((tag) => {
      const box = tag.getBoundingClientRect();
      const media = tag.querySelector(".v-avatar, .canon-avatar, .v-chip__prepend .v-icon, .canon-icon")!.getBoundingClientRect();
      const label = tag.querySelector(".canon-tag-label") ?? tag.querySelector(".v-chip__content")!;
      const range = document.createRange();
      range.selectNodeContents([...label.childNodes].find((n) => n.nodeType == Node.TEXT_NODE && n.textContent!.trim())!);
      const text = range.getBoundingClientRect();
      const remove = tag.querySelector(".v-chip__close .v-icon, .canon-tag-remove")?.getBoundingClientRect();
      return {
        id: tag.getAttribute("data-parity"),
        height: box.height,
        media: [media.width, media.height],
        mediaTop: media.top - box.top,
        startInset: media.left - box.left,
        labelGap: text.left - media.right,
        remove: remove && { size: remove.width, gap: remove.left - text.right, endInset: box.right - remove.right },
      };
    });
  }, root);
}

test("tag avatar and icon: size, start inset, label gap and remove match Canon at sm / md / lg", async ({ page }) => {
  await openStory(page, "parity-data--tag-media");
  const canon = page.frames().find((f) => f != page.mainFrame())!;
  await canon.waitForFunction(() => [...document.images].every((i) => i.complete) && !!document.querySelector("[data-parity]"));
  await canon.evaluate(() => document.fonts.ready);

  const ours = await measure(page.mainFrame(), '[data-side="vuetify"]');
  const theirs = await measure(canon, "body");
  expect(ours.map((t) => t.id)).toEqual(theirs.map((t) => t.id));
  expect(ours).toEqual(theirs);

  const line = { sm: 16, md: 20, lg: 24 };
  for (const t of ours) {
    const size = line[t.id!.split("-").pop() as keyof typeof line];
    expect(t.media, t.id!).toEqual([size, size]);
    expect(t.startInset, t.id!).toBe((t.height - size) / 2);
  }
});
