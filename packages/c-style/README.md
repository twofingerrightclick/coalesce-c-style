# c-style

Canon's look for Vuetify 4 and Coalesce (`coalesce-vue-vuetify3`). c-style restyles stock Vuetify components and Coalesce's `c-*` components through Vuetify's own channels: SASS settings, a blueprint of component defaults, and a theme. A small amount of layered CSS covers what those channels can't express. Apps keep writing plain `<v-btn>`, `<v-text-field>` and `<c-admin-table-page>`; nothing in app templates changes.

What you get, at Canon's md size: Public Sans, bundled (Canon's own Inter is an opt-in import); 32/40/48px controls (40 by default) with 20px Lucide icons at a 1.5px stroke; 4/8/12px radii; zinc neutrals with a blue accent, both generated as full 50–950 ladders from any brand hex; hairline rules, edge-and-shadow depth, a 2px+1px focus ring, and 0.12s motion with a 0.98 press. Light and dark follow the OS (`defaultTheme: 'system'`).

## Why it ships this way

c-style is one Vite-first package with five entry points. Vuetify's SASS variables only reach its compiled component CSS through `vite-plugin-vuetify`'s `styles.configFile`, and no other plugin can inject that option, so c-style's Vite plugin replaces the app's `vite-plugin-vuetify` call and owns `configFile`. Everything else is runtime: the blueprint and theme are plain objects passed to `createVuetify`, and the CSS is one stylesheet import.

| Entry | Contents | Runs in |
|---|---|---|
| `c-style/vite` | `cStyle(options)`: `vite-plugin-vuetify` with c-style's settings, plus Vuetify's layer-order `<style>` in `index.html` and dev-server file access for the package and its font | `vite.config.ts` |
| `c-style` | `cStyleBlueprint`, `cStyleThemes`, `applyCStyleColors`, `generateLadder`, `palettes`, icons (`cs`, `csAliases`, `csIcon`, `csIconOptions`), `layerOrderCss` / `layerOrderStyle`, Canon Time components (`CsTimeField`, `CsTimeRangeField`, `CsTimeInput`), types | browser |
| `c-style/icons` | every `@lucide/vue` icon, re-exported, plus `csIcon` | browser |
| `c-style/settings` | Vuetify SASS settings (`@forward 'vuetify/settings' with (… !default)`); emits no CSS | Sass |
| `c-style/styles` | layer order, Public Sans, `--cs-*` tokens, layered overrides, unlayered Coalesce rules | browser, via Vite |

The package ships TypeScript and SCSS source; the consuming app's Vite compiles them. That works inside this pnpm workspace. A prebuilt `dist` for npm is not done yet (plan M19).

