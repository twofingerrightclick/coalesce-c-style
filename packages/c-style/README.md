# coalesce-c-style

Canon's look for Vuetify 4 and Coalesce (`coalesce-vue-vuetify3`). c-style restyles stock Vuetify components and Coalesce's `c-*` components through Vuetify's own channels: SASS settings, a blueprint of component defaults, and a theme. A small amount of layered CSS covers what those channels can't express. Apps keep writing plain `<v-btn>`, `<v-text-field>` and `<c-admin-table-page>`; nothing in app templates changes.

What you get, at Canon's md size: Public Sans, bundled (Canon's own Inter is an opt-in import); 32/40/48px controls (40 by default) with 20px Lucide icons at a 1.5px stroke; 4/8/12px radii; zinc neutrals with a blue accent, both generated as full 50–950 ladders from any brand hex; hairline rules, edge-and-shadow depth, a 2px+1px focus ring, and 0.12s motion with a 0.98 press. Light and dark follow the OS (`defaultTheme: 'system'`).

Styling an app's own components to match: see [Styling your own components](#styling-your-own-components) (tokens, the `coalesce-c-style/tokens` SCSS module, and an agent skill).

## Why it ships this way

c-style is one Vite-first package with seven entry points. Vuetify's SASS variables only reach its compiled component CSS through `vite-plugin-vuetify`'s `styles.configFile`, and no other plugin can inject that option, so c-style's Vite plugin replaces the app's `vite-plugin-vuetify` call and owns `configFile`. Everything else is runtime: the blueprint and theme are plain objects passed to `createVuetify`, and the CSS is one stylesheet import.

