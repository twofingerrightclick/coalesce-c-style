# Component reference

Read this when choosing sizes or icons, laying out a content drawer, or adding time inputs. Complete the [initial setup](../README.md) first.

## Sizes

Use Vuetify's named `size` props for controls, and `density` where the component supports it. Field density and table density have different roles; inspect the configured settings rather than assuming they share a scale. Explicit props and app defaults can override package defaults.

Exact dimensions and mappings are defined in [`src/styles/settings.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/styles/settings.scss) and [`src/styles/_sizes.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/styles/_sizes.scss). Installed copies are under `dist/styles/`. Component defaults are defined in [`src/defaults.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/defaults.ts).

For custom controls, use `control-box` from the [styling guide](styling.md), with sizes accepted by the installed Sass module. It reads the public tokens rather than duplicating component measurements in app CSS.

## Icons

The blueprint configures Lucide-based Vuetify aliases and maps supported Font Awesome strings used by Coalesce. To render a Lucide icon in app code:

```vue
<script setup lang="ts">
import { csIcon, House } from "coalesce-c-style/icons";
</script>

<template>
  <v-icon :icon="csIcon(House)" />
</template>
```

`coalesce-c-style/icons` re-exports the installed Lucide library and `csIcon`; the app does not need a separate Lucide dependency for these imports. Read the installed declaration for optional icon props.

Unmapped Font Awesome classes and explicit `fa:` icons require the Font Awesome stylesheet. Retain its dependency and import and set `excludeStyles.fontAwesome: false` in the Vite wrapper. Supported raw Coalesce `<i>` icons use CSS masks supplied by c-style. See [exclusion scope](configuration.md#excluding-replaced-font-styles) before removing fallback CSS.

Alias and string mappings are defined in [`src/icons/`](https://github.com/twofingerrightclick/coalesce-c-style/tree/main/packages/c-style/src/icons). Raw Coalesce masks and host selectors are defined in [`src/styles/coalesce/`](https://github.com/twofingerrightclick/coalesce-c-style/tree/main/packages/c-style/src/styles/coalesce).

## Content drawers

For a scrolling body with footer actions, use `.cs-drawer-body` directly inside the drawer before its actions:

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

Drawer layout rules are defined in [`src/styles/overrides/_nav.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/styles/overrides/_nav.scss). Use the public spacing tokens for app content; see [Styling your own components](styling.md).

## Components: Canon Time

c-style provides segmented time inputs alongside Vuetify's existing time picker. Import them explicitly; the Vite wrapper does not auto-import c-style components.

```ts
import { CsTimeField, CsTimeRangeField } from "coalesce-c-style";
```

| Component | Purpose |
|---|---|
| `CsTimeField` | A time field with label, messages and VForm validation |
| `CsTimeRangeField` | A start/end range; use `overnight` when the end may precede the start |
| `CsTimeInput` | The bare segmented input; provide an accessible name |

Models use time strings, or a start/end pair for ranges, and can be empty or incomplete. Convert `Date` values before binding. Display format is independent of the emitted time representation. Use exported `CsTimeRange`, `CsTimeFormat` and other time types instead of inventing a model shape.

Accepted props, model types, defaults and exposed methods are defined in the installed `dist/index.d.ts`. Source implementations and the parsing/validation model are in [`src/components/time/`](https://github.com/twofingerrightclick/coalesce-c-style/tree/main/packages/c-style/src/components/time). Read those for format, step, allowed-value and range constraints.

Check keyboard entry, stepping, paste, incomplete input and validation in the app's form. The inputs do not add a clock popover. Consult the implementation before assuming localization behavior; component messages and labels are not a complete localized UI.
