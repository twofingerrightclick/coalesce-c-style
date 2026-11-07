import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, type Rule, type Root, type AtRule, type Document } from "postcss";
import { expect, test } from "vitest";
import { build } from "vite";
import { cStyle } from "../src/vite.mjs";

const normalize = (selector: string) => selector.replace(/\s*>\s*/g, ">").replace(/\s+/g, " ");

async function bundle(root: string, buttonOverlay: boolean) {
  const result = await build({
    root,
    configFile: false,
    logLevel: "silent",
    plugins: cStyle({ excludeStyles: { buttonOverlay }, vuetify: { autoImport: false } }),
    build: { write: false, minify: false, cssMinify: false },
  });
  if (Array.isArray(result) || !("output" in result)) throw new Error("Expected a single build");
  const css = result.output.filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => asset.type === "asset" ? String(asset.source) : "").join("\n");
  return { css, ast: parse(css) };
}

test("Vite removes replaced VBtn state opacities and preserves Canon, app, and other component styles", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "c-style-buttons-"));
  try {
    await writeFile(path.join(root, "index.html"), '<script type="module" src="/main.js"></script>');
    const overrides = fileURLToPath(new URL("../src/styles/overrides/_btn.scss", import.meta.url));
    await writeFile(path.join(root, "main.js"), `
      import { VBtn } from ${JSON.stringify(fileURLToPath(import.meta.resolve("vuetify/components/VBtn")))};
      import { VListItem } from ${JSON.stringify(fileURLToPath(import.meta.resolve("vuetify/components/VList")))};
      import ${JSON.stringify(overrides)};
      import './app.css';
      globalThis.components = [VBtn, VListItem];
    `);
    // Identical selector in app CSS must survive the dependency-only cleanup.
    await writeFile(path.join(root, "app.css"), '.v-btn:hover > .v-btn__overlay { opacity: .3 }');
    const baseline = await bundle(root, false);
    const trimmed = await bundle(root, true);

    const opacityRules = (ast: typeof trimmed.ast, layer: string | null, target: string) => {
      const matches: string[] = [];
      ast.walkRules((rule: Rule) => {
        if (!rule.selectors.some((selector) => normalize(selector).includes(target))) return;
        let parent: Rule | Root | AtRule | Document | undefined = rule.parent;
        while (parent?.parent && !(parent.type === "atrule" && parent.name === "layer")) parent = parent.parent;
        const inLayer = parent?.type === "atrule" && parent.name === "layer" ? parent.params : null;
        if (inLayer !== layer) return;
        rule.walkDecls("opacity", () => { matches.push(normalize(rule.selector)); });
      });
      return matches;
    };
    const before = opacityRules(baseline.ast, "vuetify-components", ".v-btn__overlay");
    const after = opacityRules(trimmed.ast, "vuetify-components", ".v-btn__overlay");
    expect(before.length).toBeGreaterThan(10);
    // Base opacity:0 remains; VBtn's own generated state overrides are gone.
    // VBtnToggle is a different Sass module and intentionally out of scope.
    expect(after.filter((selector) => !selector.startsWith(".v-btn-toggle"))).toEqual([".v-btn__overlay"]);
    expect(after.filter((selector) => selector.startsWith(".v-btn-toggle")))
      .toEqual(before.filter((selector) => selector.startsWith(".v-btn-toggle")));
    expect(opacityRules(trimmed.ast, null, ".v-btn:hover>.v-btn__overlay")).toHaveLength(1);
    expect(opacityRules(trimmed.ast, "vuetify-overrides", ".v-btn>.v-btn__overlay")).toHaveLength(1);
    expect(opacityRules(trimmed.ast, "vuetify-components", ".v-list-item__overlay"))
      .toEqual(opacityRules(baseline.ast, "vuetify-components", ".v-list-item__overlay"));
    expect(trimmed.css).toContain("--cs-btn-tint");
    expect(trimmed.css).toContain(".v-btn:focus-visible::after");
    expect(trimmed.css).toContain(".v-btn__underlay");
    expect(trimmed.css.length).toBeLessThan(baseline.css.length);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30_000);
