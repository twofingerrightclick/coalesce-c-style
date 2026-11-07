import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { build } from "vite";
import { cStyle, type CStyleOptions } from "../src/vite.mjs";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function bundle(excludeStyles?: CStyleOptions["excludeStyles"]) {
  const root = await mkdtemp(path.join(tmpdir(), "c-style-exclude-"));
  roots.push(root);
  const files: Record<string, string> = {
    "index.html": '<script type="module" src="/main.js"></script>',
    "main.js": `
      import '@fortawesome/fontawesome-free/css/all.css';
      import '@fontsource/roboto';
      import '@fontsource-variable/roboto/wght.css';
      import 'typeface-roboto';
      import 'roboto-fontface/css/roboto/roboto-fontface.css';
      import './app.css';
    `,
    "app.css": `
      @import '@fortawesome/fontawesome-free/css/solid.css';
      @import '@fontsource/roboto/400.css';
      @import '@fontsource/roboto-condensed/400.css';
      @import '@fontsource-variable/public-sans/wght.css';
      .app { color: green }
    `,
  };
  const packages: Record<string, string[]> = {
    "@fortawesome/fontawesome-free": ["css/all.css", "css/solid.css"],
    "@fontsource/roboto": ["index.css", "400.css"],
    "@fontsource-variable/roboto": ["wght.css"],
    "typeface-roboto": ["index.css"],
    "roboto-fontface": ["css/roboto/roboto-fontface.css"],
    "@fontsource/roboto-condensed": ["400.css"],
    "@fontsource-variable/public-sans": ["wght.css"],
  };
  for (const [name, styles] of Object.entries(packages)) {
    const dir = `node_modules/${name}`;
    files[`${dir}/package.json`] = JSON.stringify({ name, main: styles[0] });
    files[`${dir}/font.woff2`] = `font bytes for ${name}`;
    const marker = name.replace(/[^a-z-]/g, "");
    for (const style of styles) {
      const relativeFont = path.posix.relative(path.posix.dirname(style), "font.woff2");
      files[`${dir}/${style}`] = `
        @font-face { font-family: '${marker}'; src: url('./${relativeFont}') }
        .${marker} { font-family: '${marker}' }
      `;
    }
  }
  await Promise.all(Object.entries(files).map(async ([file, content]) => {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }));
  const result = await build({
    root,
    configFile: false,
    logLevel: "silent",
    plugins: cStyle({ excludeStyles, vuetify: { autoImport: false } }),
    build: { write: false, assetsInlineLimit: 0, minify: false },
  });
  if (Array.isArray(result) || !("output" in result)) throw new Error("Expected a single build");
  const css = result.output.filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => asset.type === "asset" ? String(asset.source) : "").join("\n");
  const fonts = result.output.filter((asset) => asset.fileName.endsWith(".woff2"));
  return { css, fonts };
}

test("production build excludes replaced CSS and fonts, including CSS @imports", async () => {
  const { css, fonts } = await bundle();
  expect(css).not.toContain("fortawesome");
  expect(css).not.toContain("fontsource-variableroboto'");
  expect(css).not.toContain("fontsourceroboto'");
  expect(css).not.toContain("typeface-roboto");
  expect(css).not.toContain("roboto-fontface");
  expect(css).toContain("roboto-condensed");
  expect(css).toContain("public-sans");
  expect(css).toContain(".app");
  expect(fonts).toHaveLength(2);
});

test("apps can keep Font Awesome without keeping Roboto", async () => {
  const { css, fonts } = await bundle({ fontAwesome: false });
  expect(css).toContain("fortawesome");
  expect(css).not.toContain("typeface-roboto");
  expect(fonts).toHaveLength(3);
});

test("apps can keep Roboto without keeping Font Awesome", async () => {
  const { css, fonts } = await bundle({ roboto: false });
  expect(css).not.toContain("fortawesome");
  expect(css).toContain("typeface-roboto");
  expect(css).toContain("roboto-fontface");
  expect(fonts).toHaveLength(6);
});
