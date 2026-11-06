import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile, compileString } from "sass";
import { describe, expect, test } from "vitest";
import { cStyleIntents, cStyleThemes, cStyleTokens, csVar } from "../src";

// The public styling contract: the `--cs-*` tokens (src/styles/_tokens.scss,
// src/tokens.ts) and the `c-style/tokens` SCSS module (src/tokens.scss).

const pkg = fileURLToPath(new URL("../", import.meta.url));
const stylesCss = compile(`${pkg}src/styles/index.scss`).css;

/** Compiles `scss` as an app stylesheet that `@use`s the public module as `cs`. */
function consumer(scss: string) {
  return compileString(`@use 'sass:list';\n@use 'src/tokens' as cs;\n${scss}`, {
    loadPaths: [pkg],
    url: new URL("file:///app/component.scss"),
  }).css;
}

/** `--cs-<name>` declarations in `css`, by name. */
function declared(css: string) {
  return new Map([...css.matchAll(/--cs-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
}

/**
 * Class-level specificity of a compound selector with no ids or types:
 * `:where()` counts 0, `:is()` / `:not()` their largest argument.
 */
function specificity(selector: string): number {
  let count = 0;
  for (let i = 0; i < selector.length; ) {
    const fn = /^:(where|is|not)\(/.exec(selector.slice(i));
    if (fn) {
      let depth = 1;
      let j = i + fn[0].length;
      for (; depth > 0; j++) depth += selector[j] === "(" ? 1 : selector[j] === ")" ? -1 : 0;
      if (fn[1] !== "where") {
        const args: string[] = [];
        let start = i + fn[0].length;
        for (let k = start, d = 0; k < j - 1; k++) {
          d += selector[k] === "(" ? 1 : selector[k] === ")" ? -1 : 0;
          if (selector[k] === "," && d === 0) args.push(selector.slice(start, k)), (start = k + 1);
        }
        args.push(selector.slice(start, j - 1));
        count += Math.max(...args.map((a) => specificity(a.trim())));
      }
      i = j;
    } else {
      const simple = /^(\.[\w-]+|\[[^\]]+\]|:{1,2}[\w-]+)/.exec(selector.slice(i));
      if (simple && !simple[0].startsWith("::")) count++;
      i += simple ? simple[0].length : 1;
    }
  }
  return count;
}

const emphases = ["high", "medium", "low", "minimal"];
const surfaces = ["resting", "raised", "floating", "overlay"];
const roles = [
  "display-large", "display-medium", "display-small", "headline-large", "headline-medium", "headline-small",
  "title-large", "title-medium", "title-small", "body-large", "body-medium", "body-small", "label-large",
  "label-medium", "label-small",
];

describe("token list", () => {
  test("the SCSS module's $tokens is cStyleTokens", () => {
    const css = consumer(`:root { --names: "#{cs.$tokens}"; }`);
    const names = css.match(/--names: "([^"]+)"/)![1].split(", ");
    expect(names).toEqual([...cStyleTokens]);
  });

  // The size of the stability promise: changing it is a contract change.
  test("the contract has 125 tokens", () => {
    expect(cStyleTokens).toHaveLength(125);
  });

  test("names are unique and prefix-free", () => {
    expect(new Set(cStyleTokens).size).toBe(cStyleTokens.length);
    for (const name of cStyleTokens) expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  test("csVar", () => {
    expect(csVar("muted")).toBe("var(--cs-muted)");
    expect(csVar("primary-tint-2", "transparent")).toBe("var(--cs-primary-tint-2, transparent)");
  });
});

describe("c-style/styles declares every token", () => {
  const tokens = declared(stylesCss);

  test("every public token has a declaration", () => {
    const missing = cStyleTokens.filter((name) => !tokens.has(name));
    expect(missing).toEqual([]);
  });

  // The aliases resolve on the elements Vuetify writes its theme variables
  // to, so a `.v-theme--*` subtree re-resolves them.
  // Layered, so an app's unlayered `:root` override wins in any import order.
  test("every declaration sits in vuetify-overrides", () => {
    const css = compile(`${pkg}src/styles/_tokens.scss`).css.trim();
    expect(css.startsWith("@layer vuetify-overrides {")).toBe(true);
    expect(css.indexOf("}\n@")).toBe(-1);
    expect(css.endsWith("}\n}")).toBe(true);
  });

  test("theme-backed tokens are declared on :root and .v-theme--* elements", () => {
    const block = stylesCss.match(/:root,\s*\[class\*="?v-theme--"?\]\s*\{([^}]+)\}/);
    expect(block).not.toBeNull();
    const scoped = declared(block![1]);
    for (const name of cStyleTokens) {
      if (/^(control-(height|pad|font|lh|gap)$|gap-|icon$|radius$|surface-radius$|hairline$|duration-|press-scale$)/.test(name)) continue;
      expect(scoped.has(name), name).toBe(true);
    }
  });

  test("every theme variable a token reads exists in both themes, whatever the accent", () => {
    const referenced = new Set(
      [...tokens.entries()]
        .filter(([name]) => cStyleTokens.includes(name as (typeof cStyleTokens)[number]))
        .flatMap(([, value]) => [...value.matchAll(/var\(--v-([\w-]+)/g)].map((m) => m[1])),
    );
    expect(referenced.size).toBeGreaterThan(40);
    for (const colors of [undefined, { primary: "#7c3aed", neutral: "slate" }]) {
      for (const theme of Object.values(cStyleThemes(colors))) {
        const keys = new Set([
          ...Object.keys(theme.colors!).map((k) => `theme-${k}`),
          ...Object.keys(theme.variables!),
        ]);
        for (const name of referenced) expect(keys.has(name), name).toBe(true);
      }
    }
  });

  test("colour tokens are complete colours, not channel lists", () => {
    for (const name of cStyleTokens) {
      if (!/^(canvas|surface|surface-bright|on-surface|muted|quiet|fill|fill-hover|fill-strong|frame|frame-hover|rule|rule-faint|link|disabled-bg|disabled-fg|scrim|focus|\w+-(solid|on-solid|solid-hover|solid-active|text|tint-\d|line|line-hover|halo|border-low))$/.test(name)) continue;
      expect(tokens.get(name), name).toMatch(/^rgba?\(/);
    }
  });

  test("per-intent tokens cover every intent", () => {
    for (const intent of cStyleIntents) {
      expect(tokens.get(`${intent}-solid`)).toBe(`rgb(var(--v-theme-${intent}))`);
      expect(tokens.get(`${intent}-tint-2`)).toBe(`rgba(var(--v-${intent}-tint), var(--v-tint-2))`);
    }
  });
});

describe("c-style/tokens module", () => {
  test("@use emits no CSS", () => {
    expect(consumer("").trim()).toBe("");
  });

  test("every mixin and function compiles for every argument", () => {
    const css = consumer(`
      ${surfaces.map((s) => `.s-${s} { @include cs.surface(${s}); }`).join("\n")}
      ${cStyleIntents.flatMap((i) => emphases.map((e) => `.i-${i}-${e} { @include cs.interactive(${i}, ${e}); }`)).join("\n")}
      ${cStyleIntents.map((i) => `.t-${i} { @include cs.tone(${i}, low); @include cs.focus-halo(${i}); }`).join("\n")}
      ${["sm", "md", "lg"].map((s) => `.c-${s} { @include cs.control-box(${s}); }`).join("\n")}
      ${roles.map((r) => `.r-${r} { @include cs.type(${r}); }`).join("\n")}
      ${["all", "top", "bottom", "inline-start", "block"].map((s) => `.h-${s} { @include cs.hairline(${s}); }`).join("\n")}
      .f:focus-visible { @include cs.focus-ring; }
      .v { color: cs.token(muted); background: cs.token(primary-tint-2); }
    `);
    expect(css).toContain(".s-raised {");
    expect(css).toContain("box-shadow: var(--cs-shadow-edge), var(--cs-shadow-raised)");
    expect(css).toContain("@media (hover: hover) {\n  .i-primary-high:hover {");
    expect(css).toContain(".i-primary-high:focus-visible {");
    expect(css).toContain("min-height: 48px");
    expect(css).toContain("font-family: var(--cs-font-heading)");
    expect(css).toContain("border-inline-start: var(--cs-hairline) solid var(--cs-rule)");
    expect(css).toContain("color: var(--cs-muted)");
  });

  // The module may be compiled by any app, so it can only read names this
  // package promises to keep: the public tokens and the recipe's own
  // element-local `--_cs-*` slots.
  test("emits no custom property outside the contract", () => {
    const css = consumer(`
      ${cStyleIntents.flatMap((i) => emphases.map((e) => `.i-${i}-${e} { @include cs.interactive(${i}, ${e}); }`)).join("\n")}
      ${surfaces.map((s) => `.s-${s} { @include cs.surface(${s}); }`).join("\n")}
      ${roles.map((r) => `.r-${r} { @include cs.type(${r}); }`).join("\n")}
      .c { @include cs.control-box(lg); @include cs.hairline; @include cs.focus-ring; @include cs.focus-halo(error); }
    `);
    const names = new Set([...css.matchAll(/--([\w-]+)/g)].map((m) => m[1]));
    const outside = [...names].filter(
      (n) => !n.startsWith("_cs-") && !(n.startsWith("cs-") && cStyleTokens.includes(n.slice(3) as never)),
    );
    expect(outside).toEqual([]);
  });

  test("source references no theme variable, internal token, hex or !important", () => {
    const source = readFileSync(`${pkg}src/tokens.scss`, "utf8").replace(/^\s*\/\/.*$/gm, "");
    expect(source).not.toMatch(/--v-/);
    expect(source).not.toMatch(/--cs-(tone|btn)-/);
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toContain("!important");
  });

  // State rules stay at one class plus one state, so an app's own
  // `.chip:hover`-style override wins by source order, and disabled (last)
  // wins over pressed.
  test("interactive's state selectors stay at (0,2,0)", () => {
    const css = consumer(`.i { @include cs.interactive(primary, low); }`);
    const selectors = [...css.matchAll(/^\s*(\.i[^{]*)\{/gm)].map((m) => m[1].trim());
    expect(selectors.length).toBeGreaterThan(5);
    for (const selector of selectors) expect(specificity(selector), selector).toBeLessThanOrEqual(2);
    expect(specificity(".a:is(.b, [c]:not([d]))")).toBe(3);
  });

  test("interactive keeps the focus ring on a focused aria-disabled element", () => {
    const css = consumer(`.i { @include cs.interactive(primary, low); }`);
    expect(css).toContain(".i:is(:disabled, [aria-disabled=true]:not(:where([aria-busy=true]))):not(:where(:focus-visible)) {\n  box-shadow: none;");
  });

  test("the type mixin emits Canon's ramp", () => {
    const css = consumer(`.a { @include cs.type(label-large); } .b { @include cs.type(headline-medium); } .c { @include cs.type(label-small); }`);
    expect(css).toContain(".a {\n  font-family: var(--cs-font-body);\n  font-size: 14px;\n  line-height: 20px;\n  font-weight: 500;\n  letter-spacing: calc(-0.006em * var(--cs-font-tracking));");
    expect(css).toContain(".b {\n  font-family: var(--cs-font-heading);\n  font-size: 24px;\n  line-height: 32px;\n  font-weight: 600;\n  letter-spacing: calc(-0.015em * var(--cs-font-tracking));");
    expect(css).toContain("letter-spacing: 0.01em");
    // Vuetify's `.text-title-medium` / `-small` use the body family.
    expect(consumer(`.d { @include cs.type(title-medium); }`)).toContain("font-family: var(--cs-font-body)");
    expect(consumer(`.d { @include cs.type(title-large); }`)).toContain("font-family: var(--cs-font-heading)");
  });

  test.each([
    ["token", `.a { color: cs.token(bogus); }`, "not a c-style token"],
    ["surface", `.a { @include cs.surface(sunken); }`, "Unknown surface level"],
    ["interactive intent", `.a { @include cs.interactive(brand); }`, "Unknown intent"],
    ["interactive emphasis", `.a { @include cs.interactive(primary, loud); }`, "Unknown emphasis"],
    ["control-box", `.a { @include cs.control-box(xl); }`, "Unknown control size"],
    ["type", `.a { @include cs.type(huge); }`, "Unknown type role"],
    ["hairline", `.a { @include cs.hairline(botom); }`, "Unknown side"],
  ])("%s rejects an unknown argument", (_, scss, message) => {
    expect(() => consumer(scss)).toThrow(message);
  });
});