Peer dependencies: `vue ^3.5`, `vuetify ^4.3`, `vite-plugin-vuetify ^2.1`, `vite ^7 || ^8`, `sass ^1.80`. Vuetify must resolve to one real path from both the app and c-style; with two copies, Sass silently applies none of the settings (see [Troubleshooting](#troubleshooting)).

## Install

In a pnpm workspace:

```jsonc
// package.json of the app
"dependencies": {
  "c-style": "workspace:*"
}
```

Then `pnpm install`. c-style brings `@lucide/vue`, `@fontsource-variable/public-sans`, `inter-ui` and `culori`.

## Adopting it in a Coalesce app

The whole change for the Coalesce starter template. Routes, views and Coalesce props stay as they are.

`vite.config.ts`:

```diff
-import createVuetify, { transformAssetUrls } from "vite-plugin-vuetify";
+import { transformAssetUrls } from "vite-plugin-vuetify";
+import { cStyle } from "c-style/vite";
 ...
   plugins: [
     ...
-    createVuetify({ autoImport: true }),
+    cStyle(),
   ],
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
-  defaults: { VTextField: inputDefaults, /* … */ VSwitch: { color: "primary" } },
-  theme: { themes: { light: { colors: {} }, dark: { colors: {} } } },
+  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
 });
```

`package.json`: add `"c-style": "workspace:*"`; `@fontsource/roboto` can go.

`site.scss`: the template's input-details alignment, readonly dashed outline, `--fa-display` and `a { text-decoration: none }` rules are now c-style's; delete them. (The last one is unlayered, so it would keep Canon's link line from showing on hover.)

### CSS import order

1. `@fortawesome/fontawesome-free/css/all.css` (Coalesce still renders a few raw FontAwesome `<i>` tags; c-style masks them with Lucide shapes).
2. `coalesce-vue-vuetify3/styles.css`
3. `vuetify/styles`
4. `c-style/styles`, which must come after Coalesce's CSS: both are unlayered, and c-style's `.c-*` rules win by source order.
5. The app's own styles.

Keep a single CSS chunk (the template's `codeSplitting.groups` `styles` group) so bundled order follows `main.ts`. Vuetify's cascade-layer order must be the first CSS the page parses (vuetify#22752); the template's `index.html` already inlines it, `cStyle()` injects it when a page lacks it, and `c-style/styles` repeats it.

### Optional cleanup

- The template's `<v-app-bar color="primary">` gives an accent app bar. Drop `color` for Canon's neutral bar (white / zinc-900 over a hairline). c-style leaves explicit app colours alone.
- Coalesce admin toolbars are neutral whatever `color` the page gets (see [Coalesce](#coalesce)); nothing to change in routes.

## Colours

```ts
cStyleBlueprint({
  colors: {
    primary: "#7c3aed",      // a hex: a 50–950 ladder is generated around it
    neutral: "slate",        // a Tailwind v3 palette name
    success: "emerald",
    warning: "amber",
    error: "rose",
    info: "sky",             // defaults to primary
    dark: { primary: "#a78bfa" }, // per-mode overrides, same shape
  },
});
```

Each value is a hex, a Tailwind v3 palette name (`zinc slate gray neutral stone red orange amber yellow lime green emerald teal cyan sky blue indigo violet purple fuchsia pink rose`) or a full ladder object (`{ 50: "#…", …, 950: "#…" }`). Omitted intents use Canon's palette (blue accent, zinc neutral, green / amber / red).

From the ladders the theme derives Canon's roles in both modes: solids at step 600 with their `on-*` colour, labels at 700 / 300, tints, lines, hover and press steps, focus and halo. Components read those roles, never hexes.

- **Runtime switch:** `applyCStyleColors(useTheme(), { primary: "#e11d48" })` regenerates the ladders and updates every registered theme in place, without a reload.
- **Ladders on their own:** `generateLadder("#7c3aed")` returns `{ 50 … 950 }`. The input hex is pinned to its nearest step, and the rest follows the hue drift of the nearest Tailwind palette, so Tailwind inputs reproduce Tailwind.
- **`palettes`** holds the Tailwind v3 hexes; `steps` the step names.
- **Escape hatch:** plain Vuetify `theme.themes.light.colors.*` in the app's `createVuetify` options still wins over the blueprint, but ladders and roles don't follow such edits.

Contrast: white on the success solid (green-600) is 3.3:1, Canon's own choice. The emerald and orange presets give 3.8 and 3.6. For AA body text on those, pass a darker hex or a full ladder.

## Font

The default is **Public Sans** (variable, upright and italic, latin + latin-ext + vietnamese), shipped with the package through `@fontsource-variable/public-sans` and bundled by Vite with the app: no font request leaves the app at run time.

Another body and heading font is a theme setting:

```ts
cStyleBlueprint({ font: "IBM Plex Sans" });  // or { family, features, tracking }
applyCStyleFont(useTheme(), "Geist");         // switch at run time, no reload; no argument restores Public Sans
```

c-style only sets theme variables (`--v-font-body`, `--v-font-heading`, `--v-font-features`, `--v-font-tracking`); the app ships the font files. Self-host them the same way c-style does: an `@fontsource` package or your own `@font-face` with woff2 files in the app, imported after `c-style/styles`. Avoid a CDN `<link>` in production; the Google Fonts and Fontshare presets in the Storybook are for preview only.

- **Inter (Canon's font):** `import "c-style/fonts/inter"` after `c-style/styles`, and `cStyleBlueprint({ font: "Inter" })`. It is rsms's build (`inter-ui`), which keeps the alternates Canon turns on.
- **Features:** Canon's Inter alternates (`ss01 cv11 cv04 cv03 cv02`) apply only to Inter. Every other font gets `font-feature-settings: normal`, because the same tags select unrelated glyphs elsewhere (`ss01` swaps glyphs in Satoshi, General Sans, Work Sans and Public Sans). Pass `features` to choose a font's own.
- **Tracking:** Canon's negative letter-spacing (−0.006em at 14px, to −0.02em on display roles) is tuned for Inter. `--v-font-tracking` scales it: 1 for Inter, 0.5 for Public Sans (wider-set; half keeps titles compact without crowding body text), 0 for any other font unless you pass `tracking`. Positive caps tracking is unchanged.
- `applyCStyleColors` leaves the font alone, and `applyCStyleFont` leaves colours alone.

## Overriding SASS settings

Every value in `c-style/settings` is `!default`. To change one, write an app settings file and point `cStyle` at it:

```scss
// src/styles/settings.scss
@use 'c-style/settings' with (
  $table-row-height: 48px,
);
```

```ts
cStyle({ settings: "src/styles/settings.scss" });
```

`cStyle({ vuetify: { … } })` passes other options to `vite-plugin-vuetify` (`autoImport` defaults to true; `styles` belongs to c-style). Settings changes recompile Vuetify's SASS (a few seconds on first load, then HMR).

## Sizes

Canon's md is the default everywhere. Smaller and larger controls are per instance through Vuetify's named sizes, which c-style maps to Canon's sm / md / lg:

| `size` | Button | Icon in button | Type |
|---|---|---|---|
| `x-small` | 28 (in-box) | 16 | 12/16 |
| `small` | 32 | 16 | 12/16 |
| default | 40 | 20 | 14/20 |
| `large`, `x-large` | 48 | 24 | 16/24 |

Tags (`v-chip`) follow Canon's tag sizes: `x-small`, `small` and default are sm (24, 12/16 type; Canon has nothing smaller), `large` md (32, 14px), `x-large` lg (40, 16px), radius 2 / 4 / 8 (`label`; the blueprint default). Icons, avatars and the remove icon are the line height (16 / 20 / 24), 4 / 6 / 8 from the edge and 4 / 8 / 12 from the text; avatar initials are 0.4 of the avatar at weight 400. Pill chips keep the same avatar (Vuetify's full-height pill avatar is not Canon).

Avatar initials take Canon's type for the avatar's size at weight 400: 24 → 10/12, 32 → 12/16, 40 → 14/20, 48 and 56 → 16/24, 64 → 24/32. Named sizes `x-small` … `x-large` are 24 … 56; a numeric `size` takes the nearest step (12–96px). Leave the text bare or in a plain `<span>`; a type class such as `text-caption` overrides it.

Fields are 40px at every `density` (Coalesce passes `compact` and `comfortable`); density never changes a control's size. Tables keep Vuetify's density rows (56 / 48 / 40), Canon's default being 56; `density="compact"` gives Canon's compact 40. The `--cs-*` custom properties (`--cs-control-height`, `--cs-icon`, `--cs-radius`, `--cs-gap-md`, `--cs-hairline`, …) are Canon's md values for c-style's own rules. There is no inherited size context.

## Icons

- **Vuetify aliases** (`$close`, `$dropdown`, `$checkboxOn`, … all 65) render Lucide icons at a 1.5px stroke that stays 1.5 at any size. Checkbox and radio glyphs are c-style's own SVGs.
- **App icons:** `<v-icon :icon="csIcon(House)" />` with any Lucide icon. `csIcon(icon, props?)` caches per icon, so it is safe in templates. Import both from `c-style/icons`, which re-exports `@lucide/vue`, so the app needs no Lucide dependency of its own (and gets c-style's copy):

  ```ts
  import { csIcon, House } from "c-style/icons";
  ```
- **FontAwesome strings** that Coalesce passes (`"fa fa-clock"`, `"fa-edit"`, …) are mapped to Lucide by the `cs` icon set; other classes on the string are kept. Unmapped strings render as class names, so FontAwesome or MDI classes still work. A `fa:` prefix forces Vuetify's FontAwesome set.
- Coalesce's raw `<i class="fa fa-*">` glyphs (row actions, info and asterisk marks, the password eye) are masked with the matching Lucide shape (`scripts/fa-masks.mjs` regenerates the masks).
- Default icon size is 20 (16 in tags and small buttons, 24 in large buttons).

## Components: Canon Time

Canon's time field is far better than Vuetify's `v-time-picker` for typing: a row of framed cells (hour, minute, optional second, AM/PM), each typed into or stepped from the keyboard. c-style ships it as three Vue components (inventory and keyboard model: `docs/research/canon-time.md`).

```ts
import { CsTimeField, CsTimeRangeField } from "c-style";
```

```vue
<cs-time-field v-model="opens" label="Opens" :step="900" :rules="[required]" />
<cs-time-range-field v-model="shift" label="Shift" overnight hint="May end the next day." persistent-hint />
```

| Component | v-model | Use |
|---|---|---|
| `CsTimeField` | `"HH:mm"`, or `"HH:mm:ss"` with seconds; `null` while empty or incomplete | a time in a form: label above, hint / messages below, `rules`, VForm |
| `CsTimeRangeField` | `[start, end]`, each as above | a time window; an end before the start is invalid unless `overnight` |
| `CsTimeInput` | either (with `range`) | the bare box, no label or messages; name it with `aria-label` |

Values are always 24-hour; the cells show 12 or 24 hours. Inputs also accept `"h:mm pm"` and `Date`.

Props (all three): `format` (`'ampm'` / `'24hr'`; unset follows Vuetify's locale), `step` (seconds per step, as `<input type="time" step>`: `900` moves minutes by 15; under 60 adds a seconds cell), `use-seconds`, `min` / `max` (out of range is invalid, not prevented), `allowed-hours` / `allowed-minutes` / `allowed-seconds` (arrays or functions; Up / Down skip the rest, typed ones are invalid), `size` (`small` / `default` / `large`: cells 32 / 40 / 48), `disabled`, `readonly`, `required`. Fields add VInput's `label`, `hint`, `persistent-hint`, `messages`, `rules`, `error`, `error-messages`, `max-errors`, `hide-details` (default `auto`), `validate-on`, `id`, `name`; ranges add `overnight`, `start-label` / `end-label` (accessible names, default "Start" / "End"). App defaults reach them by name (`defaults: { CsTimeField: { … } }`). Exposed: `focus()`, and on fields `validate()`, `reset()`, `resetValidation()`.

Keys: Tab / Shift+Tab per cell; Left / Right between cells; Up / Down step and wrap (59 → 00, PM ↔ AM; empty starts from now); digits fill a cell and move on (`7` is `07`); `:`, `.` or space move on; A / P set the period; Backspace clears (then goes back), Delete clears in place; Home / End and PageUp / PageDown (hours by 6, minutes by 10 or the step); paste fills every cell; Enter submits the form; the mouse wheel steps the focused cell. The focused cell grows and shows step arrows (hold to repeat).

Canon's own checks become the field's first rule: "Enter a complete time." (left incomplete), `min` / `max` / `step` in the browser's words, "Choose an allowed time.", "The end time is before the start time.".

Not covered: localised strings (labels and messages are English); no clock dial or popover (Canon has none). `v-time-picker` is unchanged and still restyled by c-style.

## What is styled where

In order of preference; a change uses the first channel that can express it.

1. **SASS settings** (`src/styles/settings.scss`, `_sizes.scss`, `_typography.scss`): sizes, radii, type scale, density maps, paddings, shadows (`$shadow-key` → theme variables), colours that name a theme role.
2. **Blueprint defaults** (`src/defaults.ts`): prop choices such as `VBtn { color: 'primary', variant: 'tonal' }`, neutral minimal buttons inside toolbars, tables, fields, lists, alerts and toasts; outlined text inputs with the label above; `VAlert`/`VSnackbar` outlined; inset tabs; neutral choices and pickers; ripple off.
3. **Theme** (`src/theme/`): every colour and every light/dark difference, as Vuetify theme colours plus role variables (`--v-primary-text`, `--v-frame`, `--v-shadow-raised`, …).
4. **`@layer vuetify-overrides`** (`src/styles/overrides/`, one partial per family): what no variable, default or theme key reaches, for example the button tint rungs, the field frame and halo, the label above, choice lines, the segmented track, the menu tick. Rules read tokens and theme variables only: no hex, no `!important`, specificity ≤ (0,3,0).
5. **Sublayer `vuetify-utilities.c-style`** (`tone.repoint`): custom-property re-points that have to beat Vuetify's theme classes on the same element (button labels at the tone's text step, hover and press solids, disabled greys, admin toolbars' `bg-primary`). Custom properties only.
6. **Unlayered `.c-*` rules** (`src/styles/coalesce/`): Coalesce's own unlayered CSS and inline styles. Every selector starts with a `.c-` class; `!important` only against Coalesce's inline styles.
7. **c-style components** (`src/components/`, CSS in `src/styles/components/`, `@layer vuetify-components`): Canon components Vuetify lacks (Time). Same token-only rule as the overrides.

### Coalesce

- Admin table, editor, methods and audit toolbars are card headers: no shadow, a rule below, a 56px main row and a 48px filter row. Coalesce fills them with `bg-primary` when the page gets `color="primary"` (the starter template's admin routes, and the audit page's own default); c-style re-points the toolbar's primary to the surface, so they stay neutral without touching routes.
- Pagination, the "Showing 1 - 10 of 40" range and page-size text use Canon's muted 14/20 info type; prev/next are Canon's frameless 40px arrow squares beside the 40px page field.
- The "Columns & Filters" active-filter count shows whole (the button clipped it).
- Row actions are neutral Lucide icons; the pinned actions column has a hairline and a flat 4px band instead of a blurred shadow.
- Editor labels are 14/20/500 ink, rows a form gap apart.
- The audit "Entity Type" filter keeps its label visible while it holds an empty value.
- The filter row's first control (table search, audit filters) sits 8px from the card edge, as the row's last control does; the search icon lines up with the title text. Below 600px the title and its dividers hide (Coalesce's `hidden-xs-only`, a class Vuetify 4 dropped).
- Editable `c-table` cells are Canon data table edit cells: the field spans the cell with no frame at rest, the field line under the pointer, the focus frame while typing (errors keep their line); values start under their header text and rows stay 56. Read-only cells in edit mode don't wrap.

## Known deviations from Canon

Kept on purpose or not reachable through Vuetify; the parity gate (`verify/parity/parity.spec.ts`) lists each one it allows.

- **Font:** Canon specifies Inter; c-style defaults to Public Sans (bundled, no CDN), with Inter's alternates off and half Canon's tracking. Inter stays one import away (see Font). The parity gate measures in Inter, Canon's own font.

- **Field height** comes from a −3 density on a 52px base (Vuetify hard-codes field padding as `16px + density/2`). A spec pins every field at 40.
- **Neutral ink** labels sit one step off Canon in places (zinc-950 vs 900 for the page's labels, zinc-100 vs white for dark neutral button labels).
- **Disabled, dark:** low and minimal buttons use zinc-500 (Canon zinc-600), the low-emphasis line zinc-700 (Canon zinc-800).
- **Messages** are ink at Vuetify's medium emphasis (≈ zinc-500); error messages use error 600 (Canon 700 / 300). Choice messages sit 8px below (Canon 6).
- **Alerts:** a typeless alert still shows a zinc bar; the dark alert icon is error 600 (Canon 400). Banner intents are not styled, and the banner keeps Vuetify's close-less layout (no Canon close button).
- **Toasts:** no stacking, timer line or Canon enter motion.
- **Tags:** the neutral high-emphasis tag is Vuetify's flat chip (zinc-100), not Canon's 70% ink solid; the neutral low line is zinc-200 (Canon ≈ zinc-300). Tags inside a combobox are sm (Vuetify asks for `small`; Canon's md 32 doesn't fit the 40 field). On a hued tag the remove icon sits in the tag's tint; Canon gives it its own neutral segment (zinc-100 / zinc-700, the tag's end radii).
- **Segmented control (VBtnToggle) and tabs:** rest options are muted zinc-500 (Canon zinc-600); the card crossfades instead of gliding.
- **Navigation:** the dark current nav item is zinc-800 (Canon zinc-700); sidebar items are 10px in (Canon 16); the breadcrumb separator is `/` (Canon a chevron); the demo's app bar is 48 (Canon md 64).
- **Pagination:** Vuetify decides how many pages to show by measuring, counts a gap after the last item, and with a middle page needs five slots for `1 … 4 … 12`; below that (a card under about 336px) it shows the current page alone. Canon's own row of seven items is 328px, so it doesn't fit a 325px card body either (Canon wraps it; Vuetify's measuring can't take a wrapped row). With `total-visible` the row can overflow. The unsorted column arrow stays hidden until hover (Canon shows `arrow-down-up`).
- **Links:** every app link is Canon's standalone link (no line until hover). Canon's in-text link, underlined at rest, isn't told apart.
- **Stepper** (no Canon counterpart): current and completed steps get the ink badge; a step only counts as completed when the app marks it (`complete`, or `rules`), as in Vuetify.
- **FAB / speed dial** (no Canon counterpart): button radius for both icon-only and extended; otherwise Vuetify's.
- **Dialog** opens with Vuetify's transition (Canon scales from .98); tooltips have no arrow.
- **Date picker:** today is a ring (Canon a dot); its controls row is Vuetify's (month and year menus, toggles padded 8 / 4 so the row fits the 280px grid). Longer month or year labels than English "Sep" / "2026" by more than about 11px would widen the row past the 304px box again.
- **Stacked choices:** separate checkboxes and switches stack at Canon's 28 / 32px pitch only inside a `v-form` (or as a `v-radio-group`); elsewhere sibling inputs may be laid out in a row, so they keep the 40px row.
- **Theme on the same element** (`<v-btn theme="dark">`) wins over c-style's re-points on that element; a theme on an ancestor is fine.

## Upgrading Vuetify or Coalesce

c-style relies on some Vuetify and Coalesce internals. After an upgrade, run all suites (below) and check these by hand if anything moved:

- **Layer order:** `test/layer-order.spec.ts` fails if Vuetify's `lib/styles/layers.css` changes. Update `src/layer-order.mjs` and `_layers.scss` together, keeping `c-style` last in `vuetify-utilities`.
- **Settings canary:** `verify/app/plumbing.spec.ts` checks the 8px button radius; if it fails, Sass loaded a second `vuetify/settings`.
- **Field padding math:** the −3 density on a 52px base depends on Vuetify's `16px + density/2` formula; `verify/app/size.spec.ts` pins every field at 40.
- **Button icon margins:** `$button-margin-start-multiplier: -6.67` assumes Vuetify's multiplier math; `verify/app/button.spec.ts` checks the 10px icon inset.
- **Menu tick** draws on `.v-list-item::after`, which Vuetify uses for its focus border; c-style's focus ring is a box-shadow. If Vuetify moves focus styling back onto `::after`, the tick and focus collide.
- **Dialog parts:** `.v-dialog > .v-overlay__content > :is(.v-card, form > .v-card) > :is(.v-card-item, .v-card-title)` breaks if the card is wrapped in anything else (`v-form`'s own wrapper, a sheet).
- **Inset tabs:** the segmented track uses Vuetify 4's `.v-tabs--inset` and `.v-tab__slider`. Tabs heading a card match `.v-card > .v-tabs:first-child` or `.v-card__loader + .v-tabs` (`verify/app/showcase.spec.ts`).
- **Tonal recipe:** the shared tonal underlay matches `[class*='--variant-tonal'] > [class*='__underlay']` and the text-step re-point `.text-<intent>` with `--variant-tonal|text|plain` classes; a renamed variant or underlay class drops it (`showcase.spec.ts` avatar/alert checks).
- **Popup motion:** `cs-popup` scales with `transform`, which Vuetify's `nullifyTransforms` undoes when it places an overlay. If Vuetify stops undoing transforms, menus near the viewport's bottom open the wrong way (`showcase.spec.ts` datetime check).
- **Chip sizes:** the per-size re-points override the literal values Vuetify's `chip-sizes` mixin emits (`--v-chip-height`, padding, font size, avatar height, media margins) and `.v-chip__close`'s `max-width`/`max-height` (`$chip-close-size`).
- **Avatar initials:** a numeric `size` only reaches the DOM as inline `width`/`height`, so the type rule matches `[style*=" height: Npx"]` for whole pixels 12–96 (`verify/app/data.spec.ts`); another unit or a fraction keeps the inherited type.
- **`__element` selectors** (`.v-selection-control__input`, `.v-field__outline`, `.v-overlay__content`, `.v-snackbar__content`, about 25 in all) assume Vuetify's internal markup.
- **Coalesce** (styled against `coalesce-vue-vuetify3@6.5.1`'s `dist`): toolbar class names and inline heights, `.c-admin-table-toolbar--range`, the pinned `.fixed-column-right`, `c-select`'s `filled` menu search, the raw FontAwesome sites (re-grep `dist` for `fa-` names; `test/coalesce-fa.spec.ts` fails on an unmapped one), the audit filters' markup, the `hidden-xs-only` toolbar classes, `.c-table--editable`'s cell padding rules (`verify/app/coalesce.spec.ts` checks the toolbar insets and edit cells), `c-list-page`'s direct child prev/next buttons and `c-list-filters`' badge (`verify/app/showcase.spec.ts`).
- **Parity gate:** `verify/parity/parity.spec.ts` (with Storybook running) compares every Parity story with Canon in light and dark. A failure lists the property that moved.

## Troubleshooting

- **Nothing from the settings applies** (buttons round at 4px, Roboto-sized controls): two copies of Vuetify. `node -p "require.resolve('vuetify/package.json')"` from the app and from `packages/c-style` must print the same real path.
- **`vuetify/styles` 404s after a `pnpm install`:** `vite-plugin-vuetify` caches Vuetify's path for the life of the Vite process; restart Vite.
- **Font 403s in dev:** the app sets `server.fs.allow`; `cStyle()` adds the package and the Public Sans and `inter-ui` directories, so keep `cStyle()` in the plugin list rather than calling `vite-plugin-vuetify` yourself.

## Credits

The design is [Canon](https://github.com/recepkutuk/canon) by Recep Kütük (MIT). c-style also includes the Tailwind v3 colour palette (MIT) and Lucide icon paths (ISC). Licenses and attribution are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
