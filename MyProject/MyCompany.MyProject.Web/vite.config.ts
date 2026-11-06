import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";

import { defineConfig } from "vite";

import createVuePlugin from "@vitejs/plugin-vue";
import { createAspNetCoreHmrPlugin } from "coalesce-vue/lib/build";
import createAutoImport from "unplugin-auto-import/vite";

import createVueComponentImporterPlugin from "unplugin-vue-components/vite";
import { CoalesceVuetifyResolver } from "coalesce-vue-vuetify3/build";
import { transformAssetUrls } from "vite-plugin-vuetify";
import { cStyle } from "c-style/vite";

export default defineConfig({
  build: {
    outDir: "wwwroot",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "styles",
              // Chunk all styles together so that there aren't problems
              // with selectors getting reordered, which alters specificity.
              test: /\.s?css|type=style/,
              priority: 30,
            },
            {
              name(moduleId: string) {
                // Suggest that top level node_modules folders should have their own chunk.
                return (
                  /node_modules[/\\](?:\.pnpm[/\\])?(@?[^@/\\]+)/i.exec(
                    moduleId,
                  )?.[1] ?? null
                );
              },
            },
          ],
        },
      },
    },
  },

  plugins: [
    createVuePlugin({
      template: { transformAssetUrls },
    }),

    // Integrations with UseViteDevelopmentServer from IntelliTect.Coalesce.Vue:
    createAspNetCoreHmrPlugin(),

    // Dynamically adds imports for usages of Vuetify and Coalesce components.
    // Vuetify3Resolver could be removed and replaced by vite-plugin-vuetify if desired.
    createVueComponentImporterPlugin({
      resolvers: [CoalesceVuetifyResolver()],
      dts: "src/types/components.d.ts",
    }),

    // Auto-import vue composition API functions,
    // and any custom composables in the src/composables directory:
    createAutoImport({
      imports: ["vue", "vue-router"],
      dirs: ["src/composables/*"],
      dts: "src/types/auto-imports.d.ts",
    }),

    // vite-plugin-vuetify with c-style's SASS settings.
    cStyle(),

    {
      name: "inject-build-date",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            children: `BUILD_DATE = new Date('${new Date().toISOString()}');`,
          },
        ];
      },
    },
  ],

  resolve: {
    alias: {
      // Allow imports prefixed with "@" to be relative to the src folder.
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },

  server: {
    fs: {
      allow: [
        // Workaround https://github.com/vitejs/vite/issues/22405
        execSync("pnpm store path", { encoding: "utf8" }).trim(),
        ".",
      ],
    },
    warmup: {
      clientFiles: ["./src/views/**/*.vue"],
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      exclude: ["**/*.g.ts", "**/*.spec.*", "test{,s}/**"],
    },
    server: {
      deps: {
        inline: [/vuetify/],
      },
    },
  },
});
