# Styling your own components

Read this when writing app components with c-style tokens or SCSS mixins. Complete the [initial setup](../README.md) first.

## Which tool to use

Choose the simplest public API that expresses the design:

- Compose Vuetify and Coalesce components, using props or `v-defaults-provider` to change their behavior within a subtree.
- Use Vuetify layout and typography utilities for ordinary composition. Use semantic theme colors; see [Semantic colors](configuration.md#semantic-colors) before migrating Material helpers.
- Use `coalesce-c-style/tokens` for custom markup that needs themed surfaces, typography or interaction states.
- Use ordinary component CSS for layout and positioning.

Component defaults are defined in [`src/defaults.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/defaults.ts). Sass settings and their generated utility values are defined in [`src/styles/settings.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/styles/settings.scss). In the installed package, read `dist/styles/settings.scss` when checking exact configured dimensions.

## Form composition

c-style styles each control and the internals of composite components such as radio groups and Coalesce editors. A `v-form` supplies validation and submission behavior; it does not add field spacing or change neighboring controls' heights. Use your own grid, flex layout, or Vuetify utilities to arrange fields and actions.

Vuetify inputs retain their native message-space behavior unless your app or Coalesce explicitly selects `hide-details`. Use `hide-details="auto"` to collapse empty space while showing hints and validation messages, or `:hide-details="false"` to reserve it. Bare `hide-details` hides the details entirely, including validation messages. Explicit props and scoped defaults remain available. c-style's own `CsTimeField` defaults to `auto`.

For a compact vertical stack, choose both policies explicitly:

```vue
<v-form>
  <div class="d-flex flex-column ga-4">
    <c-input :model="item" for="name" hide-details="auto" />
    <c-input :model="item" for="category" hide-details="auto" />
  </div>
</v-form>
```

Canon's external labels and control dimensions still change component geometry. Check custom input-and-action rows and layouts with validation messages when adopting c-style.

## The token contract

Import `cStyleTokens` from `coalesce-c-style`, or inspect `$tokens` in the `coalesce-c-style/tokens` Sass module, for the authoritative public token names. Use `CStyleToken` for TypeScript checking and `cs.token(name)` for Sass validation. These definitions replace a separately maintained inventory or count.

| Need | Definition |
|---|---|
| Public names and inline style helper | Installed `dist/index.d.ts`; source [`src/tokens.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/tokens.ts) |
| CSS token values and theme aliases | Installed `dist/styles/_tokens.scss`; source [`src/styles/_tokens.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/styles/_tokens.scss) |
| SCSS functions, mixins and accepted arguments | Installed `dist/tokens.scss`; source [`src/tokens.scss`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/tokens.scss) |
| Theme palette roles | Source [`src/theme/roles.ts`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/packages/c-style/src/theme/roles.ts) |

Use installed files for your pinned release; repository links point to `main`.

Color, shadow and font tokens follow the element's effective theme. Treat them as read-only: change colors and fonts through `cStyleBlueprint`, `applyCStyleColors` and `applyCStyleFont`. Theme aliases are redeclared on Vuetify theme elements, so an ancestor's custom color token can stop applying inside a component.

Size and motion tokens may be overridden on `:root` or a component where appropriate. Their values are defined in the token stylesheet. Vuetify's compiled dimensions can also depend on Sass settings or JavaScript props; a CSS token override does not automatically replace those. For example, changing a shell inset does not change the drawer's JavaScript `rail-width` prop.

Color tokens contain complete CSS colors, suitable for `color: var(--cs-muted)`. Shadow tokens contain shadow values. Read resolved tokens from the element that uses them when drawing a canvas or chart, and refresh those readings after theme or brand changes.

Internal `--cs-tone-*`, `--cs-btn-*`, `--cs-field-*`, `--cs-time-*`, `--_cs-*` slots and Vuetify `--v-*` variables are outside this public contract. Inspecting the installed implementation is useful for diagnosis; app styles should depend on the public API.

## The SCSS module: `coalesce-c-style/tokens`

```scss
@use 'coalesce-c-style/tokens' as cs;

.panel {
  @include cs.surface(raised);
}
.panel__title {
  @include cs.type(title-small);
}
.panel__hint {
  color: cs.token(muted);
}
.panel__action {
  @include cs.control-box(sm);
  @include cs.interactive(neutral, minimal);
  font: inherit;
}
```

The module emits no CSS until a function or mixin is used. Its implementation documents signatures and checks arguments at compile time.

For available functions, mixins and accepted arguments, read the installed `dist/tokens.scss`, resolved through the manifest's `coalesce-c-style/tokens` export. The example above shows surface, typography and control composition without maintaining a separate API inventory here.

Include `control-box` before `interactive` so the control's base border does not replace its interaction border. Use either `surface` or `interactive` on an element: both set background, ink and shadow. Use `tone` in a modifier for an existing interactive element.

Drive selected, expanded and disabled appearance with semantic HTML and ARIA state. The mixin styles those states; your component still supplies the correct keyboard behavior and prevents activation when disabled. An `aria-disabled` attribute alone does not prevent a click handler from running.

Use public tokens for theme-dependent colors, shadows, fonts, radii and icon sizes. Ordinary layout lengths may be literal. Prefer source order and component selectors when adding app styles; investigate conflicts before increasing specificity. Use component props, defaults providers or Sass configuration for Vuetify changes rather than styling its private markup.

## Runtime (TypeScript)

```ts
import { csVar } from "coalesce-c-style";

const hintStyle = { color: csVar("muted") };
```

`csVar(name, fallback?)` returns a CSS variable reference and validates the name through its TypeScript type. It does not resolve the current color. For a resolved value, call `getComputedStyle(element).getPropertyValue('--cs-muted')` on the element that hosts the content.

## Worked example

For a complete custom control with selection and keyboard behavior, see the repository demo's [`OptionTiles.vue`](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/MyProject/MyCompany.MyProject.Web/src/components/OptionTiles.vue). The demo is an optional example, not a file shipped in the npm package. The patterns above work in an ordinary app without Storybook or demo routes.

## Checking your component

Check the component in your app with light and dark themes, including a nested theme if relevant. Switch the brand and font through the public APIs and check that no old colors remain and text still fits.

Verify keyboard focus and the appropriate interaction model, disabled behavior, and reduced motion. Token-driven motion follows the package's reduced-motion settings; separately authored animations need their own handling.

## Agent skill

Start with [Agent guidance](agents.md) for task-specific references. The package includes an optional [component styling skill](../skills/c-style/SKILL.md); copy its directory into your agent's project skill directory if supported, and refresh it after upgrading.
