# Review: the public styling contract (`--cs-*`, `c-style/tokens`)

Scope: the uncommitted work described in docs/progress.md, "Public styling contract". Severity is for app authors once the API is documented. "Fixed" items are in the working tree; "Decision" items need a call before the docs go out.

## Fixed

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| 1 | High | `interactive()`: a disabled element with `aria-current` showed the pressed rung, not the disabled one. `[aria-current]:not([aria-current='false'])` inside `:is()` made the pressed rule (0,3,0), above the disabled rule's (0,2,0). | Specificity of the compiled selectors. | `:not(:where(...))`. Every state rule now sits at (0,2,0), so disabled (last) wins and an app's `.x:hover` override wins by source order. New unit test computes each selector's specificity. |
| 2 | High | `interactive()` removed the focus ring from a focused `aria-disabled` element (`box-shadow: none` in the disabled rule). `aria-disabled` exists so the element stays focusable. | Mixin source. | Disabled sets `box-shadow: none` only `:not(:where(:focus-visible))`. Unit test. |
| 3 | Med | `interactive()` greyed `aria-busy` buttons. Canon: busy buttons are `aria-disabled` but keep their colours (canon §3.5). | canon.md §3.5 "aria-busy". | Disabled selector excludes `[aria-busy='true']` (inside `:where`). |
| 4 | Med | Hover applied on touch devices (sticky tint after a tap). Canon gates hover on `@media (hover: hover)`. | canon.md Button "States". | Hover moved under `@media (hover: hover)`; focus-visible keeps the hover rung on its own. |
| 5 | Med | `type(title-medium)` / `type(title-small)` used the heading family; Vuetify's `.text-title-medium/-small` use the body family. The docstring promises the same roles as the classes. Invisible with the default font (heading = body), wrong once an app sets a heading font. | vuetify/lib/styles/settings/_variables.scss: heading for display-*, headline-*, title-large only. | `type()` matches Vuetify. Unit test. |
| 6 | Med | Worked example used `role="group"` + `aria-pressed` toggle buttons for a single choice, so pressing the selected tile again "pressed" it, and every tile was a tab stop. It is the template app authors will copy. | WAI-ARIA radio group pattern. | `OptionTiles.vue` is a `radiogroup` of `role="radio"` buttons (`aria-checked`, labelled and described by the header), one roving tab stop, arrow / Home / End move focus and selection, skipping disabled tiles. Styles `scoped`. App test for the keyboard model. |
| 7 | Low | `--cs-gap` / `--cs-form-gap` lived on `:root` with the public prefix but outside the contract: an undocumented promise by appearance. Seven internal uses. | grep. | Removed; c-style's rules read `control-gap`, `gap-sm`, `gap-md` (same values). README line updated. |
| 8 | Low | Tints used `color-mix(in srgb, rgb(var(--v-x-tint)) calc(var(--v-tint-N) * 100%), transparent)`. Correct (Vuetify 4 already requires `color-mix`, so no new browser floor) but the same colour as `rgba(var(--v-x-tint), var(--v-tint-N))`, which the other alpha tokens (`rule`, `scrim`) use. | Computed values identical in the app tests. | `rgba(...)`: one form for every alpha token, ~1.4 KB less per declaration block. |
| 9 | Low | `hairline($side)` accepted any word (`hairline(botom)` emitted `border-botom`). | Mixin source. | Validated against the 11 `border-*` sides; error test. |
| 10 | Low | Module variables `$intent-roles`, `$control-sizes` were public (readable and assignable as `cs.$...`), so would have become API by accident. | Sass module rules. | Private (`$-intent-roles`, `$-control-sizes`). Public module members are now: `$tokens`, `$intents`, `$emphases`, `$surfaces`, `token()`, and the mixins. |
| 11 | Low | No test that `@use 'c-style/tokens'` emits nothing; no runtime check of a nested dark subtree (only the selector text was tested). | test/tokens.spec.ts, verify/app/tokens.spec.ts. | Unit: `@use` compiles to empty CSS. App: a `.v-theme--dark` element under the light app resolves `--cs-surface` / `--cs-primary-text` to dark values. |
| 12 | Low | App test sampled the pressed tile's `box-shadow` once while it transitions; failed once in dark. | Flake on the full run. | Polled like the background. |

## Decisions

Outcome (orchestrator): D1 recorded as contract wording, no code; D4 and D5 applied; D8 deferred; D2, D3, D6, D7 accepted, with D2 and D7 stated in the `token()`, `interactive()` and `control-box()` docstrings.

**D1 (Med). Colour tokens can't be overridden from an ancestor.** Theme-backed tokens are redeclared on every `[class*='v-theme--']` element, and Vuetify puts `v-theme--<name>` on nearly every component (VCard, VBtn, VList, overlay content). So `.my-panel { --cs-primary-solid: … }` stops at the first Vuetify component inside. Unavoidable if tokens must follow nested themes, and the same as Vuetify's own `--v-theme-*`. **Contract wording (adopted):** colour, shadow and font tokens are read-only; change them through the theme (`cStyleBlueprint`, `applyCStyleColors`, `applyCStyleFont`). Size and motion tokens may be overridden on `:root`.

**D2 (Low). Re-pointed `--v-theme-*` leak into `--cs-*` on the same element.** c-style re-points some theme colours on individual elements in `vuetify-utilities.c-style`: `.text-primary.v-btn` (text step), hovered / pressed `bg-*` buttons, disabled buttons (`on-surface` → disabled-fg), Coalesce admin toolbars (`primary` → surface), two picker parts. Those elements also redeclare `--cs-*`, so app content in such a component's slot reading `--cs-primary-solid` gets the re-pointed value. Rare in practice; document as "tokens are the element's effective theme", or later give the re-points their own variables.

