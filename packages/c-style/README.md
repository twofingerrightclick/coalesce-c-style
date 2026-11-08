# coalesce-c-style

c-style is a styling plugin for **Vuetify 4 and IntelliTect Coalesce**, based on [Canon](https://recepkutuk.github.io/canon/). It supplies themes, component defaults, Sass settings and CSS for your existing `v-*` and `c-*` components.

The plugin includes light and dark themes that follow the OS, locally bundled Public Sans, and Lucide icons. Set your brand color once to apply it across the app.

## Install

Choose a c-style release matching your app's Coalesce release, then install it with an exact version:

```sh
# Replace <matching-version> with the selected release.
pnpm add --save-exact "coalesce-c-style@<matching-version>"
```

The package's [manifest](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/package.json) defines the release and supported peer dependency ranges. Install any missing peers: Vue, Vuetify, Vite, `vite-plugin-vuetify`, and Sass. For an installed copy, read `node_modules/coalesce-c-style/package.json`.

### Versions

Versions follow `<Coalesce version>-cs.<build>`. Choose a build matching your app's Coalesce release and pin it explicitly. The build suffix identifies c-style updates within that release. These are prerelease versions, so ordinary stable semver ranges do not select them. An unversioned install follows the registry's default dist-tag and may target another Coalesce release.

The manifest's development dependencies identify the Coalesce and Vuetify versions used by the package's test environment; peer dependencies define the supported ranges. Use the manifest for the release you are adopting, rather than assuming repository `main` matches it.

## Configure

Setup requires the Vite plugin, stylesheet, and Vuetify blueprint.

**1. Replace the Vuetify Vite plugin.** Keep `transformAssetUrls` in the Vue plugin and keep your other Vite plugins and options. This shows the relevant configuration:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { transformAssetUrls } from "vite-plugin-vuetify";
import { cStyle } from "coalesce-c-style/vite";

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    cStyle(),
  ],
});
```

`cStyle()` wraps `vite-plugin-vuetify`, enables auto-import, and supplies c-style's Sass settings. Use it once in place of the original plugin call. Pass other Vuetify plugin options as `cStyle({ vuetify: { /* options */ } })`; move an existing `styles.configFile` to the [custom Sass settings](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/configuration.md#overriding-sass-settings) setup.

**2. Import the styles in this order.** Keep app styles last:

```ts
// main.ts
import "coalesce-vue-vuetify3/styles.css";
import "vuetify/styles";
import "coalesce-c-style/styles";
import "@/styles/site.scss";
```

**3. Apply the blueprint to your existing Vuetify instance.**

```ts
// main.ts
import { createVuetify } from "vuetify";
import { cStyleBlueprint } from "coalesce-c-style";

const vuetify = createVuetify({
  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
});

