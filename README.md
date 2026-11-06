# c-style

[Canon](https://recepkutuk.github.io/canon/reference/introduction.html)'s look for Vuetify 4 and IntelliTect Coalesce, without rewriting a single template.

The C is for **Coalesce** style, for **Canon**, and for what goes away: the **chunkiness**. Same `<v-btn>`, same `<c-admin-table-page>`; tighter controls, quieter colour, no Material slabs.

## Before and after

Stock Coalesce starter template (Vuetify 4 + Material) on the left, the same app with c-style on the right. Same views, same 40 widgets, 1440×900.

| Before | After |
|---|---|
| ![Dashboard, stock](docs/showcase/dashboard-before-light.png) | ![Dashboard, c-style](docs/showcase/dashboard-after-light.png) |
| ![List and detail, stock](docs/showcase/workspace-before-light.png) | ![List and detail, c-style](docs/showcase/workspace-after-light.png) |
| ![Settings, stock](docs/showcase/settings-before-light.png) | ![Settings, c-style](docs/showcase/settings-after-light.png) |

Coalesce's generated admin pages, with no changes to routes or props:

| Before | After |
|---|---|
| ![Admin table, stock](docs/showcase/admin-table-before-light.png) | ![Admin table, c-style](docs/showcase/admin-table-after-light.png) |
| ![Admin editor, stock](docs/showcase/admin-editor-before-light.png) | ![Admin editor, c-style](docs/showcase/admin-editor-after-light.png) |
| ![Audit log, stock](docs/showcase/audit-log-before-light.png) | ![Audit log, c-style](docs/showcase/audit-log-after-light.png) |

Up close:

| Before | After |
|---|---|
| ![Form fields, stock](docs/showcase/crop-form-fields-before-light.png) | ![Form fields, c-style](docs/showcase/crop-form-fields-after-light.png) |
| ![Admin table toolbar, stock](docs/showcase/crop-table-before-light.png) | ![Admin table toolbar, c-style](docs/showcase/crop-table-after-light.png) |
| ![Select menu, stock](docs/showcase/crop-select-open-before-light.png) | ![Select menu, c-style](docs/showcase/crop-select-open-after-light.png) |
| ![Buttons, stock](docs/showcase/crop-buttons-before-light.png) | ![Buttons, c-style](docs/showcase/crop-buttons-after-light.png) |
| ![Chips, stock](docs/showcase/crop-chips-before-light.png) | ![Chips, c-style](docs/showcase/crop-chips-after-light.png) |

Dark:

| Before | After |
|---|---|
| ![Dashboard, stock, dark](docs/showcase/dashboard-before-dark.png) | ![Dashboard, c-style, dark](docs/showcase/dashboard-after-dark.png) |
| ![Admin table, stock, dark](docs/showcase/admin-table-before-dark.png) | ![Admin table, c-style, dark](docs/showcase/admin-table-after-dark.png) |
| ![Select menu, stock, dark](docs/showcase/crop-select-open-before-dark.png) | ![Select menu, c-style, dark](docs/showcase/crop-select-open-after-dark.png) |

Every pair, light and dark, is in [docs/showcase/](docs/showcase/) (`<page>-<before|after>-<light|dark>.png`).

## What you get

- **Canon on every component.** Spacing, sizes, radii, type, depth and colour roles from Canon, at its md size: 40px controls (32 / 48 for `small` / `large`), 4 / 8 / 12px radii, hairline rules, edge-and-shadow depth, a 2px + 1px focus ring, 0.12s motion. Covers Vuetify's components (Labs excluded) and Coalesce's `c-*` components; the remaining gaps are listed under [Known deviations](packages/c-style/README.md#known-deviations-from-canon).
- **Vuetify-native.** c-style works through Vuetify's own channels: SASS settings, a blueprint of component defaults, theme variables, and cascade layers for the little CSS those can't reach. No `!important` fights, and app CSS still wins without it.
- **Brand colours.** Pass any hex or Tailwind palette name; c-style generates a 50–950 ladder and derives Canon's roles for both modes. `applyCStyleColors` swaps them at run time, no reload.
- **Light and dark**, following the OS by default.
- **Fonts.** Public Sans by default, bundled with the package (no font CDN). Canon's Inter is one import away; `cStyleBlueprint({ font })` or `applyCStyleFont` switches to any font the app ships.
- **Lucide icons** at Canon sizes and a 1.5px stroke for every Vuetify alias, plus `csIcon()` for app icons. FontAwesome strings and glyphs that Coalesce renders are mapped to Lucide.
- **Coalesce admin, zero touch.** Table, editor and audit pages get neutral card toolbars, Canon pagination and row actions, and 40px fields, with the starter template's routes unchanged.
- **Canon's time field**, which Vuetify lacks: `CsTimeField`, `CsTimeRangeField` and `CsTimeInput`, typed cell by cell from the keyboard.
- **Your own components.** A public token contract (125 `--cs-*` properties), the `c-style/tokens` SCSS module (`surface`, `interactive`, `control-box`, `type`, …) and an agent skill that teaches coding agents to use them. See [Styling your own components](packages/c-style/README.md#styling-your-own-components).
- **Storybook** with a story for every Vuetify and Coalesce component (178 Vuetify exports, 27 Coalesce) and `Parity/*` stories that set c-style beside Canon's own CSS; a parity gate fails on any undocumented difference.
- **Playwright suites** that measure the demo app (sizes, colours, states, light and dark), render every story, and capture screenshots.

## Adopting it

Three files in a Coalesce starter app. Routes, views and Coalesce props stay as they are.

```diff
 // package.json
+"c-style": "workspace:*",
-"@fontsource/roboto": "…",

 // vite.config.ts
-import createVuetify, { transformAssetUrls } from "vite-plugin-vuetify";
+import { transformAssetUrls } from "vite-plugin-vuetify";
+import { cStyle } from "c-style/vite";
 ...
-    createVuetify({ autoImport: true }),
+    cStyle(),

 // main.ts
 import "vuetify/styles";
+import "c-style/styles";
 import "@/styles/site.scss";
+import { cStyleBlueprint } from "c-style";
 ...
 const vuetify = createVuetify({
-  icons: { defaultSet: "fa", aliases, sets: { fa } },
-  defaults: { /* … */ },
+  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
 });
```

The full steps (CSS import order, `site.scss` rules to delete, settings overrides, colours, fonts, sizes) are in the [package README](packages/c-style/README.md).

## Repository

| Path | What |
|---|---|
| `packages/c-style/` | The package (`c-style`, `c-style/vite`, `c-style/settings`, `c-style/styles`, `c-style/tokens`, `c-style/icons`, `c-style/fonts/inter`) and its unit tests |
| `storybook/` | Storybook (`c-style-storybook`): every component, Foundations pages, `Parity/*` stories against Canon's vendored CSS, and a mocked Coalesce domain |
| `verify/` | Playwright (`c-style-verify`): `app/` measures the demo app, `parity/` measures Storybook, `capture/` writes screenshots |
| `MyProject/` | Demo Coalesce app that adopts c-style, and the pnpm workspace root. `/c-style` is the fixture page the app specs measure; `/dashboard`, `/workspace`, `/settings` are the showcase views |
| `docs/` | `plan.md` (decisions), `progress.md` (log, mechanisms, deviations), `research/`, `showcase/` (the screenshots above) |

### Running

Run pnpm only from `MyProject/`, with `--filter`; inside `packages/c-style`, `storybook` or `verify` pnpm treats the folder as its own project and relinks the store.

```sh
cd MyProject
pnpm install
```

- **Demo app:** start the Aspire AppHost (`MyCompany.MyProject.AppHost`); the web project serves Vite at https://localhost:48110 with hot reload.
- **Storybook:** `pnpm --filter c-style-storybook storybook`, then http://localhost:6006. The toolbar switches theme, accent and font.

### Tests

```sh
cd MyProject
pnpm --filter c-style test                        # unit (vitest): colour math, themes, icons, layer order, tokens, CSS lint
pnpm --filter c-style-verify test --project app   # demo app specs (app running)
pnpm --filter c-style-verify storybook            # every story renders, parity gate, coverage and accent sweep (Storybook running)
pnpm --filter c-style-verify baseline             # screenshots (CAPTURE=1; CAPTURE_DIR=screenshots/<name>)
```

Type checks: `tsc --noEmit` in `packages/c-style` and `verify`; `vue-tsc --noEmit` in `storybook` and `MyProject/MyCompany.MyProject.Web` (each from its `node_modules/.bin`). `PARITY_DUMP=<file>` makes the parity gate write its differences instead of failing.

## Credits

**[Canon](https://recepkutuk.github.io/canon/) by Recep Kütük** ([repository](https://github.com/recepkutuk/canon), MIT) is the design. c-style reproduces Canon's design decisions (measurements, tones, colour roles, motion and component behaviours) for Vuetify and Coalesce, and ports some of its component recipes. c-style is independent and isn't affiliated with or endorsed by the Canon project. Canon's license and the other notices are in [packages/c-style/THIRD-PARTY-NOTICES.md](packages/c-style/THIRD-PARTY-NOTICES.md).

c-style is built on, and bundles or depends on:

- [Vuetify](https://vuetifyjs.com) (MIT)
- [IntelliTect Coalesce](https://github.com/IntelliTect/Coalesce) (Apache 2.0)
- [Lucide](https://lucide.dev) icons (ISC)
- [Public Sans](https://public-sans.digital.gov) (SIL Open Font License 1.1), the default font
- [Inter](https://rsms.me/inter/) by Rasmus Andersson (SIL Open Font License 1.1), Canon's font, opt-in
- The [Tailwind CSS](https://tailwindcss.com) v3 colour palette (MIT)
