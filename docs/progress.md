# c-style progress log

Running log of milestones from `docs/plan.md`: what each did, acceptance results, deviations.

## Working notes (all milestones)

- The pnpm workspace root is `MyProject/`. `packages/*`, `storybook` and `verify` sit outside it, so **run pnpm only from `MyProject/`** with `--filter` (`pnpm --filter c-style test`, `pnpm --filter c-style-verify test --project app`). Running `pnpm` inside `packages/c-style` or `verify` makes pnpm treat that folder as a standalone project: it writes a stray `pnpm-lock.yaml`/`pnpm-workspace.yaml` there and relinks the global virtual store. Plain binaries (`node_modules/.bin/tsc`) are safe anywhere.
- Single Vuetify copy: `MyProject/MyCompany.MyProject.Web/node_modules/vuetify` and `packages/c-style/node_modules/vuetify` must resolve to the same real path, or Sass applies none of `c-style/settings`. The `plumbing.spec.ts` settings canary catches it.
- Demo checks without breaking HMR: `node_modules/.bin/vue-tsc --noEmit -p tsconfig.json` in the Web project. Never `pnpm build` there.
- Cold-start benchmark harness (second Vite on :22999 with its own cache, `/api` proxied to Aspire): `scratchpad/bench/run.sh <label>`; HMR timing: `scratchpad/infra/pw/hmr-canary.mjs`.
- **Global-store relinks break the running Vite.** When any `pnpm install` changes Vuetify's peer graph (adding Storybook did), the store link for `vuetify` moves to a new hash. `vite-plugin-vuetify` caches `resolveVuetifyBase()` through `require.resolve` for the life of the Node process, so `vuetify/styles` then resolves to a 404 virtual id (`/<hash>/node_modules/vuetify/lib/styles/main.sass`). A config reload doesn't help; the Vite process must restart. Kill only the Vite child (`pgrep -f "vite.js --port 22268"`); Coalesce's `ViteDevelopmentServerMiddleware` relaunches it on the same port within seconds. Aspire stays up.
- `pnpm run`/`--filter … test` first verifies deps and runs an install, so a placeholder in `allowBuilds` (`esbuild: set this to true or false`) fails every script. Fixed (`esbuild: false`).

## M0 — Workspace, harness, baselines (done)

- Root `.gitignore`: `node_modules/`, `verify/screenshots/`, `verify/test-results/`, `verify/playwright-report/`, `storybook-static/`.
- `MyProject/pnpm-workspace.yaml` packages: `../packages/*`, `../storybook`, `../verify`.
- `verify/` (`c-style-verify`): `@playwright/test` 1.65.0, Chromium headless, projects `app` (`https://localhost:48110`, `ignoreHTTPSErrors`), `storybook` (`http://localhost:6006`, testDir `parity/`, not created yet) and `capture`.
  - `lib/admin.ts`: discovers model types from `/admin` at run time; finds an editor URL (first row, or creates one).
  - `app/smoke.spec.ts`: admin table renders rows.
  - `capture/baseline.spec.ts`: Home, `/admin`, `/admin/<Model>`, its editor, `/admin/audit`, light + dark → `verify/screenshots/baseline/`. Run with `pnpm --filter c-style-verify baseline`.
- Acceptance: `pnpm --filter c-style-verify test --project app` passes (smoke). Baselines captured before any c-style change (10 PNGs).
- Deviation: a third Playwright project, `capture`, skipped unless `CAPTURE=1`, keeps screenshot capture out of the test run.

## M1 — Package plumbing and demo adoption (done)

### Package API (`packages/c-style`, ships source)

| Entry | Exports |
|---|---|
| `c-style` | `cStyleBlueprint()` → Vuetify `Blueprint` (M1: icons only; `colors` option arrives in M3). `csIconOptions` (Vuetify `icons` options). `cs` (IconSet), `csAliases` (all 65 Vuetify aliases → Lucide), `csIcon(LucideIcon, props?)`. `layerOrderCss`, `layerOrderStyle` (`<style>` string for `previewHead`). |
| `c-style/vite` (Node) | `cStyle({ settings?, vuetify? })` → `[...vite-plugin-vuetify, c-style:layer-order, c-style:serve]`. `cStyleHtml()` (layer-order injection alone). `settingsFile` (absolute path). `layerOrderCss`, `layerOrderStyle` (same as the browser entry). |
| `c-style/settings` | `@forward 'vuetify/settings' with (… !default)`. M1: `$border-radius-root: 8px` (the canary). |
| `c-style/styles` | Vuetify layer-order statement. Later milestones add tokens and `@layer vuetify-overrides` partials. |

Consumer wiring (as applied to the demo):

```ts
// vite.config.ts
import { cStyle } from "c-style/vite";
plugins: [vue(), /* … */, cStyle()]          // replaces vite-plugin-vuetify's createVuetify()

// main.ts, CSS order
import "@fortawesome/fontawesome-free/css/all.css";
import "coalesce-vue-vuetify3/styles.css";
import "vuetify/styles";
import "c-style/styles";
import "@/styles/site.scss";

createVuetify({ blueprint: cStyleBlueprint(), /* app options win */ });
```

