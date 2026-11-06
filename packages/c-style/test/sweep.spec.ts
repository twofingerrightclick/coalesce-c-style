import { readFileSync, readdirSync } from "node:fs";
import { compile } from "sass";
import { modeLrgb, modeRgb, useMode, wcagContrast } from "culori/fn";
import { describe, expect, test } from "vitest";
import { cStyleThemes } from "../src";

// M17 sweep: generated brand ladders keep readable solids, and the CSS
// partials keep the plan §3d/§3e rules.

useMode(modeRgb);
useMode(modeLrgb);

const styles = new URL("../src/styles/", import.meta.url);

/** Storybook's accent presets (storybook/src/globals.ts). */
const presets = { canon: "#2563eb", violet: "#7c3aed", emerald: "#059669", rose: "#e11d48", orange: "#ea580c" };

// White on a pinned 600 step is what Canon does; emerald-600 (3.8) and
// orange-600 (3.6) fall short of 4.5 exactly as Tailwind's own do (Canon's
// success green-600 is 3.3). They clear 3:1 (large text, UI); an app that
// needs AA body text on them passes a darker hex or a full ladder.
const below45 = new Set(["emerald", "orange"]);

describe("brand presets: text on the accent solid", () => {
  test.each(Object.entries(presets))("%s", (name, hex) => {
    for (const theme of Object.values(cStyleThemes({ primary: hex }))) {
      const c = theme.colors!;
      const ratio = wcagContrast(c.primary as string, c["on-primary"] as string);
      expect(ratio).toBeGreaterThanOrEqual(below45.has(name) ? 3 : 4.5);
    }
  });
});

/** Every .scss file under `dir`, with comments stripped. */
function sources(dir: string) {
  const url = new URL(dir, styles);
  return readdirSync(url)
    .filter((f) => f.endsWith(".scss"))
    .map((f) => ({
      file: `${dir}${f}`,
      text: readFileSync(new URL(f, url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, ""),
    }));
}

/** `css` with every `@layer … { … }` block removed. */
function withoutLayers(css: string) {
  let out = "";
  for (let i = 0; i < css.length; ) {
    const at = css.indexOf("@layer", i);
    if (at < 0) return out + css.slice(i);
    out += css.slice(i, at);
    let depth = 0;
    let j = css.indexOf("{", at);
    for (; j < css.length; j++) {
      if (css[j] == "{") depth++;
      else if (css[j] == "}" && --depth == 0) break;
    }
    i = j + 1;
  }
  return out;
}

describe("lint (plan §3d/§3e)", () => {
  test("overrides/ has no hex literals and no !important", () => {
    for (const { file, text } of sources("overrides/")) {
      expect(text.match(/#[0-9a-fA-F]{3,8}\b/g), file).toBeNull();
      expect(text.includes("!important"), file).toBe(false);
    }
  });

  test("coalesce/ selectors all start with a .c- class", () => {
    // The tone mixin's module brings its own layered rules along; only the
    // unlayered rules are Coalesce's.
    const css = withoutLayers(compile(new URL("coalesce/_index.scss", styles).pathname).css);
    const selectors = [...css.matchAll(/^([^@{}\n][^{}]*)\{/gm)]
      .flatMap((m) => m[1].split(/,(?![^(]*\))/))
      .map((s) => s.trim())
      .filter(Boolean);
    expect(selectors.length).toBeGreaterThan(10);
    const bad = selectors.filter((s) => !/^(\.c-|:is\(\.c-)/.test(s));
    expect(bad).toEqual([]);
  });
});
