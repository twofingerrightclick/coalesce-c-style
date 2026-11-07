---
name: c-style
description: Style custom Vue components in apps using coalesce-c-style. Use when choosing component styles, theme tokens, SCSS mixins, colors, typography or interaction states in those apps.
---

# Style app components with c-style

Use the public API so custom components follow the app's theme, brand and font. Resolve the installed `coalesce-c-style` package from the app root and use its documentation for the pinned release.

## Read the reference for the task

- For custom markup, tokens, mixins or interaction states, read `node_modules/coalesce-c-style/docs/styling.md`.
- For colors, fonts, runtime changes or Sass configuration, read `node_modules/coalesce-c-style/docs/configuration.md`.
- For component sizes, icons, content drawers or time inputs, read `node_modules/coalesce-c-style/docs/components.md`.
- For installation or migration, start with the package's `README.md` and `docs/agents.md`.

The package includes these guides. The repository's Storybook and demo routes are optional development tools, not installed app dependencies.

## Choose the implementation

Compose Vuetify or Coalesce components first. Use props and `v-defaults-provider` for component behavior, utility classes for layout, and the public token module for custom markup.

```scss
@use 'coalesce-c-style/tokens' as cs;

.panel { @include cs.surface(raised); }
.panel__title { @include cs.type(title-small); }
.panel__hint { color: cs.token(muted); }
.panel__action {
  @include cs.control-box(sm);
  @include cs.interactive(neutral, minimal);
  font: inherit;
}
```

Include `control-box` before `interactive`. Use either `surface` or `interactive` on an element; both set background, ink and shadow. Recolor an existing interactive element with `tone` in a modifier class.

For inline styles, import `csVar` from `coalesce-c-style`. Use the installed `cStyleTokens` export, SCSS `$tokens` list and declarations for accepted names and arguments instead of a copied inventory.

## Keep the theme contract

Use tokens for themed values and ordinary CSS for layout. Change colors and fonts through `cStyleBlueprint`, `applyCStyleColors` and `applyCStyleFont`; color, shadow and font tokens follow the effective theme and should be treated as read-only.

Keep app styles on public components and tokens. Internal `--cs-*` state slots, `--_cs-*`, Vuetify `--v-*` variables and private component selectors are outside the public styling contract. Use props, defaults providers or the documented Sass configuration for Vuetify changes.

Use semantic HTML and ARIA state for selection, expansion and disabled appearance. The mixins supply state styling; the component still owns keyboard behavior and event handling. Prevent activation when disabled, including when using `aria-disabled`.

Prefer source order and component selectors for app styling. Inspect cascade conflicts before raising specificity. Theme role colors replace Material palette helpers; consult the migration guidance before retaining old color classes.

## Verify the component

Check light and dark themes, nested themes where relevant, brand and font changes, keyboard focus and interaction, disabled behavior, and reduced motion. Verify the component in the consuming app; report checks that cannot be performed. The styling guide provides the detailed verification criteria and source references.