Icons:
- Aliases (`$close`, `$dropdown`, `$loading`, …) are Lucide components wrapped by `csIcon`: `stroke-width 1.5` + Lucide `nonScalingStroke` (vector-effect), `width/height 1em`, so the stroke is 1.5 screen px at any `.v-icon` size.
- String icons go to the `cs` set: a FontAwesome string whose name is mapped (`"fa fa-clock cursor-pointer"`) renders Lucide and keeps non-FA classes; anything else renders as class names (FontAwesome/MDI still work). `fa:`-prefixed strings use Vuetify's FA set.
- App icons: `<v-icon :icon="csIcon(House)" />` (cached per icon, safe in templates).
- Map: every `fa-*` in `coalesce-vue-vuetify3@6.5.1/dist` (20 names, incl. `fa-edit`, which the plan's list missed) plus the Coalesce template shell's names (home, palette, cogs, moon, clipboard-list, lock-open).

### Demo adoption (§2.4 minus colors and site.scss pruning)

- `package.json`: `+ "c-style": "workspace:*"`, `- @fontsource/roboto`.
- `vite.config.ts`: `createVuetify({ autoImport })` → `cStyle()`.
- `main.ts`: Roboto imports and the FA icon set removed, `c-style/styles` imported after `vuetify/styles`, `blueprint: cStyleBlueprint()`, `inputDefaults` and `VSwitch: { color: "primary" }` removed. The empty `theme` block stays until M3.

### Acceptance

- Unit (`pnpm --filter c-style test`, 10 pass): `csAliases` keys = `vuetify/iconsets/mdi` keys; every Coalesce dist FA name is mapped; `cs` set rendering; stroke attributes; `index.scss` layer statement = `layerOrderCss` = Vuetify's `layers.css` structure. `tsc --noEmit` clean.
- App (`pnpm --filter c-style-verify test --project app`, 6 pass): admin table, editor and audit pages have no console errors; every `.v-icon` except `i.v-icon.fa` is `svg.lucide`; stroke attributes present; first `<style>` holds the layer order; `.v-btn` radius 8px (settings reach component CSS).
- HMR canary: adding `$button-border-radius: 13px` to `settings.scss` showed on the open page's `.v-btn` in 4.2s, revert in 3.2s, no full reload, no Aspire restart.
- Demo `vue-tsc --noEmit` clean. ESLint on `main.ts` reports one pre-existing prettier error (template's double blank line before `const app`), untouched.

Benchmark (second Vite instance, empty cache, `/admin/Widget` first load to rows visible):

| | server ready | first load | warm reload |
|---|---|---|---|
| no `configFile` (before M1) | 0.6s | 0.83s | 0.71s |
| `configFile` (c-style) | 0.6–0.85s | 4.2–4.4s | 0.74–0.76s |
| settings save → CSS on page | | 3.2–4.2s (HMR) | |

Below the 10s threshold; no need for the CSS-variable fallback.

### Deviations from plan

1. **Stroke mechanism:** Lucide `nonScalingStroke` instead of `absoluteStrokeWidth` (deprecated in `@lucide/vue` 1.x, and it needs a numeric size, while `.v-icon` sizes by font-size).
2. **Aliases are components, not `cs:` strings.** `cs` handles only strings (FA map + class fallback). `csIcon` and `csIconOptions` are extra exports.
3. **Raw FontAwesome sites in 6.5.1** differ from the plan's "3 sites": `c-admin-table` row actions (`<i class="v-icon fa fa-save|fa-edit|fa-ellipsis-h|fa-trash-alt">`, the only ones carrying `.v-icon`), `fa-info-circle` descriptions in `c-admin-table` and `c-admin-editor`, the editor's `fa-asterisk`, and `c-display`'s password `fa-eye`/`fa-eye-slash`. All stay FontAwesome; M16 handles them.
4. **Template shell names mapped** too, so the demo's drawer/menu icons are Lucide.
5. **Permanent canary** is `$border-radius-root: 8px` (Canon's control radius) rather than a 13px button radius; 13px was used only for the HMR timing and reverted.
6. **`cStyle()` adds a `c-style:serve` plugin:** appends the package root to `server.fs.allow` (the demo sets an explicit allow list that excludes `packages/`; when the app sets none, it keeps Vite's workspace-root default) and pre-bundles `@lucide/vue`.
7. `$checkbox*`/`$radio*` are Lucide placeholders (`TODO(M9)`) until the decision-12b glyph components.
8. `c-style` devDependency `coalesce-vue-vuetify3@6.5.1` (for the FA coverage test) and `types` conditions on `./settings`/`./styles` (TS 6 rejects untyped side-effect imports).
9. Accidental `pnpm` run inside `verify/` and `packages/c-style` (see Working notes) relinked Vuetify in the global store; both links now point to one real path. The running Vite picked the new path up when `vite.config.ts` changed (in-process restart). No Aspire or Vite process restart.

### For the Storybook designer (M2/M2b)

- `.storybook/main.ts` (Node): `import { cStyle, layerOrderStyle } from "c-style/vite"`; `viteFinal: (c) => mergeConfig(c, { plugins: [cStyle()] })`; `previewHead: (head) => layerOrderStyle + head`. Don't import `c-style` (TS source, browser-only) from `main.ts`.
- `preview.ts`: CSS in §2.3 order, `createVuetify({ blueprint: cStyleBlueprint() })`. `applyCStyleColors` and the `colors` option land in M3; until then the accent global has nothing to call.
- Icons: use `$alias` names or `csIcon(LucideIcon)`; FontAwesome strings Coalesce uses already map to Lucide.
- Run pnpm from `MyProject/` only.

## API changes

Since M1 (all additive except the blueprint signature, which only gained an optional argument):

| Change | Where |
|---|---|
| `cStyleBlueprint(options?: { colors?: CStyleColors })`; the blueprint now also sets `theme` (`defaultTheme: 'system'`, `light`/`dark` from `cStyleThemes`) and `defaults` (ripple off; text inputs `variant: 'outlined'`, `hideDetails: 'auto'`). | `c-style` |
| New: `cStyleThemes(colors?)` → `{ light, dark }` Vuetify theme definitions; `applyCStyleColors(useTheme(), colors?)` recolours a running app in place (no reload). | `c-style` |
| New: `generateLadder(hex)`, `palettes` (Tailwind v3: zinc slate gray neutral stone red orange amber yellow lime green emerald teal cyan sky blue indigo violet purple fuchsia pink rose), `steps`; types `CStyleColors`, `CStyleBlueprintOptions`, `ColorInput`, `Ladder`, `PaletteName`, `Step`. | `c-style` |
| `CStyleColors`: `{ primary, neutral, success, warning, error, info, dark: {…same} }`, each a hex, a palette name or a full ladder. `info` defaults to `primary`. | `c-style` |
| CSS contract (theme variables, emitted by Vuetify as `--v-*`): ladders `--v-<intent>-<step>` (intents `primary neutral success warning error info`); role tokens `--v-<intent>-{text,tint,hover,active,border-low,line,line-hover,halo,bar}`; neutral roles `--v-{muted,quiet,frame,frame-hover,choice-line,fill-hover,fill,fill-strong,segment,disabled-bg,disabled-fg,focus,focus-choice,ring-offset,scrim}`; `--v-tint-1…4`, `--v-rule-opacity`, `--v-rule-faint-opacity`; `--v-shadow-{edge,control,raised,floating,overlay}`, `--v-elevation-0…5`; `--v-font-{body,heading,mono}`. Colour tokens are `r, g, b` channel lists: `rgb(var(--v-primary-text))`. | theme |
| CSS tokens: `--cs-control-height/-pad/-font/-lh`, `--cs-tracking`, `--cs-icon`, `--cs-gap`, `--cs-radius`, `--cs-surface-radius`, `--cs-inset`, `--cs-input-gap`, `--cs-shell-inset`, `--cs-hairline`; size classes `.cs-size-sm/.cs-size-md/.cs-size-lg`. Only `--cs-icon` (default-size icons) follows the size class so far; the Vuetify re-point rules are M14b (R1). | `c-style/styles` |
| `c-style/styles` now self-hosts InterVariable (`inter-ui`, via a CSS `@import`), sets Inter's alternates on `:root`, and adds the tone context, focus ring and press motion in `@layer vuetify-overrides`. | `c-style/styles` |
| New deps: `culori`, `inter-ui`; dev `@types/culori`. | package.json |
| M7–M11 blueprint defaults (additive; app options still win): `VBtn { color: 'primary', variant: 'tonal' }`; neutral minimal `VBtn` nested in VToolbar, VToolbarItems, VTable, VDataTable, VField, VList, VAlert, VSnackbar; `VCardActions.VBtn { variant: 'tonal', slim: false }`; `VBtnGroup { color: 'neutral', variant: 'outlined', divided: true }`; text inputs `singleLine`, `persistentPlaceholder`; `VField.class: 'cs-label-above'` (toolbars: `cs-label-inside`, no persistent placeholder); `VSelectionControl { color: 'neutral' }`; `VSwitch { thumbColor: 'surface' }`; `VAlert { variant: 'outlined', border: 'start' }`; `VProgressCircular { size: 20, width: 1.5 }`; `VProgressLinear { height: 4 }`; `VMenu { offset: 4, transition: 'cs-popup', VList.class: 'pa-1', VListItem.rounded: 'md' }`; VSelect/VAutocomplete/VCombobox `transition: 'cs-popup'`; `VTooltip { openDelay: 500, closeDelay: 250, location: 'top', offset: 4 }`. | `c-style` |
| `$checkbox*`/`$radio*` aliases are c-style SVG glyphs (`.cs-choice`), no longer Lucide. | `c-style` |
| Theme variable `--v-track` (switch track at rest). | theme |
| CSS classes: `cs-label-above` / `cs-label-inside` (on `.v-field`), transition name `cs-popup`. Cascade sublayer `vuetify-utilities.c-style` (custom-property re-points only). | `c-style/styles` |
| `cStyle()` dev server also allows `inter-ui`'s directory. | `c-style/vite` |

For Storybook: the accent global can call `applyCStyleColors(useTheme(), { primary: hex })`; the theme global `useTheme().change('light'|'dark')`; the size global puts `.cs-size-*` on the wrapper (icons follow; controls follow after M14b).

## M3 — Colour foundation (done)

- `src/color/palettes.ts` (Tailwind v3 hexes), `src/color/ladder.ts` (`generateLadder`, `resolveLadder`), `src/theme/{palette,roles,elevation,typography,index}.ts` (`cStyleThemes`, `applyCStyleColors`), `styles/overrides/_tone.scss` (intent classes → `--cs-tone-*`; no consumers until M7).
- Roles per plan §1.2 / decisions 5–7: solids at 600 in both modes with explicit `on-*`; warning amber-400 on amber-950; neutral/secondary invert (zinc-900/white); canvas zinc-50/950; surfaces white/zinc-900, bright white/zinc-800. Vuetify's leftover `primary-darken-1`/`secondary-darken-1` are overwritten with ladder steps so no stock hex survives.
- Unit (`packages/c-style/test/color.spec.ts`): every palette hex equals Canon's `base.css` wherever Canon defines the step; `generateLadder(blue-600)` within ΔE2000 3 of Tailwind blue on every step; pinned step equals the input and lightness strictly decreases for violet, emerald, rose, orange, yellow, cyan, near-black and slate inputs; default roles match canon §3.2–3.5; brand and `dark` overrides; `applyCStyleColors` mutates registered themes.
- App (`verify/app/color.spec.ts`): `.v-application` bg zinc-50 / zinc-950, `.v-card` white / zinc-900, `--v-theme-primary` `37,99,235`, `--v-primary-text` blue-700 / blue-300. The live accent switch is unit-tested here; the Storybook global is the designer's.
- Demo: `cStyleBlueprint({ colors: { primary: "#2563eb" } })`, the empty `theme` block removed. Decision 11's optional cleanup applied too: `color: "primary"` dropped from `titledAdminPage` and from `<v-app-bar>`, so toolbars are neutral surfaces.

## M4 — Typography (done)

- `inter-ui` `inter-variable.css` imported by `c-style/styles` (Sass hoists the `@import` above the layer statement; fine, `@font-face` isn't layered). `--v-font-body/heading` = `InterVariable, Inter, ui-sans-serif, system-ui, sans-serif`; `--v-font-mono` JetBrains Mono first.
- `$typography` remapped (`styles/_typography.scss`, table in plan §3a). Literal fonts set: field 14 (−0.006em), label 14, messages 12/16, tooltip 12/16, toolbar title 16/24/600, expansion title 14, list title 14/20, subtitle 12, subheader 10/600, card title 16/24/600, alert title 14/20/500.
- App (`verify/app/type.spec.ts`): `.v-application` font starts `InterVariable`; `document.fonts.check('500 14px InterVariable')`; `font-feature-settings` has `"ss01"` and `cv11` changes rendered width; `.text-body-medium` 14/20/−0.084px; `.text-headline-medium` 24/32/600.

## M5 — Shape, depth, lines, focus, motion (done)

- Radius: root 8, `$rounded` = Canon ladder; card/alert/expansion/menu/select/autocomplete/combobox/snackbar 12, dialog 24, tooltip 4, chip label 4.
- Elevation: `$shadow-key` 0–5 = `var(--v-elevation-N)`, `$shadow-ambient` transparent; theme variables per mode (1 control, 2 edge+raised, 3–4 edge+floating, 5 edge+overlay; dark alphas per canon §2.7). Component elevations: card 2, menu/select 3, snackbar 3, dialog 5, temporary drawer 5, app bar 0, chip 0, alert 0, buttons 0 at every state (elevated = flat).
- Lines: `--cs-hairline` 1px (0.5px at ≥2dppx); `VDivider` = `rgba(border-color, rule-opacity)` at the hairline.
- `_focus.scss`: `0 0 0 2px ring-offset, 0 0 0 3px focus` on focus-visible `.v-btn/.v-chip/.v-list-item/.v-expansion-panel-title`; Vuetify's `::after` ring hidden. `_motion.scss`: button colours 0.12s, press `scale .98` 0.1s ease-out on worded buttons (not icon buttons or group halves), none under reduced motion. Ripple off in the blueprint. `$standard-easing: ease`, `$transition-duration-root: .15s`.
- App (`verify/app/shape.spec.ts`): `.elevation-2` = edge + raised and `.elevation-5` = edge + overlay, light and dark; `.rounded-lg` 12px; `.v-divider` `rgba(0,0,0,.1)`; keyboard-focused toolbar button shows the ring (white 2px + blue-600 1px) with `::after` opacity 0; no `.v-ripple__container` on press.

## M6 — Size, density, icon sizes: the chunkiness pass (done)

SASS only, no component CSS. `styles/_sizes.scss` + `settings.scss`:
- Icons: `$icon-sizes` default = `var(--cs-icon)` (20 at md; was 1.5em = 21–24px), x-small 12, small 16, large 24, x-large 32; icon-btn sizes 28/32/40/48/48 with 16/16/20/24/24 icons.
- Buttons: `$button-named-sizes` x-small 28 / small 32 / default 40 / large 48 / x-large 48; padding 8/12/16/20/20 (Canon control padding + label inset); radius 4/4/8/12/12; type 12/16, 14/20, 16/24 at 500; icon 16/16/20/24/24; icon gap 6/6/8/10/10; no min-width (was `height × 16/9`). `<v-icon start>` margins re-derived (multipliers −6.67 / 5) so the icon sits 10px in with an 8px gap at md.
- Density: button, stacked button, selection control, list, tabs, chip, avatar, alert, banner, breadcrumbs, colour-pip and time-picker maps flattened to 0. Tables keep 56/48/40 (Vuetify's own map already gives that from a 56 base).
- Fields: 40px with 10px vertical padding at every density (see deviation 1). Input/field font 14/20.
- Heights and gaps: list items 40 (two-line 56), icon→title 10, action spacer 8, avatar gap 12; tabs 40; expansion title 40 (padding 10/16); table header 40, rows 56; selection control 20; button group 40; alert padding 12, icon 20.
- App (`verify/app/size.spec.ts`) on the Widget table, its editor and `/admin/audit`: every `.v-icon` ≤ 20px and every default-size icon exactly 20×20 (raw FA `<i>` excluded); every `.v-btn/.v-selection-control/.v-list-item/.v-chip/.v-tab` ≤ 40px; every `.v-field` exactly 40 whatever its density (Coalesce passes `compact` and `comfortable`); toolbar buttons have no min-width and an 8px icon→label gap; nav items 10px icon→title.
- Not covered here (Storybook `Foundations/Chunkiness` is the designer's): parity against Canon's iframe at sm/lg, the in-box 16px icon, chip gap. Measured chip icon→label gap is ~6px, not 8 (M12).

### M6 checkpoint (screenshots)

`verify/screenshots/m6/` — home, admin, admin-table, admin-editor, admin-audit × light/dark; baseline in `verify/screenshots/baseline/`.

Before → after:
- Type: Roboto → InterVariable with Canon's alternates; titles 600 instead of 400; tighter tracking.
- Colour: Vuetify's `#1867C0` primary app bar and admin toolbars → neutral white / zinc-900 surfaces; zinc-50 / zinc-950 canvas; Canon blue only on accents.
- Icons: FontAwesome solid glyphs at 24px → Lucide 1.5px strokes at 20px (row actions still FA, M16).
- Controls: fields 40 (were 40 compact in Coalesce, 56 elsewhere); buttons 40 with content-width (were 36 with 64px min-width); list items 40 (were 48); table header 40 (was 56), rows 56.
- Shape and depth: 8px controls, 12px cards with Canon's edge + raised shadow instead of MD shadows.
- Still Vuetify/Coalesce-looking (later milestones): Coalesce toolbars keep `elevation="4"` and their 48/56 heights (M16); the toolbar search field and row actions (M8/M16); button variants and hover recipes (M7); field frame colours, halo, label (M8); nav item selected fill, app bar rule line (M13).

## R4 spike — label above the field (done, not merged)

Prototype: `docs/spikes/label-above/` (`label-above.scss`, a throwaway Vite harness, screenshots `label-above.png` vs `vuetify-floating.png`).

Mechanism: blueprint default `singleLine: true` on text inputs (Vuetify then renders one in-field label and runs no floating-label FLIP animation), plus ~25 lines in `@layer vuetify-overrides` scoped to `.v-field--variant-outlined.v-field--single-line`: the label is positioned against the field (`.v-field__field { position: static }`), placed `bottom: calc(100% + 6px)`, always visible, 14/20/500 ink; the field reserves `lh + 6px` of margin only when a label exists. `persistentPlaceholder: true` keeps placeholders visible.

Measured (harness, 14 cases: text, filled, `label=""`, prepend-inner + clearable, hint, error, select ×2, autocomplete with chips, combobox, one-row textarea, disabled, readonly, `density="compact"`): label 14px/20px/500, exactly 6px above the frame, left edge flush with the frame; frame 40px in every case; `label=""` reserves nothing; label stays put while focused and typing (no flicker; checked 30ms after focus), with the select menu open, with a 3-line textarea (frame 80), and in the error state (label stays ink, message below).

Recommendation: adopt in M8 as decision 15's primary path, merged into `overrides/_field.scss` with the `singleLine`/`persistentPlaceholder` defaults. Caveats to accept: `single-line` is repurposed (an app passing it explicitly gets the label above, not hidden); other variants (`filled`, Coalesce's c-select menu search) keep Vuetify's floating label; the hint/message offset (8px below) and label typography in sm/lg contexts are M8 work.

## Deviations (M3–M6)

1. **Field height lever:** instead of zeroing `$input-density`, every density is −3 (−12px) on a 52px base. Vuetify hard-codes `16px + density/2` for the outlined/single-line field padding and `--v-input-padding-top`; the uniform modifier turns those into 10px and the base into 40px with no CSS, and density still never changes size.
2. **Success contrast:** white on green-600 is 3.3:1. Kept for Canon parity; the ≥ 4.5 unit test covers primary, error, info, warning and neutral.
3. **Ladder model:** `generateLadder` models each input on the Tailwind palette nearest in hue (greys on the grey palettes) and keeps that palette's hue drift, offset by the input hue, rather than a single reference curve with constant hue. It reproduces Tailwind for Tailwind inputs and keeps brand ladders monotonic.
4. Theme assembly lives in `src/theme/` (plan said `color/themes.ts`).
5. `$elevation-overlay-step` has no `!default` in Vuetify, so it can't be configured; the overlay only paints under the opt-in `.elevation-overlay` class, so nothing to do.
6. **Pulled forward from M8:** text-input defaults `variant: 'outlined'`, `hideDetails: 'auto'` (removing the demo's own defaults in M1 had left `/widget` fields filled). `persistentPlaceholder`/`singleLine` wait for M8 with the spike.
7. Button `x-large` = `large` (48), per open question 2.
8. One Vite process restart (not Aspire) after Storybook's install relinked Vuetify in the global store (see Working notes).

## M7 — Buttons (done)

Levers, in order:
- **SASS** (`settings.scss`, `_sizes.scss`): `$button-border-width: 1px` / `$button-border-color: transparent` (every emphasis has Canon's 1px border box; named-size padding is now net of it: 7/11/15/19/19); `$button-icon-border-radius: var(--v-btn-border-radius)` (icon buttons square, not circles); `$button-colored-disabled: false` + `$button-disabled-opacity: 1` (Vuetify paints disabled as `on-surface` on `surface` in its trumps layer, at full strength); `$button-loader-size: var(--v-btn-icon-size)`; `$icon-btn-border-radius: 8px`, `$icon-btn-elevation: 0`; `$btn-group-border-color: rgb(var(--v-frame))`, `$btn-group-elevation: 1` (control shadow).
- **Blueprint** (`defaults.ts`): `VBtn { color: 'primary', variant: 'tonal' }`. Nested `{ VBtn: { color: 'neutral', variant: 'text' } }` on VToolbar, VToolbarItems, VTable, VDataTable, VField, VList, VAlert, VSnackbar. `VCardActions.VBtn { variant: 'tonal', slim: false }` (R3). `VBtnGroup { color: 'neutral', variant: 'outlined', divided: true }` (Vuetify's group default is `elevated`, which would make every grouped button a solid accent). Per-container choices are recorded in the `defaults` docstring; left as Vuetify: VBannerActions, VEmptyState, VNumberInput (inside VField), VDatePicker/VPicker (M14), VCarousel, VSpeedDial, VFileUpload, VTreeview, VBottomNavigation.
- **`overrides/_btn.scss`** (106 lines, 67 non-comment): Vuetify tints with `currentColor` plus a hover overlay; Canon swaps one tint of the tone's 400/500 step per state. Overlay off; the underlay carries the rung (`--cs-btn-tint`: tonal 2/3/4, outlined/text 0/1/2; focus-visible = hover). Low emphasis: `border-low` line + control shadow, dropped on `:active`. Neutral icons muted until pressed/current/open. Disabled: tonal fill, outlined frame line, no tint. The rest is re-points of `--v-theme-*` (below).
- **New mechanism, `tone.repoint` (`_tone.scss`)**: Vuetify puts `v-theme--<name>` on nearly every component (VBtn included), so the theme's `--v-theme-*` are declared *on the element* in `vuetify-utilities.theme-base`, above `vuetify-overrides`. The plan's §3d indirection (re-point `--v-theme-primary` on `.v-btn.text-primary` in the overrides layer) therefore never applied. Re-points now go in a sublayer `vuetify-utilities.c-style`, which the browser appends after Vuetify's utility sublayers. It holds custom properties only: labels at the tone's text step, solid hover/active steps, and disabled `on-surface`/`surface` → `disabled-fg`/`disabled-bg`. The `var()` resolves on the same element, so a nested `theme="dark"` still gets dark values.

Demo: `/c-style` route (`src/views/CStyleKitchen.vue`), a fixture page the app specs measure (buttons: 4 emphases × default/neutral/error × sm/md/lg, disabled, icon, prepend, loading, group, card actions). Later milestones add sections.

Acceptance (`verify/app/button.spec.ts`, 14 tests; helpers `lib/measure.ts`): for default/neutral/error, rest/hover/press colours of all four emphases (fill, label, border, underlay colour and opacity, control shadow dropping on press); dark: labels step 300, tints step 500 at .20, neutral high inverts, low accent border = 300 at 35%; disabled grey for every emphasis; sm/md/lg H 32/40/48, text 12/16/20 from the edge, radius 4/8/12, type 12/16, 14/20, 16/24 at 500 and tracking; icon-only 40×40 radius 8; prepend icon at 10px, 8px to label; neutral icon zinc-500 → zinc-900 on press; focused button holds the hover rung; group outer radius only, 1px dividers, one control shadow on the group, pressed = zinc-400 at 15% (≈ zinc-100); card action tonal at full padding; no accent button inside toolbars, tables, fields or lists on the admin pages. All M3–M6 specs still pass.

### R2: buttons that turn accent under the global default (confirm at checkpoint)

Coalesce/demo buttons without an explicit `color` that are outside the neutral containers:
1. `c-list-pagination` → `c-list-page` prev/next (`variant=outlined size=x-small icon`) below admin tables: accent low emphasis (blue arrows). The same component inside the toolbar is neutral.
2. `c-admin-editor` footer `v-card-actions` Save (create mode / no autosave): accent medium (R3, intended).
3. `c-datetime-picker` menu close button (`$complete`, x-small): accent medium.
4. `c-admin-create-btn` outside a toolbar (the `.my-2` instance under `c-admin-table`, shown in some table states): accent minimal (`variant=text`).
5. Demo `/widget` "Widget Admin Table" (`color="primary"` explicit): was elevated solid, now accent medium (default emphasis).

Unchanged (explicit colours kept, open question 5): `c-admin-method` Execute/Preview/Download `primary`; row Save `success`; `c-list-filters` sub-filter toggles `primary flat` when active, Remove `error`. Neutral now: admin table/editor/audit toolbar buttons, row actions, `c-loader-status` Retry (inside VAlert), `c-list-filters` menu buttons.

Deviations: VBtnToggle gets the Button Group look (pressed = active rung), not Canon's Segmented Control track; VFab/VSpeedDial unstyled beyond the global VBtn levers. Disabled low/minimal fg in dark is zinc-500 (Canon zinc-600) and the outlined disabled line is `frame` (zinc-700 dark, Canon zinc-800): one token each instead of two.

## M8 — Text entry (done; label-above adopted)

- **Blueprint**: every text input gets `singleLine: true`, `persistentPlaceholder: true` (with `variant: 'outlined'`, `hideDetails: 'auto'` from M3). `VField.class: 'cs-label-above'` opts fields into the label above. `VToolbar` nested defaults swap that for `cs-label-inside` and turn `persistentPlaceholder` off for every text input, so toolbar fields (Coalesce's table search, audit filters) keep Vuetify's single-line label inside the frame, where it reads as a placeholder (an active field hides it, and a persistent placeholder keeps the field active).
- **SASS**: `$field-outline-opacity: 1`, `$field-focused-border-width: 1px` (1px frame in every state); messages: `$input-details-padding-above: 8px`, `$input-details-padding-inline: 0`, details/messages line-height and min-height 16.
- **`overrides/_field.scss`** (86 lines, 61 non-comment): frame line colour from the tone context (`line` → `line-hover` on hover → `focus` + 3px `primary-halo` on focus; `.v-field--error` switches to the error tone and focuses on its hover step); surface fill and ink (also on coloured toolbars), control shadow; disabled fill/ink/no shadow at opacity 1 (Vuetify fades the whole field to .38); readonly dashed; the spike's label-above block keyed on `.cs-label-above.v-field--single-line`.
- Demo `site.scss`: deleted the input-details alignment and readonly-dashed rules (c-style owns them, adoption diff §2.4). `--fa-display` stays: the raw FontAwesome `<i>` sites still need it until M16.
- Fixture: `/c-style` fields section (text, prepend icon + clearable, error, disabled, readonly, `label=""`, select, autocomplete, combobox, one-row textarea, number, toolbar field).

Acceptance (`verify/app/field.spec.ts`, 9 tests): frame H 40, 1px zinc-200, radius 8, white, control shadow; input 14/20/400, text 16px in; hover zinc-400; focus blue-600 + `0 0 0 3px` blue-100; error red-400 → focus red-600 + red-100, label stays ink; disabled zinc-50 / zinc-400 / no shadow / opacity 1; readonly dashed; label 6px above at 14/20/500 and flush left for text, prepend-icon, select, autocomplete, combobox, textarea, number, and still 6px after typing; message 8px below, flush left, 12/16 (ink at .6 ≈ zinc-500); `label=""` reserves no row; toolbar label inside the frame; one-row textarea 40; Coalesce admin editor fields 40, top edge at the input's top, control shadow. M3–M7 specs pass.

Deviations / not done: messages are ink at Vuetify's medium-emphasis .6 (≈ zinc-500), error messages Vuetify's error 600 (Canon red-700/300). Prefix/suffix wells, 28px in-box clear/reveal buttons, placeholder at `quiet` and VSelect chip size: not styled (no Coalesce use beyond c-display's password eye). A form-gap rule (`.v-input + .v-input { margin-top: 16px }`) was tried for stacked `c-input`s on `/widget` and dropped: it breaks inputs laid out in a row (audit filters stretch to 56). Stacked fields on custom pages sit flush; spacing is the app's layout (open issue).

## M9 — Choices (done)

- **Glyphs** (`src/icons/choice.ts`, decision 12b): `$checkboxOn/Off/Indeterminate`, `$radioOn/Off` are now c-style render-function SVGs (replacing the Lucide placeholders and their `TODO(M9)`): 20-unit box, 18px box with a 1px `currentColor` line, radius 5; checked = `currentColor` fill with Canon's check/dash path (24-unit, stroke 1.5, scaled to 1.25) or a 5px dot in `rgb(var(--v-theme-surface))` (white / zinc-900). Unit test `test/choice.spec.ts`.
- **Blueprint**: `VSelectionControl { color: 'neutral' }` (every checkbox, radio and switch; decision 7). `VSwitch { thumbColor: 'surface' }`: Vuetify otherwise paints an on thumb in the track colour.
- **Theme**: new role variable `--v-track` (zinc-300 / zinc-700), the switch track at rest.
- **SASS**: `$switch-track-width: 38px`, `$switch-track-height: 24px`, `$switch-thumb-offset: -2px` (Canon's 34×20 track + 2px ring = a 38×24 pill with the 20px thumb inset 2, travel 14), `$switch-track-opacity: 1`, `$switch-track-background: rgb(var(--v-track))`, `$switch-thumb-elevation: 1`, `$switch-label-margin-inline-start: 8px`. (`$selection-control-size: 20px` from M6.)
- **`overrides/_choice.scss`** (53 lines, 36 non-comment): unchecked glyph opacity 1 in `--v-choice-line` (Vuetify fades it to .6 of the label ink); hover halo `0 0 0 3px fill` on an 18px rounded `::before` instead of Vuetify's round currentColor wash (no hover look on switches); label padding 8 (Vuetify relies on a 40px control for the gap); switch wrapper `width: auto` so the track doesn't overflow under the label; focus ring around control + label in `focus-choice` (blue-300 dark).
- Disabled stays Vuetify's `.38` opacity on the whole control: zinc-400 line ≈ zinc-200, ink label ≈ zinc-400, close to Canon's disabled tones.

Acceptance (`verify/app/choice.spec.ts`, 7 tests): checkbox glyph 20 cell, 18 box, radius 5, unchecked line zinc-400, checked zinc-900 + white mark (indeterminate too); radio ring zinc-400, checked zinc-900 with a 5px white dot; dark: white box + zinc-900 mark, line zinc-500; label 14/20, opacity 1, text 8px from the box; hover halo 3px zinc-100 on an 18px radius-5 box; keyboard focus ring (white 2 + blue-600 1) on the control row; switch 38×24, thumb 20 inset 2 (x 2 → 16), off zinc-300 / on zinc-900 with a white thumb, label text 8px out; dark switch off zinc-700, on white with zinc-900 thumb. All earlier specs pass; unit 31/31.

Deviations: unchecked hover line stays zinc-400 (Canon darkens to zinc-600/300; no role token for that pair); label ink is the page's `on-background` (zinc-950) rather than zinc-900; error/invalid uses Vuetify's error 600 on the glyph; press scale and check-draw animation not added.

## M2 — Storybook shell and parity harness (done)

Start: `cd MyProject && pnpm --filter c-style-storybook storybook` → http://localhost:6006. Verify: `pnpm --filter c-style-verify storybook` (Storybook must be running).

- `storybook/` (`c-style-storybook`): `storybook` + `@storybook/vue3-vite` **10.6.5** (10.6.6 was inside pnpm's release-age window; peer `vite ^5–^8` checked on npm), Vite 8.3.6. Docgen off.
- `.storybook/main.ts`: `viteFinal` adds `@vitejs/plugin-vue`, `unplugin-vue-components` (`CoalesceVuetifyResolver`), `cStyle()`; alias `@` → `src/`; `server.fs.allow` gets the storybook root and the pnpm store (Inter's woff2 and Storybook's mocker runtime live there; without it: 403/404 console errors). `previewHead` prepends `layerOrderStyle`. It throws at startup if `storybook/node_modules/vuetify` and `c-style/node_modules/vuetify` are different real paths (two copies = settings silently not applied).
- `.storybook/preview.ts`: CSS in §2.3 order; one `createVuetify({ blueprint: cStyleBlueprint(), components, directives })` (all components registered, since story templates compile at run time); `createCoalesceVuetify` with every `C*` export; per-app memory router with `coalesce-admin-list`, `coalesce-admin-item`, `/admin/audit`. Decorator wraps stories in `v-app > v-main > .cs-size-<size>` and applies globals: `theme` (`useTheme().change`), `size` (`.cs-size-*`), `accent` (`applyCStyleColors(theme, { primary })`, presets canon/violet/emerald/rose/orange). `parameters.padded: false` drops the 24px canvas padding.
- Story helpers (global): `sb-section`, `sb-row`, `sb-sizes` (slot once per `.cs-size-*`), `sb-measure` (prints computed props), `Parity`, `CanonFrame`.
- Canon vendored to `storybook/public/canon/` (canon.css, canon.core.css, canon.js, LICENSE, plus `licenses/` for the Lucide and Tailwind work canon.css bundles). `CanonFrame` = `iframe srcdoc` with `color-scheme` from the theme global and `data-size` from the size global, auto-height. `Parity` = two columns, `data-side="vuetify"` + Canon frame; pairs share `data-parity`.
- `verify/lib/measure.ts`: `compareParity(page, storyId, ids, props?, globals?)` → `ParityDiff[]` (lengths ±0.5px, shadows normalized), `compareBox(...)` (block/inline size only). `verify/lib/storybook.ts`: `fetchStories()`, `openStory(page, id, globals)` → console errors, uncaught errors, HTTP ≥400, Storybook error overlay.
- Specs (storybook project): `parity/stories.spec.ts` renders **every** story in `index.json` and fails on any error (`STORY_FILTER`, `STORY_GLOBALS="theme:dark;size:sm;accent:violet"` env); `parity/smoke.spec.ts`: `Parity/Smoke` reports diffs (bg differs → harness measures), `compareBox` measures both sides, layer order precedes all layered CSS, and every `data-parity` id in `Parity/*` and `Foundations/Chunkiness` resolves on both sides.

### Inventory (262 stories)

| Section | Stories | Pages |
|---|---|---|
| Overview/All components (live counts from `index.json`, coverage from tags) | 1 | 1 |
| Foundations: Colors (live theme roles/ladders/variables, light + dark), Typography, Shape and depth, Spacing and sizes, Icons (all 65 `$aliases`, Coalesce FA names, csIcon), Chunkiness (M6 parity) | 13 | 6 |
| Vuetify: Buttons, Text entry, Choices, Surfaces, Overlays, Lists, Data, Navigation, Pickers, Media, Layout | 130 | 48 |
| Coalesce: Inputs, Display, Lists, Admin | 89 | 14 |
| Pages: Admin shell (People table, Person editor, Audit log via router-view), Settings form | 4 | 2 |
| Parity: Smoke, Buttons (button, disabled, icons, group, segmented), Text entry (text input, field, select, date), Choices, Surfaces (card, alert, toast), Overlays (menu, tooltip, dialog), Data (table, data-table, pagination, tag), Navigation (nav-list, tabs) | 25 | 8 |

Coverage: 178 of 178 non-transition `vuetify/components` exports have a story (directly or via parent); 27/27 Coalesce components incl. internal `CAdminCreateBtn`, `CTimePicker`, `CListFilterInput`. Labs components are not covered.

Conventions for later stories:
- Title `Vuetify/<Family>/<Component>`, `Coalesce/<Group>/<c-name>`, `Parity/<Family>`.
- Coverage tags on the meta: `vuetify:VBtn`, `coalesce:CSelect` (the overview and M17 read them from `index.json`). Story-level tags must be literal in the export for the indexer: `export const X = { ...tpl(...), tags: [...] }`.
- `allow-request-errors` tag: the story shows a mocked API failure that Coalesce leaves unhandled; the smoke spec tolerates only `Request failed with status code 4xx` there.
- `stories/_helpers.ts`: `tpl(template, setup, extra)`, `fieldStories(component, props, value)`, shared `colors` (incl. `neutral`), `btnVariants`, `fieldVariants`, `placeholderImage`. `stories/parity/_parity.ts`: `parity(title, vuetifyHtml, canonHtml, canonCss?, setup?)`, `staticPopover` CSS.

### Deviations

1. The layer-order `<style>` is the second `<style>` in the preview, after Storybook's own Nunito `@font-face` block (which has no layers). The check asserts it precedes every layered stylesheet instead of being first. `cStyleHtml` skips injection because `previewHead` already put the statement in.
2. `MyProject/pnpm-workspace.yaml`: `allowBuilds.esbuild: false` (Storybook's esbuild; it resolves its platform binary at run time).
3. Storybook's esbuild peer initially gave this package a separate Vuetify link; the install moved all three (`Web`, `c-style`, `storybook`) onto one new hash. That relink is what forced the Vite restart noted in Working notes.

## M2b — Storybook Coalesce domain and mocks (done)

- `storybook/domain/`: `StorybookDomain.Data` (net10 class library, IntelliTect.Coalesce + AuditLogging 6.5.1, EF Core 10) and `StorybookDomain.Web` (generator target only: `DotNetCliToolReference IntelliTect.Coalesce.Tools 6.5.1`), own `Directory.Build.props`/`global.json`/`coalesce.json`. Regenerate: `cd storybook/domain/StorybookDomain.Web && dotnet coalesce` → `storybook/src/domain/{metadata,models,viewmodels,api-clients}.g.ts`. Generated C# (`Api/Generated`, `Models/Generated`) and bin/obj are gitignored. (`targetDirectory` resolves against the web project's `wwwroot`, hence `../../../src/domain`.)
- Model: `Person` (string, multiline, email, tel, url, image-url, color, password, int with range, decimal, double, bool, enum with descriptions, enum[], DateOnly, TimeOnly, DateTimeOffset, DateTime, byte[], ref `Company`, self-ref `Manager`, `[ManyToMany("Tags")]` via `PersonTag`, string[], int[]; instance methods `Promote` (string result, params), `Archive` (void), `ChangeCompany` (model param + result), `DownloadCard` (file), `UploadResume` (IFile param); static `NicknameSuggestions(page, search)` (string[] for c-select-string-value), `CountActive`, `ScheduleReview` (DateOnly/TimeOnly/enum params), `FailingMethod`), `Company` (with `Employees` collection), `Tag`, `PersonTag`, `AuditLog : DefaultAuditLog` (+ `AuditLogProperty`).
- `src/fixtures`: deterministic DTOs: 30 people, 5 companies, 8 tags, ~45 person-tags, 24 audit logs with properties. Avatars/logos are static SVGs in `public/avatars/` (offline).
- `src/mocks`: `mockDomain({ delay, fail, empty })` over `coalesce-vue/lib/test-utils` `mockEndpoint`: list (paging, search on `[Search]` fields, `filter.*`, orderBy/orderByDescending), count, get, save, delete, bulkSave, and every Person method by metadata. Each story gets a fresh copy (preview `beforeEach`), and a catch-all `mockFallback()` answers unmatched requests so nothing reaches the network. Stories layer their own in `beforeEach`: `withMocks({...})`, `pending(endpoint)`, `mockEndpoint(...)` (later registrations win). `fixtureDto(route, id)` returns one expanded DTO.
- `stories/coalesce/_support.ts`: `person(id)`, `company(id)` (clean VMs; DTOs go through `mapToModel` first, since `$loadCleanData` doesn't parse date strings), `people(params)` (list, `$load` once), `user`/`find` (Testing Library with pointer-events check off, for Vuetify menus mid-transition).
- Done-when: `Coalesce/Admin/c-admin-table / Page With Methods` renders Person with 10 rows, pagination and the static methods panel; `Coalesce/Inputs/c-select / Search` types into the menu and lists matches (and `Menu Open` lists all 5 companies).

### Results

- `pnpm --filter c-style-verify storybook`: 291 pass (262 render checks, 29 harness/pair checks), light/md. `STORY_GLOBALS="theme:dark;size:sm;accent:violet"` rerun of the render checks: 261/261 pass at the time of the run. `vue-tsc --noEmit` in `storybook/` clean.
- Gaps: `c-admin-create-btn` multi-type menu needs a domain with derived types (none here; 6.5.1 abstract models need `createAbstractProxyViewModelType` handling); Vuetify labs components; `c-app-update-alert` is driven by a stub axios instance, not a real deployment.

## Requests from Storybook

1. **Done (M11 session):** `c-style:serve` now also allows `inter-ui`'s resolved directory; Storybook's `main.ts` workaround can go. Original request: `cStyle()`'s `c-style:serve` allows only the package root. Inter's woff2 (`inter-ui` in the pnpm global store) is outside it, so any consumer that sets `server.fs.allow` (Storybook does, and so would most apps without the demo's `pnpm store path` workaround) gets a 403 for the font. Suggest allowing `inter-ui`'s resolved directory (or the store root) the same way the package root is allowed. Storybook works around it in `main.ts`.

## M10 — Surfaces and feedback (done)

- **SASS**: card `$card-item-padding`/`$card-title-padding: 20px 20px 16px`, `$card-text-padding: 20px`, `$card-actions-padding: 0 20px 20px` (min-height 0, gap 8), subtitle 14/20 with 4px above (Canon description); alert bar `$alert-border-thin-width: 4px`, `$alert-border-opacity: 1`; banner `$banner-background: surface-light` (zinc-100 / zinc-800), `$banner-border-color` = rule, padding-start 16; snackbar `$snackbar-background/-color` = `surface-bright` (white / zinc-800, Canon's toast), content padding 12; skeleton text = `fill`. Radii/elevations from M5 (card 12 + edge/raised, snackbar 12 + edge/floating).
- **Blueprint**: `VAlert { variant: 'outlined', border: 'start', VBtn: neutral minimal }`; `VProgressCircular { size: 20, width: 1.5 }` (Canon spinner: icon-sized, currentColor, 1.5 stroke at 24); `VProgressLinear { height: 4 }`.
- **`overrides/_surface.scss`** (38 lines, 24 non-comment): alert text at control type (Vuetify inherits the page's 16px); outlined alert = surface fill, edge-coloured border, muted description, ink title, bar from the tone's `bar` step (the icon keeps the intent colour); expansion title weight 500 and line-height 20 (no variables).
- Fixture: `/c-style` surfaces section (card with title/subtitle/text, expansion panel, error and success alerts, banner, spinner, linear progress, snackbar).

Acceptance (`verify/app/surface.spec.ts`, 7 tests): card radius 12, edge + raised, title at (20, 20) 16/24/600, description 14/20 at .6, 4px under the title, body 16 below and 20 from the bottom; expansion row H 40, 14/20/500; alert light/dark: surface fill, 4px bar red-500 / red-400, 20px icon in error 600, title ink 500, text 14/20, radius 12, padding 12; banner zinc-100 + rule line; snackbar white / zinc-800, radius 12, edge + floating, 14/20, padding 12; spinner 20×20 with a currentColor stroke; linear progress 4. All earlier specs pass.

Deviations: dark alert icon is error 600 (Vuetify's role colour; Canon 400). A neutral (typeless) alert still shows a zinc-500 bar (Canon has none); banner intent tints (hue-50 / hue-200 line) not implemented: VBanner's `color` only tints its icon and `bg-color` gives a solid, and Coalesce uses no banners. Snackbar intent bar, toast stacking and timer line not implemented. Skeleton sweep colour, empty state untouched.

## M11 — Overlays and lists (done)

- **SASS**: scrim `$overlay-scrim-background: rgb(var(--v-scrim))` with `$overlay-opacity: 1` (white .85 / zinc-950 .75, the theme variable carries the alpha); tooltip `$tooltip-background-color`/`-text-color` = surface / on-surface (Canon's light tooltip); list subheader line-height 16, min-height 32. Panel radii/elevations from M5 (menu 12 + edge/floating, dialog 24 + edge/overlay, tooltip 4).
- **Blueprint**: `VMenu { offset: 4, transition: 'cs-popup', VList: { class: 'pa-1' }, VListItem: { rounded: 'md' } }` (4px panel padding, 8px rows, via a utility class and the `rounded` prop); select/autocomplete/combobox menus `transition: 'cs-popup'`; `VTooltip { openDelay: 500, closeDelay: 250, location: 'top', offset: 4 }`. Menu row hover needs no rule: Vuetify's currentColor overlay at the theme's hover opacity composites to ≈ zinc-100 / zinc-800.
- **`overrides/_overlay.scss`** (77 lines, 53 non-comment): scrim blur 4px; tooltip 1px `frame` line + raised shadow; subheader caps +0.01em; menu rows show focus as their fill, not the ring (pickers focus the chosen row on open); chosen menu option = weight 500, no fill, trailing 20px tick (mask on Vuetify's `::after`, freed because c-style's focus ring is a box-shadow); dialog card header 72 / padding 16 16 15 24 over a rule, body 24, footer 23/24/24 gap 12 over a rule.
- **`_motion.scss`** (+22 non-comment): the `cs-popup` transition (fade + scale .97, 0.15s ease-out in, 0.1s ease-in out; no scale under reduced motion).
- Fixture: `/c-style` overlays section (menu with subheader, plain and chosen rows; tooltip; dialog with title/body/actions).

Acceptance (`verify/app/overlay.spec.ts`, 8 tests): menu panel radius 12, padding 4, edge + floating (light and dark); row H 40, radius 8, text 16 in, hover ≈ zinc-100; chosen row 500, no fill, 20px tick; subheader 10/16/600 caps, 32 row; select picker's chosen option ticked, `cs-popup` rule has opacity 0 + scale .97; tooltip white, 1px zinc-200, radius 4, 12/16, padding 4/6, raised; dialog (light/dark) radius 24, header 72 with a 1px rule, body padding 24, footer 23/24/24 with a rule, scrim white .85 / zinc-950 .75 at opacity 1 with blur(4px). Full app suite 66/66; unit 31/31; `vue-tsc` (demo) and `tsc` (package) clean.

Deviations / not done: dialog open/close keeps Vuetify's transition (Canon .98 scale); tooltip has no arrow and keeps Vuetify's fade; VBottomSheet, temporary VNavigationDrawer (Canon floating drawer), VHotkey/VKbd, VListGroup untouched; danger menu rows and submenu chevrons not styled. Coalesce's `c-list-filters` Reset row keeps its inline negative margin (M16).

### M11 checkpoint (screenshots)

`verify/screenshots/m11/`: home, widget, admin, admin-table, admin-editor, admin-audit, kitchen (`/c-style`) × light/dark (`CAPTURE=1 CAPTURE_DIR=screenshots/m11 playwright test --project=capture`; the capture spec now also shoots `/widget/1` and, outside the baseline, `/c-style`).

### CSS added, M7–M11 (all in `@layer vuetify-overrides` or its `vuetify-utilities.c-style` sublayer; no unlayered CSS)

| Milestone | File | Lines (non-comment) |
|---|---|---|
| M7 | `_btn.scss` 106 (67), `_tone.scss` repoint mixin +11 (6) | 73 |
| M8 | `_field.scss` 86 (61) | 61 |
| M9 | `_choice.scss` 53 (36) | 36 |
| M10 | `_surface.scss` 38 (24) | 24 |
| M11 | `_overlay.scss` 77 (53), `_motion.scss` +27 (22) | 75 |

## M12 — Data display (done)

- **SASS**: table `$table-column-padding: 7px 16px` (Canon cell block padding), `$table-line-height` 20/14, `$table-border-color`/`$table-border` = `rule` at the hairline, `$table-stripe-color` = half the hover ink (≈ zinc-50); hover keeps Vuetify's ink at `hover-opacity` (composites to ≈ zinc-100 / zinc-800, no rule). Pagination `$pagination-item-margin: 4px` (8 apart), `$button-pagination-active-overlay-opacity: 0`. Tag `$chip-padding-ratio: 3.2` (text 10 in), `$chip-font-weight: 500`. Count: `$badge-*` 16px pill, 10/600, `error` solid / `on-error`. Avatar: `fill` bg, `muted` fg, elevation 0. Kbd: 10/16/600, padding 2/6, flat, no border.
- **Blueprint**: `VPagination { color: 'neutral' }`, `VChip { label: true }` (4px tag radius).
- **`overrides/_data.scss`** (60 lines, 39 non-comment): tabular nums + tracking on tables; table frame (12px radius + edge ring) only when not inside a `.v-card` (Canon `data-frame="none"` there); header muted + nowrap, sortable header back to ink on hover; current page = `frame` line; tag tonal underlay = tone tint at `tint-2` and outlined line = `border-low` (the button recipe); hued tag labels re-pointed to the tone's text step (`tone.repoint`); kbd caps.
- Fixture: `/c-style` data section (v-table, compact table, v-data-table with select + sort, pagination, chips, badge, avatar, kbd, code).

Acceptance (`verify/app/data.spec.ts`, 7 tests): frame radius 12 + edge ring (light/dark), th 40 / 500 / zinc-500 / nowrap / rule line; rows 56 and compact 40, cells 7/16, 14/20 tabular, text 16 in, hover ≈ zinc-100; sortable th zinc-500 → zinc-900 on hover; pagination 40 squares 8 apart, radius 8, current zinc-200 line no fill, ink number, muted arrows; tag H 32, radius 4, 14/500, text 10 in, neutral tint zinc-400@.15, success label green-700; count 16 high 10/600 red-600/white; avatar zinc-100/zinc-500 flat; kbd 10/600 caps padding 6 radius 4.

Deviations: chip `small` is 26 (Vuetify's 6px size step is a literal; Canon sm 24); tag line-height inherits (one fixed-height line, invisible); count uses the `error` role (Canon rose-600 is a fixed non-theme hue); unsorted sort arrow stays hidden until hover (Canon shows `arrow-down-up`); Data Table selected-row fill, filter chips, bulk bar and pinned columns not styled; kbd keeps Vuetify's theme-kbd colours rather than Canon's currentColor mix.

## M13 — Navigation and shell (done)

- **SASS**: tabs `$tabs-height: 34px`, `$tab-min-width: 0`, `$tab-inset-padding: 3px`, `$tab-inset-radius: 7px` (track 40 = 34 + 2×3, radius 10 = 7 + 3); breadcrumbs padding 10/0, lh 20, item padding 0, no underline, current opacity 1; toolbar border (VAppBar draws its border through VToolbar) `rule-faint` at `0 0 hairline`; drawer border `rule-faint` at the hairline; nav list `$list-nav-padding: 10px` (icon 10 in), `$list-item-nav-margin-top: 10px` (items a quarter-control apart), nav title weight 400.
- **Blueprint**: `VAppBar { flat, border: true }`; `VNavigationDrawer { width: 264, VList: { nav: true, prependGap: 8 } }`; `VTabs { inset: true, color: 'neutral' }` — Vuetify 4's inset tabs are Canon's segmented track, with the slider as the gliding card.
- **`overrides/_nav.scss`** (68 lines, 46 non-comment): nav current = `fill` bg, overlay off, title 500; tab track `fill` with no ring, 2px gap, tab padding 10 in, card = `surface-bright` + 6% ring + raised shadow, rest tabs muted with no button tint; breadcrumb 14 + tracking, links muted → ink on hover, current and separators `quiet`.
- Demo `site.scss`: its `.v-application ul { padding-left: 24px }` now skips `.v-breadcrumbs` (it indented every breadcrumb row).
- M6's "nav icon→title 10px" was a misreading of Canon (`nav-list.css`: icon-to-label = button gap + label inset = 8 at md; 10 is the item-to-item gap). `size.spec.ts` now asserts 8.
- Fixture: `/c-style` navigation section (tabs with a disabled tab, breadcrumbs).

Acceptance (`verify/app/nav.spec.ts`, 5 tests): light/dark app bar and sidebar = surface, no shadow, 1px `rule-faint` line (bar bottom only), sidebar 264; nav items H 40, radius 8, icon 10 in, 10 apart, current zinc-100 / 500 / overlay 0, rest 400; tabs track 40 zinc-100 radius 10 no ring, tab 34 radius 7, 2 apart, text 10 in, selected card white with the 6% ring, selected zinc-900 / rest zinc-500, 14/500; breadcrumb row 40 flush left, links zinc-500, current and separators zinc-400 at opacity 1, 14px.

Deviations: the demo keeps `<v-app-bar density="compact">` (48 = Canon's sm bar; 64 at md); breadcrumb separator stays Vuetify's text `/` (VBreadcrumbs takes a string, Canon draws a chevron); dark nav current is zinc-800 (`fill`; Canon zinc-700) and nav hover is Vuetify's ink at hover opacity (≈ zinc-100, Canon zinc-50); sidebar inline inset 10 (Canon 16: Vuetify uses one variable for the list and item padding). VBottomNavigation, VStepper, VSystemBar, VFooter untouched.

## M14 — Pickers (done)

- **SASS**: date picker width 304, day cell and day button 40, column gap 0, controls row 40 (`--v-date-picker-controls-height` fallback), month/year toggles padded 8 / 4 so the controls row fits the 280 grid (see Fixes: picker overlap); `$picker-border-radius: 12px`, title 600; slider track 5 (fill the same, radius pill), thumb 18; color picker radius 12, elevation 2.
- **Blueprint**: `VDatePicker { color: 'neutral', hideHeader: true, VBtn: neutral minimal }` (its day, month and arrow buttons are plain VBtns that took the global accent); `VColorPicker { VBtn: neutral minimal }`; `VTimePicker`, `VSlider`, `VRangeSlider { color: 'neutral' }`.
- **`overrides/_pickers.scss`** (34 lines, 22 non-comment): slider thumb = surface centre with a 5px currentColor border (the shadow is the `elevation-*` utility's, so ring = border, focus = outline), no hover wash; neutral track at full strength on `frame` (re-point in the `c-style` sublayer).
- Fixture: `/c-style` pickers section (date picker, slider, range slider, color picker).

Acceptance (`verify/app/pickers.spec.ts`, 3 tests): no MD header; day buttons 40×40, radius 8, ink; selected zinc-900/white; controls ink; cells 40 apart; slider track zinc-200 5px at opacity 1, fill zinc-900 5px, thumb 18 with a 5px zinc-900 ring around white; color picker radius 12.

Deviations: today is an outlined ring (Canon: a 4px dot); weekday header, rows-8-apart and the inline calendar border not styled; slider value tooltip and marks untouched; VCalendar, VRating, VFileUpload, VCarousel and the media/render-only components get only the global levers.

### Fixes from the M8/M11 checkpoints

- **Radio group (M11 kitchen):** M6's 20px selection control collapsed grouped radios to 20px rows at the top of a 40px input (checkboxes keep a 40px row from VCheckbox's own rule), and inline radios were spaced only by the 40px control they were designed around, so "Radio A" ran into the next radio. `_choice.scss` (+12 lines, 6 non-comment): `.v-radio-group .v-selection-control { min-height: var(--v-input-control-height) }` (VCheckbox's rule, for radios) and `.v-selection-control-group--inline { column-gap: 24px }` (Canon fieldset `gap-inline`).
- **Form gap (M8 open issue), decided:** Canon Form Layout stacks fields a form gap apart (12/16/20, new token `--cs-form-gap`). The lever is the blueprint `VForm { class: 'cs-form' }` plus one rule `.cs-form .v-input + .v-input { margin-top: var(--cs-form-gap) }` in `_field.scss`. Scoping to forms keeps row layouts (toolbars, audit filters) untouched, and Coalesce's only VForm (the admin editor) puts one input per `v-row`, so it is unaffected. `/widget` fields are now 16 apart. Inputs laid side by side as direct siblings inside a form would get the margin too; such a layout should wrap them in columns (documented limit).
- Acceptance (`verify/app/form.spec.ts`, 3 tests): `/widget` stacked fields 16 apart; audit toolbar filters still one row of 40px fields; inline radio control centres level with the checkboxes', items 24 apart.

## M16 — Coalesce components (done)

Unlayered partials in `src/styles/coalesce/` (imported last by `c-style/styles`, after `coalesce-vue-vuetify3/styles.css`); every selector starts with a `.c-` class (unit-linted, M17).

- **`_icons.scss`** (32 / 22) + generated **`_fa-masks.scss`** (`scripts/fa-masks.mjs` writes Lucide SVGs from `@lucide/vue` as data-URI masks): the raw `<i class="fa fa-*">` glyphs in `.c-admin-table`, `.c-admin-editor`, `.c-admin-page--description` and `.c-password-display` (save, edit, ellipsis-h, trash-alt, info-circle, asterisk, eye, eye-slash) render the same Lucide icon the `cs` set maps that name to, 1.5 stroke, as a `currentColor` mask at the icon box (20 in buttons, 1.15em in text). Row actions now read as muted Lucide icons like the toolbar's. The demo's `--fa-display` rule in `site.scss` is gone.
- **`_admin.scss`** (60 / 38): admin toolbars (`.c-admin-table-toolbar`, `.c-admin-editor--toolbar`, `.c-admin-methods--toolbar`) lose the `elevation="4"` shadow, gain a `rule` line below, and every row (main and extension) is control + 16 = 56 (Coalesce's density gives 48/56 inline and the extension 49 `!important`); page description at Canon card-description type (14/20 muted, 12px under the toolbar, 20 in); editor rows a form gap apart, label column 14/20/500 ink (its 10px top padding already aligns it with the field's first line); method section labels 14/500, descriptions muted, null results `quiet` (was `#999`); audit nested property hover = theme ink at hover opacity (was black 10%).
- **`_list.scss`** (87 / 55): c-table pinned actions column = surface + hairline rule + hard 4px band at 5% (was frosted blur + `rgba(0,0,0,.4)` shadow, 8px corner); pagination text 14/20 muted, items 8 apart; `c-list-page` prev/next neutral (tone neutral, muted icon) everywhere, per the orchestrator's R2 decision; `c-list-filters` Reset icon's inline margins reset; `c-loader-status` bar 4px; c-select's menu search (`variant="filled"`) is a plain row over a rule; c-time-picker header 16/24/600 on the surface (was 32px on a solid sheet).
- `c-table` header height: Coalesce's inline `--v-table-header-height: 40px` already equals Canon's; the muted header, rules and 56 rows come from M12. No rule needed.
- `!important` only where Coalesce or Vuetify set the property inline or with `!important`: toolbar row heights, pagination child margins, the Reset icon margins, the loader bar height.
- **Demo**: `/admin/audit` route passes `color: null` (the audit page's toolbar colour defaults to `"primary"`, which filled its toolbar blue). Adoption note: apps should do the same, as with `titledAdminPage`.
- R2 accent buttons, per orchestrator: kept accent for c-admin-editor Save, c-datetime-picker close, c-admin-create-btn outside a toolbar, demo `/widget` explicit primary; `c-list-pagination` prev/next now neutral.
- c-datetime-picker's selected day and time are ink already (its `color` defaults to `"secondary"` = neutral ink in c-style's theme).

Acceptance (`verify/app/coalesce.spec.ts`, 5 tests): table, editor and audit toolbars: no shadow, white, 1px rule, every row 56, title 16/24/600; dark toolbar zinc-900 with white 10% rule; c-table th 40 zinc-500, rows ≥ 56; row action glyph 20×20, `::before` content empty with an SVG mask, muted; pagination 14/20 zinc-500, next arrow zinc-500 on a zinc-200 line; editor label 14/20/500, its first line 10 below the field top; description zinc-500.

Deviations / not done: no `Parity/Coalesce` stories (Coalesce composites are covered by the app specs and the existing Coalesce stories); c-select's chosen-row tick renders faint (Coalesce's pending-selection overlay rules); c-admin-method results `pre` and audit monospace cells keep Coalesce type; `max-width: 1300px` / `margin-bottom: 50vh` page layout untouched.

## M17 — Coverage sweep (done)

- `verify/parity/coverage.spec.ts` (Storybook project): the Overview page (which diffs every `vuetify/components` export, transitions excluded, sub-parts via parent, and every Coalesce `C*` plus the three internals against story tags) shows no missing component; brand sweep renders all 25 Parity stories at the five accent presets × light/dark with no console errors (250 renders, 26 tests pass).
- `packages/c-style/test/sweep.spec.ts` (unit): text-on-accent-solid contrast for the five presets; lint: no hex and no `!important` in `overrides/`, every compiled unlayered selector in `coalesce/` starts with `.c-` (layered rules the tone module brings along are stripped first).
- Coverage gaps found: **contrast** — white on emerald-600 is 3.8 and on orange-600 3.6 (Tailwind's own 600 steps; Canon's green-600 success is 3.3). Canon, violet and rose clear 4.5. The test holds those two presets to 3:1 and documents why; an app needing AA body text on them should pass a darker hex or a full ladder. Story coverage: none missing. Lint: one real bug caught and fixed (a duplicated dark selector in `_list.scss`).
- Not done: Parity stories at sm/lg (M14b skipped per instructions).

### CSS added, M12–M16

| Milestone | File | Lines (non-comment) | Layer |
|---|---|---|---|
| M12 | `overrides/_data.scss` 60 (39) | 39 | `vuetify-overrides` (+ `c-style` re-point sublayer) |
| M13 | `overrides/_nav.scss` 68 (46) | 46 | `vuetify-overrides` |
| M14 | `overrides/_pickers.scss` 34 (22), `_choice.scss` +12 (+6), `_field.scss` +7 (+3) | 31 | `vuetify-overrides` (+ sublayer) |
| M16 | `coalesce/_icons.scss` 32 (22), `_admin.scss` 60 (38), `_list.scss` 87 (55), `_index.scss` 6 (3); generated `_fa-masks.scss` 10 | 118 | **unlayered** |

Totals since M7: layered 340 non-comment lines (M7–M14), unlayered 118 (M16). No overrides partial is near the ~150-line escalation mark.

### API changes (M12–M16, additive)

| Change | Where |
|---|---|
| Blueprint defaults: `VPagination { color: 'neutral' }`, `VChip { label: true }`, `VAppBar { flat, border: true }`, `VNavigationDrawer { width: 264, VList: { nav, prependGap: 8 } }`, `VTabs { inset, color: 'neutral' }`, `VDatePicker { color: 'neutral', hideHeader, VBtn: neutral minimal }`, `VColorPicker { VBtn: neutral minimal }`, `VTimePicker`/`VSlider`/`VRangeSlider { color: 'neutral' }`, `VForm { class: 'cs-form' }` | `c-style` |
| Token `--cs-form-gap` (12/16/20); class `cs-form` (stacked inputs a form gap apart) | `c-style/styles` |
| Unlayered `.c-*` partials (Coalesce) now part of `c-style/styles`; `scripts/fa-masks.mjs` regenerates the FA→Lucide masks | `c-style/styles` |
| Demo: `/admin/audit` route `color: null`; `site.scss` breadcrumb exception, `--fa-display` rule removed | demo |

### M17 checkpoint

Suites: app 89/89 (`verify/app`, incl. new data, nav, pickers, form, coalesce specs), Storybook 317/317 (every story renders + parity harness + coverage/brand sweep), unit 38/38, `tsc` (package, verify) and demo `vue-tsc` clean. Screenshots: `verify/screenshots/m17/` — home, widget, admin, admin-table, admin-editor, admin-audit, kitchen × light/dark.

## Review fixes (docs/review/fidelity-review.md)

Per finding, with the lever used:

| # | Fix | Lever |
|---|---|---|
| 1 | Tags default to Canon's sm: 24px, 12/16 type, text 6 in, radius 2, 16px icon. Vuetify's sizes step 6px from it (small 18, large 30). Tags in a combobox stay sm (24 fits the 40 field; the review's md-in-combobox idea needs sizes Vuetify can't step to). | SASS: `$chip-height`, `$chip-font-size`, `$chip-padding-ratio: 4`, `$chip-label-border-radius: 2px`, `$chip-icon-size-multiplier: .8` |
| 2 | Toasts with `color` are Canon toasts: bright surface, ink text, intent icon, a 4px bar outside the start edge in the tone's `bar` step, edge + floating; 46 tall. Plain toasts unchanged in look. | Blueprint `VSnackbar.variant: 'outlined'`; SASS `$snackbar-fallback-background`, `$snackbar-wrapper-min-height: 0`; `_surface.scss` shares the alert's ink rule and adds one snackbar rule (bar = `rgba(var(--cs-tone-bar, 0,0,0,0))`, transparent with no intent) |
| 3 | Stacked choices at Canon's fieldset pitch: radio groups 28 (20 rows, 8 apart); checkboxes and switches stacked in a `v-form` 28 / 32; a lone choice and inline groups keep the 40 row. Also: choices no longer reserve a 24px message row. | Blueprint `hideDetails: 'auto'` on VCheckbox, VRadioGroup, VSwitch; `_choice.scss`: group `row-gap: 8px`, the M14 min-height rule narrowed to inline groups, `.cs-form` stacked checkboxes/switches re-point `--v-input-control-height: 20px` (+8 / +12 margin) |
| 4 | Audit "Entity Type": dirty-with-empty predates c-style (baseline shows the floated label over a blank value); the regression was the hidden single-line label. A select whose selection text is empty keeps its in-field label. | `_field.scss`, one rule on `.cs-label-inside` |
| 5 | Admin toolbar: "Showing 1 - 10 of 40" in muted 14/20; extension row 48 (control + 8 below), so two rows read as one toolbar (104 + rule). | `_list.scss` selector list; `_admin.scss` height split |
| 6 | Nav subheader 10px caps. | SASS `$list-nav-subheader-font-size` |
| 7 | VBtnToggle is Canon's segmented control: `fill` track 40, 3px inset, radius 10; options 34, radius 7, muted at rest; the chosen one a bright card with the tab shadow. | Blueprint `VBtnToggle { color: 'neutral', variant: 'text', divided: false }`; `_nav.scss` inset-tabs rules widened to `.v-btn-toggle` (shared track, card, muted rest, underlay off) plus its geometry |
| 8 | Menu tick and focus-as-fill only in `.v-menu` (selects, autocompletes, comboboxes open a VMenu); neutral-icon rule down to (0,3,0) with `:where(.v-icon)`. | `_overlay.scss`, `_btn.scss` |
| 9 | Parity harness: CanonFrame sets no `data-size` (Canon's own per-component defaults: md, sm for tag/tooltip); Menu and Dialog stories render real `v-menu` / `v-dialog`; Canon popovers measured at rest (`scale: none`, no transition); toasts measured on `.v-snackbar__wrapper` (`content-props`), text inputs/selects/date on `.v-field` (`data-parity-target`); colours compared as channels (`color(srgb …)` = `rgb()`), transparent shadow layers and zero-width border colours ignored. New gate `verify/parity/parity.spec.ts`: 24 Parity stories × light/dark, with a listed allowance per structural difference or documented deviation. It found and fixed: date fields 42 tall (Chromium's 1px datetime padding), tooltip tracking, and the toggle buttons' visible group border. | `verify/lib/measure.ts`, stories, `_field.scss`, `_overlay.scss` |
| 10 | Size contexts removed: `.cs-size-sm/md/lg`, the Storybook size global, `SbSizes` and every "size context" story section (the `CListPagination/SizeContexts` story is gone; `Foundations/Spacing and sizes/Size Contexts` is now `Tokens`). Unused tokens `--cs-inset`, `--cs-input-gap`, `--cs-shell-inset` dropped; the rest stay as md constants. Per-instance `size` (named sizes) unchanged. | `_tokens.scss`, Storybook |
| 11 | `c-style` sublayer named in the layer-order statement (`…theme-foreground,c-style`); the unit test checks it is last in `vuetify-utilities` and the rest equals Vuetify's `layers.css`. | `layer-order.mjs`, `_layers.scss`, `test/layer-order.spec.ts` |
| 12/13 | Zero-touch adoption: admin, editor, methods and audit toolbars with `bg-primary` re-point their own primary to the surface. Demo routes reverted to the template (`titledAdminPage` passes `color: "primary"`, audit route `{ type: "AuditLog" }`); toolbars stay neutral (new spec). | `_admin.scss` via `tone.repoint` |
| 14 | Toast height 46 (above). Table `nowrap`, dialog primary emphasis, sort arrow, date picker header: not done (optional or decided earlier). | |

Tables stay 56 (Canon's default density).

CSS (non-comment lines): `overrides/` 452 → 490 (+38), `coalesce/` 118 → 129 (+11), `_tokens.scss` 54 → 20 (−34). Net +15.

### Tests

- Unit 38/38 (layer-order spec reworked). `tsc` (package, verify), `vue-tsc` (storybook, demo) clean.
- App 93/93: updated `data.spec` (tag 24/12/2, icon 16), `size.spec` (chip icons 16), `coalesce.spec` (extension row 48; new: `color=primary` toolbars neutral; audit filters show a label or a value), `surface.spec` (toast 46; new: intent toast bar/icon/ink, light and dark), `form.spec` (new: stacked pitch 28/28/32, lone checkbox 40).
- Storybook 364/364: every story renders, parity pairs, coverage + brand sweep, and the new parity gate (48 tests).
- Kitchen fixtures added: VBtnToggle, stacked checkboxes in a form, a column radio group, stacked switches, a success toast.

### API changes

| Change | Where |
|---|---|
| Blueprint: `VSnackbar.variant: 'outlined'`; `VBtnToggle { color: 'neutral', variant: 'text', divided: false }`; `hideDetails: 'auto'` on VCheckbox, VRadioGroup, VSwitch | `c-style` |
| Removed: `.cs-size-sm`, `.cs-size-md`, `.cs-size-lg`; tokens `--cs-inset`, `--cs-input-gap`, `--cs-shell-inset` | `c-style/styles` |
| `layerOrderCss` names `vuetify-utilities.c-style` | `c-style`, `c-style/vite` |
| Storybook: no `size` global; `CanonFrame` has no `size` prop | storybook |
| `verify`: `StoryGlobals.size` removed; `data-parity-target` attribute; `compareParity` colour/shadow normalisation | verify |

## M18 — Documentation of usage (done)

- `packages/c-style/README.md`: what it is, shipping shape and why, install, the Coalesce adoption diff (vite.config.ts, main.ts, package.json, site.scss, CSS order), colours (brand options, palettes, `applyCStyleColors`, `generateLadder`, contrast note), SASS overrides, sizes (named sizes; no contexts), icons (aliases, `csIcon`, FA mapping, masks), the layer architecture and what is styled where, Coalesce specifics, known deviations, the upgrade checklist (the review's internals-dependent selectors plus the tests that guard each), troubleshooting.
- Root `README.md`: repo layout, running the demo and Storybook, test commands, the parity gate.
- Final screenshots: `verify/screenshots/final/` (home, widget, admin, admin-table, admin-editor, admin-audit, kitchen × light/dark).

## Fixes: toolbar search inset, editable c-table cells

User-reported: the admin table's search field sat flush against the card's start edge (the row's end control is 8 in, the divider 16 after it), and editable c-table cells were full outlined fields touching their neighbours.

**Toolbar inset.** Canon toolbar controls sit 8 from the edges (the rule M16 set for row heights; the row's end controls already do). `.c-admin-table-toolbar--search` and `.c-audit-logs--filters` (Coalesce: flush, and 16 in) get `margin-inline-start: var(--cs-gap)`. With the field's 12px icon inset the search icon lands on the title text's 20. The 16 to the divider is Canon's separator spacing (toolbar gap 8 + separator space 7.5), so it stays. Narrow widths: Coalesce hides the title and dividers with `hidden-xs-only`, which Vuetify 4 dropped (it has `hidden-xs`), so phones showed an empty 20px title slot and stray dividers. One rule restores it inside `.c-admin-table-toolbar` at Vuetify's xs breakpoint (599.98). Also fixed the `Coalesce/Admin/c-admin-table / Toolbar` story, whose `sb-row stack` grid squeezed each toolbar to 240px.

**Edit cells, Canon precedent.** Canon's Data Table has inline edit cells (`src/css/theme/data-table.css` "Editing cells", `docs/components/data-table-editing.md`; canon.md §4 Data Table): the cell's padding is 0 and `.canon-data-table-edit` spans it at control height, text inset `P + input-inset − 1` + 1px border = 16, so the value sits where a read cell's text sits; the 1px frame is transparent at rest, shows the resting field line (zinc-200 / zinc-700) under the pointer, and the focus treatment with focus; failed keeps the red line. Editing opens a real Text Input over the cell. Rows stay control + 16 (56), and Data Table cells don't wrap.

Mapping (unlayered, `coalesce/_list.scss`, all under `.c-table.c-table--editable .v-table tr`): headers back to the table padding (`revert-layer` over Coalesce's `0 8px`); field text back to the field's 16 (`revert-layer` over Coalesce's 6); read-only cells 16 in and `nowrap` (Coalesce: 8 and wrapping; at 16 the datetime cells wrapped to 61px rows); outlined fields not focused lose the surface fill and control shadow, hovered ones show `--cs-tone-line`, and the outline is transparent unless hovered or in error. A focused cell field keeps c-style's field focus (accent line + 3px halo), Canon's editor being a Text Input. Coalesce's `td { padding: 0 }` already matches Canon's. Sizing the fields down or gapping them was rejected: Canon keeps the edit frame at the table's control size, flush to the cell, and avoids the grid look by hiding the frame instead.

Not a nested-defaults lever: Coalesce passes `variant="outlined"`, `density="compact"` and `label=""` explicitly, and VTable-nested VField defaults would also reach dialogs and menus opened from a cell. Generic `v-table` cells with fields are left as Vuetify's (Canon's recipe needs the 0-padding cell).

Fields stay at Coalesce's 120px minimum, so narrow columns truncate values (as before; now 10px more since the text is 16 in rather than 6).

CSS (non-comment lines): `coalesce/` +29 (`_admin.scss` +8, `_list.scss` +21).

Tests: `verify/app/coalesce.spec.ts` +6 — search frame 8 from the start edge and the page size 8 from the end, search icon on the title text's x (light, dark, 1440; and 400, where no `hidden-xs-only` element shows); audit filters 8 in; editable Widget table (light, dark): every cell field frameless at rest (transparent line, fill, no shadow), hovered field line zinc-200 / zinc-700 with its neighbours still hidden, focused field one halo layer, each value's text x = its header's, all rows 56. App 99/99, unit 38/38, verify `tsc` clean.

## Fixes: showcase findings

Findings from the showcase pages (`/dashboard`, `/workspace`, `/workspace/:id`, `/settings`, `/gallery`). Each checked against Canon first; lever per the usual order.

| # | Finding | Canon | Lever | Result |
|---|---|---|---|---|
| 1 | Plain `<a>` / router links in browser blue / purple | Link (`theme/link.css`): blue-600 / 400, hover and focus 700 / 300, 1px line at 0.2em, standalone = no line until hover, focus outline 1px 2px out, no visited colour | Theme role `--v-link` (600 / 400; hover reuses `--v-primary-text`); `_nav.scss` one rule on `.v-application a[href]` without a `v-*` class. Adoption: the template's unlayered `a { text-decoration: none }` in `site.scss` goes (it would hide the hover line) | Links blue-600 / blue-400, underline on hover only |
| 2, 3 | Tonal avatars, tonal info alert, selected tonal card low-contrast in dark (600 on a dark tint) | Seeded avatar and hued tag: fg 700 / 300 on tone-400 15% / tone-500 20% (`seed.css`, `tag.css`), the button medium recipe | Tone recipe, generalised in `_tone.scss`: the text-step re-point (was `.v-btn.text-*` and `.v-chip.text-*`) now covers every `--variant-tonal|text|plain` component plus buttons and tags; one shared tonal underlay rule (tone tint at `tint-2`) replaces the tag one. Outlined alerts and toasts keep the 600 icon | Dark: green-300 initials on green-500 @ .2; tonal info alert and selected slide card blue-300. Light moves to 700 on 400 @ .15 too (Canon) |
| 4 | `size="small"` chips 18px / 10px; close X 18px | Tag sm 24 / md 32 / lg 40, 12 / 14 / 16 type, text 6 / 10 / 14 in, icon and remove icon = line height (16 / 20 / 24); sm is the smallest | `$chip-close-size: 16px`; `_data.scss` re-points per named size (Vuetify's chip mixin emits literal 6px steps; `$size-scales` is global and also drives avatars, whose steps already equal Canon's): `small`/`x-small` = sm, `large` = md, `x-large` = lg | Dashboard and combobox tags 24 / 12px with a 16px X; combobox fields stay 40 |
| 5 | Tabs flush against a card's top-left | Card header padding 20, header→body gap 16 | `_nav.scss`: `.v-card > .v-tabs` first (or after the card loader) gets `margin: 20px 20px 16px` | Track at (20, 20) |
| 6 | `v-pagination` too wide, one page in a ~330px card, overflow with `total-visible` | Page squares 40, list gap 8, no outer margin | `$pagination-item-margin: 0` + list `gap` (`_data.scss`) | Row 40 (was 48; the README deviation is gone), items 8 apart. **Still one page at 325px**: Vuetify's measure needs 5 slots for `1 … 4 … 12` (it counts a trailing gap) and Canon's own 7-item row is 328 > 325 (Canon wraps; a wrapped row breaks Vuetify's measuring). `total-visible` overflow is Vuetify's (no wrap). Documented |
| 7 | `c-list-page` prev/next 28px outlined squares beside 40px fields | Pagination arrows: control squares, transparent border, button radius, default icon | Unlayered `_list.scss`: `.c-list-page > .v-btn` 40×40, no frame/shadow, radius 8, 20px icon (Coalesce passes `size="x-small" variant="outlined"` and a small icon) | Level with the 40 page field |
| 8 | Radio-group label indented ~10px | Fieldset legend flush with items, 16 above them | SASS `$radio-group-label-margin-inline-start: 0`, `…-selection-group-padding-inline: 0`, `…-margin-top: 16px` | Flush, 16 above |
| 9 | Standalone `v-list` slab, square full-bleed active row | Nav list / menu rows: 8 radius, inset; current = fill + 500 | SASS `$list-background: transparent`, `$list-padding: 8px 4px`; blueprint `VListItem.rounded: 'md'` (Vuetify adds `rounded-0` unless set, so `$list-item-border-radius` can't reach it; replaces the VMenu-nested default); `_nav.scss` current-item rule widened from nav items to every list item outside menus | Rows 4 in, radius 8, current zinc-100 / 500 |
| 10 | Stepper steps indistinguishable | No Canon stepper; chosen = ink | Blueprint `VStepperItem.color: 'neutral'` (VStepper doesn't pass `color` to its items) | Current (and app-marked complete) badge zinc-900 / white; upcoming grey at .6. Vuetify only marks a step complete with `complete` / `rules`; the gallery's `:items` stepper has none, so step 1 reads as upcoming |
| 11 | Icon FAB 8px square vs extended pill | No Canon FAB; Canon has no pill buttons | `_btn.scss`: `.v-fab.v-fab--extended .v-btn` radius = `--v-btn-border-radius` (Vuetify's pill is a literal in its overrides layer, so (0,3,0)) | Both 8 |
| 12 | Banner grey fill, actions low-right | Banner: zinc-100 / **zinc-900** strip, rule, 8 block / 16 inline padding, gap 12, 20px icon, small high neutral actions at the row end, centred | Theme role `--v-banner`; SASS `$banner-padding: 4px` (two-line → 8), prepend gap 12, text padding-end 12, action margins 0; blueprint `VBanner.VAvatar.size: 20`, `VBannerActions.VBtn { neutral, flat, small, slim: false }`; `_surface.scss` centres prepend and actions | Light fill kept (Canon's zinc-100 — Canon-faithful); dark now zinc-900; 45px row with 32px actions centred. The gallery's explicit `variant="text"` actions stay text |
| 13 | `c-datetime-picker` menu off the viewport bottom | — | **c-style caused it.** `cs-popup` scaled with the `scale` property; Vuetify's placement undoes only `transform` (`nullifyTransforms`), so the panel measured 3% short while opening and a 384px menu "fit" below the field (ending at 899 of 900). Now `transform: scale(.97)` | Opens above when it doesn't fit below |
| 14 | "Columns & Filters" count clipped | Count | Unlayered `.c-list-filters { overflow: visible }` (the button's own `overflow: hidden` clipped the floating badge 2px) | Whole |
| 15 | `csIcon` needs `@lucide/vue` in the app | — | New entry `c-style/icons`: `export * from "@lucide/vue"` plus `csIcon`. README documents it | `import { csIcon, House } from "c-style/icons"`; kitchen uses it |

Left alone (Canon-faithful): light dialog scrim, light tooltips, light banner fill.

CSS (non-comment lines): `overrides/` 490 → 537 (+47: `_tone` +11, `_data` +14, `_nav` +19, `_surface` +3; `_btn`/`_motion` net 0), `coalesce/` 170 → 183 (+13), `settings.scss` +11. Theme roles `banner`, `link`.

### API changes

| Change | Where |
|---|---|
| New entry `c-style/icons` (Lucide re-export + `csIcon`) | package exports |
| Theme variables `--v-banner`, `--v-link` | theme |
| Blueprint: `VListItem.rounded: 'md'` (global; was VMenu-nested), `VBanner.VAvatar.size: 20`, `VBannerActions.VBtn { color: 'neutral', variant: 'flat', size: 'small', slim: false }`, `VStepperItem.color: 'neutral'` | `c-style` |
| `cs-popup` animates `transform`, not `scale` | `c-style/styles` |
| Demo: `site.scss` `a { text-decoration: none }` removed (adoption diff); kitchen shows a `c-style/icons` icon | demo |

Working note: changing `packages/c-style/package.json` `exports` needs a Vite restart (Vite caches package data; the new subpath 500s until then). Killed only the Vite child, as for the Vuetify relink.

### Tests

New `verify/app/showcase.spec.ts` (17 tests): link colours/line light and dark; dark and light tonal avatar text/tint, tonal alert, selected tonal card; tag 24/12 and 32/14, 16px remove icon, combobox fields 40 with 24 tags; tabs at (20, 20) with 16 below; pagination row 40, 8 apart, no item margin; `c-list-page` arrows 40 frameless at the field's y with 20px icons; radio legend flush and 16 above; list transparent, rows 4 in, radius 8, current fill/500; stepper current ink badge, upcoming faded; FAB radii 8; banner fill light/dark, 8 padding, 20 icon, centred 32px neutral actions; datetime menu opens above inside the viewport at 1440×900; filter count unclipped; `c-style/icons` icon 20px at stroke 1.5. `overlay.spec.ts` now expects `transform: scale(0.97)`.
`coalesce.spec.ts` pagination test now expects frameless arrows. Suites: app 116/116, unit 38/38, Storybook 364/364 (render, parity gate, coverage), `tsc` (package, verify) and demo `vue-tsc` clean. Showcase screenshots regenerated in `verify/screenshots/showcase/` (no console errors or warnings).

## Fixes: picker overlap (Storybook)

Report: date and colour picker stories (dark) showed neighbouring pickers' columns colliding ("S S", "7 1", "2115"), controls rows "> <" touching, month/year views running into the next picker.

| Overlap | Cause | Fix |
|---|---|---|
| Pickers drawn over each other (date, time, colour) | **Story.** `sb-row stack` lays items in a grid of `minmax(240px, 1fr)` cells, 252 apart; the pickers are fixed 304 (date), 328 (time), 300 (colour) wide, so each overran the next by 52 / 76 / 48px. Every collision in the screenshot is this | `SbRow` gets a `wrap` prop (items keep their width, top-aligned, wrap 12 apart); the date, time and colour picker rows use it |
| Date picker content wider than its box, day columns 41.2 | **Library.** The docked controls row is 12 + month group 140.5 (36 + 68.5 + 36) + year group 148 (36 + 76 + 36) + 12 = 312.5 > 304. The picker body is a flex column, so the month, months and years views stretched to 312.5 too and `overflow: hidden` clipped 8.5px: grid 288.5 (7 × 41.2), 12 in on the left, 4 on the right | SASS `$date-picker-controls-docked-toggle-btn-padding: 8px 4px` (Vuetify 12px 8px): groups 130.5 + 138 = 268.5 ≤ 280. Every view is 304, the grid 280 (7 × 40) 12 in on both sides. This was M14's "≈ 41 apart" deviation, now gone |
| Colour picker content | Fits: canvas, preview and inputs inside the 300 box (the 5px preview scroll overflow is the slider thumb's invisible 28px ripple) | — |

Tests: `verify/lib/layout.ts` `pickerSpill` (any picker body section, button, day grid, slider track, canvas or input reaching past the picker's left/right edge) and `rowOverlaps` (overlapping `sb-row` items). `verify/parity/pickers.spec.ts` (7): date/time/colour picker stories × light/dark fit and don't overlap; every month-view date picker's grid is 12 / 280 / 12 with cells 40 apart. `stories.spec.ts` now also fails any story whose row items overlap. `verify/app/pickers.spec.ts`: cells exactly 40 apart; `/c-style` pickers (month, months and years views) and `/gallery` date card fit, light and dark. All of these fail on the old settings/story. Suites: app 119/119, unit 38/38, Storybook 371/371, `tsc` (verify) and Storybook `vue-tsc` clean.


## Fixes: avatar and icon in a tag

Report: an avatar in a chip is too big next to Canon's tag (gallery `pill` chip: a 24px avatar filling the 24px tag, flush with the edge); Canon tags round more as they grow.

Canon (`tag.css`, measured in `Parity/Data/Tag Media`), sm / md / lg: tag 24 / 32 / 40, radius 2 / 4 / 8; avatar and icon = line height 16 / 20 / 24, centred, `padding` 4 / 6 / 8 from the start edge, gap + label inset 4 / 8 / 12 to the text; remove icon the same size, 4 / 8 / 12 after the text and 4 / 6 / 8 from the end; initials 0.4 × line height (6.4 / 8 / 9.6px) at 400, seeded tint tone-400 @ .15 / 700 (dark tone-500 @ .2 / 300).

| Before (c-style) | sm | md (`large`) | lg (`x-large`) |
|---|---|---|---|
| avatar | 18 (default size had no re-point; `pill` 24) | 20 | 24 |
| avatar / icon start inset | 1.8 / 3 (`pill` 0) | 4.4 / 6 | 7.7 / 9.5 |
| gap to text | 3 | 4 | 4.5 |
| remove gap / end inset | 3 / 3 | 4 / 2 (20px icon in a 16px close box) | 4.5 / 1.5 |
| initials | 12 / 500 | 14 / 500 | 16 / 500 |
| radius | 2 | 2 | 2 |

After: every value equals Canon's (tint colours already did).

Lever: no SASS setting covers it (Vuetify's `chip-sizes` mixin emits avatar height = height − 6, full height on pills, and media margins from its literal 6px steps; there is no `$chip-avatar-size`). `_data.scss`'s per-size loop now takes Canon's tag metrics (padding, gap, label inset, line height, font size, radius), includes `default`, and derives height, text inset, `label` radius, avatar size and initials, start/end media margins and the close box's max size from them. +39 lines (+29 non-comment).

Tests: Storybook `Parity/Data/Tag Media` (photo avatar, blue-seeded initials, icon + remove × sm/md/lg) in the parity gate (one new allowance: Canon cuts the avatar circle with a mask, no radius); `verify/parity/tag.spec.ts` compares media size, start inset, label gap and remove gap/end inset with Canon's frame. `showcase.spec.ts`: gallery avatar tag light/dark (16 avatar 4 in and 4 before the text, 6.4/400 initials, blue 700/300 on its tint); chip radius 2 (small) / 4 (large).

Not done: Canon's neutral remove segment on hued tags (README deviation).
Suites: app 121/121, unit 38/38, Storybook 377/377, `tsc` (verify) and Storybook `vue-tsc` clean.

## Fixes: time picker AM / PM and fields

Report (dark): the chosen period didn't read as chosen. AM (chosen) was grey text on a grey tint; PM (unchosen) light blue on a blue tint with a blue frame, so it looked like the selection.

Cause: VTimePickerControls passes `color` only to the chosen period's VBtn (`undefined` to the other), so the unchosen one took the global `VBtn { color: 'primary', variant: 'tonal' }` blueprint and Vuetify's 1px currentColor frame; the chosen one was neutral tonal. The hour / minute fields differed only by Vuetify's overlay (.04 vs .12 on `surface-light`). Also: the segmented card (tabs, VBtnToggle) used `surface-bright`, which in dark is zinc-800, the track's own colour, so the card vanished there.

Canon: Segmented Control (canon §4 A): track `fill`, 3px inset, options 2 apart; chosen = card (white / zinc-700, 6% edge ring + raised shadow) in ink; unchosen muted, no frame, hover to ink; focus = the button ring in place of the card shadow.

Levers, in order:
- Theme: neutral role `segment` (white / zinc-700), the segmented card. Inset tabs and VBtnToggle use it too (their dark card was zinc-800, an M13 deviation now gone).
- Blueprint: `VTimePicker { color: 'neutral', VBtn: { color: 'neutral' } }`, so neither period takes the accent.
- SASS: `$time-picker-controls-ampm-height: 36px`, `$time-picker-controls-input-ampm-height: 32px`: the AM / PM track is as tall as the fields (80 / 72).
- `_nav.scss`: the segmented-track rules (fill, inset, radius, card, shadow, underlay off) widened from `.v-btn-toggle` to `.v-time-picker-controls__ampm`; options get a full transparent 1px border (Vuetify drops PM's top border); the card shadow yields to the focus ring on `:focus-visible`.
- `_pickers.scss`: fields muted on `fill`; the field the clock edits is the card in ink (its `text-neutral` from VTimePickerField); a focused field takes the text input's focus line and halo. The unchosen period re-points `--v-theme-neutral` to `muted` in the `c-style` sublayer (`text-neutral` outranks the overrides layer).

CSS: `_nav.scss` +12 / −9 non-comment, `_pickers.scss` +24, settings +2.

Fixture: `/c-style` gets a second time picker, `variant="input" use-seconds`, with its model on `data-value`.

Tests (`verify/app/pickers.spec.ts`, +3): light and dark, AM then PM chosen: track = `fill` and as tall as a field; chosen period = card bg + ink + shadow, unchosen = transparent + muted, chosen contrast at least 3 above unchosen; hour field card + ink, minute `fill` + muted; focusing the minute field moves the card and adds the inset focus line; keyboard focus on PM shows the 2 + 3px ring. Input variant: typing into hour, minute and second each updates the model (`09:30:15` → `11:45:07`). The input-variant "second field didn't work" report was the story sharing one `HH:mm` model (19e3d00).

Suites: app 124/124, unit 38/38, Storybook 377/377 (one Data Table parity timeout under 6 workers, passes alone).
