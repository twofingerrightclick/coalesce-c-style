import type { Locator, Page } from "@playwright/test";

// Computed-style helpers for the app specs (the Storybook parity harness is lib/measure.ts).

/**
 * Computed colours as `#rrggbb` (opaque) or `rgba(r, g, b, a)`, whatever
 * syntax Chrome serialised them in (`rgb()`, `color(srgb …)`).
 */
export async function normalizeColors<T extends Record<string, string>>(page: Page, colors: T): Promise<T> {
  return page.evaluate((colors) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    return Object.fromEntries(
      Object.entries(colors).map(([k, v]) => {
        // Canvas keeps `color(srgb r g b / a)` as written; spell it as rgba().
        const srgb = v.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
        if (srgb) {
          const [r, g, b] = srgb.slice(1, 4).map((c) => Math.round(Number(c) * 255));
          v = `rgba(${r}, ${g}, ${b}, ${srgb[4] ?? 1})`;
        }
        ctx.fillStyle = "#000";
        ctx.fillStyle = v;
        return [k, ctx.fillStyle];
      }),
    );
  }, colors) as Promise<T>;
}

/** Fill, label, border and underlay of a `.v-btn`, colours normalised. */
export async function buttonColors(button: Locator) {
  const raw = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    const u = getComputedStyle(el.querySelector(".v-btn__underlay")!);
    return {
      bg: s.backgroundColor,
      fg: s.color,
      border: s.borderTopColor,
      underlay: u.backgroundColor,
      underlayOpacity: u.opacity,
      shadow: s.boxShadow,
    };
  });
  const { underlayOpacity, shadow, ...colors } = raw;
  return { ...(await normalizeColors(button.page(), colors)), underlayOpacity: Number(underlayOpacity), shadow };
}

/** Distance from the element's outer left edge to the first text it contains. */
export function textOffset(el: Locator) {
  return el.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const text = walker.nextNode()!;
    const range = document.createRange();
    range.selectNodeContents(text);
    return range.getBoundingClientRect().left - node.getBoundingClientRect().left;
  });
}