// Keep this in your existing app setup, before app.mount(...):
app.use(vuetify);
```

Keep your Vue app creation, router, Coalesce registration and mount code. Options beside `blueprint` are deep-merged over it and win; retain app-specific settings after reviewing conflicts with c-style.

## Adopting it in a Coalesce app

Before calling the migration complete:

- Replace the starter's Font Awesome icon configuration, input defaults and empty light/dark theme configuration with the blueprint above. They can override c-style if left alongside it.
- Remove the starter's input-details alignment, readonly dashed outline, `--fa-display`, and `a { text-decoration: none }` overrides from `site.scss`. Preserve unrelated app styles.
- Keep form spacing and action alignment in app layouts. Inputs retain Vuetify's message-space policy unless explicitly overridden; see [Form composition](docs/styling.md#form-composition) for compact stacks and `hide-details` choices.
- Audit Material color helpers such as `text-grey`, `text-white`, `bg-blue-lighten-2`, and props such as `color="red"`. The Material color pack is disabled by default. Use semantic roles (`primary`, `neutral`, `success`, `warning`, `error`, `info`) or temporarily restore `$color-pack: true` in custom Sass settings. See [Semantic colors](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/configuration.md#semantic-colors).
- Existing supported Roboto and Font Awesome package CSS imports can stay: `cStyle()` excludes them and their font assets automatically. Removing unused imports and dependencies is optional cleanup. Apps that still need Font Awesome CSS (for example, for unmapped or explicit `fa:` icons) or Roboto must retain their imports and dependencies and disable the corresponding exclusion with `cStyle({ excludeStyles: { fontAwesome: false } })` or `cStyle({ excludeStyles: { roboto: false } })`. CDN links, copied CSS and Sass imports remain active; remove those manually if unused. See [exclusion scope](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/configuration.md#excluding-replaced-font-styles).
- Preserve the starter's shared styles chunk so production bundling keeps CSS order. `cStyle()` injects Vuetify's layer-order declaration into `index.html` when absent. If a server layout supplies the HTML instead, emit `layerOrderStyle` from `coalesce-c-style/vite` before other styles.

For a neutral app bar, remove an explicit `color="primary"` from `v-app-bar`. Explicit app colors otherwise retain their meaning.

Check a production build as well as development: controls should use Public Sans and Lucide icons, follow your brand color, and render correctly in light and dark. Check existing app icons and custom styles too.

## Customize

Configure colors in the blueprint:

```ts
cStyleBlueprint({
  colors: {
    primary: "#7c3aed",
    neutral: "slate",
    dark: { primary: "#a78bfa" },
  },
});
```

Public Sans is the default. To replace it for body text and headings:

```ts
// vite.config.ts
cStyle({ font: "Inter" });

// main.ts
import "coalesce-c-style/styles";
import "coalesce-c-style/fonts/inter";
```

For your own font, use its family name and import its stylesheet. A custom default omits the automatic Public Sans bundle; additional font imports still work.

Use Vuetify props for individual components:

```vue
<v-btn color="primary" variant="flat">Save</v-btn>
<v-btn color="neutral" variant="outlined" size="small">Cancel</v-btn>
```

## Reference and agent guidance

The guides below ship in the npm package under `node_modules/coalesce-c-style/docs/`. Agents should start with `docs/agents.md` and read the guide for their task. The web links point to the repository's main branch; use the installed files when working against a pinned version.

| Task | Guide (installed path relative to the package) |
|---|---|
| Configure colors, runtime switching, fonts, Sass or Vite exclusions | [`docs/configuration.md`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/configuration.md) |
| Choose sizes or icons; use content drawers or time inputs | [`docs/components.md`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/components.md) |
| Style app components with tokens and SCSS mixins | [`docs/styling.md`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/styling.md) |
| Find entry points and follow agent implementation checks | [`docs/agents.md`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/agents.md) |
| Compare behavior with Canon | [`docs/canon-differences.md`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/docs/canon-differences.md) |

An optional component styling skill is included at `skills/c-style/SKILL.md`. Copy that directory into your agent's project skill directory if supported, and refresh it after upgrading.

## Troubleshooting

- **Settings do not apply:** check that the app and c-style resolve the same physical Vuetify installation. Duplicate copies can prevent Sass settings from applying. Also check that `cStyle()` replaced the original plugin.
- **`vuetify/styles` returns 404 after an install:** restart Vite; the Vuetify plugin caches its resolved path.
- **Fonts return 403 in development:** keep `cStyle()` in the plugin list; it extends `server.fs.allow` for c-style and its font packages.
- **Icons disappeared:** review retained icon configuration and the Font Awesome exclusion option above.
- **Old colors or spacing persist:** check retained Vuetify defaults, app CSS, color helpers and stylesheet order.

## Credits

Design by [Canon](https://github.com/recepkutuk/canon), adapted independently for Vuetify and [Coalesce](https://intellitect.github.io/Coalesce/). c-style includes Lucide icons, Public Sans, opt-in Inter, and Tailwind palettes. See [third-party notices](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/THIRD-PARTY-NOTICES.md). Repository development and release instructions are in [DEVELOPMENT.md](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/DEVELOPMENT.md).
