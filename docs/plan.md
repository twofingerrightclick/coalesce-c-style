# c-style implementation plan

Goal: make Vuetify 4 and the Coalesce `c-*` components look like Canon, using Vuetify's own channels (SASS settings, blueprint defaults, theme) before any CSS. Colors are configurable. Spacing, sizing, shape, type and tone relationships follow Canon.

Inputs: `docs/research/canon.md` (spec), `vuetify.md` (levers), `coalesce.md` (c- anatomy), `vetting.md` (corrections, open questions). Section numbers like "canon §3.5" refer to those docs.

Versions this plan targets: vuetify 4.3.2, vite-plugin-vuetify 2.1.3, vite 8.3.x, coalesce-vue / coalesce-vue-vuetify3 6.5.1, sass 1.107, Storybook 10.6.x, pnpm 11.

---

## 1. Decisions

### 1.1 Mapping decisions (vetting questions 1–11, plus the extras asked for)

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Emphasis → variant | `flat` = high, `tonal` = medium, `outlined` = low, `text` = minimal. `elevated` renders like `flat` (Canon has no raised buttons). `plain` renders like `text` with muted fg. No alias components. | Vuetify apps and Coalesce already use these variant names. Aliases would leave Coalesce's hard-coded `variant="text"`/`"outlined"` unstyled. The four variants line up 1:1 with Canon's four emphases. |
| 1b | Default emphasis | `defaults.VBtn.variant = 'tonal'` (medium). | Canon: "Default emphasis is medium. high must be chosen deliberately." |
| 2 | Default intent | `defaults.VBtn.color = 'primary'` (accent). Neutral is opt-in via `color="neutral"`. Nested defaults switch to neutral where Canon uses neutral buttons: `VToolbar.VBtn`, `VAppBar.VBtn`, `VTable.VBtn`, `VDataTable.VBtn`, `VField.VBtn`, `VList.VBtn`, `VAlert.VBtn`, `VSnackbar.VBtn`, `VPagination` (via `VPaginationBtn`). Vuetify components that `provideDefaults({ VBtn })` internally (`VToolbar`, `VToolbarItems`, `VCardActions`, `VSnackbar`, `VAlert` close, `VBannerActions`, `VEmptyState`, `VBtnGroup`, `VNumberInput`, `VDatePickerControls`/`Header`, `VPicker`, `VCarousel`, `VSpeedDial`, `VFileUpload*`, `VTreeviewItem`, `VBottomNavigation`) shadow the global `VBtn` defaults, so their buttons stay `variant: 'text'` with no color unless the blueprint sets the nested key. Nested blueprint keys do win over those internal providers: `provideSubDefaults` runs after the component's setup (`util/defineComponent.tsx:125-129`). M7 decides each container explicitly. | Canon's default intent is the accent. Canon toolbars, row actions and in-field buttons are neutral. |
| 3 | sm/md/lg → size | VBtn `size`: `x-small` = 28 (Canon's in-box button, I+8), `small` = sm 32, `default` = md 40, `large` = lg 48, `x-large` = lg 48 (Canon collapses xl→lg). Set via `$button-named-sizes` (all five required). Same for `$icon-btn-named-sizes`, chip sizes and `$btn-group-named-sizes`. | Vuetify's `size` is the only per-instance size prop. Canon has three sizes and collapses the rest. Coalesce uses `x-small` for compact icon buttons, which match Canon's 28px in-box buttons. |
| 4 | Density | Density is **not** Canon size. Every SASS density map except `$table-density` is zeroed (`(default:0, comfortable:0, compact:0)`): `$button-density`, `$button-stacked-density`, `$input-density`, `$chip-density`, `$tabs-density`, `$selection-control-density`, `$list-density`, `$alert-density`, `$banner-density`, `$avatar-density`, `$breadcrumbs-density`, `$color-input-pip-density`, `$time-picker-controls-field-density`. This works against explicit props because density is a class whose height the map computes; it doesn't go through defaults. Coalesce's hard-coded `density="compact"` (fields, `v-btn-group`, and the `v-list` in the `c-select` menu and `c-list-filters`) is then harmless. `$button-icon-density` needs no change: with named sizes set, icon buttons use `$button-density` (`VBtn/_mixins.scss` `button-icon-densities()`). Tables keep density, mapped to Canon density: `default` = comfortable (control + 16 = 56), `comfortable` = control + 8 (48, documented interpolation), `compact` = control (40). Canon size sm/lg for fields and the rest comes from a size context (§1.3). Toolbar density stays JS (`toolbar.ts`: comfortable −8, compact −16 from `height`): `defaults.VToolbar.height` sets the base, and Coalesce's explicit toolbar densities (table toolbar comfortable → 56, editor compact → 48) are handled in §3e. | Coalesce pairs `density="compact"` fields with default-size buttons (editor aux column, `c-list-page`). Only "compact = md 40" keeps those rows aligned, and Canon's own density only changes table rows. |
| 5 | Palette → theme | `colors` holds roles only: `primary`, `secondary`, `neutral`, `success`, `warning`, `error`, `info`, `background`, `surface`, `surface-bright`, `surface-light`, `surface-variant`, plus explicit `on-*`. Ladders (`primary-50…950`, `neutral-*`, `success-*`, `warning-*`, `error-*`, `info-*`) go in `variables` and emit as `--v-primary-600: r,g,b` (no classes). Per-mode role tokens also go in `variables` (§1.2). `secondary` = neutral ink (Canon has one accent; Coalesce only uses `secondary` for the filter-count badge). `info` gets its own ladder, defaulting to the accent ladder (Canon info = blue = accent). | Vetting's bloat warning: ladders as `colors` would emit 2×66 color classes. Roles must stay `colors` so `color="primary"` props and `bg-*`/`text-*` classes work. |
| 6 | Ladder generation | Runtime JS, in the blueprint factory. Default palettes are Canon's Tailwind v3 hexes verbatim (zinc, blue, green, amber, red), so the default look is exact. A brand hex goes through `generateLadder(hex)`: convert to OKLCH (`culori`), find the step whose Tailwind reference lightness is nearest and pin the hex there, take the other steps' L from the Tailwind reference curve, scale chroma along the reference chroma curve, keep hue, gamut-map with `clampChroma`. A full `{50…950}` object or a Tailwind palette name is also accepted. Neutral defaults to zinc; options are `'zinc' \| 'slate' \| 'gray' \| 'neutral' \| 'stone'`, a ladder object, or `{ tint: hex, amount }` for a brand-tinted zinc. | Runtime generation lets Storybook and apps switch brands live through `theme.themes`. OKLCH keeps perceptual spacing close to Tailwind. Pinning keeps the exact brand hex visible. |
| 6b | Solid step | `primary`/`success`/`error`/`info` = step 600 in both modes, `on-*` = white. `warning` = amber-400 with `on-warning` = amber-950. `neutral` and `secondary` = zinc-900 / white, `on-*` = white / zinc-900. | Canon high emphasis is solid 600 in both modes (canon §3.5 "hue is the same in light and dark"). Warning's exception comes from canon §4 E. |
| 6c | On-colors | Always set explicitly by the theme factory. Never rely on `genOnColors`. | Vuetify's contrast pick would choose black on some 600 steps. |
| 7 | Selected = ink | Checkbox, radio, switch, slider fill, date-picker selected day and toggle chips default to `color: 'neutral'`. Selected list items get a neutral fill (Canon Nav List / option row), never an accent tint: `defaults.VList.activeColor` unset, `VList.color` unset. The adoption diff deletes the demo's `VSwitch: { color: 'primary' }`. | Canon §3.6. App options would otherwise beat the blueprint. |
| 8 | Radius | `$border-radius-root: 8px`. `$rounded: (0:0, sm:4px, null:8px, md:8px, lg:12px, xl:16px, xxl:24px, pill:9999px, circle:50%, shaped:12px 0)`. Component radii set by variable: button/field/list-item 8, card/table/alert/toast/expansion 12, menu/select/autocomplete content 12, dialog 24, tooltip 4, chip (tag) 4, switch track and filter chip pill. sm/lg contexts swap 4/12 and 8/16 through CSS variables (§1.3). | Canon radius ladder (canon §2.3, §6.3). Redefining `$rounded` keeps the `rounded` prop meaningful. |
| 9 | Typography | MD3 roles remapped to Canon's ramp (table in §3a). Component literals set explicitly: `$field-font-size: 14px`, `$label-font-size: 14px`, `$messages-font-size: 12px`, `$tooltip-font-size: 12px`, `$toolbar-title-font-size: 16px`, `$expansion-panel-title-font-size: 14px`, list subheader 10px. Font: `--v-font-body` set through theme `variables['font-body']` = `InterVariable, Inter, ui-sans-serif, system-ui, sans-serif`. `font-feature-settings: "ss01","cv11","cv04","cv03","cv02"` on `:root` in c-style CSS. Inter is self-hosted from the `inter-ui` package (rsms's own build, keeps the cv/ss features). No bundled mono font: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` with JetBrains Mono first if installed. | The theme-variable route needs no SASS and switches at runtime. Google-derived builds (Fontsource) strip the alternates. |
| 10 | Elevation | `$shadow-key` levels 0–5 = `var(--v-elevation-N)`, `$shadow-ambient` = `0 0 transparent`. Theme variables per mode: 1 = control, 2 = edge + raised, 3 = edge + floating, 4 = edge + floating, 5 = edge + overlay (Canon alphas, dark alphas from canon §2.7). `$elevation-overlay-step: 0%`. Component elevations: card 2, menu/select content 3, snackbar 3, dialog 5, navigation-drawer temporary 5, app-bar/toolbar 0, field/btn 0 (control shadow added by CSS), chip 0, alert 0. | One theme variable per level makes shadows mode-aware with no CSS. Canon's edge is part of every floating surface, so it travels with the elevation. |
| 11 | Admin toolbars | Neutral surface, not primary. The adoption diff removes `color: "primary"` from `titledAdminPage`. Unlayered CSS on `.c-admin-table-toolbar`, `.c-admin-editor--toolbar`, `.c-admin-methods--toolbar` removes `elevation="4"` and draws a `rule` hairline below. Toolbar title = card title type (16/24/600). | Canon headers are white surfaces with weight 600 titles. One accent, spent on primary actions. |
| 12 | Icon set | Wired through Vuetify's native config only: `icons: { defaultSet: 'cs', aliases: csAliases, sets: { cs, fa } }`. `cs` is a custom `IconSet` whose component renders Lucide via `@lucide/vue` (1.70.x) at `stroke-width: 1.5` with `absoluteStrokeWidth`, so the stroke stays 1.5px at 16/20/24. `csAliases` covers **every** key of Vuetify's `IconAliases` (65 keys in 4.3.2 `iconsets/mdi.ts`, among them `$collapse $expand $dropdown $clear $close $prev $next $first $last $sortAsc $sortDesc $checkboxOn $checkboxOff $checkboxIndeterminate $radioOn $radioOff $loading $calendar $clock $tableGroupCollapse $tableGroupExpand $treeviewCollapse $treeviewExpand $search` and the `$command`/`$ctrl`/arrow keys VHotkey uses); a unit test diffs the keys against `vuetify/iconsets/mdi` so a Vuetify upgrade that adds one fails. **Coalesce literals:** the `cs` component maps the FA names Coalesce passes through `v-icon`/`*-icon` props (19 in source: `fa-save fa-trash-alt fa-search fa-info-circle fa-filter fa-eye fa-eye-slash fa-undo fa-lock fa-external-link-alt fa-ellipsis-h fa-download fa-columns fa-clock fa-caret-up fa-caret-down fa-calendar-alt fa-asterisk`, plus `fa-fw` ignored; re-grep `PKG/dist` in M1) to Lucide, so Coalesce icons get the same stroke and box as everything else. Other strings with a space or an `fa`/`mdi` prefix fall through to `fa.component`. Only the raw `<i class="fa …">` elements in `c-admin-editor`/`c-admin-table` (3 sites) stay FA glyphs; §3e sizes and mutes them. FontAwesome stays loaded for those and for app strings. | Canon draws Lucide at 1.5. Vuetify's MDI/FA glyphs are the main source of the "playful, too big" look the user called out, so the swap is global and lands in M1, not per component. |
| 12b | Checkbox / radio glyphs | `$checkboxOn`, `$checkboxOff`, `$checkboxIndeterminate`, `$radioOn`, `$radioOff` alias to c-style render-function SVG components: a box at 5% inset, radius c/4, 1px line; checked = `currentColor` fill with a mark stroked in `rgb(var(--v-theme-surface))` (white / zinc-900, which is Canon's mark color). Line colors come from tone variables in CSS. | The glyph is an icon in Vuetify. SVG components give Canon's exact geometry with no font, and the box-line colors stay themeable. |
| 13 | Dark mode | Two Vuetify themes, `light` and `dark`, built by the same factory. `defaultTheme: 'system'`. Mode differences live entirely in theme `colors`/`variables` (step flips, tint alphas, shadow alphas, canvas 50/950, surfaces white/900, bright surface white/800). The few Canon dark-only literals (choice focus blue-300) are theme variables too. No `light-dark()` in c-style CSS. | Vuetify scopes themes with `.v-theme--*`, which supports nested theme switches. `light-dark()` would follow `color-scheme`, and Vuetify already sets it per theme, but theme variables keep one mechanism. |
| 14 | Press / ripple | `defaults.global.ripple = false`. Press = `scale: .98` over 100ms ease-out on worded buttons only. Colors transition 120ms. All of it is disabled under `prefers-reduced-motion`. | canon §2.10. |
| 15 | Field label | Canon's label sits **above** the field (6px gap, 14/20 weight 500). Vuetify has no such variant, so c-style restyles `outlined`: the frame becomes a 1px border on `.v-field` (outline pieces hidden), the floating label is shown above the frame at all times, the in-field label is hidden, the input reserves label height. `persistent-placeholder` is on by default. Fallback if this proves brittle across select/autocomplete/textarea: keep Vuetify's floating label, restyled. Decide by the end of M8. An empty label (`label=""`, which Coalesce passes on every admin editor, table and method input) reserves no height. | The label position is the most visible Canon trait of forms. It is a structural gap that no Vuetify lever covers (vetting "Open gaps"). |
| 16 | Icon sizes | One global lever: `$icon-sizes: ('x-small': 12px, 'small': 16px, 'default': var(--cs-icon), 'large': 24px, 'x-large': 32px)`. Vuetify's default is `1.5em` (21px in 14px text, 24px in 16px), which is a large part of the chunky look. `--cs-icon` is 16/20/24 by size context (canon §2.3), so every default-size icon in fields, lists, alerts, tabs, chips, pagination and table sort headers follows Canon with no per-component rule. Component icon variables are set to match: `$icon-btn-named-sizes` icon-size 16/16/20/24/24, `$button-named-sizes` `icon-size` the same, `$chip-icon-size-multiplier: 1`, `$alert-prepend-icon-size: 20px`, `$breadcrumbs-item-icon-font-size: 16px`, `$bottom-navigation-icon-font-size: 20px`, VSlider named-size `icon-size: 20px`, `$selection-control-size: 20px` (from 40). In-box buttons (clear, reveal, stepper; 28px) take 16. | Canon's icon box is the control's icon size: 20 at md, inside and outside controls. |
| 17 | Chunkiness | Vuetify's bulk comes from a few global sources, all fixed in SASS before any component CSS: (a) icon size (decision 16); (b) density multipliers (decision 4); (c) button min-width `h×16/9` and padding `h/2.25` (named sizes set `min-width: 0` and Canon padding); (d) control heights 56/48 → 40 (`$input-control-height`, `$field-control-height`, `$list-item-one-line-min-height`, `$tabs-height`, `$expansion-panel-title-min-height`, selection control 40 → 20); (e) gaps sized for MD (`$list-item-icon-margin-start/end` 32, `$list-item-prepend-size` 40, `$list-item-action-spacer-width` 16, `$field-input-row-gap`, `$icon-margin-start/end` 8) → Canon control gap 8 and nav gap 10; (f) MD3 typography sizes (§3a). M6 measures the result before any family milestone. | The user's main complaint is that Vuetify is "too chunky". These are global levers; fixing them late as per-component CSS is the brittleness the plan is meant to avoid. |

### 1.2 Theme token model

The theme factory `cStyleThemes(palette)` returns `{ light, dark }`. Each contains:

- `colors`: the roles from decision 5, with explicit `on-*`.
  - light: `background` zinc-50, `surface` white, `surface-bright` white, `surface-light` zinc-100, `surface-variant` zinc-100, `on-surface` zinc-900, `on-background` zinc-950, `on-surface-variant` zinc-700.
  - dark: `background` zinc-950, `surface` zinc-900, `surface-bright` zinc-800, `surface-light` zinc-800, `surface-variant` zinc-800, `on-surface` white, `on-background` zinc-50, `on-surface-variant` zinc-200.
- `variables`:
  - Ladders: `<intent>-<step>` for intents `primary neutral success warning error info`.
  - Per-intent role tokens, resolved per mode by step (canon §3.5): `<intent>-text` (700/300), `<intent>-tint` (400/500), `<intent>-hover` (500, solid hover), `<intent>-active` (700), `<intent>-border-low` (200 / 300@35%), `<intent>-line` (field rest 400/500), `<intent>-line-hover` (600/400), `<intent>-halo` (100/900), `<intent>-bar` (500/400). Neutral overrides follow canon §3.5 "Neutral intent".
  - Tint alphas: `tint-1…4` = .08/.15/.20/.25 light, .10/.20/.25/.30 dark.
  - Neutral roles: `muted` (zinc-500/400), `quiet` (zinc-400/500), `frame` (zinc-200/700), `frame-hover` (zinc-400/500), `choice-line` (zinc-400/500), `fill-hover` (zinc-50/800), `fill` (zinc-100/800), `fill-strong` (zinc-200/700), `disabled-bg` (zinc-50/800), `disabled-fg` (zinc-400/500), `focus` (accent 600/400), `focus-choice` (accent 600/300), `ring-offset` (white/zinc-900), `scrim` (white .85 / zinc-950 .75).
  - Lines: `border-color` #000/#FFF, `border-opacity` .12 (= Canon `edge`), `rule-opacity` .10, `rule-faint-opacity` .07/.08.
  - States: `hover-opacity` .04/.06, `focus-opacity` .08, `activated-opacity` .12, `selected-opacity` .08, `high-emphasis-opacity` 1, `medium-emphasis-opacity` .60 (zinc-900 at .6 on white ≈ zinc-500; white at .6 on zinc-900 ≈ zinc-400), `disabled-opacity` .38 in both modes.
  - Shadows: `elevation-0…5` (decision 10).
  - Type: `font-body`, `font-heading` (same), `theme-code`/`theme-on-code` (zinc-50 / zinc-800 mix per canon Code Block), `theme-kbd`/`theme-on-kbd`.

`#hex` values emit as rgb triplets, so CSS reads `rgb(var(--v-primary-text))` and `color-mix(in srgb, rgb(var(--v-primary-tint)) calc(var(--v-tint-2) * 100%), transparent)`.

