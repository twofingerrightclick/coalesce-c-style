# c-style

[Canon](https://recepkutuk.github.io/canon/reference/introduction.html)'s look for Vuetify 4 and IntelliTect Coalesce, without rewriting a single template.

The C stands for **Coalesce**, **Canon**, and for what goes away: the **chunkiness**. Same `<v-btn>`, same `<c-admin-table-page>`; tighter controls, simpler color, no Material slabs.

## Before and after

Stock Coalesce starter template (Vuetify 4 + Material) on the left, the same app with c-style on the right. Same view, same code, dark mode, 1440×900.

| Before | After |
|---|---|
| ![Dashboard, stock, dark](docs/showcase/dashboard-before-dark.png) | ![Dashboard, c-style, dark](docs/showcase/dashboard-after-dark.png) |

## What's chunky about stock Vuetify

Vuetify's defaults are Material Design 2 at full volume. Seven things stand out:

- **The primary colour is the nav bar.** A slab of saturated brand colour across the top of every page, so the chrome competes with the content.
- **FontAwesome Solid icons.** Heavy, filled and near-black; they outweigh the text beside them.
- **Tabs that float in space.** An underline and nothing else, with no container to say what the tabs belong to.
- **Buttons with drastic elevation.** Drop shadows and Material 2 ripple animations on every click.
- **Alerts that shout.** The alert level sets the whole background, so a page with four messages looks like a traffic light.
- **Harsh shadows on every card.** Elevation stands in for borders.
- **A dropdown caret that doesn't match its field.** A solid triangle on a hairline outline: the heaviest mark in the control.

c-style replaces each one with Canon's quieter equivalent: a neutral nav bar, 1.5px Lucide icons, tabs in a segmented container, flat tonal buttons, alerts with a status edge and an icon, hairline-and-shadow cards and a thin chevron.

The collage below puts all seven on one canvas. Light and dark, stock then c-style:

| Before | After |
|---|---|
| ![Components, stock, light](docs/showcase/collage-before-light.png) | ![Components, c-style, light](docs/showcase/collage-after-light.png) |
| ![Components, stock, dark](docs/showcase/collage-before-dark.png) | ![Components, c-style, dark](docs/showcase/collage-after-dark.png) |

Every captured pair, light and dark, is in [docs/showcase/](docs/showcase/) (`<page>-<before|after>-<light|dark>.png`).

## Built on Vuetify's own theming

c-style adds no styling system of its own. Its Vite plugin is `vite-plugin-vuetify` with Vuetify's documented customization points filled in, and everything else is plain `createVuetify` input:

| Vuetify mechanism | What c-style supplies |
|---|---|
| [SASS variables](https://vuetifyjs.com/en/features/sass-variables/) through `styles.configFile` | `cStyle()` is `vite-plugin-vuetify` with `configFile` pointing at c-style's settings (`@forward 'vuetify/settings' with (… !default)`), so Canon's sizes, radii and type reach the compiled component CSS. Your own `settings` file and `vuetify` options pass straight through. |
| [Blueprints](https://vuetifyjs.com/en/features/blueprints/) and [global defaults](https://vuetifyjs.com/en/features/global-configuration/) | `cStyleBlueprint()` sets component defaults (variants, densities, icon sets). Your own `defaults` still override it. |
| [Themes](https://vuetifyjs.com/en/features/theme/) | `cStyleThemes()` builds `light` and `dark` themes with Vuetify's standard color roles and CSS variables, which the color helpers generate from your brand colors. |
| [Icon sets](https://vuetifyjs.com/en/features/icon-fonts/) | Lucide registered through Vuetify's `aliases` and `sets`. |
| [CSS layers](https://vuetifyjs.com/en/features/theme/#css-layers) | Vuetify's own layer order, plus a few overrides that SASS and the theme can't reach. App CSS still wins without `!important`. |

Because of that, Vuetify's docs still apply: any setting, theme option or component default that works in a stock Vuetify app works here.

## What you get

- **Canon on every component.** Spacing, sizes, radii, type, depth and colour roles from Canon, at its md size: 40px controls (32 / 48 for `small` / `large`), 4 / 8 / 12px radii, hairline rules, edge-and-shadow depth, a 2px + 1px focus ring, 0.12s motion. Covers Vuetify's components (Labs excluded) and Coalesce's `c-*` components; the remaining gaps are listed under [Known deviations](packages/c-style/README.md#known-deviations-from-canon).
- **Vuetify-native.** See [Built on Vuetify's own theming](#built-on-vuetifys-own-theming).
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

```sh
pnpm add c-style
```

c-style's version is the Coalesce release it was tested with plus a build number, so `6.5.1-cs.1` is build 1 for Coalesce 6.5.1 (see [Versions](packages/c-style/README.md#versions)).

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