**D3 (Low). Cost of the redeclaration.** 116 declarations, 7.7 KB uncompressed, on 314 themed elements on /c-style (2157 elements; Vuetify's own `.v-theme--light` block is 225 declarations). Chrome, median of 40 forced recalcs of the whole tree:

| Change | With tokens | Block removed |
|---|---|---|
| `body` colour | 0.9 ms | 0.6 ms |
| unrelated custom property on `:root` | 16.7 ms | 10.6 ms |
| `--v-theme-surface` on `:root` | 8.3 ms | 0.7 ms |

Ordinary state changes are unaffected; a theme or accent switch pays a few ms more. Acceptable. If it needs trimming, D5's cuts remove ~30 declarations.

**D4 (Low). Size tokens are unlayered, colour tokens layered.** Sizes on `:root` are unlayered (pre-existing); an app overriding `--cs-radius` on `:root` wins by import order, not by layer. Moving the size `:root` block into `@layer vuetify-overrides` would make any unlayered app override win regardless of order. **Applied:** every token declaration is now in `@layer vuetify-overrides` (unit test); an unlayered `:root { --cs-control-height: 36px }` parsed before c-style's CSS wins (app test).

**D5 (Med). Contract size and naming (137 tokens).** Before it becomes a promise:
- Cut candidates: `ease`, `ease-out`, `ease-in` (aliases of CSS keywords, not zeroed under reduced motion: nothing to gain from the indirection); `ring-offset` (only meaningful inside `focus-ring`, which is a token); `segment` (one component's track); `font-features`; the 6 × `bar` (alert-only). Removing them: 137 → 125 (an earlier draft of this note said 122; the cuts are 12 names).
- `--cs-tracking` (control text, already scaled) next to `--cs-font-tracking` (the font's multiplier) is easy to confuse. Suggest `control-tracking`, in line with `control-font` / `control-lh` / `control-gap`.
- `control-gap` and `gap-sm` are both 8px with different meanings (icon↔label vs. cluster). Keep both, but document the distinction.
- `surface-bright` is Vuetify's name; fine since it maps to a Vuetify surface, but its role (Canon's raised-in-dark lift) needs a line in the docs.
- Intent `line` / `line-hover` / `halo` are the field recipe; `border-low` is the button recipe. Document by recipe rather than renaming.

**Applied:** all seven cut (internal rules read the `--v-*` value or the CSS keyword instead: the focus ring inlines `rgb(var(--v-ring-offset))`, transitions use `ease`); `--cs-tracking` renamed `--cs-control-tracking` in every c-style rule and the Spacing story. 125 tokens; a unit test pins the count.

**D6 (Low). `interactive()` vs Canon's disabled matrix in dark mode.** Low / minimal disabled text is `disabled-fg` (zinc-500 dark) where Canon says zinc-600, and the low disabled border is `frame` (zinc-700) where Canon says zinc-800. This matches c-style's own disabled VBtn, which is the more useful parity for app components sitting beside Vuetify buttons. Fix both together (theme roles) if exact Canon is wanted.

**D7 (Low). Order dependence between mixins.** `control-box()` draws `border: 1px solid transparent`; included after `interactive()` it erases the low emphasis border. Documented in the docstring ("include it before `interactive`"). A structural fix (`var(--_cs-border, transparent)`) was rejected: `--_cs-*` slots inherit, so a `control-box` nested inside an interactive element would pick up its parent's border. `surface()` and `interactive()` both set background, colour and shadow and don't compose; that's expected.

**D8 (Low, deferred). Missing pieces, deferred past the first documented version:**
- A field-frame mixin (`field($intent)`: frame, frame-hover, `focus-halo` on `:focus-within`, disabled bg / fg, read-only dashed), since every custom input needs it and the parts are already tokens.
- `press()` (scale to `--cs-press-scale` over `--cs-duration-press`, for worded buttons), as Canon applies it separately from the tone matrix.

## Checked, no change

- `[class*='v-theme--']` matches Vuetify's `v-theme--<name>` for any theme name, not `v-theme-provider`. Specificity (0,1,0) in `vuetify-overrides`: unlayered app CSS always wins; app CSS in a layer listed before `vuetify-overrides` loses.
- Light, dark, nested dark, `theme.change`, `applyCStyleColors`, `applyCStyleFont`: app tests (13).
- `prefers-reduced-motion`: durations 0 and press scale 1; `interactive()` reads the duration token, so it needs no media query.
- `@use 'c-style/tokens'` from an app SFC under the demo's Vite (default modern Sass API, `sass` export condition) and Storybook's Vite; emits no CSS; `type()`, `token()` and all mixins compile for every argument; output names only public tokens and `--_cs-*`.
- `interactive()` × 6 intents × 4 emphases matches canon §3.5 for rest / hover / focus / pressed / disabled, apart from D6. Neutral's inverted high emphasis comes from the theme roles.
- Existing components: `_typography.scss` refactor produces the same `$typography` (app `type.spec.ts` and the parity suites pass); the `_tokens.scss` rewrite keeps every pre-existing name except the two removed aliases.

## Suites after the fixes

Unit 111/111; app 169/169; Storybook 409/409; package and verify `tsc`, demo and Storybook `vue-tsc` clean; demo eslint clean on `OptionTiles.vue`.