### 1.3 Size context

Canon's `data-size` is an inherited context. Vuetify has no cross-component size axis, so c-style adds one with CSS custom properties.

- `:root` sets md tokens: `--cs-control-height: 40px`, `--cs-control-pad: 10px`, `--cs-control-font: 14px`, `--cs-control-lh: 20px`, `--cs-tracking: -0.006em`, `--cs-icon: 20px`, `--cs-gap: 8px`, `--cs-radius: 8px`, `--cs-surface-radius: 12px`, `--cs-panel-radius: 12px`, `--cs-inset: 6px`, `--cs-input-gap: 4px`, `--cs-shell-inset: 12px`, `--cs-hairline: 1px` (0.5px at ≥2dppx).
- `.cs-size-sm` and `.cs-size-lg` override them (Canon sm/lg columns). `.cs-size-md` resets. Utility classes are the API; apps put them on any ancestor or on a component via `class`.
- SASS settings hold the **numeric md values** wherever Vuetify does SASS math on them. Overrides-layer rules re-point Vuetify's own runtime variables (`--v-input-control-height`, `--v-field-padding-*`, `--v-btn-height`, `--v-table-row-height`, …) to `--cs-*` only inside `.cs-size-sm`/`.cs-size-lg`. md therefore costs no CSS.
- VBtn `size="small"|"large"` sets explicit sm/lg values through named sizes. A `default`-size button inside a size context follows the context.

