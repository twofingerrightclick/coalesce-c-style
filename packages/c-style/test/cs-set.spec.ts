import { h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, test } from "vitest";
import { cs, csAliases, csIcon } from "../src";
import { parseFaString } from "../src/icons/cs-set";
import { Save } from "@lucide/vue";

const render = (icon: string) =>
  renderToString(h(cs.component, { icon, tag: "i", class: "v-icon" }));

describe("cs icon set", () => {
  test("renders mapped FontAwesome strings as Lucide and keeps non-FA classes", async () => {
    const html = await render("fa fa-clock cursor-pointer");
    expect(html).toMatch(/^<i class="cursor-pointer v-icon"><svg/);
    expect(html).toContain("lucide-clock");
  });

  test("ignores FontAwesome modifiers such as fa-fw", () => {
    expect(parseFaString("fa fa-fw fa-search")?.classes).toEqual([]);
  });

  test("renders unknown strings as class icons", async () => {
    expect(await render("fa fa-rocket")).toBe('<i class="fa fa-rocket v-icon"></i>');
    expect(await render("mdi-home")).toBe('<i class="mdi-home v-icon"></i>');
  });
});

describe("csIcon", () => {
  test("draws a 1.5px non-scaling stroke in a 1em box", async () => {
    const html = await renderToString(h(csIcon(Save)));
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('vector-effect="non-scaling-stroke"');
    expect(html).toContain('width="1em"');
  });

  test("returns the same wrapper for the same icon", () => {
    expect(csIcon(Save)).toBe(csIcon(Save));
  });

  test("fills rating stars", async () => {
    expect(await renderToString(h(csAliases.ratingFull as never))).toContain(
      'fill="currentColor"',
    );
  });
});
