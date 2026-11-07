import { fileURLToPath } from "node:url";
import { compileString, Logger } from "sass";
import { expect, test } from "vitest";

const pkg = fileURLToPath(new URL("../", import.meta.url));
const compile = (scss: string) => compileString(scss, {
  loadPaths: [pkg, `${pkg}node_modules`],
  logger: Logger.silent,
}).css;

test("internal weight lookup reads the shared type roles and rejects unknown roles", () => {
  const css = compile(`@use 'sass:map'; @use 'src/styles/typography' as type;
    .label { font-weight: type.weight('label-large'); --role-weight: #{map.get(type.$typography, 'label-large', 'weight')}; }
    .body { font-weight: type.weight('body-medium'); }
    .title { font-weight: type.weight('title-small'); }`);
  expect(css).toContain("font-weight: 500;\n  --role-weight: 500;");
  expect(css).toContain(".body {\n  font-weight: 400;");
  expect(css).toContain(".title {\n  font-weight: 600;");
  expect(() => compile(`@use 'src/styles/typography' as type; .bad { font-weight: type.weight('missing'); }`))
    .toThrow('Unknown typography role "missing".');
});

test("token-derived snackbar settings retain application Sass overrides", () => {
  const css = compile(`@use 'src/styles/settings' as settings with ($snackbar-font-weight: 600, $snackbar-title-font-weight: 700);
    .message { font-weight: settings.$snackbar-font-weight; }
    .title { font-weight: settings.$snackbar-title-font-weight; }`);
  expect(css).toContain(".message {\n  font-weight: 600;");
  expect(css).toContain(".title {\n  font-weight: 700;");
});
