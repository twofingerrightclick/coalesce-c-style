import { h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import { csAliases } from "../src";

const render = (alias: keyof typeof csAliases) => renderToString(h(csAliases[alias] as Component));

// Decision 12b: Canon's box (18 of 20, radius 5, 1px line) with the mark in the surface colour.
test("checkbox and radio aliases draw Canon's choice glyphs", async () => {
  const off = await render("checkboxOff");
  expect(off).toContain('viewBox="0 0 20 20"');
  expect(off).toContain('width="17" height="17" rx="4.5" stroke="currentColor"');
  const on = await render("checkboxOn");
  expect(on).toContain('width="18" height="18" rx="5" fill="currentColor"');
  expect(on).toContain('d="m9 12 2 2 4-4"');
  expect(on).toContain('stroke="rgb(var(--v-theme-surface))"');
  expect(await render("checkboxIndeterminate")).toContain('d="M9 12h6"');
  expect(await render("radioOn")).toContain('r="2.5" fill="rgb(var(--v-theme-surface))"');
  for (const alias of ["checkboxOn", "checkboxOff", "checkboxIndeterminate", "radioOn", "radioOff"] as const) {
    expect(await render(alias)).not.toContain("lucide");
  }
});
