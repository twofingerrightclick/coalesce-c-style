import { mkdtemp, writeFile, rm, mkdir, cp, readFile, readdir, symlink, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { beforeAll, afterAll, expect, test } from "vitest";
import { build, createServer } from "vite";
import { cStyle, type CStyleOptions } from "../src/vite.mjs";

let root: string;
let plugin: typeof cStyle;
beforeAll(async () => {
  const pkg = fileURLToPath(new URL("../", import.meta.url));
  await promisify(execFile)(path.join(pkg, "node_modules/.bin/tsdown"), [], { cwd: pkg });
  await promisify(execFile)(process.execPath, ["scripts/copy-assets.mjs"], { cwd: pkg });
  root = await realpath(await mkdtemp(path.join(tmpdir(), "c-style-font-")));
  const installed = path.join(root, "node_modules/coalesce-c-style");
  await mkdir(installed, { recursive: true });
  await cp(path.join(pkg, "dist"), path.join(installed, "dist"), { recursive: true });
  const manifest = JSON.parse(await readFile(path.join(pkg, "package.json"), "utf8"));
  await writeFile(path.join(installed, "package.json"), JSON.stringify({ ...manifest, exports: manifest.publishConfig.exports }));
  // A real installed package, not a workspace link: exercise published paths and optimization.
  for (const name of await readdir(path.join(pkg, "node_modules"))) {
    if (name === "coalesce-c-style" || name.startsWith(".")) continue;
    await symlink(path.join(pkg, "node_modules", name), path.join(root, "node_modules", name));
  }
  plugin = (await import(path.join(installed, "dist/vite.mjs"))).cStyle;
}, 30000);
afterAll(async () => { if (root) await rm(root, { recursive: true, force: true }); });

const runtime = `
  import { cStyleThemes, applyCStyleFont } from 'coalesce-c-style';
  const themes = cStyleThemes();
  const theme = { themes: { value: themes } };
  const initial = structuredClone(themes);
  applyCStyleFont(theme, "Inter");
  const switched = structuredClone(themes);
  // Reset also replaces an explicit initial font override with the build default.
  const overridden = { themes: { value: cStyleThemes(undefined, "Other") } };
  applyCStyleFont(overridden);
  applyCStyleFont(theme);
  globalThis.fontTest = [initial.light.variables, switched.light.variables, themes.light.variables, themes.dark.variables, overridden.themes.value.light.variables];
`;
async function bundle(font?: CStyleOptions["font"], extraImports = "") {
  await writeFile(path.join(root, "main.js"), `
    import 'coalesce-c-style/styles';
    ${extraImports}
    ${runtime}
  `);
  const result = await build({
    root, configFile: false, logLevel: "silent",
    plugins: plugin({ font, vuetify: { autoImport: false } }),
    build: {
      write: false, assetsInlineLimit: 0, minify: false,
      rollupOptions: { input: path.join(root, "main.js") },
    },
  });
  if (Array.isArray(result) || !("output" in result)) throw new Error("Expected a single build");
  const css = result.output.filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
    .map((item) => item.type === "asset" ? String(item.source) : "").join("\n");
  const js = result.output.filter((item) => item.type === "chunk").map((item) => item.code).join("\n");
  const { variables, inlineCss } = new Function("globalThis", `${js}; return { variables: globalThis.fontTest, inlineCss: globalThis.inlineFontCss };`)({});
  return { css, variables, inlineCss, fonts: result.output.filter((item) => item.fileName.endsWith(".woff2")) };
}

test("default build includes Public Sans and matching theme tokens", async () => {
  const { css, variables, fonts } = await bundle();
  expect(css).toContain("Public Sans Variable");
  expect(fonts.length).toBeGreaterThan(0);
  expect(variables[0]["font-body"]).toContain('"Public Sans Variable"');
  expect(variables[0]["font-tracking"]).toBe(0.5);
});

test("custom build omits Public Sans CSS and assets and sets a single font for both roles", async () => {
  const { css, variables, fonts } = await bundle("IBM Plex Sans");
  expect(css).not.toContain("Public Sans");
  expect(css).toContain("@layer vuetify-core");
  expect(fonts).toHaveLength(0);
  expect(css).toContain("--cs-font-body: var(--v-font-body)");
  expect(css).toContain("--cs-font-heading: var(--v-font-heading)");
  expect(variables[0]).toMatchObject({
    "font-body": '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    "font-heading": '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    "font-features": "normal", "font-tracking": 0,
  });
  expect(variables[1]["font-body"]).toContain("InterVariable");
  expect(variables[2]).toEqual(variables[0]);
  expect(variables[4]).toEqual(variables[0]);
  for (const key of ["font-body", "font-heading", "font-features", "font-tracking"]) {
    expect(variables[3][key]).toEqual(variables[0][key]);
  }
});

test("build preserves custom font features and tracking", async () => {
  const { variables, fonts } = await bundle({ family: "Geist", features: '"ss01"', tracking: 0.75 });
  expect(fonts).toHaveLength(0);
  expect(variables[0]).toMatchObject({ "font-features": '"ss01"', "font-tracking": 0.75 });
});

test("rejects an empty custom family", () => {
  expect(() => cStyle({ font: "  " })).toThrow("non-empty family");
});

test("explicit Public Sans package import survives a custom default", async () => {
  const { css, fonts, variables } = await bundle("Geist", 'import "coalesce-c-style/fonts/public-sans";');
  expect(css).toContain("Public Sans Variable");
  expect(fonts.length).toBeGreaterThan(0);
  expect(variables[0]["font-body"]).toMatch(/^Geist,/);
});

test("direct Fontsource and Inter imports survive a custom default", async () => {
  const { css, fonts } = await bundle("Geist", `
    import "@fontsource-variable/public-sans/wght.css";
    import "coalesce-c-style/fonts/inter";
  `);
  expect(css).toContain("Public Sans Variable");
  expect(css).toContain("InterVariable");
  expect(fonts.length).toBeGreaterThan(0);
});

test("explicit Public Sans selection keeps its assets and token defaults", async () => {
  const { fonts, variables } = await bundle('  "public sans variable"  ');
  expect(fonts.length).toBeGreaterThan(0);
  expect(variables[0]["font-body"]).toContain('"Public Sans Variable"');
  expect(variables[0]["font-tracking"]).toBe(0.5);
});

test("installed package receives the configured font in SSR dev and build", async () => {
  await writeFile(path.join(root, "server.js"), `
    import { cStyleThemes } from 'coalesce-c-style';
    export const variables = cStyleThemes().light.variables;
  `);
  const server = await createServer({
    root, configFile: false, logLevel: "silent",
    plugins: plugin({ font: "Geist", vuetify: { autoImport: false } }),
    ssr: { noExternal: ["vuetify"] },
    server: { middlewareMode: true },
  });
  try {
    const { variables } = await server.ssrLoadModule("/server.js");
    expect(variables["font-body"]).toMatch(/^Geist,/);
    const transformed = await server.transformRequest("/main.js");
    expect(transformed?.code).toBeTruthy();
  } finally { await server.close(); }
  const result = await build({
    root, configFile: false, logLevel: "silent",
    plugins: plugin({ font: "Geist", vuetify: { autoImport: false } }),
    ssr: { noExternal: ["vuetify"] },
    build: { ssr: path.join(root, "server.js"), write: false, minify: false },
  });
  if (Array.isArray(result) || !("output" in result)) throw new Error("Expected a single build");
  const entry = result.output.find((item) => item.type === "chunk" && item.isEntry);
  expect(entry?.type === "chunk" && entry.code).toContain("Geist");
  expect(entry?.type === "chunk" && entry.code).not.toContain("__COALESCE_C_STYLE_FONT__");
});


test("inline stylesheet imports omit default font assets and retain runtime styles", async () => {
  const { inlineCss, fonts } = await bundle("Geist", `
    import css from "coalesce-c-style/styles?inline";
    globalThis.inlineFontCss = css;
  `);
  expect(fonts).toHaveLength(0);
  expect(inlineCss).not.toContain("Public Sans");
  expect(inlineCss).toContain("--cs-font-body: var(--v-font-body)");
  expect(inlineCss).toContain("@layer vuetify-core");
});