---

## 2. Package shape and repo layout

### 2.1 Shipping shape

c-style is one npm package, `c-style`, with four entry points. It is a Vite-first design-system package, because Vuetify's SASS settings only reach the compiled CSS through `vite-plugin-vuetify`'s `configFile`, and a separate plugin cannot inject that option (vuetify §5.4).

| Entry | Contents | Runs in |
|---|---|---|
| `c-style/vite` | `cStyle(options)`: returns `[vuetify({ autoImport: true, ...options.vuetify, styles: { configFile } }), cStyleHtml()]`. `configFile` defaults to the package's `settings.scss` (absolute path); `options.settings` points it at an app file instead. `cStyleHtml` uses `transformIndexHtml` to inject the Vuetify layer-order `<style>` at the top of `<head>` when it isn't already there. (No font preload: the hashed woff2 URL isn't known in `transformIndexHtml` during dev, and `font-display: swap` is enough.) Authored as `src/vite.mjs` + `vite.d.mts`, so Node loads it without TS stripping. | Node (vite.config) |
| `c-style` | `cStyleBlueprint(options)`, `cStyleThemes(palette)`, `generateLadder(hex)`, `palettes`, `applyCStyleColors(theme, palette)` (runtime brand switch), `layerOrderStyle` (string), `cs` icon set and `csAliases`, types. | Browser |
| `c-style/settings` | `src/styles/settings.scss`: `@forward 'vuetify/settings' with (… !default)`. Variables only; it emits no CSS. | Sass |
| `c-style/styles` | `src/styles/index.scss`: Vuetify layer-order statement, Inter `@font-face` (from `inter-ui`), `:root` size tokens, `@layer vuetify-overrides { … }` partials, unlayered `.c-*` partials. | Browser (via Vite) |

The package ships source (TS + SCSS). Vite compiles it in consuming apps. A `dist` build for npm publishing is M19 and is not needed for the workspace demo.

Dependencies: `culori`, `@lucide/vue`, `inter-ui`. Peer dependencies: `vue ^3.5`, `vuetify ^4.3` (named sizes need 4.3), `vite-plugin-vuetify ^2.1`, `vite ^7 || ^8`, `sass ^1.80`. Vuetify is a peer, so pnpm links one Vuetify instance and Sass loads `vuetify/settings` from one real path (vuetify §2.1 symlink caveat). `settings.scss` resolves `vuetify/settings` from `packages/c-style`, so c-style's `devDependencies` pin `vuetify` to the exact version MyProject uses; a different version would give Sass a second copy and the config would silently not apply (the M1 canary catches it).

### 2.2 Repo layout

```
c-style/
  packages/c-style/
    package.json            exports: ".", "./vite", "./settings", "./styles"
    src/
      index.ts
      blueprint.ts          defaults, aliases, icons, theme assembly
      icons/                cs set, Lucide alias map, choice glyph components (render functions, no SFCs)
      color/                oklch.ts, ladder.ts, palettes.ts (Tailwind v3 hexes), themes.ts (roles per mode)
      vite.mjs, vite.d.mts
      styles/
        settings.scss       the one @forward … with (…) map
        _typography.scss    $typography map, imported by settings.scss as a map value
        index.scss
        _tokens.scss        :root --cs-*, size contexts
        overrides/          one partial per family, each wrapped in @layer vuetify-overrides
          _tone.scss _focus.scss _motion.scss _btn.scss _field.scss _choice.scss
          _surface.scss _overlay.scss _list.scss _table.scss _chip.scss _nav.scss _tabs.scss _picker.scss
        coalesce/           unlayered, every selector starts with .c-
          _admin.scss _table.scss _select.scss _list.scss _loader.scss _picker.scss
    test/                   vitest: ladders, themes, contrast
  storybook/                workspace package "c-style-storybook"
    .storybook/main.ts preview.ts
    public/canon/           vendored canon.core.css, canon.css, canon.js, LICENSE (MIT)
    domain/                 StorybookDomain C# project + coalesce.json (generator input only)
    src/domain/             generated metadata.g.ts, models.g.ts, viewmodels.g.ts, api-clients.g.ts
    src/fixtures/ src/mocks/ src/parity/
    stories/foundations/ stories/vuetify/<family>/ stories/coalesce/ stories/parity/
  verify/                   workspace package "c-style-verify": @playwright/test
    playwright.config.ts    projects: storybook, app
    lib/measure.ts  parity/*.spec.ts  app/*.spec.ts  coverage.spec.ts
  MyProject/                demo app (consumer)
  docs/
```

Workspace: keep `MyProject/pnpm-workspace.yaml` as the single workspace root, and add `../packages/*`, `../storybook` and `../verify` to its `packages`. The demo is being regenerated from the template, so re-apply these entries to the regenerated `pnpm-workspace.yaml` in M0. A scratch test confirmed that pnpm 11 links `workspace:*` deps to packages outside the root. Moving the workspace root would relocate `node_modules` under a running Vite and fight the Coalesce template layout.

### 2.3 Import-order constraints

1. The Vuetify layer-order statement must come before any Vuetify component CSS. The demo's `index.html` already inlines it (a Vite 8/Rolldown CSS-ordering workaround), and `cStyleHtml` injects it into apps that lack it. `c-style/styles` also opens with the same statement, so it is correct whichever loads first. A duplicate order statement is a no-op.
2. `c-style/styles` must load **after** `coalesce-vue-vuetify3/styles.css`, because both are unlayered and the c-style `.c-*` rules must win on source order.
3. Keep the demo's single `styles` chunk in `vite.config.ts` (`codeSplitting.groups`). Bundled CSS order then follows `main.ts` import order.

Required `main.ts` order: `@fortawesome/fontawesome-free/css/all.css` → `coalesce-vue-vuetify3/styles.css` → `vuetify/styles` → `c-style/styles` → app `site.scss`.

### 2.4 Adoption diff (Coalesce app)

`vite.config.ts`:
```diff
-import createVuetify, { transformAssetUrls } from "vite-plugin-vuetify";
+import { transformAssetUrls } from "vite-plugin-vuetify";
+import { cStyle } from "c-style/vite";
 ...
-    createVuetify({ autoImport: true }),
+    cStyle(),
```

`main.ts`:
```diff
-import "@fontsource/roboto/latin.css";
-import "@fontsource/roboto/latin-italic.css";
 import "@fortawesome/fontawesome-free/css/all.css";
 import "coalesce-vue-vuetify3/styles.css";
 import "vuetify/styles";
+import "c-style/styles";
 import "@/styles/site.scss";
-import { aliases, fa } from "vuetify/iconsets/fa";
+import { cStyleBlueprint } from "c-style";
 ...
-const inputDefaults = { density: "compact", variant: "outlined" };
 const vuetify = createVuetify({
-  icons: { defaultSet: "fa", aliases, sets: { fa } },
-  defaults: { VTextField: inputDefaults, …, VSwitch: { color: "primary" } },
-  theme: { themes: { light: { colors: {} }, dark: { colors: {} } } },
+  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
 });
```

`site.scss`: delete rules that c-style now owns (input-details alignment, `--fa-display`, readonly dashed outlines). `package.json`: add `"c-style": "workspace:*"`, drop `@fontsource/roboto`. App-specific chrome is optional cleanup, not part of adoption: if the app passes `color: "primary"` to Coalesce admin pages (the template's `titledAdminPage` wrapper does) or to its `v-app-bar`, removing it gives Canon's neutral toolbars. Without it the toolbars stay accent-filled but otherwise Canon-styled.

### 2.5 Color overrides for users

- Brand: `cStyleBlueprint({ colors: { primary: '#7c3aed', neutral: 'slate', success, warning, error, info } })`. Each value is a hex (generates a ladder), a Tailwind palette name, or a full ladder object. `colors.dark` takes per-mode overrides of the same shape.
- More brands: `cStyleThemes(palette, { name: 'acme' })` returns `acme-light`/`acme-dark` to spread into `theme.themes`.
- Runtime: `applyCStyleColors(useTheme(), palette)` rewrites the current themes' `colors`/`variables` in place.
- Escape hatch: plain Vuetify `theme.themes.light.colors.*` in app options (they win over the blueprint). Ladders don't follow such edits, and the docs say so.
- Shape and size overrides (discouraged): the app's own settings file does `@use 'c-style/settings' with ($button-named-sizes: …)`, passed as `cStyle({ settings: 'src/styles/settings.scss' })`.

---

## 3. Layering strategy

Order of preference. Use the first channel that can express the change.

### 3a. SASS settings (`settings.scss`)

Everything Vuetify exposes as a variable:
- **Global:** `$border-radius-root`, `$rounded`, `$typography` (table below), `$shadow-key`/`$shadow-ambient`, `$elevation-overlay-step: 0%`, `$border-color-root`, `$transition-duration-root`, `$standard-easing: ease`.
- **Named sizes:** `$button-named-sizes`, `$icon-btn-named-sizes`, `$btn-group-named-sizes`, `$chip-sizes`.
- **Density maps:** per decision 4.
- **Icon sizes and gaps:** `$icon-sizes` and the component icon variables (decision 16); the list, field and icon gap variables (decision 17e).
- **Heights and paddings:** `$input-control-height` and `$field-control-height` 40, `$field-control-padding-*`, `$field-input-padding-*`, `$text-field-input-padding-start`, `$selection-control-size: 20px`, `$table-header-height` 40, `$table-row-height` 56, `$table-column-padding: 0 16px`, `$list-item-*`, `$tabs-height` 40, `$chip-height` 32, `$alert-padding` 12, `$snackbar-*`, `$expansion-panel-*`, `$dialog-*`, `$card-*` paddings 20/16.
- **Fonts:** the literal font variables from decision 9.
- **Colors that name a theme role:** `$toolbar-background: rgb(var(--v-theme-surface))`, `$tooltip-background-color` = surface, `$chip-background`, `$alert-background` = surface.
- **Borders:** `$button-border-width: 1px` with a transparent color, `$field-focused-border-width: 1px`, `$field-outline-opacity`.
- **Behavior flags:** `$button-colored-disabled: false`, `$button-text-transform: none`.

| MD3 role | Canon | size/lh | weight | tracking |
|---|---|---|---|---|
| display-large / -medium / -small | stat lg and beyond | 57/64, 45/52, 36/44 | 600 | −0.02em |
| headline-large / -medium / -small | page title lg / md / sm | 30/36, 24/32, 20/28 | 600 | −0.015em |
| title-large / -medium / -small | card/form title lg / md / sm | 18/28, 16/24, 14/20 | 600 | −0.01em |
| body-large / -medium / -small | control lg / md / description md | 16/24, 14/20, 12/16 | 400 | −0.004 / −0.006 / −0.007em |
| label-large / -medium / -small | button md / sm / micro | 14/20, 12/16, 10/16 | 500, 500, 600 | −0.006 / −0.007 / +0.01em |

### 3b. Blueprint defaults (`blueprint.ts`)

Prop-level choices: `global.ripple: false`. VBtn variant and color (decisions 1b and 2) and nested neutral defaults. Every text input (`VTextField`, `VTextarea`, `VSelect`, `VAutocomplete`, `VCombobox`, `VFileInput`, `VNumberInput`, `VDateInput`, `VColorInput`, `VField`) gets `variant: 'outlined'`, `persistentPlaceholder: true`, `hideDetails: 'auto'`. Selection controls get `color: 'neutral'`. Others: `VToolbar` `{ flat: true, height: 64 }`, `VAppBar` `{ flat: true, border: 'b', height: 64 }`, `VNavigationDrawer` `{ width: 264 }`, `VMenu` `{ offset: 4 }`, `VTooltip` `{ openDelay: 500, closeDelay: 250, location: 'top' }`, `VTabs` `{ hideSlider: true }`, `VChip` `{ variant: 'outlined', label: true }`, `VAlert` `{ variant: 'outlined' }` (Canon alert = neutral surface, edge and bar), `VCard` `{ elevation: 2 }`, `VDatePicker`/`VTimePicker` `{ color: 'neutral', elevation: 0 }`, `VPagination` `{ variant: 'text', activeColor: 'neutral' }`, `VProgressLinear` `{ height: 4 }`. Icons: `defaultSet: 'cs'`, `aliases: csAliases`. Theme: from `cStyleThemes`, `defaultTheme: 'system'`.

### 3c. Theme

All color and every light/dark difference (§1.2). The theme is the only place hexes live.

### 3d. `@layer vuetify-overrides` (Vuetify internals)

Mechanics with no variable, default or theme key:
- **Tone context** (`_tone.scss`): `@each` intent, `.text-<i>, .bg-<i>` set `--cs-tone-*` from the intent's role variables. The default `.v-btn`, `.v-chip`, `.v-field` tone is neutral.
- **Custom-property indirection** (the rule that makes 3d work under utility layers): utility classes (`bg-*`, `text-*`) sit in `vuetify-utilities`, above this layer. So never set `color`/`background-color` against them. Re-point the variable they read on the element itself instead, for example `.v-btn--variant-tonal.text-primary { --v-theme-primary: var(--v-primary-text) }` and `.v-btn--variant-flat.bg-primary:hover { --v-theme-primary: var(--v-primary-hover) }`. An element's own declaration always beats the inherited theme value.
- **State model:** Canon swaps backgrounds instead of overlaying. Overlay opacity goes to 0 where Canon replaces the fill, and tints come from the underlay (`background: rgb(var(--cs-tone-tint)); opacity: var(--v-tint-N)`).
- **Focus ring:** `0 0 0 2px ring-offset, 0 0 0 3px focus` on focusables. VBtn's `::after` ring is suppressed.
- **Field frame:** 1px border, control shadow, focus border + 3px halo, intents, readonly dashed, disabled fill, label above (decision 15).
- **Other gaps:** choice line colors and halo, switch geometry if the switch variables can't reach it, table header muted type and hairline rules, segmented tabs track, press scale, hairline dividers.

Selectors use Vuetify classes, with specificity ≤ (0,3,0). No `!important`. Values come only from `--v-*` theme variables and `--cs-*` tokens. Never a hex.

### 3e. Unlayered `.c-*` CSS (Coalesce)

Only for Coalesce's own unlayered CSS and hard-coded props (coalesce §5 table): toolbar elevation, toolbar heights forced by explicit `density` (table toolbar comfortable = 56, editor compact = 48) and extension height, the three raw `<i class="fa …">` glyphs (sized to `--cs-icon`, muted), `c-loader-status` bar height and color, `c-table` header height and fixed-column shadow, the `c-select` menu search field, pagination font sizes, the admin editor label column, `#999` / `rgba(0,0,0,.1)` literals, and datetime/time picker headers. Every selector starts with a `.c-` class (a `verify` lint test greps for violations). `!important` only where Coalesce uses it on the same property.

### 3f. When a component-level rule is justified

A rule in 3d or 3e is allowed only if all of these hold:
1. No SASS variable, default, nested default or theme key expresses it. Check `components/<C>/_variables.scss` and vuetify §4 first.
2. A parity test shows the deviation, and the test passes once the rule is in.
3. The rule reads tokens; it doesn't restate numbers that exist as tokens.

Escalate rather than patch. If the same fix appears in two or more families, move it to a shared partial (`_tone`, `_focus`, `_motion`). If a family's overrides partial passes ~150 lines, stop and look for the global lever that was missed.

---

## 4. Milestones

Each milestone is one agent's sequential unit. It ends with green `verify` tests for its scope and an atomic commit series. Acceptance values are Canon md in light mode unless stated. Every family milestone also checks dark mode, sm/lg contexts, and one non-default brand (`#7c3aed`). Every family milestone also adds the stories for the c- components that consume that family (M7: c-admin-create-btn, toolbar buttons; M8: c-input text/number/enum rows, c-select, c-select-values, c-select-string-value, c-list-page-size; M9: c-input bool rows; M10: c-loader-status, c-app-update-alert; M11: c-select menu, c-list-filters menu; M12: c-table, c-list-pagination, c-display; M13: c-admin-table-toolbar shell; M14: c-datetime-picker) and runs the same assertions on them. A Coalesce deviation found there is first traced to a missed global lever; only a residue caused by Coalesce's hard-coded props or unlayered CSS is deferred to M16.

Notation: `H` = height (`getBoundingClientRect`); colors are computed `rgb()`; "parity" = equal to the Canon iframe element's computed value (±0.5px lengths, exact colors, normalized `box-shadow`).

### M0 — Workspace, harness, baselines
- Root `.gitignore` additions (`node_modules`, `verify/screenshots`, `storybook-static`). Workspace members added (§2.2). `pnpm install` runs with Aspire up.
- `verify/` with `@playwright/test` 1.65, headless Chromium (already cached). Two projects: `app` (`https://localhost:48110`, `ignoreHTTPSErrors`) and `storybook` (`http://localhost:6006`).
- No auth step: the demo uses dummy dev auth. Discover the admin routes at run time (the `/admin` index page lists types) instead of hard-coding model names.
- Baseline screenshots: Home, `/admin`, the example model's table page (`/admin/<Model>`) and editor page (`/admin/<Model>/edit/<id>`, creating a row through the editor if the table is empty), and `/admin/audit`, light and dark → `verify/screenshots/baseline/`.
- **Done when:** `pnpm --filter c-style-verify test --project app` passes a smoke test (admin table renders rows).

### M1 — Package plumbing and demo adoption
- `packages/c-style` with the four entry points, a nearly empty `settings.scss` (one canary), an empty blueprint apart from icons, and `cStyleHtml`.
- The full icon set (decision 12): `cs` Lucide component, all `csAliases`, the Coalesce FA→Lucide map (re-grep `PKG/dist` for `fa fa-`), FA fallback. Icon sizes come later (M6).
- Apply the §2.4 diff, except colors and site.scss pruning.
- Benchmark: Vite cold start and the time from a `settings.scss` save to CSS update, with and without `configFile`. Record the numbers in the commit message. If a settings save takes > 10s, raise it before M3; fallback is to keep volatile values as CSS variables.
- **Done when:** the admin table, editor and audit pages render with no console errors; a canary SASS change (`$button-border-radius: 13px`) shows on `.v-btn` via HMR without restarting Aspire; every `.v-icon` on those pages renders an `svg.lucide` except the 3 raw-`<i>` FA sites; the `csAliases` key-diff unit test passes; and `document.querySelectorAll('style')[0]` holds the layer order. (No pixel diff against the baseline: dropping Roboto, the icon swap and the removed demo defaults change the page on purpose.)

### M2 — Storybook shell and parity harness
- Storybook 10.6.x (`storybook`, `@storybook/vue3-vite`, peer `vite ^8` verified on npm). Pin the newest 10.6 patch that pnpm's `minimumReleaseAge` allows. `viteFinal` adds `cStyle()`. `previewHead` injects `layerOrderStyle`.
- `preview.ts`: `setup(app)` installs Vuetify (`cStyleBlueprint`), `createCoalesceVuetify` and a memory-history router with routes `coalesce-admin-list` and `coalesce-admin-item`. A global decorator wraps each story in `<v-app><v-main>`. Toolbar globals: `theme` (light/dark), `accent` (canon blue, violet `#7c3aed`, emerald `#059669`, rose `#e11d48`, orange `#ea580c`, plus any hex through the URL `globals=accent:xxxxxx`), `size` (sm/md/lg → `.cs-size-*` on the wrapper). The decorator applies them with `useTheme().change()` and `applyCStyleColors`.
- Canon reference: vendor `canon.core.css`, `canon.css`, `canon.js` and the MIT LICENSE from `.refs/canon` into `storybook/public/canon/`. `<CanonFrame :html :scheme :size>` renders an `iframe srcdoc` with those links. It sets `color-scheme` from the theme global and `data-size` from the size global. Markup is copied from `.refs/canon/reference/<component>.html`. Canon colors aren't brand-aware, so parity color checks run with the default palette.
- `<Parity>` story layout: two columns, `data-side="vuetify"` and the CanonFrame. Matching elements carry the same `data-parity="<id>"` on both sides.
- `verify/lib/measure.ts`: `compareParity(page, storyId, ids, props)` reads computed styles from both documents.
- **Done when:** `Parity/Smoke` (a plain Vuetify button beside a Canon button) loads and `verify` reports the expected *failing* diffs. That proves the harness measures. The first `<style>` in the preview iframe holds the layer order. The same helper exposes `compareBox(page, storyId, ids)` (bounding boxes only), which M6 uses for icon and control sizes.

### M2b — Storybook Coalesce domain and mocks
- Runs right after M2: `preview.ts` needs the generated metadata for `createCoalesceVuetify`, and each family milestone adds stories for the c- components that consume it.
- `storybook/domain/`: a C# class library on IntelliTect.Coalesce 6.5.1 (version from `MyProject/Directory.Build.props`) with a DbContext and models that cover every c-input dispatch row (coalesce §1): `Person` (string, multiline, email, tel, url, url-image, color, password, int, decimal, bool, enum, enum[], DateTime, DateOnly, TimeOnly, DateTimeOffset, byte[] file, IFile, `[ManyToMany]` via `PersonTag`, reference to `Company`, string[] and int[] values), `Company`, `Tag`, an `AuditLog`/`AuditLogProperty` pair, static and instance methods (void, object result, file result, string[] suggestions for `c-select-string-value`). `coalesce.json` writes TS into `storybook/src/domain`. Generated C# controllers and DTOs go to an ignored folder; only the TS is committed. It is regenerated with `dotnet coalesce`; it never touches the demo app or Aspire.
- Fallback, if the generator needs more than a library: hand-trim `.refs/coalesce/src/test-targets` to Person/Company/ComplexModel and remove the `createAbstractLoader` code (coalesce §6).
- `src/fixtures/`: deterministic data (static arrays; no random generation) with 30 people and 5 companies. `src/mocks/`: helpers over `mockEndpoint` from `coalesce-vue/lib/test-utils` that implement list (paging, search, sort), get, save, bulkSave, delete and methods, with a configurable delay and failure. Stories register mocks in `beforeEach` and return `destroy` as cleanup.
- **Done when:** a smoke story renders `c-admin-table-page` for Person with 10 rows and pagination, and `c-select` lists companies after typing.

### M3 — Color foundation
- `color/`: palettes (Tailwind v3 hexes for zinc, slate, gray, neutral, stone, blue, green, amber, red, violet, emerald, rose, orange), `generateLadder`, `cStyleThemes`, `applyCStyleColors`. `overrides/_tone.scss` with the indirection pattern.
- Vitest: default themes reproduce Canon role hexes exactly (canon §3.2–3.4). `generateLadder(blue-600)` is within ΔE2000 ≤ 3 of Tailwind blue on every step. The pinned step equals the input hex. `on-*` contrast is ≥ 4.5 for all default solids, warning included.
- Stories: Foundations/Colors (ladders, roles, tints per mode and brand).
- **Done when (Playwright, app):** `.v-application` background is zinc-50 (`rgb(250,250,250)`) light and zinc-950 dark; `.v-card` background is white / zinc-900; `--v-theme-primary` is `37,99,235`; `--v-primary-text` is blue-700 light and blue-300 dark; switching the accent global changes `--v-primary-600` with no reload.

### M4 — Typography
- `inter-ui` font-face in `index.scss`, theme `font-body`, `font-feature-settings`, `$typography`, literal font variables.
- **Done when:** body computed `font-family` starts with `InterVariable`. `document.fonts.check('500 14px InterVariable')` is true. `font-feature-settings` on `.v-application` includes `"ss01"`. A canvas width test of `"a1"` with and without `cv11` differs (the alternates are live). `.text-body-medium` is 14/20 −0.084px. `.text-headline-medium` is 24/32 weight 600.

### M5 — Shape, depth, lines, focus, motion
- `$rounded`, radius root, elevation maps and shadow variables, `_tokens.scss` hairline, `rule-*` opacities, `VDivider` → rule 10% at hairline, `_focus.scss`, `_motion.scss`, ripple off.
- **Done when:** `.elevation-2` box-shadow = edge + raised (normalized string match); `.elevation-5` = edge + overlay; dark alphas per canon §2.7; `.v-divider` border color alpha .10; `.rounded-lg` = 12px; a focused `.v-btn` has box-shadow `0 0 0 2px <ring-offset>, 0 0 0 3px <focus>` and no visible `::after`; no `.v-ripple__container` appears on click.
### M6 — Size, density and icon sizes (the "chunkiness" pass)
- `_tokens.scss` size contexts, density-map zeroing in settings, table density mapping (decision 4), icon sizes (decision 16), and the global height, gap and min-width variables of decision 17. SASS settings only; no component CSS in this milestone.
- `Foundations/Chunkiness` parity story: default-prop instances of VBtn (text, prepend icon, icon-only), VTextField with `prepend-inner-icon` and `clearable`, VSelect, VCheckbox, VSwitch, VListItem with a prepend icon, VChip with an icon, VAlert, VTab, VPagination and a VDataTable sort header, each beside the Canon equivalent, at sm/md/lg.
- **Done when (Playwright, Storybook and app):**
  - Control heights: every control in the story is 32/40/48 by context (±0.5px) against Canon, with `density="compact"` and `density="default"` giving the same height; one-line list items 40; tabs 40.
  - Icon boxes: every `.v-icon` bounding box in the story is 16/20/24 by context and matches the Canon `.canon-icon` box beside it (±0.5px); the Lucide stroke width is 1.5px at each size; in-box buttons hold a 16px icon.
  - Gaps: icon-to-label gap in VBtn, VListItem and VChip equals Canon's control gap (6/8/10).
  - Button min-width is 0 (a one-letter button is narrower than 72px).
  - On the demo's admin table, editor and audit pages, no `.v-icon` is larger than 20px and no control taller than 40px except table rows and toolbars.
- **Review checkpoint (screenshots):** demo Home and admin pages, light and dark, after M3–M6. Hand to the user before component work.

### M7 — Buttons (canon §4 A Button, Button Group, Split Button, Segmented Control, Toggle Chip)
- Components: VBtn (all variants × intents × sizes, icon, prepend/append, loading, disabled, `active`), VIconBtn, VBtnGroup, VBtnToggle (Canon Segmented Control: track zinc-100/800, raised card), VFab, VSpeedDial.
- Levers: named sizes (heights 28/32/40/48/48; padding-inline 7/7/9/11/11; radius 4/4/8/12/12 (`border-radius-pressed` the same; it is a required key); typography label-medium/label-large/body-large; icon 16/16/20/24/24; icon-gap 6/6/8/8/8), defaults, `_btn.scss` (label inset on `.v-btn__content`, tint underlay, solid hover/active via indirection, low-emphasis border-low and control shadow removed on `:active`, neutral icon muting, grey disabled, press scale, busy keeps colors).
- Decide the nested `VBtn` defaults for each Vuetify container that provides its own (decision 2 list), and record the choice per container in the blueprint.
- **Done when (parity vs Canon button page):** for emphasis {high, medium, low, minimal} × intent {default, neutral, danger} × size {sm, md, lg}: H 32/40/48, text x-offset 12/16/20 from the outer edge, radius 4/8/12, font 12/14/16, weight 500, letter-spacing, bg and fg at rest, hover (`page.hover`), active (mouse down) and disabled. Focus ring per M5, and a focused button also shows its hover background (canon §2.8). Icon-only is square H. Group: outer radius only, 1px dividers, pressed fill zinc-100.

### M8 — Text entry (canon §4 B: Text Input, Textarea, Field, Label, Password, Number, Select, Combobox)
- Components: VField, VTextField, VTextarea, VNumberInput, VFileInput, VSelect, VAutocomplete, VCombobox, VDateInput, VColorInput, VOtpInput, VLabel, VMessages, VCounter, VInput details.
- Levers: SASS heights, paddings and fonts; defaults; `_field.scss` (frame, label above, halo, intents via `error` → error tone, readonly dashed, disabled, prefix/suffix wells, clear and reveal in-box buttons at 28px, chevron rotate) plus the Select chip size through `defaults.VSelect.VChip`.
- **Done when (parity vs Canon text-input/field/select pages):** `.v-field` H 40 (32/48 in contexts), border 1px zinc-200, radius 8, input text x-offset 16, font 14/20 weight 400, control shadow; hover border zinc-400; focus border blue-600 + 3px blue-100 halo; error border red-400, focus red-600 + red-100 halo; disabled bg zinc-50, text zinc-400; readonly dashed; label sits 6px above the frame at 14/20/500; message 8px below at 12/16 zinc-500. One-row textarea = 40. Label-above holds for text field, select, autocomplete, combobox and textarea, or the decision-15 fallback is taken and recorded in the commit message. With `label=""` (Coalesce admin inputs) the field's top edge sits at the input's top edge (no reserved label row).
- **Review checkpoint:** forms story plus the demo admin editor.

### M9 — Choices (canon §4 C: Checkbox/Radio, Switch, Fieldset)
- Components: VCheckbox, VCheckboxBtn, VRadio, VRadioGroup, VSwitch, VSelectionControl/Group.
- Levers: glyph components (decision 12b), `$selection-control-size: 20px`, switch variables (track 34×20 + 2px ring, thumb 20), defaults `color: 'neutral'`, `_choice.scss` for line, halo and focus.
- **Done when (parity):** control box 18px in a 20px cell, checkbox radius 5, unchecked line zinc-400, checked fill zinc-900 with a white mark (white fill / zinc-900 mark dark), hover halo 3px zinc-100, label 14/20 at 8px gap, switch track 34×20 off zinc-300 / on zinc-900, thumb 20, disabled tones, focus ring around control + label.

### M10 — Surfaces and feedback (canon Card & Section, Separator, Accordion, Alert, Banner, Toast, Empty State, Skeleton, Spinner)
- Components: VSheet, VCard (+ title, subtitle, text, actions, item), VDivider, VExpansionPanels, VAlert, VBanner, VSnackbar, VSnackbarQueue, VEmptyState, VSkeletonLoader, VProgressCircular, VProgressLinear.
- **Done when:** card radius 12, padding 20, title 16/24/600, description muted, edge + raised; expansion row title 14/20/500; alert radius 12, padding 12, neutral surface, a 4px start bar in the intent's 500 step, icon 20 in step 600, title weight 500; banner tinted intent-50 with an intent-200 line; snackbar = Canon toast (white/zinc-800, radius 12, floating shadow, bar); progress circular stroke currentColor at Canon spinner sizes.

### M11 — Overlays and lists (canon Menu, Popover, Tooltip, Dialog, Drawer, Command Palette)
- Components: VOverlay (scrim = white .85 / zinc-950 .75 with 4px blur), VMenu, VList / VListItem / VListSubheader / VListGroup, VDialog, VBottomSheet, VTooltip, VNavigationDrawer temporary, VHotkey/VKbd.
- **Done when:** menu panel radius 12, padding 4, edge + floating, item H 40, radius 8, text x 16, hover fill zinc-100, selected weight 500 + trailing tick; subheader 10/16/600 uppercase muted; dialog radius 24, card header 72 with a rule line, footer padding 23/24/24; tooltip white with a 1px zinc-200 border, radius 4, 12/16, padding 4/6, raised shadow; popup motion .15s ease-out from scale .97.

### M12 — Data display (canon Table, Data Table, Pagination, Tag, Count, Avatar, Kbd, Description List)
- Components: VTable, VDataTable (+ server/virtual, headers, footer, select column), VDataIterator, VPagination, VChip, VChipGroup (toggle chips), VBadge, VAvatar, VAvatarGroup, VKbd, VCode, VVirtualScroll, VInfiniteScroll, VTreeview, VTimeline.
- **Done when:** table frame radius 12 + edge ring, header H 40 weight 500 muted, no uppercase, hairline rule under; rows 56 / 48 / 40 by density with 7px block padding and 16px inline; hover zinc-100; selected zinc-50; sort arrow muted → strong on hover; pagination item square 40, current page bordered zinc-200 with no fill; chip (tag) H 32 radius 4 at md; filter chip pill, checked = ink inverted; badge = Canon count (16px pill, 10px/500).

### M13 — Navigation and shell (canon App Shell, Nav List, Page Header, Tabs, Breadcrumb, Toolbar)
- Components: VApp/VMain (canvas), VAppBar, VToolbar, VSystemBar, VFooter, VNavigationDrawer (sidebar), VList `nav`, VTabs/VTab/VWindow, VBreadcrumbs, VBottomNavigation, VStepper, VSlideGroup.
- **Done when:** app bar H 64, white/zinc-900, `rule-faint` bottom line, no shadow; drawer 264 wide, white, `rule-faint` end line; nav item H 40, radius 8, gap 10, current fill zinc-100 with weight 500, icon muted → ink when current; tabs = track zinc-100 radius 10 H 40, tab H 34 radius 7, selected white card with Canon tab shadow, rest text zinc-500; breadcrumb muted links, quieter current.
- **Review checkpoint:** full demo shell, light and dark.

### M14 — Pickers and inputs (canon Date family, Time, Slider/Range, Swatches, Color Picker, Rating)
- Components: VDatePicker, VTimePicker, VCalendar, VSlider, VRangeSlider, VColorPicker, VRating, VFileUpload, VConfirmEdit, VCarousel, VImg, VParallax, VResponsive, VSparkline, VPullToRefresh, VHover/VLazy/VNoSsr (render-only stories).
- **Done when:** date picker day cell 40 at button radius 8, selected day ink fill, today ring, header type per Canon calendar; slider track and fill ink, thumb per Canon; color picker panel surface radius 12.

### M15 — (moved to M2b)

### M16 — Coalesce components (unlayered `.c-*`)
- Stories for every c- component and state in the coalesce §6 table, plus `Parity/Coalesce` stories that pair `c-table` with Canon Data Table, `c-admin-editor` with Canon Form Layout, `c-list-pagination` with Canon Pagination, and `c-select` with Canon Select.
- `coalesce/` partials per §3e. Most of the look should already come from M3–M14. Each new rule names the Coalesce selector it neutralizes.
- **Done when (Playwright, both Storybook and the demo app):** admin toolbars have no box-shadow, surface background, title 16/24/600, a rule line below; `.v-toolbar__extension` sits at Canon control row height; `c-table` header H 40 muted, rows 56; fixed actions column uses the Canon pinned-edge band (4px hard shadow, black 5%) instead of `rgba(0,0,0,.4)` blur; `c-loader-status` bar H 4 in accent; editor label column 14/20/500, ink, aligned with the field's first line (Canon `data-label="start"`: margin-top 10); `c-select` menu search field is a Canon field (no filled variant); pagination text 14/20 muted; every `fa` glyph renders at the Canon icon box. The demo's example-model table and editor pages and `/admin/audit` pass the same assertions.
- **Review checkpoint:** demo admin pages side by side with baseline screenshots.

### M17 — Coverage sweep
- `verify/coverage.spec.ts`: enumerate `Object.keys(await import('vuetify/components'))`, drop providers (`VDefaultsProvider`, `VThemeProvider`, `VLocaleProvider`, `VValidation`, `VForm`, `VLayout*`) and sub-parts (`VCardTitle` and the like, covered by their parent), and require a story tagging each remaining component (`parameters.components`). Do the same for every `C*` export of `coalesce-vue-vuetify3`.
- Brand sweep: every parity story at all five accent presets, light and dark, with no console errors. Contrast check: text-on-solid ≥ 4.5 for the generated ladders.
- Lint: `.c-*`-only selectors in `coalesce/`, no hex literals in `overrides/`, no `!important` in `overrides/`.

### M18 — Documentation of usage
- `packages/c-style/README.md`: install, adoption diff, options, size contexts, overrides, known deviations (§7). The user asked for a consumable package, so this file is part of the deliverable.

### M19 — Publishable build (optional, on request)
- `tsdown` (or `vite build --lib`) to `dist/` with `.d.ts`. Exports switch to `dist` with the `sass` condition kept for SCSS. Not needed for the workspace demo.

---

## 5. Storybook plan

- **Location:** `storybook/`, a workspace package (`c-style-storybook`) that depends on `c-style: workspace:*`, so the stories exercise the public API exactly like an app.
- **Version:** `storybook` + `@storybook/vue3-vite` 10.6.x. npm shows 10.6.6 as latest with peer `vite ^5 || ^6 || ^7 || ^8`. 10.6.6 was published today, so pnpm's release-age gate may pick 10.6.5; either is fine. Don't use 11.x (beta).
- **Install of Vuetify + c-style:** `main.ts` `viteFinal` adds `cStyle()` and `unplugin-vue-components` with `CoalesceVuetifyResolver`. `previewHead` adds `layerOrderStyle`. `preview.ts` imports CSS in the §2.3 order and calls `setup()` (M2).
- **Toolbar:** `theme`, `accent`, `size` globals (M2).
- **Inventory:**
  - `Foundations/` Colors, Typography, Radius, Elevation, Sizes, Icons.
  - `Vuetify/<Family>/<Component>` for every component in M7–M14 (families match the milestones). Each story covers variants × states in one grid (rest, hover via `pseudo-states` addon or explicit classes, focus, disabled, error, loading) and all three sizes.
  - `Coalesce/<component>` for all c- components and states in coalesce §6: c-input (one story per dispatch row, plus readonly/disabled/error/hint), c-select (single, multiple, clearable, create, loading, error, empty, max-items, open), c-select-many-to-many, c-select-values, c-select-string-value, c-datetime-picker (datetime/date/time/native/min-max/open), c-display (all types), c-admin-display, c-loader-status (loading, error+retry, success, placeholder), c-table (read, editable, sorted, wide with fixed column), c-list-filters (closed, open, sub-filter, badge), c-list-pagination/-page/-page-size/-range-display (first, middle, last, unknown count), c-admin-table-toolbar, c-admin-table (read, editable dirty, autosave, description), c-admin-table-page, c-admin-editor (create, edit, view-only, autosave, validation, aux buttons, image preview), c-admin-editor-page (loaded, error), c-admin-methods/c-admin-method (params, void, object, file, error), c-admin-audit-log-page, c-app-update-alert (forced visible), c-admin-create-btn (single, multi-type).
  - `Parity/<Canon component>` only for the Canon pages named in a milestone's Done-when (button, button-group, segmented-control, text-input, field, select, checkbox, radio, switch, card, alert, toast, menu, tooltip, dialog, table, data-table, pagination, tag, nav-list, tabs, date) plus `Foundations/Chunkiness`. Everything else is covered by spec assertions, which cost less to keep up.
  - `Pages/` full compositions: an admin shell (app bar + drawer + c-admin-table-page) and a settings form, for screenshot review.
- **Mock data:** the generated Storybook domain plus fixtures and `mockEndpoint` (M2b). Decision: a **dedicated domain**, not the demo's metadata. The demo lacks numbers, multiline, color, url, image, tel, date-only/time, files and string-value methods, and tying stories to the demo couples them to app evolution. Generating with the installed 6.5.1 tool guarantees runtime compatibility, which the `.refs` test-targets don't.
- **Canon reference:** `CanonFrame` iframes the vendored Canon CSS and JS with markup copied from the reference pages. Parity stories place both sides in the same grid with shared `data-parity` ids. The iframe sizes to its content so screenshots line up.

---

## 6. Verification strategy

- **Parity tests** (`verify/parity/*.spec.ts`, Storybook project) are the main gate. They measure Vuetify and Canon in the same page, which avoids hand-copying numbers. Props: block/inline size, padding, border width and color, border-radius, font-size, line-height, font-weight, letter-spacing, color, background-color, box-shadow (normalized: shadows parsed and sorted, colors to rgba). States are driven with `hover()`, `focus()` and `mouse.down()`. Parity runs at md only, plus light/dark × sm/lg contexts. Brand presets get a separate check that colors equal the generated role tokens instead of Canon's blue.
- **Spec assertions** (`verify/app/*.spec.ts`, app project) cover what Canon has no markup for (Coalesce composites, shell). Expected values come from canon.md and live in `verify/lib/canon.ts` with the canon.md section cited in the test name.
- **Unit tests** (vitest in `packages/c-style`) cover color math and theme assembly.
- **Screenshots:** full-page and per-story PNGs only at the review checkpoints (M6, M8, M13, M16) and on failures. `toHaveScreenshot` is not a gate (font and anti-aliasing noise). Screenshots go to `verify/screenshots/<milestone>/` (gitignored). The agent views them and hands paths to the user at checkpoints.
- **Running without restarting Aspire:** Aspire is already up (`https://localhost:48110`). Its ASP.NET host owns the Vite dev server (`UseViteDevelopmentServer`; check `Program.cs` for the port after the demo is regenerated). Frontend edits rely on HMR. Edits to `vite.config.ts` make Vite restart itself in-process. `pnpm install` is safe while running; Vite re-optimizes deps and reloads. Never run `pnpm build`, `pnpm dev` or `dotnet run` in the Web project, and never restart AppHost. If the Vite server dies, stop and report rather than restart Aspire. Storybook runs on its own (`pnpm --filter c-style-storybook storybook`, port 6006). Attach its URL to the task while it runs. The StorybookDomain generator runs `dotnet coalesce` in `storybook/domain` only.

---

## 7. Risks and open questions

| Risk | Mitigation |
|---|---|
| `configFile` compile cost (≈100 SASS modules; every settings save recompiles all) | Benchmarked in M1 with a 10s threshold. Settings stabilize after M6; later work is CSS partials, which hot-reload alone. |
| Sass loads `vuetify/settings` via two real paths (pnpm global virtual store), so the config silently doesn't apply | Vuetify is a peer of c-style. The M1 canary test fails loudly if the config isn't applied. |
| Label-above field restyle fights Vuetify's JS notch and floating-label logic across select/autocomplete/combobox/textarea | Time-boxed in M8, with decision 15's fallback. |
| Custom-property indirection depends on Vuetify utilities reading `--v-theme-*` rather than literal values | Holds in 4.3.2 (`theme.ts`). The parity tests catch a regression on upgrade. |
| Vite 8/Rolldown CSS ordering (vuetify#22752) reorders layer declarations | Layer statement injected in HTML and repeated at the top of `c-style/styles`. Single styles chunk kept. |
| Coalesce hard-coded props and unlayered CSS change across versions (6.5.1 ≠ source) | Style against `PKG/dist` only. The `.c-*` partials are small and versioned. Recheck on upgrade. |
| Generated ladders drift from Tailwind spacing for very light or dark brand hexes | Pinning to the nearest step, plus an override with a full ladder object. Unit tests cover yellow, cyan and near-black inputs. |
| Storybook 10.6.6 is one day old | Release-age gate. Fall back to 10.6.5. |
| `inter-ui` CSS path names | Verify the file layout at M4. Fall back to declaring `@font-face` with the package's woff2 URL. |
| Coalesce FA literals | Strings passed through `v-icon` are mapped to Lucide by the `cs` set (decision 12). Only 3 raw `<i class="fa">` elements stay FA, sized and muted by §3e; a Coalesce upgrade that adds new FA names falls back to FA until the map is extended (M1 re-greps `PKG/dist`). |
| A theme class on the same element (`<v-btn theme="dark">`) declares `--v-theme-*` in `vuetify-utilities`, which beats the §3d re-point on that element | Rare. Document it; nested theme providers (a theme on an ancestor) are unaffected. |
| StorybookDomain generation needs a web project or a build | Fallback to trimmed test-targets (M2b). |

Open questions (defaults chosen; the user can overturn them):
1. Default VBtn emphasis `tonal` changes how existing app buttons look (Vuetify's default is elevated). Chosen for Canon fidelity.
2. Canon has no x-large; `x-large` equals `large`. Alternative: extrapolate to 56.
3. Table `comfortable` = 48 is an interpolation. Canon's spacious (72) is reachable only through a `.cs-density-spacious` class, if wanted.
4. Neutral palette: plain zinc by default, with a brand-tinted neutral available as an option. Should brand themes tint neutrals by default?
5. Coalesce row actions and toolbar buttons are neutral through nested defaults. Is that the intended Canon reading for admin pages, or should primary actions (Save) stay accent? The current plan keeps Coalesce's explicit `color="success"`/`"primary"` where it sets one.

---

## 8. Review notes

Senior review of this plan against `.refs/vuetify` (v4.3.2), the Coalesce 6.5.1 research and canon.md §6. Clear-cut fixes are already applied above: density maps (decision 4), internal `VBtn` default providers (decision 2), the icon pipeline and sizes (decisions 12, 16, 17), the M6 chunkiness pass with measured acceptance, the domain milestone moved to M2b, Coalesce consumer stories in each family milestone, M1 acceptance, empty-label fields, focus showing hover, scoped parity pages, the vuetify devDependency pin, and the dropped font preload.

Verified against source, no change needed: `@forward 'vuetify/settings' with (… !default)` lets an app `@use 'c-style/settings' with (…)`; `$rounded` and `$shadow-key`/`$shadow-ambient` are `map-deep-merge`d with the configured map, so redefining keys works; `$button-named-sizes` requires all five sizes and the keys `height typography padding-inline icon-size border-radius border-radius-pressed` (M7 must supply `border-radius-pressed`); theme `variables` emit `--v-<key>` with `#hex` → triplet; `.bg-*`/`.text-*` read `--v-theme-<key>` on the element, so the §3d re-point works; `defaultTheme: 'system'` exists; `@lucide/vue` 1.70.0 and `inter-ui` 4.1.1 are on npm. Ladder generation runs synchronously in `createVuetify`, before mount, so there is no flash in this SPA.

Judgment calls for the orchestrator or user:

| # | Issue | Severity | Recommendation |
|---|---|---|---|
| R1 | Size contexts (`.cs-size-sm/lg`) need a re-point rule for each family's runtime variables, and every family milestone checks them. That multiplies component-level CSS and test time for a feature Coalesce apps don't use (they render md). | Medium-high | Keep the `--cs-*` tokens and `$icon-sizes: var(--cs-icon)` (free). Ship per-instance `size` through named sizes. Move the context re-point rules and their sm/lg checks out of M7–M14 into one milestone after M14, and cut it if the user doesn't need contexts. |
| R2 | Global `VBtn` `color: 'primary'` + `variant: 'tonal'` turns every unspecified button in existing apps blue-tinted, including Coalesce's bare `variant="text"` buttons outside the containers that get neutral nested defaults. | Medium | Keep (Canon's default intent is the accent), but list in M7 every Coalesce button that ends up accent-colored and confirm with the user at the M8 checkpoint. Open question 5 covers the admin Save button. |
| R3 | `VCardActions` provides `variant: 'text'`, so Canon form and dialog footers, and the Coalesce editor's Save, render minimal unless the blueprint sets `VCardActions.VBtn`. | Medium | Decide in M7. Suggested: `VCardActions: { VBtn: { variant: 'tonal' } }`, with Coalesce Save keeping its explicit color. |
| R4 | Label-above (decision 15) is the largest single piece of component CSS and the riskiest. Its fallback changes M8's acceptance and the look of every form. | Medium | Spike it as a half-day prototype at the M6 checkpoint, across text field, select, autocomplete and textarea, so the decision is made before M8 starts. |
| R5 | Over-engineering: `cStyleThemes(palette, { name })` multi-brand themes, the neutral `{ tint, amount }` option, arbitrary hex accents via URL globals, `.cs-density-spacious`. | Low | Cut the first two until a user asks; the preset accents in Storybook are enough. Keep `generateLadder` and `applyCStyleColors`, which the brand presets need. |
| R6 | The parity harness (Canon iframe + `compareParity`) costs one milestone plus upkeep per story. | Low | Worth it: it is the only objective check for "chunkiness" and spacing, and Canon ships reference markup. Scope is now limited to the listed pages. |
| R7 | `$icon-sizes` named steps other than `default` are fixed px, so `<v-icon size="small">` doesn't follow the size context. | Low | Accept; Canon has no per-instance icon sizes beyond the context. |
| R8 | `$loading` is the alias Coalesce uses for its Reload buttons (`mdi-cached` in Vuetify's MDI set), not a spinner. | Low | Map `$loading` to Lucide `refresh-cw`, not `loader`, in `csAliases`. |
| R9 | Importing `culori` whole adds ~40 kB to every app. | Low | Import from `culori/fn` (tree-shakeable) in `color/`. |
| R10 | Storybook's Vite builder probably runs plugin `transformIndexHtml` hooks on `iframe.html` (not checked against builder-vite source), in which case `cStyleHtml` and `previewHead` both inject the layer order. | Low | Harmless either way (a repeated order statement is a no-op). Keep both; M2 checks the first `<style>` in the preview iframe. |

### 8.1 Orchestrator decisions

All R1–R10 recommendations are accepted:

- R1: keep the `--cs-*` size tokens and `$icon-sizes: var(--cs-icon)`. The sm/lg context re-point rules and their checks move to one milestone after M14 (M14b), which is optional.
- R2: keep the accent + `tonal` global default. M7 lists every Coalesce button that turns accent; the user confirms at the M8 checkpoint.
- R3: `VCardActions: { VBtn: { variant: 'tonal' } }`.
- R4: spike label-above at the M6 checkpoint, before M8.
- R5: cut multi-brand theme names, the tinted-neutral option, URL hex globals and `.cs-density-spacious`.
- R6–R10: as recommended.

The user's standing priority: Vuetify reads as too chunky, and its icons are too big and too playful. When a milestone has to choose, it picks the global lever that makes things lighter and smaller.
