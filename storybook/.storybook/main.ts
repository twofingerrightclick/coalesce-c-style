import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import vue from "@vitejs/plugin-vue";
import { CoalesceVuetifyResolver } from "coalesce-vue-vuetify3/build";
import { cStyle, layerOrderStyle } from "coalesce-c-style/vite";
import components from "unplugin-vue-components/vite";
import { mergeConfig } from "vite";
import { transformAssetUrls } from "vite-plugin-vuetify";

// Sass applies c-style's settings only when the Vuetify that `settings.scss`
// forwards and the one Storybook bundles are the same files. pnpm links a
// separate copy whenever this package's peer set differs from c-style's (for
// example, Storybook's esbuild peer on vite), so fail loudly instead of
// rendering stock Vuetify.
const vuetifyHere = realpathSync(fileURLToPath(new URL("../node_modules/vuetify", import.meta.url)));
const vuetifyCStyle = realpathSync(
  fileURLToPath(new URL("../node_modules/coalesce-c-style/node_modules/vuetify", import.meta.url)),
);
if (vuetifyHere != vuetifyCStyle) {
  throw new Error(
    `Two Vuetify copies: storybook uses ${vuetifyHere}, c-style uses ${vuetifyCStyle}. ` +
      "Align their peer dependencies (run pnpm install from MyProject/).",
  );
}

// pnpm's global virtual store holds every dependency's real files (fonts,
// Storybook's mocker runtime), outside any folder Vite allows by default.
const pnpmStore = vuetifyHere.slice(0, vuetifyHere.indexOf("/links/"));

// The demo app's source, for stories of app components written against
// c-style's public API (`@demo/components/OptionTiles.vue`), so one file
// serves both the demo and the Storybook.
const demoSrc = fileURLToPath(new URL("../../MyProject/MyCompany.MyProject.Web/src/", import.meta.url));

const config: StorybookConfig = {
  framework: {
    name: "@storybook/vue3-vite",
    options: { docgen: false },
  },
  stories: ["../stories/**/*.stories.ts"],
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
  previewHead: (head) => `${layerOrderStyle}\n${head}`,
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [
        vue({ template: { transformAssetUrls } }),
        components({ resolvers: [CoalesceVuetifyResolver()], dts: false }),
        // The icon stories intentionally demonstrate the Font Awesome fallback.
        cStyle({ excludeStyles: { fontAwesome: false } }),
      ],
      resolve: {
        alias: [
          { find: /^@\//, replacement: fileURLToPath(new URL("../src/", import.meta.url)) },
          { find: /^@demo\//, replacement: demoSrc },
        ],
      },
      server: {
        fs: { allow: [fileURLToPath(new URL("..", import.meta.url)), pnpmStore, demoSrc] },
      },
      optimizeDeps: {
        include: ["coalesce-vue", "coalesce-vue-vuetify3", "vue-router", "@lucide/vue"],
      },
    }),
};

export default config;
