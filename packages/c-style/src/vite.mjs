import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchForWorkspaceRoot } from "vite";
import vuetify from "vite-plugin-vuetify";
import { layerOrderCss } from "./layer-order.mjs";

export { layerOrderCss, layerOrderStyle } from "./layer-order.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

// `c-style/styles` imports Inter's CSS, whose woff2 files the browser then
// fetches from wherever `inter-ui` is installed (often pnpm's global store).
const interRoot = path.dirname(createRequire(import.meta.url).resolve("inter-ui/package.json"));

export const settingsFile = fileURLToPath(new URL("./styles/settings.scss", import.meta.url));

export function cStyle({ settings, vuetify: vuetifyOptions } = {}) {
  return [
    ...vuetify({
      autoImport: true,
      ...vuetifyOptions,
      styles: { configFile: settings ?? settingsFile },
    }),
    cStyleHtml(),
    cStyleServe(),
  ];
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
 * Lets the dev server read this package and its Inter font files when they
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
        server: { fs: { allow: [...fallback, packageRoot, interRoot] } },
        optimizeDeps: { include: ["c-style > @lucide/vue"] },
      };
    },
  };
}
