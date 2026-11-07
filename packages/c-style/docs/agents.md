# Agent guidance

Use the documentation shipped with the installed version of `coalesce-c-style`. Repository `main` may describe a newer version. Paths below are relative to the package directory, usually `node_modules/coalesce-c-style/`.

## Choose the reference for the task

| Task | Read |
|---|---|
| Install or migrate an app | [README.md](../README.md), including all migration checks |
| Change theme, font, Sass settings or Vite behavior | [configuration.md](configuration.md) |
| Choose icons or sizes; add drawers or time inputs | [components.md](components.md) |
| Write custom component CSS, tokens or mixins | [styling.md](styling.md) |
| Investigate a difference from Canon | [canon-differences.md](canon-differences.md) |

## Public entry points

The installed `package.json` defines public subpaths in `exports` and points to their declarations. Use that manifest for available entry points and the declarations for exported APIs. The repository [manifest](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/package.json) is useful when working on source, but may describe a different release.

For setup, follow the imports in the [README](../README.md#configure). For font entry points, use the [font guide](configuration.md#font); for custom component Sass, use the [styling guide](styling.md).

Read installed declarations for exact signatures. For example, `cStyleTokens` and the SCSS `$tokens` list define the public token names; use those rather than an assumed count. A package name of `c-style` is not an alias for `coalesce-c-style`. Internal `dist/` paths and Vuetify's `--v-*` variables are outside c-style's public styling contract.

## Configuration boundaries

- Keep the Vite wrapper, global stylesheet and runtime blueprint together. Each does a different part of setup. Import `cStyle` from `/vite` and `cStyleBlueprint` from the package root.
- Preserve the app's router, Coalesce metadata/plugin registration and mount behavior. Configure the existing Vuetify instance and register it with `app.use(vuetify)`.
- Review retained Vuetify options: sibling `icons`, `defaults` and `theme` values override blueprint values. Keep intentional app behavior and remove conflicting starter defaults.
- Use semantic roles and public tokens for theme-dependent appearance. Hex values belong in brand configuration; layout lengths can remain literal. Review Material helpers during migration.
- `applyCStyleColors(theme, colors)` resolves omitted intents to c-style defaults, then updates all registered themes. It is not a partial patch of the previous brand configuration. Supply the full desired color configuration when retaining previous custom intents.
- Load custom font files separately from setting `font`. Roboto and Font Awesome CSS exclusions must be disabled when those styles are needed; see the scope and examples in the configuration guide.
- Time components need explicit imports. They are not registered by the blueprint or automatically imported by the Vite wrapper.

## Completion checks

For setup changes, run the app's build and check development and production CSS order, fonts and icons. Verify light and dark themes and the app's retained customizations. Report any checks the environment prevents.

For custom components, use the [styling guide's checks](styling.md#checking-your-component): active theme and brand, font changes, keyboard interaction, disabled behavior and reduced motion. Use the app's own controls or public runtime APIs; the repository's Storybook and demo routes are not part of the npm package.

The optional [component styling skill](../skills/c-style/SKILL.md) follows the same public API. Copy its directory into an agent-supported project skill location if desired; keep this package installed so its reference links can be resolved.
