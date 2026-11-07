# Configuration reference

Read this when changing colors, fonts, Sass settings, semantic colors, or Vite exclusions. For initial setup, start with the [package README](../README.md).

## Vite options

Import `cStyle` from `coalesce-c-style/vite`. It returns a Vite plugin array, accepted directly in `plugins: [cStyle()]`.

The installed `dist/vite.d.mts` defines `CStyleOptions`; the implementation is in `dist/vite.mjs`. Repository sources are [`src/vite.d.mts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/vite.d.mts) and [`src/vite.mjs`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/vite.mjs).

| Option | Default | Meaning |
|---|---|---|
| `font` | `"Public Sans"` | One default family for body and heading; a custom family omits the automatic Public Sans import |
| `settings` | c-style's bundled settings file | Sass config file, absolute or relative to the Vite root; an app file must load c-style's settings as shown below |
| `vuetify` | `{ autoImport: true }` | Other `vite-plugin-vuetify` options; c-style owns `styles.configFile` |
| `excludeStyles.fontAwesome` | `true` | Exclude supported Font Awesome package CSS imports |
| `excludeStyles.roboto` | `true` | Exclude supported plain Roboto package CSS imports |
| `excludeStyles.buttonOverlay` | `true` | Remove replaced VBtn overlay state opacity rules |

The wrapper also injects the layer-order declaration into Vite HTML and extends dev-server file access for c-style and its fonts. With server-rendered HTML, emit `layerOrderStyle` from `coalesce-c-style/vite` before other styles in the server layout. Both `layerOrderCss` (CSS text) and `layerOrderStyle` (a complete `<style>` tag) are exported.

## Colours

```ts
cStyleBlueprint({
  colors: {
    primary: "#7c3aed",      // a hex: a palette ladder is generated around it
    neutral: "slate",        // a named palette
    success: "emerald",
    warning: "amber",
    error: "rose",
    info: "sky",             // defaults to primary
    dark: { primary: "#a78bfa" }, // per-mode overrides, same shape
  },
});
```

Each value is a hex, a named palette, or a complete ladder. Import `palettes` and `steps` from `coalesce-c-style` for the supported palette names and ladder keys; the exported `ColorInput` and `Ladder` types define the accepted shape. Theme role selection is defined in [`src/theme/roles.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/theme/roles.ts), with palette defaults in [`src/theme/palette.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/theme/palette.ts).

`generateLadder(hex)` generates a ladder independently of the theme. Plain Vuetify `theme.themes.light.colors.*` options override the blueprint, but related palette roles do not regenerate from those overrides. Use blueprint colors or `applyCStyleColors` for a coherent brand change.

For runtime switching, import `useTheme` from `vuetify` and `applyCStyleColors` / `applyCStyleFont` from `coalesce-c-style`. Obtain the theme inside a component's setup, then reuse it in event handlers:

```ts
import { useTheme } from "vuetify";
import { applyCStyleColors, applyCStyleFont } from "coalesce-c-style";

const theme = useTheme();
function changeBrand() {
  applyCStyleColors(theme, { primary: "#e11d48", neutral: "slate" });
}
function changeFont() {
  applyCStyleFont(theme, "Inter"); // also load the Inter stylesheet
}
```

`applyCStyleColors` resolves omitted intents to package defaults; it does not merge a partial change with the previous brand configuration. Pass the full desired configuration, including dark overrides. It updates c-style roles in every registered theme, selecting light or dark values by each theme's `dark` flag; unrelated custom keys and font settings remain.

Check contrast against the actual foreground and background in your app; changing the brand or theme changes the result.

## Font

Public Sans is the default. To replace it for body text and headings:

```ts
// vite.config.ts
cStyle({ font: "Inter" });

// main.ts
import "coalesce-c-style/styles";
import "coalesce-c-style/fonts/inter";
```

For your own font, use its family name and import its stylesheet. A custom default omits the automatic Public Sans bundle; additional font imports still work.

To load Public Sans explicitly, import `"coalesce-c-style/fonts/public-sans"`.

```ts
// Optional runtime overrides; load the font stylesheet first.
cStyleBlueprint({ font: "My Font" });
applyCStyleFont(useTheme(), "My Font");
applyCStyleFont(useTheme()); // reset to the Vite-configured default
```

## Overriding SASS settings

The Vuetify settings configured by `coalesce-c-style/settings` use `!default`. To change one, write an app settings file and point `cStyle` at it:

```scss
// src/styles/settings.scss
@use 'coalesce-c-style/settings' with (
  $table-row-height: 48px,
);
```

```ts
cStyle({ settings: "src/styles/settings.scss" });
```

`cStyle({ vuetify: { … } })` passes other options to `vite-plugin-vuetify` (`autoImport` defaults to true; `styles` belongs to c-style). Settings changes recompile Vuetify's Sass.

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