| Entry | Contents | Runs in |
|---|---|---|
| `coalesce-c-style/vite` | `cStyle(options)`: `vite-plugin-vuetify` with c-style's settings, plus Vuetify's layer-order `<style>` in `index.html` and dev-server file access for the package and its font | `vite.config.ts` |
| `coalesce-c-style` | `cStyleBlueprint`, `cStyleThemes`, `applyCStyleColors`, `generateLadder`, `palettes`, icons (`cs`, `csAliases`, `csIcon`, `csIconOptions`), `layerOrderCss` / `layerOrderStyle`, Canon Time components (`CsTimeField`, `CsTimeRangeField`, `CsTimeInput`), `csVar`, `cStyleTokens`, `cStyleIntents`, types | browser |
| `coalesce-c-style/icons` | every `@lucide/vue` icon, re-exported, plus `csIcon` | browser |
| `coalesce-c-style/fonts/inter` | Canon's Inter (rsms's `inter-ui` build), opt-in; import after `coalesce-c-style/styles` (see [Font](#font)) | browser, via Vite |
| `coalesce-c-style/settings` | Vuetify SASS settings (`@forward 'vuetify/settings' with (… !default)`); emits no CSS | Sass |
| `coalesce-c-style/styles` | layer order, Public Sans, `--cs-*` tokens, layered overrides, unlayered Coalesce rules | browser, via Vite |
| `coalesce-c-style/tokens` | the public SCSS module for app components (`token()`, `surface`, `interactive`, `control-box`, `type`, …); emits no CSS | Sass |

For workspace setup, implementation details, tests and releases, see the [development README](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/DEVELOPMENT.md).

Peer dependencies: `vue ^3.5`, `vuetify ^4.3`, `vite-plugin-vuetify ^2.1`, `vite ^7 || ^8`, `sass ^1.80`. Vuetify must resolve to one real path from both the app and c-style; with two copies, Sass silently applies none of the settings (see [Troubleshooting](#troubleshooting)).

## Install

```sh
pnpm add coalesce-c-style
```

Then add the peer dependencies your app doesn't already have (`vue`, `vuetify`, `vite-plugin-vuetify`, `vite`, `sass`). c-style brings `@lucide/vue`, `@fontsource-variable/public-sans`, `inter-ui` and `culori`.

### Versions

A version has two parts: `<Coalesce version>-cs.<build>`. `6.5.1-cs.3` is the third c-style build, tested against `coalesce-vue-vuetify3` 6.5.1.

- **Left of `-cs.`:** the Coalesce release c-style was checked against. Use the c-style build whose left side matches your Coalesce version.
- **After `-cs.`:** c-style's own build number. It counts up within a Coalesce version and restarts at 1 for the next one.
- **Vuetify:** the Vuetify version c-style is tested with is its `vuetify` dev dependency (currently 4.3.2). The peer range is `^4.3.0`.
- **Pinning:** npm treats these as prereleases, so a range like `^6.5.1` won't pick them up. `pnpm add coalesce-c-style` installs the newest build, and `pnpm add --save-exact coalesce-c-style@6.5.1-cs.2` pins one.

| c-style | Coalesce | Vuetify |
|---|---|---|
| `6.5.1-cs.2` | 6.5.1 | 4.3.2 |
| `6.5.1-cs.1` | 6.5.1 | 4.3.2 |

## Adopting it in a Coalesce app

The whole change for the Coalesce starter template. Routes, views and Coalesce props stay as they are.

`vite.config.ts`:

```diff
-import createVuetify, { transformAssetUrls } from "vite-plugin-vuetify";
+import { transformAssetUrls } from "vite-plugin-vuetify";
+import { cStyle } from "coalesce-c-style/vite";
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
+import "coalesce-c-style/styles";
 import "@/styles/site.scss";
-import { aliases, fa } from "vuetify/iconsets/fa";
+import { cStyleBlueprint } from "coalesce-c-style";
 ...
-const inputDefaults = { density: "compact", variant: "outlined" };
 const vuetify = createVuetify({
-  icons: { defaultSet: "fa", aliases, sets: { fa } },
-  defaults: { VTextField: inputDefaults, /* … */ VSwitch: { color: "primary" } },
-  theme: { themes: { light: { colors: {} }, dark: { colors: {} } } },
+  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
 });
```

`package.json`: the install command adds `coalesce-c-style`; `@fontsource/roboto` can go.

`site.scss`: the template's input-details alignment, readonly dashed outline, `--fa-display` and `a { text-decoration: none }` rules are now c-style's; delete them. (The last one is unlayered, so it would keep Canon's link line from showing on hover.)

### CSS import order

1. `@fortawesome/fontawesome-free/css/all.css` (Coalesce still renders a few raw FontAwesome `<i>` tags; c-style masks them with Lucide shapes).
2. `coalesce-vue-vuetify3/styles.css`
3. `vuetify/styles`
4. `coalesce-c-style/styles`, which must come after Coalesce's CSS: both are unlayered, and c-style's `.c-*` rules win by source order.
5. The app's own styles.

Keep a single CSS chunk (the template's `codeSplitting.groups` `styles` group) so bundled order follows `main.ts`. Vuetify's cascade-layer order must be the first CSS the page parses (vuetify#22752); the template's `index.html` already inlines it, `cStyle()` injects it when a page lacks it, and `coalesce-c-style/styles` repeats it.

### Optional cleanup

- The template's `<v-app-bar color="primary">` gives an accent app bar. Drop `color` for Canon's neutral bar (white / zinc-900 over a hairline). c-style leaves explicit app colours alone.
- Coalesce admin toolbars are neutral whatever `color` the page gets (see the [development README](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/DEVELOPMENT.md#coalesce)); nothing to change in routes.

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

From the ladders the theme derives Canon's roles in both modes: accent solids generally at step 600 with their `on-*` colour, labels at 700 / 300, tints, lines, hover and press steps, focus and halo. Warning's solid uses step 400; neutral and secondary use an inverse neutral solid (dark in light mode, white in dark mode). Components read those roles rather than fixed hexes.

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

c-style only sets theme variables (`--v-font-body`, `--v-font-heading`, `--v-font-features`, `--v-font-tracking`); the app ships the font files. Self-host them the same way c-style does: an `@fontsource` package or your own `@font-face` with woff2 files in the app, imported after `coalesce-c-style/styles`. Avoid a CDN `<link>` in production; the Google Fonts and Fontshare presets in the Storybook are for preview only.

- **Inter (Canon's font):** `import "coalesce-c-style/fonts/inter"` after `coalesce-c-style/styles`, and `cStyleBlueprint({ font: "Inter" })`. It is rsms's build (`inter-ui`), which keeps the alternates Canon turns on.
- **Features:** Canon's Inter alternates (`ss01 cv11 cv04 cv03 cv02`) apply only to Inter. Every other font gets `font-feature-settings: normal`, because the same tags select unrelated glyphs elsewhere (`ss01` swaps glyphs in Satoshi, General Sans, Work Sans and Public Sans). Pass `features` to choose a font's own.
- **Tracking:** Canon's negative letter-spacing (−0.006em at 14px, to −0.02em on display roles) is tuned for Inter. `--v-font-tracking` scales it: 1 for Inter, 0.5 for Public Sans (wider-set; half keeps titles compact without crowding body text), 0 for any other font unless you pass `tracking`. Positive caps tracking is unchanged.
- `applyCStyleColors` leaves the font alone, and `applyCStyleFont` leaves colours alone.

## Overriding SASS settings

Every value in `coalesce-c-style/settings` is `!default`. To change one, write an app settings file and point `cStyle` at it:

```scss
// src/styles/settings.scss
@use 'coalesce-c-style/settings' with (
  $table-row-height: 48px,
);
```

```ts
cStyle({ settings: "src/styles/settings.scss" });
```

`cStyle({ vuetify: { … } })` passes other options to `vite-plugin-vuetify` (`autoImport` defaults to true; `styles` belongs to c-style). Settings changes recompile Vuetify's SASS (a few seconds on first load, then HMR).

## Semantic colors

c-style keeps Vuetify's `color` and `variant` props, theme configuration, and
semantic `bg-*` / `text-*` class syntax. Existing uses such as
`color="primary"` still use the active Vuetify theme. The role values, component
defaults, and hover, focus, pressed, and disabled appearances follow Canon, so
the same props can look different from a default Vuetify installation.

`primary` is the brand accent; `neutral` is the neutral intent. For existing
Vuetify code, `secondary` defaults to the same neutral colors and treatment as
`neutral`, rather than a second brand accent. c-style's palette configuration
has no separate secondary ladder.

For example:

```vue
<v-btn color="primary">Save</v-btn> <!-- default: tonal, medium emphasis -->
<v-btn color="neutral" variant="outlined">Cancel</v-btn> <!-- low emphasis -->
<v-btn color="primary" variant="flat">Publish</v-btn> <!-- high emphasis -->
```

Buttons default to primary and tonal; `flat` and `elevated` are high emphasis,
`tonal` is medium, `outlined` is low, and `text` is minimal. Context can change
defaults: for example, buttons in toolbars and tables default to neutral text,
and selection controls default to neutral. Outlined alerts and snackbars use a
neutral surface with the intent on the icon and bar. Explicit props and Vuetify
defaults providers remain available when a different treatment is needed.

c-style disables Vuetify's literal Material color pack at Sass compile time.
Classes such as `text-red`, `bg-blue-lighten-2`, `text-grey`, `text-white`, and
`bg-black` are not generated. Choose a role instead of a palette color so
the UI follows the active theme and brand:

| Purpose | Use |
|---|---|
| Actions and status | `color="primary"`, `color="neutral"`, `color="success"`, `color="warning"`, `color="error"`, `color="info"` |
| Surfaces and their text | `bg-surface`, `on-surface`, or a Vuetify surface component with `color="surface"` |
| Secondary text | `class="text-muted"`; for custom CSS use `cs.token(muted)` or `csVar('muted')` |
| Accent text on a quiet background | `color: cs.token(primary-text)` (or the corresponding intent) |
| Text over dark media | A dark themed surface with a transparent background and `on-surface` |

Semantic `bg-*` / `text-*` helpers still come from Vuetify's theme system.
c-style's palette ladders remain available internally to resolve tokens;
disabling the Material color pack does not remove brand colors or change
layout utilities. Coalesce's remaining `text-grey` uses in audit logs and
select-menu hints are mapped locally to `--cs-muted`; there is no global
grey compatibility class.

`text-muted` reads `--cs-muted` in Vuetify's foreground utility layer and follows
the element's theme. It is a text helper, not a `color="muted"` component role.
`bg-transparent` remains available as a no-fill helper: Vuetify uses it internally
for drawer and file-upload lists. Color-picker checkmarks and preview tracks,
and video progress tracks, have scoped white/black compatibility rules to
preserve Vuetify's internal contrast choices. Global `text-white`, `text-black`,
and `bg-white` helpers remain absent. Recheck these dependency hooks on upgrades.

If you customize a Coalesce select's menu class, retain its built-in anchor:
`:menu-props="{ contentClass: 'c-select__menu-content my-menu' }"`. Replacing that
anchor also removes Coalesce-specific menu styling, including the muted hint.

Palette names in blueprint configuration, such as `primary: "red"`, select a
ladder; they do not restore Material helpers. A component prop `color="red"`
therefore needs a `red` theme role or the opt-in color pack described below.
Vuetify accepts explicit hex, `rgb()`/`hsl()`, and `var()` colors through component
props. Named values such as `red` or `white` require a corresponding theme role
or palette helper; they are not treated as inline CSS colors. Custom CSS still
accepts normal CSS color syntax. Prefer roles and tokens in app code.
A legacy app can temporarily
restore the old helpers in its [custom Sass settings](#overriding-sass-settings)
with `$color-pack: true`; the package default remains `false`.

## Excluding replaced font styles

`cStyle()` excludes `@fortawesome/fontawesome-free/css/*.css` and plain Roboto
styles from `@fontsource/roboto`, `@fontsource-variable/roboto`, `typeface-roboto`
and `roboto-fontface` by default. Existing app imports can stay: the plugin
redirects them to an empty stylesheet before CSS processing, in development and
production, including CSS `@import`s. Their font files are no longer emitted
through those stylesheets. Public Sans, optional Inter, and Roboto Condensed
are unaffected.

Mapped Coalesce Font Awesome icons still render through c-style's Lucide icon
set and CSS masks. Unmapped classes, raw FA icons outside c-style's supported
Coalesce hosts, and explicit `fa:` icons need Font Awesome's stylesheet. Keep
it for an app that uses those, or keep Roboto when selecting it as a custom font:

```ts
cStyle({ excludeStyles: { fontAwesome: false, roboto: false } });
```

These exclusions cover the package CSS paths above, not Font Awesome JavaScript
libraries, Sass entry points, copied vendor files, or external font CDN links.
Links emitted by a server layout must be removed there. A `font-family: Roboto`
declaration alone does not download Roboto. The plugin does not remove arbitrary
overridden Vuetify rules: their layout and state styles can still be required.

## Trimming replaced button states

`cStyle()` removes Vuetify VBtn's overlay opacity rules for hover, keyboard
focus, active/open, disabled, and active pagination states. c-style replaces
these with its Canon tint states and keeps the overlay at zero opacity.
The cleanup runs on compiled CSS in development and production, only for
the VBtn stylesheet supplied by `vite-plugin-vuetify`. It preserves base
overlay geometry and opacity, underlays, focus rings, forced-color rules,
other components, and app styles. It does not remove the overlay element
or the ripple directive.

To retain Vuetify's original overlay state rules:

```ts
cStyle({ excludeStyles: { buttonOverlay: false } });
```

This is a specific removal of replaced declarations, not a general purge of
Vuetify CSS. Utility classes remain available with c-style's configured values.

## Sizes

Canon's md is the default everywhere. Smaller and larger controls are per instance through Vuetify's named sizes, which c-style maps to Canon's sm / md / lg:

| `size` | Button | Icon in button | Type |
|---|---|---|---|
| `x-small` | 28 (in-box) | 16 | 12/16 |
| `small` | 32 | 16 | 12/16 |
| default | 40 | 20 | 14/20 |
| `large`, `x-large` | 48 | 24 | 16/24 |

Tags (`v-chip`) follow Canon's tag sizes: `x-small`, `small` and default are sm (24, 12/16 type; Canon has nothing smaller), `large` md (32, 14px), `x-large` lg (40, 16px), radius 2 / 4 / 8 (`label`; the blueprint default). Icons, avatars and the remove icon are the line height (16 / 20 / 24), 4 / 6 / 8 from the edge and 4 / 8 / 12 from the text; avatar initials are 0.4 of the avatar at weight 400. Pill chips keep the same avatar (Vuetify's full-height pill avatar is not Canon).

Tag emphasis maps to `flat` (high), `tonal` (medium and default), and `outlined` (low). Uncoloured tags derive their fill and border from inherited text, following Canon's per-theme tag opacities; high-emphasis content uses the contrasting tag text role. Explicit `color` props retain their intent colours.

Avatar initials take Canon's type for the avatar's size at weight 400: 24 → 10/12, 32 → 12/16, 40 → 14/20, 48 and 56 → 16/24, 64 → 24/32. Named sizes `x-small` … `x-large` are 24 … 56; a numeric `size` takes the nearest step (12–96px). Leave the text bare or in a plain `<span>`; a type class such as `text-caption` overrides it.

Fields are 40px at every `density` (Coalesce passes `compact` and `comfortable`); density never changes a control's size. Tables keep Vuetify's density rows (56 / 48 / 40), Canon's default being 56; `density="compact"` gives Canon's compact 40. The `--cs-*` custom properties (`--cs-control-height`, `--cs-icon`, `--cs-radius`, `--cs-gap-md`, `--cs-hairline`, …) are Canon's md values, public for app components (see [Styling your own components](#styling-your-own-components)). There is no inherited size context.

## Icons

- **Vuetify aliases** (`$close`, `$dropdown`, `$checkboxOn`, … all 65) render Lucide icons at a 1.5px stroke that stays 1.5 at any size. Checkbox and radio glyphs are c-style's own SVGs.
- **App icons:** `<v-icon :icon="csIcon(House)" />` with any Lucide icon. `csIcon(icon, props?)` caches per icon, so it is safe in templates. Import both from `coalesce-c-style/icons`, which re-exports `@lucide/vue`, so the app needs no Lucide dependency of its own (and gets c-style's copy):

  ```ts
  import { csIcon, House } from "coalesce-c-style/icons";
  ```
- **FontAwesome strings** that Coalesce passes (`"fa fa-clock"`, `"fa-edit"`, …) are mapped to Lucide by the `cs` icon set; other classes on the string are kept. Unmapped strings render as class names; they require the corresponding icon stylesheet. A `fa:` prefix forces Vuetify's FontAwesome set. To use either Font Awesome fallback, set `excludeStyles.fontAwesome: false` (see [Excluding replaced font styles](#excluding-replaced-font-styles)).
- Coalesce's raw `<i class="fa fa-*">` glyphs (row actions, info and asterisk marks, the password eye) are masked with the matching Lucide shape (`scripts/fa-masks.mjs` regenerates the masks).
- Default icon size is 20 (16 in tags and small buttons, 24 in large buttons).

## Content drawers

A temporary `v-navigation-drawer` with a direct `v-toolbar` header gets Canon's Dialog header insets: 24px by the title and 16px by the close action. A direct `v-card-actions` footer gets 24px side and bottom insets. For a footer that stays at the bottom while several body elements scroll together, wrap the body in `.cs-drawer-body` directly before the actions:

```vue
<v-navigation-drawer temporary location="end">
  <v-toolbar title="Widget details"><v-btn icon="$close" aria-label="Close" /></v-toolbar>
  <div class="cs-drawer-body">
    <v-text-field label="Name" />
    <v-list><!-- details --></v-list>
  </div>
  <v-card-actions><v-spacer /><v-btn>Cancel</v-btn><v-btn color="primary">Save</v-btn></v-card-actions>
</v-navigation-drawer>
```

## Components: Canon Time

c-style adds Canon-style segmented time inputs: a row of framed cells (hour, minute, optional second, AM/PM), each typed into or stepped from the keyboard. These complement Vuetify's existing `v-time-picker`. c-style ships them as three Vue components (inventory and keyboard model: `docs/research/canon-time.md`).

```ts
import { CsTimeField, CsTimeRangeField } from "coalesce-c-style";
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

Emitted values are always 24-hour; the cells show 12 or 24 hours. Inputs also accept strings such as `"1:30 pm"`. Convert `Date` values to time strings before binding them.

Props (all three): `format` (`'ampm'` / `'24hr'`; unset follows Vuetify's locale), `step` (seconds per step, as `<input type="time" step>`: `900` moves minutes by 15; under 60 adds a seconds cell), `use-seconds`, `min` / `max` (out of range is invalid, not prevented), `allowed-hours` / `allowed-minutes` / `allowed-seconds` (arrays or functions; Up / Down skip the rest, typed ones are invalid), `size` (`small` / `default` / `large`: cells 32 / 40 / 48), `disabled`, `readonly`, `required`. Fields add VInput's `label`, `hint`, `persistent-hint`, `messages`, `rules`, `error`, `error-messages`, `max-errors`, `hide-details` (default `auto`), `validate-on`, `id`, `name`; ranges add `overnight`, `start-label` / `end-label` (accessible names, default "Start" / "End"). App defaults reach them by name (`defaults: { CsTimeField: { … } }`). Exposed: `focus()`, and on fields `validate()`, `reset()`, `resetValidation()`.

Keys: Tab / Shift+Tab per cell; Left / Right between cells; Up / Down step and wrap (59 → 00, PM ↔ AM; empty starts from now); digits fill a cell and move on (`7` is `07`); `:`, `.` or space move on; A / P set the period; Backspace clears (then goes back), Delete clears in place; Home / End and PageUp / PageDown (hours by 6, minutes by 10 or the step); paste fills every cell; Enter submits the form; the mouse wheel steps the focused cell. The focused cell grows and shows step arrows (hold to repeat).

Canon's own checks become the field's first rule: "Enter a complete time." (left incomplete), `min` / `max` / `step` in the browser's words, "Choose an allowed time.", "The end time is before the start time.".

Not covered: localised strings (labels and messages are English); no clock dial or popover (Canon has none). `v-time-picker` is unchanged and still restyled by c-style.

## Styling your own components

c-style restyles Vuetify and Coalesce; your app's own components need the same look in light and dark, under any accent and font. Do it through the public API: the `--cs-*` tokens, the `coalesce-c-style/tokens` SCSS module and `csVar` at run time. Everything else c-style sets is internal and may change.

### Which tool to use

Take the first rung that can express the design:

1. **Compose Vuetify components.** `v-btn`, `v-card`, `v-list`, `v-text-field`, `v-chip` and the rest are already Canon, including every state. Set props for a subtree with `<v-defaults-provider :defaults="{ VBtn: { variant: 'text', size: 'small' } }">` rather than restyling it.
2. **Vuetify utility and type classes** for layout and one-off tweaks:
   - Spacing `pa-*`, `ma-*`, `ga-*` keep Vuetify's 4px step, which is Canon's scale (`ga-2` = `--cs-gap-sm`, `pa-4` = `--cs-gap-md`).
   - Re-pointed to Canon: `rounded-*` (`sm` 4, default and `md` 8, `lg` 12, `xl` 16, `xxl` 24), `elevation-*` (1 control shadow, 2 raised, 3 and 4 floating, 5 overlay, each with the edge hairline above 1), the type classes `text-display-*` … `text-label-*` (Canon's ramp, for example `text-title-medium`, `text-body-small`), `bg-*` and `text-*` colour classes (theme roles).
   - Literal Material palette helpers (`text-red`, `text-grey`, `text-white`, `bg-blue-lighten-2`, …) are not generated. See [Semantic colors](#semantic-colors) for replacements.
   - Not re-pointed: `text-medium-emphasis` and `text-high-emphasis` are Vuetify's on-background ink at 60% and 100%. For Canon's secondary text use `text-muted` or `color: cs.token(muted)`. On ordinary markup `text-primary` uses the primary solid (step 600); for an accent label use `cs.token(primary-text)`. c-style also selects the label step for buttons, chips, and supported tonal, text, or plain component variants.
3. **Tokens and the SCSS module** for your own markup: `@use 'coalesce-c-style/tokens' as cs` in the component's `<style lang="scss">`, then the mixins and `cs.token(...)` (below).
4. **Plain CSS in the component** for what's left (grid templates, positioning). c-style's CSS sits in cascade layers, so unlayered app CSS wins without `!important`.

### The token contract

127 custom properties, all prefixed `--cs-`, declared by `coalesce-c-style/styles` in `@layer vuetify-overrides`. The list is `cStyleTokens` (TypeScript) and `$tokens` (SCSS); a unit test keeps those and the stylesheet in step.

- **Colour, shadow and font tokens are read-only.** They alias Vuetify's theme variables and are redeclared on `:root` and on every `.v-theme--*` element, so they follow `theme.change`, a `theme="dark"` subtree, `applyCStyleColors` and `applyCStyleFont` without a recompile. That redeclaration is also why a value you set on an ancestor stops at the first Vuetify component inside it. Change them through the theme: `cStyleBlueprint({ colors, font })`, `applyCStyleColors`, `applyCStyleFont`.
- **Size and motion tokens may be overridden on `:root`.** An unlayered `:root { --cs-radius: 6px; }` wins in any import order. It reaches your components and the c-style rules that read the token; Vuetify's own component sizes (button, field, chip heights and the like) are compiled from SASS and don't read these tokens, so change those through [`coalesce-c-style/settings`](#overriding-sass-settings).
- **Tokens are the element's effective theme.** Inside a component c-style recolours (a text-variant `primary` button reads its text step as `primary`, a hovered solid button its hover step, disabled buttons and Coalesce admin toolbars their own), slot content reading `--cs-primary-solid` gets that component's value.
- **Colour tokens are complete colours** (`color: var(--cs-muted)`), not channel lists.
- **Not public:** Vuetify's `--v-*` variables (`--v-theme-primary`, `--v-muted`, …), c-style's internal `--cs-btn-*`, `--cs-tone-*`, `--cs-field-*`, `--cs-time-*`, the mixins' element-local `--_cs-*` slots, and the Sass partials under `src/styles/`.

In the tables, `n` is the neutral ladder (zinc by default) and `i` the intent's ladder; "light / dark" gives the ladder step per mode.

**Sizes** (Canon md, the same in both themes; overridable):

| Token | Value | Meaning |
|---|---|---|
| `control-height` | 40px | md control height |
| `control-pad` | 10px | md control inline padding |
| `control-font` | 14px | md control text size |
| `control-lh` | 20px | md control line height |
| `control-gap` | 8px | icon ↔ label gap inside a control |
| `icon` | 20px | icon size; `control-box()` sets it per size |
| `radius` | 8px | control radius |
| `surface-radius` | 12px | card, menu, dialog radius |
| `gap-sm` | 8px | between items in a cluster (buttons, chips) |
| `gap-md` | 16px | stacks, between fields; surface padding |
| `gap-lg` | 24px | between groups |
| `gap-xl` | 32px | between form sections |
| `shell-inset` | 12px | md shell inset; the app bar and supporting chrome derive their spacing from it |
| `card-pad` | shell-inset + gap-sm (20px) | shared inset for card titles, body, actions, tabs, and header toolbars; Coalesce admin search/filter rows keep their compact inset |
| `accordion-pad` | 12px | md accordion row block inset; vertical stepper rows compensate for their taller badge |
| `toolbar-pad` | 8px | minimum toolbar inline inset; each toolbar increases it to surface-radius − radius when needed |
| `toolbar-gap` | 8px | space between toolbar controls |
| `hairline` | 1px (0.5px on 2x screens) | rule and edge width |

`control-gap` and `gap-sm` are both 8px but mean different things; pick by meaning.

`shell-inset` inherits into the app bar, system bar, and footer. Vuetify resolves the drawer's `railWidth` in JavaScript, so its 64px default cannot follow a CSS token override; set `rail-width` as a prop when changing that width.

Toolbar spacing tokens inherit independently of `gap-sm`. Corner clearance resolves on each toolbar, so a card's local `surface-radius` and `radius` overrides apply there. The default card radius also reads `surface-radius`; explicit `rounded` props or Sass radius overrides take precedence. Ordinary toolbars retain Vuetify's density and explicit heights, with controls centered vertically. Coalesce admin table headers use `card-pad` at the top and sides, matching the bottom pagination's card inset; the search/filter row keeps its compact toolbar inset and gap.

Full-width table cards share `card-pad` across their toolbar, outer table cells, and direct `c-list-pagination` footer. This applies to a direct `v-table` or `c-table`, including a table inside a direct `c-loader-status` content slot. Internal column spacing stays unchanged and row dividers span the card. Tables inside `v-card-text` keep that wrapper's padding instead. Omit padding utilities such as `pa-2` on the footer so the shared inset can apply; override `--cs-card-pad` on the card to adjust the whole composition.

**Surfaces and neutral roles** (read-only):

| Token | Light / dark | Meaning |
|---|---|---|
| `canvas` | n50 / n950 | page background |
| `surface` | white / n900 | card and panel background |
| `surface-bright` | white / n800 | a surface lifted above `surface` (dark mode's raised layer) |
| `on-surface` | n900 / white | ink on a surface |
| `muted` | n500 / n400 | secondary text, hints |
| `quiet` | n400 / n500 | tertiary marks (separators, disabled breadcrumbs) |
| `fill-hover` | n50 / n800 | neutral fill under the pointer |
| `fill` | n100 / n800 | neutral fill (wells, tracks) |
| `fill-strong` | n200 / n700 | stronger neutral fill (pressed) |
| `frame` | n200 / n700 | field frame at rest |
| `frame-hover` | n400 / n500 | field frame under the pointer |
| `rule` | black / white at 10% | hairline rules and dividers |
| `rule-faint` | black at 7% / white at 8% | fainter rules (toolbar and drawer edges) |
| `link` | primary 600 / 400 | link at rest |
| `disabled-bg` | n50 / n800 | disabled fill |
| `disabled-fg` | n400 / n500 | disabled ink |
| `scrim` | white at 85% / n950 at 75% | overlay backdrop |

**Focus** (read-only): `focus` (primary 600 / 400, the ring colour); `focus-ring` (a `box-shadow` value: a 2px gap in the surface colour (white / n900), then 1px of `focus`).

**Elevation** (read-only, `box-shadow` values; dark mode raises the alphas): `shadow-edge` (the hairline edge every surface has), `shadow-control` (low-emphasis controls), `shadow-raised` (cards), `shadow-floating` (menus, popovers), `shadow-overlay` (dialogs, drawers). Depth is always the edge plus one shadow, as `surface()` writes it.

**Typography** (read-only): `font-body`, `font-heading` (Public Sans by default; the blueprint's `font`), `font-mono` (JetBrains Mono, then system monospace), `font-tracking` (the multiplier for Canon's negative letter-spacing: 1 for Inter, 0.5 for Public Sans, 0 otherwise), `control-tracking` (md control text tracking, −0.006em × `font-tracking`; it follows the font, so treat it as read-only).

**Motion** (overridable; all durations 0 and the scale 1 under `prefers-reduced-motion`, so transitions written with them need no media query): `duration-state` 0.12s (colour changes), `duration-press` 0.1s, `duration-open` 0.15s, `duration-close` 0.1s, `press-scale` 0.98 (a worded button's press).

**Per intent** (read-only): `--cs-<intent>-<role>` for each of `primary neutral success warning error info`, 13 roles each (78 tokens). Steps are for the accents; neutral is inverted (its solid is n900 in light, white in dark) and warning's solid is 400 with 950 ink.

| Role | Light / dark | Meaning |
|---|---|---|
| `solid` | i600 | high-emphasis fill |
| `on-solid` | white | label on the solid |
| `solid-hover` | i500 | solid under the pointer |
| `solid-active` | i700 | solid pressed |
| `text` | i700 / i300 | intent-coloured text on a light fill or the surface |
| `tint-1` … `tint-4` | i400 / i500 at 8, 15, 20, 25% (dark 10, 20, 25, 30%) | see-through fills: rest → hover → pressed rungs |
| `line` | i400 / i500 | field line at rest (the field recipe) |
| `line-hover` | i600 / i400 | field line under the pointer, and on focus |
| `halo` | i100 / i900 | 3px field focus halo |
| `border-low` | i200 / i300 at 35% | low-emphasis border (the button recipe) |

### The SCSS module: `coalesce-c-style/tokens`

```scss
<style scoped lang="scss">
@use 'coalesce-c-style/tokens' as cs;
</style>
```

It emits no CSS, so any number of components may `@use` it, and every value it writes is a public token or a Canon constant length, so theme, accent and font changes reach the component at run time. Public members: `$tokens`, `$intents` (`primary neutral success warning error info`), `$emphases` (`high medium low minimal`), `$surfaces` (`resting raised floating overlay`), and the function and mixins below.

**`token($name)`** returns `var(--cs-<name>)` and fails the build on a name outside the contract.

```scss
.hint { color: cs.token(muted); }
```

**`surface($level: resting)`**: a Canon surface. Sets `background-color` (`surface`), `color` (`on-surface`), `border-radius` (`surface-radius`) and `box-shadow`: the edge alone for `resting` (table, alert, code block), the edge plus the level's shadow for `raised` (card), `floating` (menu, popover), `overlay` (dialog, drawer).

```scss
.panel { @include cs.surface(raised); }
```

**`control-box($size: md)`**: the box of a Canon control. An inline flex row with a 1px transparent border (so every emphasis keeps the same box), and the size's height, padding, radius, gap, text and tracking. Sets `--cs-icon` on the element, so a `v-icon` inside takes the size's icon. Colour and weight are yours.

| Size | Height | Padding | Radius | Text | Icon | Gap |
|---|---|---|---|---|---|---|
| `sm` | 32 | 8 | 4 | 12/16 | 16 | 6 |
| `md` | 40 | 10 | 8 | 14/20 | 20 | 8 |
| `lg` | 48 | 12 | 12 | 16/24 | 24 | 10 |

```scss
.chip { @include cs.control-box(sm); }
```

**`interactive($intent: neutral, $emphasis: medium)`**: Canon's button tone matrix on any clickable element. Sets `color`, `background-color`, a 1px `border`, `box-shadow`, `cursor: pointer`, `user-select: none` and colour transitions over `duration-state`, plus every state:

- hover: pointer devices only (`@media (hover: hover)`);
- keyboard focus (`:focus-visible`): the hover rung plus the focus ring;
- pressed: `:active`, `aria-pressed`, `aria-checked`, `aria-selected`, `aria-expanded`, `aria-current`;
- disabled: `:disabled` or `aria-disabled="true"`, unless `aria-busy="true"`. Grey whatever the intent; a focused `aria-disabled` element keeps its ring.

| Emphasis | Ink | Rest | Hover | Pressed | Border, shadow |
|---|---|---|---|---|---|
| `high` | `on-solid` | `solid` | `solid-hover` | `solid-active` | none |
| `medium` | `text` | `tint-2` | `tint-3` | `tint-4` | none |
| `low` | `text` | transparent | `tint-1` | `tint-2` | `border-low`, `shadow-control` |
| `minimal` | `text` | transparent | `tint-1` | `tint-2` | none |

Every state selector is (0,2,0), so your own `.x:hover` rule after the include wins by source order.

```scss
.chip { @include cs.control-box(sm); @include cs.interactive(neutral, low); }
```

**`tone($intent: neutral, $emphasis: medium)`**: only the colour slots `interactive` reads. Use it in a modifier class on an element that already includes `interactive`.

```scss
.tile { @include cs.interactive(primary, low); }
.tile--error { @include cs.tone(error, low); }
```

**`focus-ring`**: Canon's focus ring (a 1px `focus` ring 2px outside the element) as `box-shadow`, over a transparent outline for forced-colours mode. It replaces the element's `box-shadow`. `interactive` already includes it.

```scss
.card-link:focus-visible { @include cs.focus-ring; }
```

**`focus-halo($intent: primary)`**: Canon's field focus. The border turns to the intent's `line-hover` with a 3px `halo` and no gap. `primary` is the neutral field's focus.

```scss
.search:focus-within { @include cs.focus-halo; }
```

**`hairline($side: all)`**: a `hairline`-wide border in `rule`. `$side` is `all` or any `border-<side>` suffix: `top`, `right`, `bottom`, `left`, `block`, `block-start`, `block-end`, `inline`, `inline-start`, `inline-end`.

```scss
.row + .row { @include cs.hairline(top); }
```

**`type($role)`**: the font family, size, line height, weight and tracking of a Vuetify type role at Canon's ramp, identical to the `.text-<role>` class. Roles: `display-large|medium|small`, `headline-large|medium|small`, `title-large|medium|small`, `body-large|medium|small`, `label-large|medium|small`. Display, headline and `title-large` use `font-heading`, the rest `font-body`. `label-large` is control text (14/20/500); `body-small` is hint text (12/16).

```scss
.card__title { @include cs.type(title-medium); }
```

`VBanner` has no separate title prop. Use its `text` slot and the existing type
roles to distinguish a medium title from a regular description:

```vue
<v-banner>
  <template #text>
    <strong class="text-label-large">A new version is available.</strong>
    <span class="text-body-medium text-muted">Refresh when you're ready.</span>
  </template>
</v-banner>
```

**Composition.**

- Include `control-box` before `interactive`: `control-box`'s transparent border would replace the low emphasis border.
- `surface` and `interactive` both set background, ink and shadow; give an element one or the other.
- Recolour a variant with `tone()` in a modifier class, not a second `interactive()`.
- `interactive` doesn't reset a `<button>`'s font; add `font: inherit` or a `type()`.

**Errors.** Every argument is checked at compile time: `cs.token(mutted)` fails with "`mutted` is not a c-style token. See `$tokens` in coalesce-c-style/tokens.", and a bad intent, emphasis, surface level, side, size or role fails with "Unknown intent `brand`; expected one of primary, neutral, success, warning, error, info." (and so on).

### Runtime (TypeScript)

From `coalesce-c-style`:

- `csVar(name, fallback?)` returns `var(--cs-<name>)` (or `var(--cs-<name>, <fallback>)`) for inline styles and charts: `:style="{ color: csVar('muted') }"`. `name` is type-checked against the contract.
- `cStyleTokens`: every token name without the prefix (125). `cStyleIntents`: the six intents.
- Types `CStyleToken`, `CStyleIntent`.

To read a resolved colour (a canvas chart, say), `getComputedStyle(el).getPropertyValue('--cs-primary-solid')` on the element that hosts it, so a nested theme applies, and read it again after a theme or accent change.

### Worked example

`MyProject/MyCompany.MyProject.Web/src/components/OptionTiles.vue` (demo app) is a radio group of tiles written with the public API only; the Storybook story `c-style/Option tiles (app example)` and `/c-style` render it. Its styles, condensed:

```vue
<style scoped lang="scss">
@use 'coalesce-c-style/tokens' as cs;

.option-tiles { @include cs.surface(raised); }

.option-tiles__header {
  display: flex;
  align-items: center;
  gap: var(--cs-gap-sm);
  padding: 12px var(--cs-gap-md);
  @include cs.hairline(bottom);
}
.option-tiles__title { @include cs.type(title-small); }
.option-tiles__hint { @include cs.type(body-small); color: cs.token(muted); }

.option-tiles__clear {
  @include cs.control-box(sm);          // box first
  @include cs.interactive(neutral, minimal);
  margin-inline-start: auto;
  font-weight: 500;
}

.option-tile {                            // <button role="radio" :aria-checked>
  @include cs.interactive(primary, low);
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: var(--cs-radius);
  text-align: start;
  font: inherit;

  &--neutral { @include cs.tone(neutral, low); }
  &--error { @include cs.tone(error, low); }
}
.option-tile__title { @include cs.type(label-large); }
.option-tile__description {
  @include cs.type(body-small);
  color: cs.token(muted);
  .option-tile:disabled & { color: inherit; }   // take the disabled ink
}
.option-tile__check {
  inline-size: var(--cs-icon);
  opacity: 0;
  transition: opacity var(--cs-duration-state) ease;
  .option-tile[aria-checked='true'] & { opacity: 1; }
}
</style>
```

The selected tile gets its pressed rung from `aria-checked`, so the template sets ARIA state and the mixin does the rest. The component also shows the keyboard model a custom choice needs (one tab stop, arrow keys move focus and selection).

### Do and don't

- **Do** take colours, shadows and fonts from tokens or mixins. **Don't** write hex, `rgb()` or px literals for themed values (colour, shadow, radius of a surface, icon size); Canon's constant lengths (a 12px tile padding, a 160px grid column) are fine as literals.
- **Do** use `cs.token(...)` in SCSS, so a typo fails the build. **Don't** read `--v-*` variables or internal `--cs-*` names (`--cs-tone-*`, `--cs-btn-*`, `--cs-field-*`, `--cs-time-*`, `--_cs-*`).
- **Do** let ARIA state drive state styling (`aria-checked`, `aria-pressed`, `aria-disabled`). **Don't** add `!important`; unlayered component CSS already beats c-style's layers.
- **Do** change colours and fonts through `cStyleBlueprint`, `applyCStyleColors`, `applyCStyleFont`. **Don't** set colour tokens on an ancestor.
- **Don't** restyle Vuetify internals (`.v-btn__overlay`, `.v-field__outline`, …) from app code. If a Vuetify component looks wrong, use its props, `v-defaults-provider` or `coalesce-c-style/settings`, or open an issue against c-style.

### Checking your component

In Storybook (`c-style/Option tiles (app example)` is the model), use the toolbar's **Theme**, **Accent** and **Font** switches; in the demo app, `/c-style` (the kitchen) has the same accent and font buttons in its tokens section. For each component, check:

- light and dark, and a dark subtree (`<v-theme-provider theme="dark">`) if it can sit in one;
- an accent switch: nothing keeps the old blue;
- a font switch: nothing clips or overflows;
- keyboard: Tab reaches it, the focus ring shows, arrow keys work where the pattern needs them;
- disabled: grey ink and fill, no hover, no pointer events;
- reduced motion: no transition left running.

### Agent skill

The repository includes an [agent skill](https://github.com/twofingerrightclick/coalesce-c-style/tree/main/packages/c-style/skills/c-style) that tells coding agents (Claude Code and others that read `SKILL.md`) to follow this section when they write or restyle a component. It is not included in the npm package. Download or copy that directory from the repository into your app as `.claude/skills/c-style/`, keeping its `SKILL.md` and supporting files together.

Refresh the copy from the matching c-style release after upgrading.

## Known deviations from Canon

Kept on purpose or not reachable through Vuetify; the parity gate (`verify/parity/parity.spec.ts`) lists each one it allows.

- **Font:** Canon specifies Inter; c-style defaults to Public Sans (bundled, no CDN), with Inter's alternates off and half Canon's tracking. Inter stays one import away (see Font). The parity gate measures in Inter, Canon's own font.

- **Field height** comes from a −3 density on a 52px base (Vuetify hard-codes field padding as `16px + density/2`). A spec pins every field at 40.
- **Neutral ink** labels sit one step off Canon in places (zinc-950 vs 900 for the page's labels, zinc-100 vs white for dark neutral button labels).
- **Disabled, dark:** low and minimal buttons use zinc-500 (Canon zinc-600), the low-emphasis line zinc-700 (Canon zinc-800).
- **Messages** are ink at Vuetify's medium emphasis (≈ zinc-500); error messages use error 600 (Canon 700 / 300). Choice messages sit 8px below (Canon 6).
- **Alerts:** a typeless alert still shows a zinc bar; the dark alert icon is error 600 (Canon 400). Banner intents are not styled, and the banner keeps Vuetify's close-less layout (no Canon close button).
- **Toasts:** no stacking, timer line or Canon enter motion.
- **Tags:** tags inside a combobox are sm (Vuetify asks for `small`; Canon's md 32 doesn't fit the 40 field). On a hued tag the remove icon sits in the tag's tint; Canon gives it its own neutral segment (zinc-100 / zinc-700, the tag's end radii).
- **Segmented control (VBtnToggle) and tabs:** rest options are muted zinc-500 (Canon zinc-600); the card crossfades instead of gliding.
- **Navigation:** sidebar items are 10px in (Canon 16); the breadcrumb separator is `/` (Canon a chevron); the demo's app bar is 48 (Canon md 64).
- **Pagination:** Vuetify decides how many pages to show by measuring, counts a gap after the last item, and with a middle page needs five slots for `1 … 4 … 12`; below that (a card under about 336px) it shows the current page alone. Canon's own row of seven items is 328px, so it doesn't fit a 325px card body either (Canon wraps it; Vuetify's measuring can't take a wrapped row). With `total-visible` the row can overflow. The unsorted column arrow stays hidden until hover (Canon shows `arrow-down-up`).
- **Links:** every app link is Canon's standalone link (no line until hover). Canon's in-text link, underlined at rest, isn't told apart.
- **Stepper** (no Canon counterpart): current and completed steps get the ink badge; a step only counts as completed when the app marks it (`complete`, or `rules`), as in Vuetify.
- **FAB / speed dial** (no Canon counterpart): button radius for both icon-only and extended; otherwise Vuetify's.
- **Dialog** opens with Vuetify's transition (Canon scales from .98); tooltips have no arrow.
- **Date picker:** today is a ring (Canon a dot); its controls row is Vuetify's (month and year menus, toggles padded 8 / 4 so the row fits the 280px grid). Longer month or year labels than English "Sep" / "2026" by more than about 11px would widen the row past the 304px box again.
- **Stacked choices:** separate checkboxes and switches stack at Canon's 28 / 32px pitch only inside a `v-form` (or as a `v-radio-group`); elsewhere sibling inputs may be laid out in a row, so they keep the 40px row.
- **Theme on the same element** (`<v-btn theme="dark">`) wins over c-style's re-points on that element; a theme on an ancestor is fine.

## Troubleshooting

- **Nothing from the settings applies** (buttons round at 4px, Roboto-sized controls): two copies of Vuetify. `node -p "require.resolve('vuetify/package.json')"` from the app and from `packages/c-style` must print the same real path.
- **`vuetify/styles` 404s after a `pnpm install`:** `vite-plugin-vuetify` caches Vuetify's path for the life of the Vite process; restart Vite.
- **Font 403s in dev:** the app sets `server.fs.allow`; `cStyle()` adds the package and the Public Sans and `inter-ui` directories, so keep `cStyle()` in the plugin list rather than calling `vite-plugin-vuetify` yourself.

## Credits

The design is [Canon](https://github.com/recepkutuk/canon) by Recep Kütük (MIT). c-style also includes the Tailwind v3 colour palette (MIT) and Lucide icon paths (ISC). Licenses and attribution are in [THIRD-PARTY-NOTICES.md](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/THIRD-PARTY-NOTICES.md).
