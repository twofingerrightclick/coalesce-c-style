import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchForWorkspaceRoot } from "vite";
import vuetify from "vite-plugin-vuetify";
import { parse } from "postcss";
import { layerOrderCss } from "./layer-order.mjs";

export { layerOrderCss, layerOrderStyle } from "./layer-order.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

// The font CSS c-style imports (Public Sans by default, `coalesce-c-style/fonts/inter`
// on request) makes the browser fetch woff2 files from wherever those packages
// are installed, often pnpm's global store.
const require = createRequire(import.meta.url);
const fontRoots = [
  path.dirname(require.resolve("@fontsource-variable/public-sans/wght.css")),
  path.dirname(require.resolve("inter-ui/package.json")),
];

export const settingsFile = fileURLToPath(new URL("./styles/settings.scss", import.meta.url));

export function cStyle({ settings, vuetify: vuetifyOptions, excludeStyles = {} } = {}) {
  return [
    ...vuetify({
      autoImport: true,
      ...vuetifyOptions,
      styles: { configFile: settings ?? settingsFile },
    }),
    cStyleExcludeStyles(excludeStyles),
    ...(excludeStyles.buttonOverlay === false ? [] : [cStyleButtonOverlay()]),
    cStyleHtml(),
    cStyleServe(),
  ];
}

// Normal Vite plugins see compiled CSS after vite:css and before vite:css-post.
// Limit this to Vuetify's own VBtn module. App CSS and c-style's replacement
// states must stay intact, as must the overlay's base opacity and geometry.
function cStyleButtonOverlay() {
  const states = [":hover", ":focus-visible", ":focus"];
  const selectors = new Set(states.map((state) => `.v-btn${state}>.v-btn__overlay`));
  for (const active of [".v-btn--active", ".v-btn[aria-haspopup=menu][aria-expanded=true]"]) {
    for (const state of ["", ...states]) selectors.add(`${active}${state}>.v-btn__overlay`);
  }
  for (const variant of ["elevated", "flat"]) {
    selectors.add(`.v-btn--disabled.v-btn--variant-${variant} .v-btn__overlay`);
  }
  selectors.add(".v-pagination .v-pagination__item--is-active .v-btn__overlay");
  const normalize = (selector) => selector.trim()
    .replace(/(["'])(menu|true)\1/g, "$2")
    .replace(/\s+/g, " ")
    .replace(/\s*>\s*/g, ">");
  return {
    name: "c-style:button-overlay",
    transform(code, id) {
      if (!/^virtual:plugin-vuetify:components\/VBtn\/VBtn\.s[ac]ss(?:\?|$)/.test(id)) return;
      // These requests contain an asset/string JS wrapper rather than CSS.
      if (/[?&](?:url|raw)(?:&|$)/.test(id)) return;
      const root = parse(code, { from: id });
      let changed = false;
      root.walkRules((rule) => {
        if (!rule.selectors.every((selector) => selectors.has(normalize(selector)))) return;
        rule.walkDecls("opacity", (decl) => {
          if (decl.important) return;
          decl.remove();
          changed = true;
        });
        if (!rule.nodes.length) rule.remove();
      });
      if (!changed) return;
      // Drop conditional wrappers made empty by the removed rules.
      root.walkAtRules((rule) => {
        if (rule.nodes?.length === 0) rule.remove();
      });
      const result = root.toResult({ map: { inline: false, annotation: false, sourcesContent: true } });
      return { code: result.css, map: result.map.toJSON() };
    },
  };
}

// Aliases run before CSS processing, including resolution of CSS @imports.
// Use a real, empty CSS file so Vite's CSS pipeline can also read it from disk.
// Do not match JS icon libraries or font packages other than plain Roboto.
function cStyleExcludeStyles({ fontAwesome = true, roboto = true }) {
  const emptyCss = fileURLToPath(new URL("./styles/empty.css", import.meta.url));
  const alias = [];
  if (fontAwesome) {
    alias.push({
      find: /^(?:.*[/\\])?@fortawesome\/fontawesome-free\/css\/[^?]+\.css(?=\?|$)/,
      replacement: emptyCss,
    });
  }
  if (roboto) {
    alias.push(
      {
        find: /^(?:.*[/\\])?@fontsource(?:-variable)?\/roboto(?:\/[^?]+\.css)?(?=\?|$)/,
        replacement: emptyCss,
      },
      {
        find: /^(?:.*[/\\])?typeface-roboto(?:\/index\.css)?(?=\?|$)/,
        replacement: emptyCss,
      },
      {
        find: /^(?:.*[/\\])?roboto-fontface\/css\/(?:roboto\/)?[^?]+\.css(?=\?|$)/,
        replacement: emptyCss,
      },
    );
  }
  return {
    name: "c-style:exclude-styles",
    enforce: "pre",
    config() {
      return { resolve: { alias } };
    },
  };
}

export function cStyleHtml() {
  return {
    name: "c-style:layer-order",
    transformIndexHtml(html) {
      if (html.includes("@layer vuetify-core")) return;
      return [{ tag: "style", children: layerOrderCss, injectTo: "head-prepend" }];
    },
  };
}

/**
 * Lets the dev server read this package and its font files when they
 * sit outside the app's `server.fs.allow` (a workspace link, or pnpm's global
 * virtual store).
 */
function cStyleServe() {
  return {
    name: "c-style:serve",
    config(config) {
      const root = path.resolve(config.root ?? process.cwd());
      // Vite only falls back to the workspace root when `allow` is unset, and
      // plugin config is concatenated onto the user's, so restore that fallback.
      const fallback = config.server?.fs?.allow ? [] : [searchForWorkspaceRoot(root)];
      return {
        server: { fs: { allow: [...fallback, packageRoot, ...fontRoots] } },
        optimizeDeps: { include: ["coalesce-c-style > @lucide/vue"] },
      };
    },
  };
}
