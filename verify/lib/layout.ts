import type { Locator, Page } from "@playwright/test";

/**
 * Parts of each picker (date, time, colour) under `root` that reach past the
 * picker's own left or right edge, as "picker #i: part (left, right) vs box".
 * Pickers clip with `overflow: hidden`, so a too-wide row would otherwise only
 * show as a lopsided or cut-off grid.
 */
export function pickerSpill(root: Locator): Promise<string[]> {
  return root.evaluate((root) => {
    const parts = ".v-picker__body > *, .v-btn, .v-date-picker-month__days, .v-slider-track, .v-color-picker-canvas, input";
    const pickers = root.matches(".v-picker, .v-color-picker") ? [root] : [...root.querySelectorAll(".v-picker, .v-color-picker")];
    const spill: string[] = [];
    pickers.forEach((picker, i) => {
      const box = picker.getBoundingClientRect();
      for (const part of picker.querySelectorAll(parts)) {
        const r = part.getBoundingClientRect();
        if (r.width == 0) continue;
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5) {
          const name = `${part.tagName.toLowerCase()}.${[...part.classList].slice(0, 2).join(".")}`;
          spill.push(`picker #${i}: ${name} (${r.left.toFixed(1)}, ${r.right.toFixed(1)}) vs (${box.left}, ${box.right})`);
        }
      }
    });
    return spill;
  });
}

/** Pairs of Storybook `sb-row` items whose boxes overlap, e.g. fixed-width panels squeezed into a too-narrow grid cell. */
export function rowOverlaps(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const overlaps: string[] = [];
    for (const row of document.querySelectorAll(".sb-row__items")) {
      const items = [...row.children].filter((el) => getComputedStyle(el).position != "absolute");
      const boxes = items.map((el) => el.getBoundingClientRect());
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const [a, b] = [boxes[i], boxes[j]];
          const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (x > 0.5 && y > 0.5) overlaps.push(`${items[i].className} / ${items[j].className}: ${x.toFixed(1)}px`);
        }
      }
    }
    return overlaps;
  });
}
