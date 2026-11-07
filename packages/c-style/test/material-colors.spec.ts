import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileString, Logger } from "sass";
import { parse } from "postcss";
import { createVuetify } from "vuetify";
import { VApp, VColorPicker, VFileUploadList, VList, VListItem, VNavigationDrawer, VSheet } from "vuetify/components";
import { VVideoControls } from "vuetify/labs/VVideo";
import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import { cStyleBlueprint } from "../src/blueprint";

const pkg = fileURLToPath(new URL("../", import.meta.url));
const paletteClass = /\.(?:bg|text)-(?:red|pink|purple|deep-purple|indigo|blue|light-blue|cyan|teal|green|light-green|lime|yellow|amber|orange|deep-orange|brown|blue-grey|grey|white|black|transparent)(?:[-\w]*)\b/g;

function globals(colorPack?: boolean) {
  return compileString(`
    @use 'src/styles/settings' ${colorPack === undefined ? "" : `with ($color-pack: ${colorPack})`};
    @use 'vuetify/lib/styles/main.sass';
  `, { loadPaths: [pkg, path.join(pkg, "node_modules")], logger: Logger.silent }).css;
}

test("default global CSS omits the Material palette and retains layout and Canon type utilities", () => {
  const selectors: string[] = [];
  parse(globals()).walkRules((rule) => { selectors.push(...rule.selectors); });
  expect(selectors.join("\n").match(paletteClass)).toBeNull();
  expect(selectors).toContain(".pa-4");
  expect(selectors).toContain(".d-flex");
  expect(selectors).toContain(".text-body-medium");
});

test("theme-generated semantic helpers remain available in light and dark themes", () => {
  const { theme } = createVuetify({ blueprint: cStyleBlueprint() });
  for (const scheme of ["light", "dark"]) {
    theme.change(scheme);
    const css = theme.styles.value;
    const selectors = new Set<string>();
    parse(css).walkRules((rule) => { rule.selectors.forEach((selector) => selectors.add(selector)); });
    for (const role of ["primary", "secondary", "neutral", "success", "warning", "error", "info", "surface"]) {
      expect(selectors.has(`.text-${role}`), role).toBe(true);
      expect(selectors.has(`.bg-${role}`), role).toBe(true);
    }
    expect(selectors.has(".on-surface")).toBe(true);
    expect(css.match(paletteClass)).toBeNull();
  }
});

test("an app can explicitly restore the Material palette through Sass settings", () => {
  const css = globals(true);
  expect(css).toContain(".text-red");
  expect(css).toContain(".bg-blue-lighten-2");
  expect(css).toContain(".text-grey");
  expect(css).toContain(".text-white");
});

test("Coalesce's remaining literal color helper is covered by local semantic compatibility rules", () => {
  const dist = path.dirname(fileURLToPath(import.meta.resolve("coalesce-vue-vuetify3")));
  const helpers = new Set<string>();
  for (const file of readdirSync(dist, { recursive: true, encoding: "utf8" })) {
    if (!file.endsWith(".js")) continue;
    const source = readFileSync(path.join(dist, file), "utf8");
    for (const match of source.matchAll(new RegExp(paletteClass.source.replace(/^\\\./, "\\b"), "g"))) helpers.add(match[0]);
  }
  // A new dependency use needs an explicit semantic mapping on upgrade.
  expect([...helpers]).toEqual(["text-grey"]);
  const compatibility = compileString("@use 'src/styles/coalesce/colors';", { loadPaths: [pkg] }).css;
  expect(compatibility).toContain(".c-admin-audit-log-page .text-grey");
  expect(compatibility).toContain(".c-select__menu-content .text-grey");
  expect(compatibility).toContain("color: var(--cs-muted)");
  expect(compatibility).not.toMatch(/^\.text-grey\s*\{/m);
});

test("small semantic utilities preserve upstream primitives without restoring the palette", () => {
  const css = compileString("@use 'src/styles/utilities';", { loadPaths: [pkg] }).css;
  const rules = new Map<string, Record<string, string>>();
  parse(css).walkRules((rule) => {
    const declarations: Record<string, string> = {};
    rule.walkDecls((decl) => { declarations[decl.prop] = decl.value; });
    rule.selectors.forEach((selector) => rules.set(selector, declarations));
  });
  expect(rules.get(".text-muted")).toEqual({ color: "var(--cs-muted)" });
  expect(rules.get(".bg-transparent")).toEqual({ "background-color": "transparent" });
  expect(rules.get(".v-color-picker-swatches__color .v-icon.text-white")?.color).toBe("white");
  expect(rules.get(".v-color-picker-swatches__color .v-icon.text-black")?.color).toBe("black");
  expect(rules.get(".v-color-picker-preview .v-slider-track__fill.bg-white")?.["background-color"]).toBe("white");
  expect(rules.get(".v-video-controls .v-media-progress-bar__background.text-white")?.color).toBe("white");
  for (const selector of [".text-grey", ".text-white", ".text-black", ".bg-white", ".text-red"]) {
    expect(rules.has(selector), selector).toBe(false);
  }
});

async function render(component: Component, props = {}, content?: () => ReturnType<typeof h>) {
  const app = createSSRApp({ render: () => h(VApp, {}, () => h(component, props, content)) });
  app.use(createVuetify({ blueprint: cStyleBlueprint() }));
  return renderToString(app);
}

test("rendered color-picker checkmarks and preview tracks have scoped compatibility hooks", async () => {
  for (const [modelValue, foreground] of [["#000000", "white"], ["#ffffff", "black"]]) {
    const html = await render(VColorPicker, { modelValue, showSwatches: true, swatches: [["#000000", "#ffffff"]] });
    expect(html).toContain("v-color-picker-swatches__color");
    expect(html).toContain(`text-${foreground}`);
    expect(html).toContain("v-color-picker-preview");
    expect(html).toMatch(/class="[^"]*v-slider-track__fill[^\"]*bg-white/);
  }
});

test("rendered drawer, upload list, and media surface retain the no-fill helper", async () => {
  const drawer = await render(VNavigationDrawer, { modelValue: true }, () => h(VList, {}, () => h(VListItem, { title: "Item" })));
  expect(drawer).toMatch(/class="[^"]*v-list [^"]*bg-transparent/);
  const uploads = await render(VFileUploadList, { files: [new File(["example"], "example.txt")] });
  expect(uploads).toMatch(/class="[^"]*v-list [^"]*bg-transparent/);
  const media = await render(VSheet, { theme: "dark", color: "transparent", class: "on-surface" });
  expect(media).toContain("v-theme--dark");
  expect(media).toContain("bg-transparent");
});

test("rendered stacked video controls place their fixed-contrast hook on the progress background", async () => {
  const html = await render(VVideoControls, { variant: "tube" });
  expect(html).toContain("v-video-controls");
  expect(html).toMatch(/class="[^"]*v-media-progress-bar__background[^"]*text-white/);
});
