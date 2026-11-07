---
name: c-style
description: Styling Vue components in an app that uses c-style (Canon look for Vuetify 4 and Coalesce). Use when creating, styling or restyling a component, writing its `<style>` block, or choosing colours, spacing, type or states in such an app.
---

# c-style: styling app components

c-style already makes Vuetify and Coalesce look like Canon. Your component must match in light and dark, under any accent and font, using only c-style's public API. The full reference (every token's meaning and light/dark source, mixin details, worked example) is the "Styling your own components" section of c-style's `README.md` (`node_modules/coalesce-c-style/README.md`); read it when a name or behaviour below is not enough.

## 1. Pick the first rung that works

1. **Compose Vuetify components** (`v-btn`, `v-card`, `v-list`, `v-text-field`, `v-chip`, …). They are already Canon in every state. Set subtree props with `<v-defaults-provider :defaults="{ VBtn: { … } }">`.
2. **Vuetify utility classes**: `pa-*` / `ma-*` / `ga-*` (4px step = Canon's scale), `rounded-*`, `elevation-*`, `text-display-*` … `text-label-*` (all Canon). For secondary text use `cs.token(muted)`, not `text-medium-emphasis` (Vuetify's 60% ink).
3. **Tokens and mixins** for your own markup: `@use 'coalesce-c-style/tokens' as cs;` in `<style scoped lang="scss">`.
4. **Plain unlayered CSS** for layout (grid, position). It already beats c-style's layered CSS.

## 2. Tokens (`--cs-*`, 125 names)

In SCSS write `cs.token(name)` (typos fail the build); in templates `csVar('name')` from `c-style`.

- Sizes (overridable on `:root`): `control-height control-pad control-font control-lh control-gap icon radius surface-radius gap-sm gap-md gap-lg gap-xl hairline`
- Surfaces and neutrals: `canvas surface surface-bright on-surface muted quiet fill-hover fill fill-strong frame frame-hover rule rule-faint link disabled-bg disabled-fg scrim`
- Focus: `focus focus-ring` · Elevation: `shadow-edge shadow-control shadow-raised shadow-floating shadow-overlay`
- Type: `font-body font-heading font-mono font-tracking control-tracking`
- Motion (overridable; zeroed under reduced motion): `duration-state duration-press duration-open duration-close press-scale`
- Per intent `primary neutral success warning error info`: `<intent>-` + `solid on-solid solid-hover solid-active text tint-1 tint-2 tint-3 tint-4 line line-hover halo border-low`

Colour, shadow and font tokens are read-only: change them with `cStyleBlueprint`, `applyCStyleColors`, `applyCStyleFont`.

## 3. Mixins (`cs.`)

| Call | Gives |
|---|---|
| `surface($level: resting)` | `resting raised floating overlay`: surface bg, ink, 12px radius, edge + shadow |
| `control-box($size: md)` | `sm md lg` (32/40/48): inline-flex control box, padding, radius, text, sets `--cs-icon` |
| `interactive($intent: neutral, $emphasis: medium)` | Canon button states: hover, focus ring, pressed (`:active`, `aria-pressed/checked/selected/expanded/current`), disabled (`:disabled`, `aria-disabled`) |
| `tone($intent, $emphasis)` | recolour an element that already has `interactive`, in a modifier class |
| `type($role)` | `display-* headline-* title-* body-* label-*` (`-large/-medium/-small`) |
| `hairline($side: all)` | rule border; `top bottom inline-start …` |
| `focus-ring` | Canon focus ring as box-shadow |
| `focus-halo($intent: primary)` | field focus: line-hover border + 3px halo |

Emphases: `high` solid, `medium` tint, `low` outlined with shadow, `minimal` transparent.

Composition rules:
- `control-box` before `interactive`, always.
- One of `surface` or `interactive` per element.
- Variants: `&--error { @include cs.tone(error, low); }`, not a second `interactive`.
- Drive state with ARIA (`aria-checked`, `aria-pressed`, `aria-disabled`); the mixin styles it.
- `<button>` needs `font: inherit` or a `type()`.

```scss
@use 'coalesce-c-style/tokens' as cs;
.panel { @include cs.surface(raised); }
.panel__head { padding: 12px var(--cs-gap-md); @include cs.hairline(bottom); @include cs.type(title-small); }
.panel__hint { @include cs.type(body-small); color: cs.token(muted); }
.panel__action { @include cs.control-box(sm); @include cs.interactive(neutral, minimal); }
```

Model component: `src/components/OptionTiles.vue` in c-style's demo app.

## 4. Rules

- Every themed value (colour, shadow, font, surface radius, icon size) comes from a token or mixin. Canon constant lengths (12px padding, a grid column width) may be literals.
- Read only public `--cs-*` names. `--v-*`, `--cs-btn-*`, `--cs-tone-*`, `--cs-field-*`, `--cs-time-*` and `--_cs-*` are internal.
- Win the cascade with source order and plain selectors; `!important` is never needed.
- Leave Vuetify internals (`.v-btn__*`, `.v-field__*`, …) alone. A Vuetify component that looks wrong gets props, `v-defaults-provider` or `coalesce-c-style/settings`; otherwise report it as a c-style issue.
- Set colours on the theme, never by redefining colour tokens on an ancestor.

## 5. Verify before done

Check each in Storybook (toolbar Theme / Accent / Font) or by switching the app's theme, `applyCStyleColors` and `applyCStyleFont`:

- [ ] light and dark (and inside `<v-theme-provider theme="dark">` if it can sit there)
- [ ] accent switch: no leftover blue
- [ ] font switch: nothing clips or overflows
- [ ] keyboard: Tab reaches it, focus ring visible, arrow keys where the pattern needs them
- [ ] disabled: grey, no hover, not clickable
- [ ] the style block has no hex, `rgb(`, `--v-` or `!important`
