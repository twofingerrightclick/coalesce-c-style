# Canon design system: research notes for c-style

Source: Canon v0.2.0 (`canon-ui`), repo clone at `.refs/canon` (HEAD `5074ecd`), live docs at <https://recepkutuk.github.io/canon/reference/introduction.html>. The live reference pages are the same files as `reference/*.html` in the repo. Spot-checked pages matched the source; any differences are noted inline.

Paths are relative to `.refs/canon/`. `T:` means `src/css/theme/`, `C:` means `src/css/core/`. Unless a value is marked otherwise, 1rem = 16px.

What this doc covers: the **Canon theme** (`css/canon/canon.css`). Canon is a markup contract plus swappable themes, and its own theme is the look we're matching. The bundled Carbon, Material, Fluent, Ant and Bootstrap themes are counter-examples. They're useful because they show which knobs a theme is *meant* to turn.

---

## 1. Philosophy and principles

Canon is a plain-HTML component kit for internal tools ("tables, forms, records"). Its slogan is **"The markup is the contract."** (`README.md`). The principles that matter for restyling:

| Principle | What it means for the look | Ref |
|---|---|---|
| **Meaning in markup, look in theme** | Variants are semantic axes, never visual ones. `data-emphasis` = `high`, `medium` (default), `low` or `minimal`. `data-intent` = `info`, `success`, `warning`, `danger`, or neutral (the default; Button also has an explicit `neutral`). The rule is "never 'outline', 'rounded' or 'blue'". The theme turns emphasis × intent into fills. | `docs/decisions.md` §Markup channels, Contract rule 2 |
| **Emphasis = how strongly it asks for attention relative to neighbors** | "Default emphasis is `medium`. `high` must be chosen deliberately." One high action per region. | decisions §Cross-cutting |
| **Calm, neutral** | The theme header says: "Canon's look: a calm, neutral theme for internal tools." Neutral zinc greys carry most of the UI. Blue is the only accent, and it appears on primary actions, focus, selection and links. | `T:base.css:1-15` |
| **Indicator rule** | Visuals that show behavior come from the attribute that declares the behavior: the chevron from `aria-haspopup`, the spinner from `aria-busy`, the external-link glyph from `target=_blank`. They're never authored. | decisions §Cross-cutting |
| **The author beats the theme, but never has to say anything** | Hints (`data-size`, `data-density`, `data-display`, …) live in the `canon.hints` layer, which sits *above* the theme. A hint resolves in this order: own attribute → nearest ancestor → theme context → theme default. | decisions §Cross-cutting, §CSS architecture |
| **Sizes belong to each component** | The same `data-size` doesn't promise the same height everywhere. In Canon's theme, fields and buttons do match: 32/40/48. | decisions |
| **Layout belongs to containers** | Components never set the space around themselves. Stack, Cluster and Grid (`data-gap`) do. | decisions |
| **Hover only for hover-capable pointers** | Hover looks go under `@media (hover: hover)`. A look shared with `:focus-visible` keeps its focus half outside the gate. | decisions |
| **Motion by how often it's seen** | Things opened many times a day (the Command Palette) open instantly. State changes "settle without overshoot". Skeletons appear only after a delay. No ripples ("pointer-position effects") ever. | decisions §Cross-cutting, §Out of scope |
| **Lines and depth** | Lines *inside* components are see-through **hairlines**. Frames that say "this is a control" are a solid 1px. *What floats has no frame*: a hairline edge plus one of three shadows. Surfaces resting on the page get a hairline edge, and a Card also gets the raised shadow. Framed controls get a faint `shadow-control` lift that disappears while pressed or disabled. A transparent 1px border always stays, so sizes never shift and forced-colors mode still draws a frame. | decisions §CSS architecture "Lines and depth" |
| **Logical properties, RTL** | Everything uses `inline`/`block` properties. | decisions |
| **Accessible by contract** | Never hide a label with `display:none`. `aria-disabled` stays focusable and must not get `pointer-events:none`. Focus is always visible. | decisions |

Taken together, the visual character is a Linear/shadcn-like neutral: Inter with stylistic alternates, zinc greys, a single blue accent, 8px control radius, see-through hairlines, very soft shadows, short 100–150ms transitions with no overshoot, and 1.5px-stroke Lucide icons.

---
## 2. Token architecture

### 2.1 Layers and files

```
@layer canon.core, canon.theme, canon.hints;   /* T:base.css:18, C:base.css:23 */
```

| Layer | File(s) | Role |
|---|---|---|
| `canon.core` | `css/canon/canon.core.css` (built from `src/css/core/*.css`) | Mechanics only, with "zero visual identity: no colors, borders, radii, shadows or fonts". Every selector is wrapped in `:where()` (zero specificity). It also holds the size *resolution* and all `--canon-text-*` strings. |
| `canon.theme` | `css/canon/canon.css` (built from `src/css/theme/*.css`) | The look: palette, semantic tokens, component tokens, and component rules. |
| `canon.hints` | core | Author hints (`data-size`, `data-density`, `data-display`, `data-orientation`, `data-gap`, …). They sit above the theme, so the author wins. |
| *(unlayered)* | app CSS | Beats all three layers with no specificity fights. This is Canon's official override path. |

Build order lives in `src/css/order.json`, and module dependencies in `src/manifest.json`.

### 2.2 Tiers and naming

| Tier | Prefix | Examples | Scope | Defined in |
|---|---|---|---|---|
| **Primitive (palette)** | `--canon-theme-<hue>-<step>` | `--canon-theme-zinc-500`, `--canon-theme-blue-600`, `--canon-theme-white` | `:root` | `T:base.css:34-273` |
| **Semantic / global** | `--canon-theme-<role>` | `ink`, `paper`, `success`, `warning`, `danger`, `focus`, `ring-offset`, `hairline`, `edge`, `rule`, `rule-faint`, `shadow-{raised,floating,control,overlay}`, `font-mono` | `:root` | `T:base.css:275-327` |
| **Contract size tokens** (theme supplies; core resolves) | `--canon-control-*-{sm,md,lg}`, `--canon-icon-size-{sm,md,lg}` → resolved `--canon-control-block-size`, `--canon-control-padding-inline`, `--canon-control-font-size`, `--canon-control-gap`, `--canon-icon-size` | | `:root`, then per `[data-size]` | theme `T:base.css:306-321`, resolution `C:base.css` "Size defaults" + `canon.hints` |
| **Spacing** | `--canon-gap-{sm,md,lg,xl}` | | `:root`, then per `[data-size]` | `T:stack.css` |
| **Density** | `--canon-density` (−1, 0, 1) | | `[data-density]` | `C:base.css` hints |
| **Component tokens** (size-dependent) | `--canon-theme-<component>-<prop>` | `button-radius`, `input-radius`, `input-inset`, `label-font-size`, `tooltip-radius`, `table-radius`, `card-title-size`, `page-title-size`, … | `:root, [data-size="md"]` / `:is([data-size="xs"],[data-size="sm"])` / `:is([data-size="lg"],[data-size="xl"],[data-size="2xl"])` | each `T:<component>.css` head |
| **Variant-local tokens** | `--canon-theme-tone-{200..700}`, `--canon-theme-tint-{1..4}`, `--canon-theme-fg`, `--canon-theme-bg`, `--canon-theme-bg-hover`, `--canon-theme-bg-active`, `--canon-theme-border`, `--canon-theme-border-low`, `--canon-theme-ring` | | set on the component element | `T:base.css:503-627` (Button). Other components use private `--_tone`, `--_t400`, `--_bar`, `--_solid`, `--_on`, `--_bg`, `--_line`. |
| **Icons** | `--canon-theme-icon` (per `[data-icon]`), `--canon-theme-icon-<name>` (system indicators) | | | `T:base.css:337-458` |
| **Strings** | `--canon-text-<key>` | | `:root`, `:lang()` | `C:base.css:42-…`, `i18n/*.css` |
| **JS-written live values** | `--canon-slider-percent`, `--canon-count-inline-size`, `--canon-tooltip-anchor`, `--canon-seed-colors`, … | | | `js/canon.js` |

**Default-size exceptions.** Tooltip, Tag and Kbd default to their **sm** values at `:root`, not md. Their md and lg values only apply under an explicit `data-size`. Avatar has six distinct sizes (24–64px), so xs–2xl don't collapse to three there. The Spinner's lg size is 32px. See §4.

Size-dependent component tokens are always declared with the same three-selector pattern (`T:base.css:470-500` is typical). **The nearest `data-size` ancestor wins through custom-property inheritance.** The six size values collapse to three: xs→sm, and xl/2xl→lg.

Variant rules only set local properties. "Themes keep variant rules at equal specificity … so rule order decides and disabled can simply come last" (decisions §CSS architecture). Each state rule then just *picks* a property, for example `background-color: var(--canon-theme-bg-hover)`.

### 2.3 Sizing (control tokens), `T:base.css:306-321`

| Token | sm (xs, sm) | **md (default)** | lg (lg, xl, 2xl) |
|---|---|---|---|
| `--canon-control-block-size` (min height of buttons, fields, select triggers) | 2rem (**32px**) | 2.5rem (**40px**) | 3rem (**48px**) |
| `--canon-control-padding-inline` | 0.5rem (8) | 0.625rem (10) | 0.75rem (12) |
| `--canon-control-font-size` | 0.75rem (12) | 0.875rem (14) | 1rem (16) |
| `--canon-control-gap` (icon↔label inside a control) | 0.375rem (6) | 0.5rem (8) | 0.625rem (10) |
| `--canon-icon-size` | 1rem (16) | 1.25rem (20) | 1.5rem (24) |

The derived component tokens per size:

| Token | sm | md | lg | Ref |
|---|---|---|---|---|
| `button-radius` | 4px | **8px** | 12px | `T:base.css:474,484,494` |
| `button-line-height` | 16px | 20px | 24px | |
| `button-tracking` | −0.007em | −0.006em | −0.004em | |
| `button-gap` (between flex children; control-gap is overridden) | 2px | 2px | 0 | |
| `button-label-inset` (label's own padding-inline) | 4px | 6px | 8px | |
| `button-kbd-padding` block / inline / radius | 0 / 4 / 2px | 2 / 6 / 4px | 4 / 8 / 6px | |
| `input-radius` | 4px | **8px** | 12px | `T:text-input.css:14-35` |
| `input-inset` | 4px | 6px | 8px | |
| `input-gap` | 2px | 4px | 6px | |
| `input-icon-gap` | 2px | 2px | 0 | |
| `input-line-height` | 16px | 20px | 24px | |
| `input-tracking` | −0.007em | −0.006em | −0.004em | |
| `label-font-size` / `line-height` / `tracking` | 12/16/−0.007em | 14/20/−0.006em | 16/24/−0.004em | `T:label.css:13-37` |
| `label-description-*` (hint text) | 10/12/−0.0025em, gap 4 | 12/16/−0.007em, gap 6 | 14/20/−0.006em, gap 8 | |
| `tooltip-radius` / `font-size` / `line-height` | 4 / 12 / 16 | 6 / 14 / 20 | 8 / 16 / 24 | `T:tooltip.css:23-42` |
| `tag-radius` / `font-size` / `line-height` | 2 / 12 / 16 | 4 / 14 / 20 | 8 / 16 / 24 | `T:tag.css:15-49` |
| `kbd-radius` | 2 | 4 | 6 | `T:kbd.css:13-23` |
| `table-radius` | 8 | **12** | 16 | `T:table.css:22-28` (note the md default is 12) |
| `card-title-size` / `line` | 14/20 | 16/24 | 18/28 | `T:card.css:18-27` |
| `form-title-size` / `line` | 14/20 | 16/24 | 18/28 | `T:form-layout.css:21-34` |
| `accordion-title` / `line` | 13/20 | 14/20 | 16/24 | `T:accordion.css:19-38` |
| `page-title-size` / `line` | 20/28 | **24/32** | 30/36 | `T:page-header.css:19-28` |
| `stat-value-size` / `line` | 24/32 | 30/36 | 36/44 | `T:stat.css:23-48` |
| `code-font-size` | 12 | 13 | 14 | `T:code-block.css:17-27` |
| `shell-inset` / `shell-brand-gap` | 8 / 10 | 12 / 12 | 16 / 16 | `T:app-shell.css:24-33` |

**Ratios to reproduce**
- Text line-height = font-size + 4px at sm (12/16), +6 at md (14/20), +8 at lg (16/24). That's 1.333, 1.4286 and 1.5.
- Radius doubles from sm to md, and md to lg adds 50% (4→8→12). Inner and nested radii use `calc(radius ± 1–2px)` or `max(0px, calc(radius − 1px))` so concentric corners stay parallel.
- Vertical padding is never set directly. It's derived: `padding-block = max(0, (block-size − 1lh)/2 − 1px)`, with the 1px for the always-present border (`T:base.css:588`). Horizontal padding is `control-padding-inline − 1px` plus a label inset. An md button therefore has 9 + 6 = 15px from its edge to the text.

### 2.4 Spacing scale (`--canon-gap-*`), `T:stack.css`

| Step | sm context | **md (default)** | lg context | Typical use |
|---|---|---|---|---|
| `--canon-gap-sm` | 4px | 8px | 12px | tight clusters |
| `--canon-gap-md` | 12px | **16px** | 20px | default stack gap; gap between fields in a Fieldset |
| `--canon-gap-lg` | 16px | 24px | 32px | |
| `--canon-gap-xl` | 24px | 32px | 40px | gap between Form Layout sections |

`data-gap="none|sm|md|lg|xl"` on Stack, Cluster or Grid is *not inherited* (`C:stack.css:45-49`). Smaller in-component values (2, 4, 6px) come from the component tokens above. In practice Canon's spacing grid is **4px**, with 2px half-steps inside controls.

### 2.5 Density, `C:base.css` hints

`data-density` = `compact`, `comfortable` or `spacious`, which sets `--canon-density` to −1, 0 or 1. When the attribute is absent, each component uses its own default via `var(--canon-density, <default>)`. Density is **independent of size**. Only a few components respond to it:

- **Table / Description List**: `--_row-extra: calc((var(--canon-density, 0) + 1) * 1rem)`, which adds **0 / 16 / 32px** to the row's block size. Compact rows are therefore the bare text/control height (`T:table.css:33`, `T:description-list.css:18`). See §4 for the resulting heights.
- **Avatar Group**: overlap. The default is −1 in one context and 1 in another (`T:avatar-group.css:14,17`).

Everything else ignores density. *Size* is the main density knob in Canon: the sm, md and lg control sets give 32, 40 and 48px rows.

### 2.6 Borders and lines, `T:base.css:286-293`

| Token | Value (light / dark) | Use |
|---|---|---|
| `--canon-theme-hairline` | 1px; **0.5px at ≥2dppx** | width of every line *inside* a component and of edges on floating or resting surfaces |
| `--canon-theme-edge` | `rgb(0 0 0 / .12)` / `rgb(255 255 255 / .12)` | outline of floating surfaces (menus, popovers, dialogs) and resting surfaces (card, table, alert) |
| `--canon-theme-rule` | black / white **10%** | separators: table rows, a dialog header line |
| `--canon-theme-rule-faint` | black **7%** / white **8%** | app-shell edges |
| Control frame | **1px solid**, opaque `zinc-200` / `zinc-700` (see §3) | text fields, checkboxes, low buttons, chips |
| Button border | always 1px, `transparent` unless the variant uses it | keeps every emphasis the same box size |

### 2.7 Elevation, `T:base.css:294-301`

| Token | Light | Dark | Used by |
|---|---|---|---|
| `shadow-control` | `0 1px 2px rgb(0 0 0/.05)` | `0 1px 2px rgb(0 0 0/.3)` | low buttons, button groups, text fields. Removed on `:active` and when disabled. |
| `shadow-raised` | `0 1px 2px rgb(0 0 0/.06), 0 1px 3px rgb(0 0 0/.04)` | `.3` / `.2` | card, tooltip |
| `shadow-floating` | `0 8px 24px rgb(0 0 0/.08), 0 2px 6px rgb(0 0 0/.06)` | `.5` / `.3` | menus, popovers, listboxes, popup calendars, color picker, toasts, bulk bar |
| `shadow-overlay` | `0 24px 48px -12px rgb(0 0 0/.18), 0 4px 12px rgb(0 0 0/.06)` | `.6` / `.3` | dialogs, drawers, command palette, narrow sidebar |

Depth is always **edge (hairline) + shadow**, with no solid border. In dark mode the shadow alphas go up roughly 4–6× and the surfaces lift with lighter zinc (see §3.4).

### 2.8 Focus ring, `T:base.css:629-651`

```css
outline: 2px solid transparent;  outline-offset: 2px;          /* forced-colors fallback */
box-shadow: 0 0 0 2px var(--canon-theme-ring-offset),           /* gap: white / zinc-900 */
            0 0 0 3px var(--canon-theme-ring);                  /* 1px ring: focus = blue-600 / blue-400 */
```

The visible result is a **1px blue ring sitting 2px outside** the element. On buttons, focus also shows the hover background. The ring is *always* the focus blue, whatever the intent ("always blue, whatever the intent"). Text fields use a focus border instead of the outer ring; see the field recipe in §4.

### 2.9 Typography, `T:base.css:21-50, 304, 323-327`

| Item | Value |
|---|---|
| Sans | `InterVariable, Inter, ui-sans-serif, system-ui, sans-serif`, weights 100–900, from rsms.me (Google Fonts strips the alternates) |
| Features | `font-feature-settings: "ss01", "cv11", "cv04", "cv03", "cv02"` on `:root`. That's open digits / single-storey a, alternate 1, 4, 6/9 and so on. These matter for "the Canon look". |
| Mono | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (`--canon-theme-font-mono`), weights 400–700, no ligatures or alternates |
| Weights used | 400 (body, inputs), **500** (buttons, labels, tabs, menu items: the most common), 600 (titles, headings, stat values) |
| Body | Inherits the browser default (16px). Canon sets no body font-size, and components size their own text. |

Type ramp, assembled from the component tokens:

| Role | sm | md | lg | Weight | Tracking |
|---|---|---|---|---|---|
| micro (count, kbd, menu/select group captions, avatar initials sm) | 10px fixed | | | 500–600 | +0.01em (+0.03em tag status); counts use `tabular-nums` |
| hint / description | 10/12 | **12/16** | 14/20 | 400 | −0.007em at 12px |
| control text, label, body-in-components | 12/16 | **14/20** | 16/24 | 400 (input) / 500 (button, label) | −0.006em at 14px |
| accordion title | 13/20 | 14/20 | 16/24 | 500 | −0.006em |
| card / form-section title | 14/20 | **16/24** | 18/28 | 600 | −0.01em (card, `T:card.css:99`) |
| page title | 20/28 | **24/32** | 30/36 | 600 | −0.015em (`T:page-header.css:70`) |
| stat value | 24/32 | 30/36 | 36/44 | 600 | −0.02em (`T:stat.css:76`) |

Tracking follows Inter's dynamic-metrics curve: slightly negative, and more negative as the size goes up. The literal values found are −0.004, −0.006, −0.007, −0.01, −0.015, −0.02em, and +0.01 / +0.03em for small caps-like labels.

### 2.10 Motion (summary; full inventory in §4 "Motion inventory")

- State colors: `background-color, border-color, color 0.12s` with the default `ease` (`T:base.css:597`).
- Press: `scale: 0.98`, transitioned with `0.1s ease-out`. Only on buttons with words: not icon-only buttons, and not joined group halves.
- Disclosure chevron: `rotate 0.15s` to 180°.
- Spinner: `canon-spin 0.8s linear infinite`. Under reduced motion it slows to 2.4s rather than stopping.
- Icon pop on copy: `0.2s ease-out` from `opacity 0; scale .5`.
- `prefers-reduced-motion: reduce` removes transitions and the press scale.
- No overshoot or spring curves. "State changes settle without overshoot." Exception: the Switch thumb uses `cubic-bezier(0.34,1.56,0.64,1)`, an overshoot spring (`T:choice.css:227-229`).

### 2.11 Z-index

Canon relies on the **top layer** (`popover`, `<dialog>`) for every overlay, so it has no global z-index scale. The local values are small (1–4, 10) for sticky headers, pinned columns and stacking within components. See the inventory in §4.

### 2.12 Icons

Lucide, **stroke 1.5 at every size**, drawn as `mask` images filled with `currentColor` (`T:base.css:337-340`). The icon box is `--canon-icon-size` (16/20/24). System indicators are theme-owned (`--canon-theme-icon-chevron`, `-check`, `-external`, `-loader`, …): chevron-down for `aria-haspopup`, the external glyph at `scale: .8` for `target=_blank`.

---
## 3. Color system

### 3.1 How colors are defined

1. **Primitives are full Tailwind v3 11-step scales**, 50 through 950 (`T:base.css:34-206`). Full scales exist for **zinc** (the neutral), **blue** (the accent and info), **green** (success), **amber** (warning) and **red** (danger). Steps 300–700 only exist for sky, cyan, teal, emerald, lime, yellow, orange, rose, pink, fuchsia, purple, violet and indigo; avatar and tag seed colors use those (`T:seed.css`, 17 seed slots).
2. **Light/dark is native**: `:root { color-scheme: light dark }`, and every color is written `light-dark(<light>, <dark>)` (decisions: "the only CSS mechanism that follows the color-scheme property"). Canon has no `.dark` class. Because `light-dark()` only takes colors, per-scheme alpha has to be written as two complete colors.
3. **Semantic roles point at *steps*, not at hexes.** Every component rule references `--canon-theme-<hue>-<step>`. Other themes recolor Canon by **redefining the scale variables** (`css/carbon/carbon.css:211-269` keeps the slot names `zinc-*` and `blue-*` but fills them with Carbon greys and blues). This is the core relationship to keep: *a brand color becomes a generated 50–950 ladder that goes into the accent slots, and a tinted or neutral grey ladder goes into the neutral slots.* Every role relationship below then holds automatically.
4. **Derived colors** use `color-mix(in srgb, <step> N%, transparent)` for see-through tints, and `color-mix(in srgb, <hue-950> 70%, zinc-950)` for dark-mode tinted surfaces (`T:banner.css:36`). Lines and shadows use plain `rgb(0 0 0 / a)` and `rgb(255 255 255 / a)`. Canon doesn't use relative color syntax.

### 3.2 Semantic globals, `T:base.css:278-285`

| Token | Light | Dark |
|---|---|---|
| `ink` (text) | zinc-950 | zinc-50 |
| `paper` (page) | white | zinc-950 |
| `success` | green-700 | green-400 |
| `warning` | amber-700 | amber-400 |
| `danger` | red-600 | red-400 |
| `focus` | blue-600 | blue-400 |
| `ring-offset` | white | zinc-900 |

**The step-flip rule.** For a hue used *as text or line on the page*, light mode takes 600–700 and dark mode takes 400. For neutral text the pairs are mirrored around about 450 (500↔400, 600↔300, 700↔200, 900↔100/white).

### 3.3 Neutral role map (zinc), counted across `T:*.css`

| Role | Light | Dark | Notes |
|---|---|---|---|
| Primary text, control value | zinc-900 (`ink`=950 at root) | white / zinc-50 | |
| **Secondary text, icons, hints, captions** | **zinc-500** | **zinc-400** | The most common pair (54 uses). Field icons and affixes use it too, as do neutral-button icons. |
| Placeholder, muted, disabled text | zinc-400 | zinc-500 | `--_muted` in fields (36 uses) |
| Strong secondary (e.g. selected tab text, body copy in alerts) | zinc-600/700 | zinc-300 | |
| **Control frame (input / checkbox / low-neutral-button border)** | **zinc-200** | **zinc-700** | 37 uses |
| Control frame on hover | zinc-400 | zinc-500 | input hover (`T:text-input.css:44`) |
| Strong frame: unchecked checkbox/radio line | zinc-400 | zinc-500 | `T:choice.css:61`; hover zinc-600 / zinc-300 |
| Switch track off | zinc-300 | zinc-700 | `T:choice.css:208` |
| Subtle fill: hover row, kbd bg, neutral chip, inset well | zinc-100 | zinc-800 (or 700 on raised) | |
| Disabled fill, prefix/suffix well | zinc-50 | zinc-800 | |
| Disabled frame | zinc-200 | zinc-700/800 | |

### 3.4 Surface hierarchy (layer stepping)

| Layer | Light | Dark | Edge / line | Shadow | Ref |
|---|---|---|---|---|---|
| Page in an App Shell (the "canvas") | **zinc-50** | **zinc-950** | — | — | `T:app-shell.css:45-46` |
| Plain page (`paper`) | white | zinc-950 | — | — | `T:base.css:279` |
| Sidebar, top bar (shell chrome) | white | zinc-900 | `rule-faint` hairline | none | `T:app-shell.css:62,125` |
| Resting surface: card, table, code block, alert | white | **zinc-900** | `edge` hairline | card only: `raised` | `T:card.css:36` |
| Field box | white | zinc-900 | 1px solid zinc-200/700 | `control` | `T:text-input.css:52` |
| Floating: menu, popover, listbox | white | zinc-900 | `edge` hairline | `floating` | `T:menu.css:35`, `T:popover.css:20` |
| Dialog, drawer | white | zinc-900 | `edge` | `overlay` | `T:dialog.css:21` |
| Dialog backdrop | `rgb(255 255 255 / .85)` (a **white** wash) | `rgb(9 9 11 / .75)` (zinc-950 at 75%) | | | `T:dialog.css:34` |
| Toast | white | **zinc-800** (one step higher) | edge | floating | `T:toast.css:33` |
| Inset well inside a raised surface | zinc-100 | zinc-700/800 | | | `T:toast.css:208`, `T:alert.css:99` |

So in **light mode** depth comes from *shadow plus white on a zinc-50 canvas*, and every surface is white. In **dark mode** depth comes from *lightness*: canvas 950 → surfaces 900 → toast 800 → wells 700. The edges stay see-through at 12%, so they work on any layer. The backdrop *lightens* the page in light mode instead of darkening it.

### 3.5 Accent and intent ladders (tone recipes)

Each intent maps to a hue: none or info → blue, success → green, warning → amber, danger → red, neutral → zinc. A component copies the hue's steps into local tone slots (`--canon-theme-tone-200…700` on Button, `--_t300…_t700` on Tag, `--_tone`, `--_bar` and `--_solid` on Alert and Banner). All styling then refers to those slots, so **recoloring an intent means swapping six steps.**

**Button tone matrix** (`T:base.css:566-627`). This is the canonical emphasis × state recipe.

| Emphasis | fg | bg (rest) | hover | active / pressed / current | border | shadow |
|---|---|---|---|---|---|---|
| **high** | white | tone-600 | tone-**500** (lighter) | tone-**700** (darker) | transparent | — |
| **medium** (default) | tone-700 / tone-300 | tint-2 | tint-3 | tint-4 | transparent | — |
| **low** | tone-700 / tone-300 | transparent | tint-1 | tint-2 | `border-low` = tone-200 / (tone-300 at 35%) | `shadow-control`, removed on `:active` |
| **minimal** | tone-700 / tone-300 | transparent | tint-1 | tint-2 | transparent | — |

The tint ladder is see-through, so it reads the same on any surface:

| Tint | Light = tone-**400** at | Dark = tone-**500** at |
|---|---|---|
| tint-1 | 8% | 10% |
| tint-2 | 15% | 20% |
| tint-3 | 20% | 25% |
| tint-4 | 25% | 30% |

`color-mix(in srgb, tone-400 8%, transparent)`, and so on. Hover moves **one rung** up the ladder, active moves two, and a pressed toggle holds the active rung.

**Neutral intent** is an exception (`T:base.css:539-564`):
- Label: zinc-900 / zinc-100.
- Icons: zinc-500 / zinc-400, switching to the label color when pressed, expanded or `:active`.
- The low border is the input line, zinc-200 / zinc-700.
- High emphasis inverts: zinc-900 bg with a white label in light mode, white bg with a zinc-900 label in dark. Hover and active go *toward the background*: light 800, then 700; dark 200, then 300.

**Disabled** is grey whatever the intent (`T:base.css:664-680`):

| | fg | bg | border |
|---|---|---|---|
| high / medium | zinc-400 / zinc-500 | zinc-50 / zinc-800 | transparent |
| low | zinc-400 / zinc-600 | transparent | zinc-200 / zinc-800; no shadow |
| minimal | zinc-400 / zinc-600 | transparent | — |

`aria-busy` buttons keep their colors even though they're `aria-disabled`.

**Field state recipe** (`T:text-input.css:42-110`): each state swaps four variables.

| State | border | hover border | focus border | focus halo (3px, no gap) |
|---|---|---|---|---|
| default | zinc-200 / zinc-700 | zinc-400 / zinc-500 | **blue-600 / blue-400** | **blue-100 / blue-900** |
| success | green-400 / green-500 | green-600 / green-400 | = hover | green-100 / green-900 |
| warning | amber-400 / amber-500 | amber-600 / amber-400 | = hover | amber-100 / amber-900 |
| error (`aria-invalid`, `:user-invalid`) | red-400 / red-500 | red-600 / red-400 | = hover | red-100 / red-900 |
| disabled | `--_border-disabled` (zinc-200/700; red-300/800 and so on for intents) | — | — | bg zinc-50 / zinc-800, text zinc-400 / zinc-500, muted zinc-300 / zinc-600, no shadow |
| read-only | `border-style: dashed` | | | |

Generalized: **rest border = hue-400 (dark 500), hover and focus = hue-600 (dark 400), halo = hue-100 (dark 900).** For neutral, rest is zinc-200 and focus is the accent.

**Intent surfaces** (Alert, Banner, Tag, Status; details in §4):
- **Alert** (resting): white / zinc-900 surface with an `edge`, plus an intent **bar** (hue-500 / 400) and an icon colored `--_tone` (hue-600 / 400). It is *not* filled with tint. `high` emphasis is a solid hue-600 fill with white text.
- **Banner**: tinted fill hue-50 / `color-mix(hue-950 70%, zinc-950)`, line hue-200 / hue-900, tone hue-600 / hue-400. High emphasis is solid hue-600.
- **Status dot**: hue-500 / hue-400.

### 3.6 Selection, current and checked

- A **current page** button and pressed toggles hold the *active* rung of the Button recipe. The Nav List current item is a neutral zinc-100 / zinc-700 fill with weight 500, not an accent tint (`T:nav-list.css:66-72`). Tabs mark selection with a raised white / zinc-700 card (see Nav List and Tabs in §4).
- **Checked, on and selected** controls (checkbox, radio, switch, slider fill, calendar selected day, day strip) are **neutral ink, not accent**: a zinc-900 fill with a white mark in light mode, a white fill with a zinc-900 mark in dark mode. Blue appears only for focus and the swatch hover halo. See §4 C.
- **Focus** is always blue, even on danger buttons. Discrete controls (checkbox, radio, switch, slider) hard-code **blue-300** in dark mode instead of the `focus` token's blue-400 (§4 C).

### 3.7 Reproducing with arbitrary brand colors

1. Generate an 11-step ladder (50–950) for the brand color, with lightness spaced like Tailwind's. Bind it to the accent slots: `blue-*` in Canon terms, i.e. our `primary-50…950`.
2. Keep or brand-tint a neutral ladder for `zinc-*`. Generate the success, warning and danger ladders the same way.
3. Derive every role by **step, not by hex**, using the tables in §3.3–3.5. For example: hover = one step lighter (high), active = one step darker; tints = 400 (light) or 500 (dark) at 8/15/20/25% (light) or 10/20/25/30% (dark); field halo = step 100 (light) or 900 (dark).
4. Lines and shadows stay black or white at fixed alphas. They are hue-independent.
5. Focus = accent-600 (light) / accent-400 (dark), with a 2px offset in white or zinc-900 and a 1px ring.

---
## 4. Component catalogue

Measurements per component. The sub-sections are grouped by family. Each one cites `src/css/theme/<m>.css:LINE`.

## A. Actions & Display components

Conventions: `L/D` = light / dark value of `light-dark()`. `H` = `--canon-control-block-size` (32/40/48). `tone-N` = the intent's hue ramp (default blue; success green; warning amber; danger red; neutral zinc). `tint-1..4` = Button tint ladder (below). `ring` = `0 0 0 2px ring-offset, 0 0 0 3px focus` (ring-offset = white L / zinc-900 D). Transitions without an easing use CSS default `ease`. All paths relative to `src/css/`.

Source check: the live `https://recepkutuk.github.io/canon/css/canon/canon.css` is byte-identical (471,818 B) to the repo's `css/canon/canon.css`, and spot-checked values from `src/` appear in it. The live reference pages (segmented-control, toggle-chip, tag) agree with the CSS: segmented 32/40/48, chips 24/32/40.

---

### Button
Anatomy: `.canon-button` > [`.canon-icon`] `.canon-button-label` [`.canon-icon`] [`.canon-kbd`]; attrs `data-emphasis` (high | medium=default | low | minimal), `data-intent` (none=blue, success, warning, danger, neutral), `data-display="icon"`, `aria-pressed`, `aria-current="page"`, `aria-haspopup`/`aria-expanded`, `aria-busy`, `a[target=_blank]`.

**Sizes** (theme/base.css:470-500; core/base.css:322-346; theme/base.css:584-603)

| | sm (xs) | md (default) | lg (xl, 2xl) |
|---|---|---|---|
| min-height (`H`) | 32 | 40 | 48 |
| border | 1px always present (transparent when unused) | same | same |
| padding-block `max(0,(H-1lh)/2-1px)` | 7 | 9 | 11 |
| padding-inline `control-padding-inline - 1px` | 7 | 9 | 11 |
| gap (`--canon-theme-button-gap`, overrides core control-gap) | 2 | 2 | 0 |
| label padding-inline (`button-label-inset`) | 4 (0.25rem) | 6 (0.375rem) | 8 (0.5rem) |
| → text start from outer edge (1+pad+inset) | 12 | 16 | 20 |
| → icon start from outer edge | 8 | 10 | 12 |
| → icon-to-text distance (gap+inset) | 6 | 8 | 8 |
| font-size (control) | 12 | 14 | 16 |
| line-height | 16 (1rem) | 20 (1.25rem) | 24 (1.5rem) |
| letter-spacing | -0.007em | -0.006em | -0.004em |
| radius | 4 (0.25rem) | 8 (0.5rem) | 12 (0.75rem) |
| icon | 16 | 20 | 24 |
| kbd inside: padding block/inline | 0 / 4 | 2 / 6 | 4 / 8 |
| kbd inside: radius | 2 | 4 | 6 |

- Typography: weight 500, `text-align:start` on label, `align-items:flex-start` (multi-line labels keep top alignment) (theme/base.css:586,594,602).
- Icon-only (`data-display="icon"` on the button or an ancestor): `min-inline-size:H`, `padding-inline:0`, centered → square 32/40/48 (theme/base.css:654-658). The menu chevron is hidden on icon-only buttons (:712).

**Tint ladder** (theme/base.css:568-571)
- tint-1: L `color-mix(tone-400 8%, transparent)` / D `tone-500 10%`
- tint-2: L tone-400 15% / D tone-500 20%
- tint-3: L tone-400 20% / D tone-500 25%
- tint-4: L tone-400 25% / D tone-500 30%

**Emphasis** (bg / hover / active / fg / border) (theme/base.css:576-627)

| emphasis | bg | hover | active | fg | border | shadow |
|---|---|---|---|---|---|---|
| medium (default) | tint-2 | tint-3 | tint-4 | L tone-700 / D tone-300 | transparent | none |
| high | tone-600 | tone-500 | tone-700 | white | transparent | none |
| low | transparent | tint-1 | tint-2 | L tone-700 / D tone-300 | `border-low`: L tone-200 / D `tone-300 35%` | `shadow-control` (0 1px 2px black 5% L / 30% D), removed while `:active` and not focus-visible (:619) |
| minimal | transparent | tint-1 | tint-2 | L tone-700 / D tone-300 | transparent | none |

- Hue is the same in light and dark; only the ladder and fg flip.
- **Neutral intent** (theme/base.css:539-564): tones = zinc; low border L zinc-200 / D zinc-700 (the inputs' line). fg for every emphasis except high: L zinc-900 / D zinc-100. Icons L zinc-500 / D zinc-400, switching to the label color when pressed, expanded, or `:active`. Neutral high: bg L zinc-900 / D white; hover L zinc-800 / D zinc-200; active L zinc-700 / D zinc-300; fg L white / D zinc-900.

**States**
- hover (only under `@media (hover:hover)`): bg → bg-hover (:633-637).
- focus-visible: bg → bg-hover, plus `outline:2px solid transparent; outline-offset:2px` (shows in forced-colors) and `box-shadow: ring`. The ring is always `--canon-theme-focus` (blue), whatever the intent (:572,630,647-651).
- active: bg → bg-active; `scale:0.98` on buttons with words only. Icon-only buttons and members of a group or split button don't scale (:638-646).
- pressed `aria-pressed=true` / `aria-current=page`: held at bg-active (:683-685).
- disabled (`:disabled` or `aria-disabled=true` that isn't busy): fg L zinc-400 / D zinc-500, bg L zinc-50 / D zinc-800, border transparent. Low: fg L zinc-400 / D zinc-600, bg transparent, border L zinc-200 / D zinc-800, no shadow. Minimal: fg L zinc-400 / D zinc-600, bg transparent. Cursor not-allowed. Disabled is grey whatever the intent (:666-680; core/base.css:348).
- loading `aria-busy=true`: keeps its colors. A `::before` spinner (icon-size; loader arc over a 20% track ring, currentColor) replaces the first `.canon-icon`. `canon-spin` 0.8s linear infinite, 2.4s under reduced motion (:726-746).
- menu (`aria-haspopup`): chevron `::after` at icon size, currentColor; rotates 180deg when expanded, `rotate 0.15s` (:691-709).
- `a[target=_blank]`: external icon `::after` at `scale:0.8` (:716-722).
- copied (`data-state=copied`): copy icon swaps to a check that pops in 0.2s ease-out from opacity 0 / scale 0.5 (:760-766).
- Kbd in a high button (not disabled): `color-scheme:dark`, so it uses the dark kbd recipe (theme/kbd.css:62).

**Motion**: `background-color .12s, border-color .12s, color .12s, scale .1s ease-out` (:597). Reduced motion: no transitions, no scale (:747-753).

---

### Button Group
Anatomy: `.canon-button-group[role=group]` > `.canon-button`×n (often with `aria-pressed`).
- Frame: inline-flex stretch; radius = button radius 4/8/12; `box-shadow: shadow-control` on the group (theme/button-group.css:17-21).
- Each button: height `H`; padding-inline = full control padding 8/10/12 (not −1px); `border-inline-width:0`, `border-radius:0`. Only the first and last buttons get a 1px inline border and the outer corners (:22-37,53-62).
- Line: `--_line` L zinc-200 / D zinc-600, used for the top/bottom borders and dividers. The divider is `inset hairline 0 0 line` box-shadow on every button after the first, so it takes no space (RTL negated) (:24,64-69).
- Colors (every emphasis renders the same here): fg L zinc-900 / D white; icon L zinc-500 / D zinc-300; bg transparent; hover L zinc-50 / D zinc-800; active L zinc-100 / D zinc-700 (:27-30).
- With an intent: fg L tone-700 / D tone-300, icon = fg, hover tint-1, active tint-2 (:40-45).
- Pressed (`aria-pressed=true`): bg L zinc-100 / D zinc-700, hover = same, active L zinc-200 / D zinc-600, inner shadow `inset 0 1px 2px` L black 8% / D black 40%, icon = fg. Intent + pressed: bg tint-1, active tint-2 (:71-80).
- Icon-only: square `H` (:82-85).
- Focus: `z-index:1` plus the ring (:87-90).
- Disabled: fg L zinc-400 / D zinc-500, icon L zinc-300 / D zinc-500, bg transparent, border stays the line. Pressed + disabled: bg L zinc-50 / D zinc-800, no inner shadow (:91-101).
- No scale on active, no shadow removal.
- Motion: `bg, border-color, color, box-shadow .12s` (:36).
- Forced colors: dividers become 1px borders; pressed uses Highlight (:102-116).

---

### Split Button
Anatomy: `.canon-split-button` > `.canon-button` (action) + `.canon-button[data-display=icon][aria-haspopup]` (arrow); menu `.canon-menu[data-split-button]`.
- Both halves are Buttons and keep emphasis, intent and states from Button. Joined edges: the first has `padding-inline-end:` control padding (8/10/12), `border-inline-end-width:0`, and square end corners. The last has `border-inline-start-width:0` and square start corners (theme/split-button.css:55-64).
- Arrow: icon-only square (`H`) and still shows the chevron (overrides the icon-only hide); held at bg-active while `aria-expanded` (:82-87).
- Divider: `inset hairline 0 0 --_divider` on the last half (RTL negated) (:65-69):
  - medium: tint-2
  - high: `white 15%`
  - low: border-low (L tone-200 / D tone-300 35%), plus shadow-control under the arrow half unless active or disabled
  - disabled: L zinc-200 / D zinc-800
- Minimal: no divider at rest; hover tint-2, active tint-3. Hovering, focusing or opening either half shows the divider in border-low and gives the other, idle half tint-1 (:34-54).
- Focus: `z-index:1` plus the ring (:77-80).
- Menu: `position-area: self-block-end span-self-inline-start` (core/split-button.css:21), `margin-inline:0`. The comment says the menu opens 4px under the button.
- No `scale` when pressed (theme/base.css:644).

---

### Link
Anatomy: `a.canon-link` | `button.canon-link`, optional `.canon-icon` children; attrs `data-standalone`, `data-emphasis="low"`, `target=_blank`.
- Inline, inherits font. Icons are 1em. With an icon it becomes inline-flex baseline with gap `--canon-link-gap` 0.25em; icon `align-self:center` (core/link.css:12-36).
- Color: L blue-600 / D blue-400; hover and focus L blue-700 / D blue-300 (theme/link.css:17-18,27-35).
- Underline: 1px thick, offset 0.2em, color `currentColor 40%` at rest → 100% on hover/focus (:20-23).
- `data-standalone`: no underline until hover or focus (:37). `data-emphasis=low`: inherits the text color and always keeps its underline (:40-44).
- Focus: `outline:1px solid focus; outline-offset:2px; border-radius:2px`. This is an outline, not Button's box-shadow ring (:24,45-48).
- Disabled: L zinc-400 / D zinc-600, cursor not-allowed (:49-51).
- New tab: external icon 0.875em square, `margin-inline-start:0.2em`, `vertical-align:-0.0625em`, mirrored in RTL (:52-64).
- No visited color. Motion: `color .12s, text-decoration-color .12s` (:25).

---

### Segmented Control
Anatomy: `.canon-segmented[role=radiogroup]` > `label.canon-segmented-option` > `input[type=radio]` (invisible, covers the option) + [`.canon-icon`] + `.canon-segmented-label`; `data-fill` for full width.

| | sm | md | lg |
|---|---|---|---|
| track height (`H`) | 32 | 40 | 48 |
| track padding / border | 2 / 1 transparent | same | same |
| track radius (button+2) | 6 | 10 | 14 |
| option height (H−6) | 26 | 34 | 42 |
| option gap (between) | 2 | 2 | 2 |
| option radius (button−1) | 3 | 7 | 11 |
| option padding-inline (control−3) + 1px border | 5 | 7 | 9 |
| icon↔label gap (button-gap) | 2 | 2 | 0 |
| label inset | 4 | 6 | 8 |
| font / lh / tracking | 12/16/-0.007em | 14/20/-0.006em | 16/24/-0.004em |

(theme/segmented.css:18-48)
- Track bg: L zinc-100 / D zinc-800 (:27).
- Option fg: L zinc-600 / D zinc-400; weight 500 (:30,41).
- Hover (not checked): fg L zinc-900 / D white. No bg change (:55-59).
- Active (not checked): bg L `zinc-200 60%` / D `zinc-700 60%` (:60-62).
- Checked: card bg L white / D zinc-700; fg L zinc-950 / D white. Shadow = ring `0 0 0 1px` L black 6% / D white 6%, plus `0 1px 2px` (L black 8% / D 40%), plus `0 1px 3px` (L 5% / D 20%) (:20-22,63-67).
- Disabled: fg L zinc-400 / D zinc-600. Checked + disabled: fg L zinc-400 / D zinc-500, faint ring only, no drop shadow (:68-74).
- Focus (radio focus-visible): z-index 1, transparent outline, ring (:75-80).
- Icon-only: option width = H−6 (square) (:50-54).
- Overflow: options shrink and the label ellipsizes. `data-fill`: options `flex:1 1 0` (core/segmented.css:21-63).
- Motion: `bg, border-color, color, box-shadow .12s`. There is no sliding indicator; the checked state crossfades (:44).

---

### Toggle Chip
Anatomy: `.canon-toggle-chips` (group, wraps) > `label.canon-toggle-chip` > `input[checkbox|radio]` (invisible cover) + [`.canon-icon`] + `.canon-toggle-chip-label`.

| | sm | md | lg |
|---|---|---|---|
| height (H−8) | 24 | 32 | 40 |
| padding-inline (control−1) + 1px border | 7 | 9 | 11 |
| no-icon chip padding off (adds `(icon+gap)/2`) | 16 | 20 | 23 |
| gap (button-gap) | 2 | 2 | 0 |
| label inset | 4 | 6 | 8 |
| font / lh / tracking | 12/16/-0.007em | 14/20/-0.006em | 16/24/-0.004em |
| chips gap | 6 | 8 | 10 |
| radius | 999px | | |

(theme/toggle-chip.css:20-52,96-120)
- Rest: fg L zinc-700 / D zinc-200; icon L zinc-500 / D zinc-400; bg transparent; 1px border L zinc-200 / D zinc-700; weight 500 (:33-36).
- Hover: bg L zinc-50 / D zinc-800; border L zinc-300 / D zinc-600 (:56-61).
- Active: bg L zinc-100 / D zinc-700 (:62-64).
- Checked (neutral-high button look): bg = border = L zinc-900 / D white; fg = icon = L white / D zinc-900. Checked hover L zinc-800 / D zinc-200; checked active L zinc-700 / D zinc-300. A check `::before` at icon size replaces the icon (:66-92).
- No-icon chip: reserves the check's room as padding. On check the padding animates down and the check grows (inline-size 0 → icon, margin-end → gap, opacity 0 → 1), so the width never changes. `padding-inline .15s ease-out`; check `inline-size/margin/opacity .15s ease-out` (:96-120).
- Focus: transparent outline plus the ring (:121-125).
- Disabled: fg = icon L zinc-400 / D zinc-600; border L zinc-100 / D zinc-800. Checked + disabled: bg L zinc-100 / D zinc-800 (:126-133).
- Motion: `bg, border-color, color .12s` (:48).

---

### Kbd
Anatomy: `kbd.canon-kbd`. Always LTR, nowrap. As a child of button/tooltip/tag it is `flex:none; align-self:center` (core/kbd.css).

| | sm (default at :root) | md | lg |
|---|---|---|---|
| padding block / inline | 0 / 4 | 2 / 6 | 4 / 8 |
| total height (lh 16 + pad) | 16 | 20 | 24 |
| radius | 2 | 4 | 6 |

(theme/kbd.css:9-24)
- Text is always 10px (0.625rem), weight 600, lh 16, tracking 0.01em, uppercase, font-style normal (:44-49).
- Colors come from the surrounding text: fg = L `currentColor 55%` / D `80%` (of the parent's color); bg = L `currentColor 8%` / D `29%` (of the kbd's own fg). On the plain page this is about zinc-100 bg / zinc-500 text (D zinc-700 / zinc-300) (:34-42).
- Bottom edge: `inset 0 -hairline 0 currentColor 25%` (:43).
- Inside a Button it defaults to md and follows the button scale (see Button). Inside a high button it uses `color-scheme:dark` (:55-64). Inside a tooltip: flex, gap 8 (:67-71).

---

### Count
Anatomy: `.canon-count` (span). Tabular nums, nowrap, centered (core/count.css).
- `min-inline-size:16`, `padding-inline:4`, radius 999px, lh 16 → a 16px pill, at least a circle (theme/count.css:4-15).
- bg **rose-600** (fixed, not intent- or dark-switched), fg white; font 10px / 600 / tracking 0.01em.
- `data-updated`: `canon-count-pop` 0.25s ease-out, `scale:1.2` at 40%. None under reduced motion (:18-25).
- On an avatar: absolute, top = `avatar-count-at`, inline-start = `avatar-badge-at`, cut out of the avatar with a 10px-radius pill hole (theme/avatar.css:161-167,247-250).

---

### Tag
Anatomy: `.canon-tag` > [`.canon-avatar`|`.canon-icon`|`.canon-tag-dot`] `.canon-tag-label` [`.canon-icon`] [`.canon-kbd`] [`button.canon-tag-remove`]; attrs `data-emphasis` (high/medium/low), `data-intent` (status: info/success/warning/danger), `data-seed` / `data-seed-slot`.

**Sizes** (theme/tag.css:11-51,129-189). sm is the default at :root. In a Combobox without a size, tags are md.

| | sm | md | lg |
|---|---|---|---|
| height (lh + 2×padding) | 24 | 32 | 40 |
| padding all sides (tag-padding − 1) + 1px border | 3 | 5 | 7 |
| gap | 2 | 4 | 6 |
| radius (category) | 2 | 4 | 8 |
| label inset (category) → text from edge | 2 → 6 | 4 → 10 | 6 → 14 |
| status label inset → text from edge | 4 → 8 | 6 → 12 | 8 → 16 |
| font / lh / tracking (category) | 12/16/-0.007em | 14/20/-0.006em | 16/24/-0.004em |
| status font | 10 | 11 | 12 |
| icon & avatar size (= lh) | 16 | 20 | 24 |
| dot | 6 | 8 | 10 |
| dot margin-start = inset + offset (3/2/1) | inset+3 | inset+2 | inset+1 |

- Category: weight 500.
- Status (`data-intent`): radius 999px, weight 600, tracking 0.03em, uppercase, status font size (:169-176).
- The label after a dot gets an extra `padding-inline-start:2px` (:187).
- Avatar in a tag: size = lh, font = lh × 0.4, lh 1 (:192-197).

**Colors**
- Neutral (no seed or intent): derived from currentColor (:69-80):
  - solid: L `cc 70%` / D `cc 43%`; content `--_solid-text` L zinc-100 / D white
  - tint: L `cc 4.8%` / D `22.4%`; fg L `cc 94%` / D `cc`
  - line: L `cc 18.6%` / D `30.3%`
  - On the page this is about medium zinc-100 bg + zinc-900 text (D zinc-700 / white), low zinc-300 border (D zinc-600), high zinc-600 (D zinc-500).
- Hued (intent or seed) (:82-89):
  - solid tone-600 + white
  - tint L tone-400 15% / D tone-500 20%, fg L tone-700 / D tone-300 (the medium button recipe)
  - line L tone-700 / D `tone-300 50%`
- Emphasis: medium (default) bg tint + on-tint fg, border transparent. High: bg solid, fg on-solid, children solid-text. Low: bg transparent, border line (:129-156).
- The intent maps to tones blue/green/amber/red (:121-124).

**Seed** (theme/seed.css): 17 hues in slot order 0 blue, 1 sky, 2 cyan, 3 teal, 4 emerald, 5 green, 6 lime, 7 yellow, 8 amber, 9 orange, 10 red, 11 rose, 12 pink, 13 fuchsia, 14 purple, 15 violet, 16 indigo. Slot = `data-seed mod 17` (pure-CSS `attr()`/`if()` path, else canon.js `data-seed-slot`). A non-integer seed (slot −1) stays neutral. Intent wins over seed. `@property --canon-theme-seed-slot` is not inherited.

**Remove button** (:204-257)
- Icon-size Lucide x. Color L `cc 65%` / D `cc 50%`; full on hover/focus. On high: `solid-text 75%` → 100%.
- Focus: `outline:2px solid` L blue-600 / D blue-400, `offset:-2px`, radius = tag radius. Motion: `color .12s`.
- On hued tags it is its own segment: padding = tag-padding (4/6/8), negative margins to the tag edge, end corners inherited, bg L zinc-100 / D zinc-700, fg L zinc-500 / D zinc-400, hover/focus L zinc-900 / D white.

---

### Status Indicator
Anatomy: `span.canon-status[data-intent][data-pulse]` > `.canon-status-label`; dot = `::before`.

| | sm | md | lg |
|---|---|---|---|
| dot | 6 | 8 | 10 |
| gap | 6 | 6 | 8 |
| font / lh / tracking | 12/16/-0.007em | 14/20/-0.006em | 16/24/-0.004em |
| hollow ring width `max(1.5px, dot×.25)` | 1.5 | 2 | 2.5 |

(theme/status.css:16-43)
- Label: L zinc-700 / D zinc-300.
- No intent: hollow ring L zinc-400 / D zinc-500.
- Intents fill the dot: info L blue-500 / D blue-400; success green-600/400; warning amber-500/400; danger red-600/400 (:44-51).
- `data-pulse`: 1.6s ease-out infinite; box-shadow spreads from 0 at `dot 55%` to `dot×0.9` transparent. The no-intent pulse keeps the inset ring. None under reduced motion (:53-69).
- Ellipsis on overflow.

---

### Avatar
Anatomy: `.canon-avatar` (span/a/button; `data-kind` person|team|bot; `data-seed`) > `img.canon-avatar-image` + `.canon-avatar-fallback` (initials or empty → icon), optional `.canon-avatar-status[data-status]`, `.canon-avatar-badge[data-intent]` > `.canon-icon`, `.canon-count`.

Avatar keeps all 6 data-size steps (it does not collapse to sm/md/lg). md is the default at :root (theme/avatar.css:10-82):

| | xs | sm | md | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| size | 24 | 32 | 40 | 48 | 56 | 64 |
| font / lh | 10/12 | 12/16 | 14/20 | 16/24 | 16/24 | 24/32 |
| tracking | -0.0025em | -0.007em | -0.006em | -0.004em | -0.004em | 0 |
| status dot | 4 | 6 | 8 | 8 | 10 | 12 |
| status-at (top/start offset) | 19 | 25 | 30 | 37 | 42 | 48 |
| badge-at | 14 | 20 | 28 | 36 | 42 | 48 |
| count-at (top) | −6 | −4 | −4 | −4 | −2 | 0 |
| ring (group cut) | 2 | 3 | 4 | 4 | 5 | 6 |
| overlap (compact) | 2 | 4 | 6 | 8 | 10 | 12 |

- Shape: circle (mask radial-gradient, edge feathered 0.5px). Team and bot are rounded squares with radius = size × 0.2 (4.8 … 12.8) (:119-151).
- Fallback: bg L zinc-100 / D zinc-700, fg L zinc-500 / D zinc-300, weight 400, uppercase. Seeded: bg L tone-400 15% / D tone-500 20%, fg L tone-700 / D tone-300 (theme/seed.css:60-65). An empty fallback shows a user-round icon at 50% of the size (team: users-round, bot: bot) (:187-206).
- Rim: `::after` `inset 0 0 0 hairline` at fg 20% on initials; on a loaded photo L black 15% / D white 15% (:273-286).
- Status dot: online L green-600 / D green-400; away amber-500/400; busy red-600/400; offline hollow `inset max(1px, status×.25)` L zinc-400 / D zinc-500. The avatar is cut out around it with radius `status/2 + 2px` (2px gap) (:153-156,209-222).
- Badge: 16px circle, icon 14px. bg L `tone-400 20%` / D `tone-500 20%`, fg L tone-700 / D tone-300. Green by default; intent info/warning/danger. Cut-out radius 10px (2px ring) (:224-244).
- Focus (a/button): ring with transparent outline (:253-257).
- Photo loading: opacity 0 → 1, `opacity .2s ease-out`, kept under reduced motion (:262-267).
- Cursor default unless link or button.

---

### Avatar Group
Anatomy: `.canon-avatar-group[data-spotlight][data-density]` > `.canon-avatar`×n.
- Gap per avatar: `max(d,0)·2·ring + min(d,0)·overlap`, where d = `--canon-density` (theme/avatar-group.css:13-23):
  - compact (−1, default for plain avatars): −overlap, so −2/−4/−6/−8/−10/−12
  - comfortable (0): touching
  - spacious (+1, default when the avatars are links or buttons): 2×ring, so 4/6/8/8/10/12
- Overlap is a real gap: each avatar after the first is masked with a circle of the previous avatar's radius + ring, so it works on any surface. Earlier avatars sit on top (`z-index: 1000 − sibling-index()`). The previous avatar's status/badge/count holes are cut too (:25-66).
- Spotlight: the hovered or focused avatar gets `scale:1.1`, z 1001, and is no longer cut; its neighbours are re-cut around it. Others drop to `opacity:.4`. `opacity .15s ease-out, scale .15s ease-out`; under reduced motion lift = 1 and only the fade remains (:73-115).

---

### Card & Section
Anatomy: `.canon-card` > `.canon-card-header` (> `.canon-card-title` [> `a.canon-card-link`], `.canon-card-description`, `.canon-card-actions`), `.canon-card-body`, `.canon-section`*, `.canon-table`, `.canon-card-footer` (items `[data-align=end]`). Section: `.canon-section` > `.canon-section-header` (> `-title`, `-description`, `-actions`) + content.

| | sm | md | lg |
|---|---|---|---|
| padding (`shell-inset + 8`) | 16 | 20 | 24 |
| radius (= table radius) | 8 | 12 | 16 |
| header→body gap / body gap / section-header margin-bottom (`shell-inset + 4`) | 12 | 16 | 20 |
| title font / lh | 14/20 | 16/24 | 18/28 |
| body text (control font / input lh / tracking) | 12/16/-0.007em | 14/20/-0.006em | 16/24/-0.004em |
| header-actions button margin-block `(titleLine − H)/2` | −6 | −8 | −10 |

(theme/card.css:16-121; shell-inset 8/12/16 from theme/app-shell.css:22-33; table-radius from theme/table.css:20-29)
- Card surface: bg L white / D zinc-900; fg L zinc-900 / D white; `border:1px transparent` (forced colors). Shadow: `0 0 0 hairline edge` + `shadow-raised` (:30-40).
- Header: grid `title | actions` / `description`, column-gap 16. Header padding-bottom is 0 when followed by a body (:53-58,87-90).
- Title: weight 600, tracking −0.01em. Description: margin-top 4, L zinc-500 / D zinc-400, control type (:94-108).
- Actions: gap 8. Below a 320px (20rem) container they wrap under the title, start-aligned, margin-top 8 (:109-121; core/card.css:48-55).
- Dividers: section+section, header+section and footer get `border-top: hairline solid rule` (:59-63). Footer: flex wrap, gap 8, `margin-top:auto`.
- Edge-to-edge Table: frame removed, rule on top if not first, first/last cell padding = card padding (:71-85).
- Link card: on hover the edge goes to L black 22% / D white 22%. Focus on `.canon-card-link` puts the ring on the card. `transition: box-shadow .12s` (:123-138).
- Section: no frame of its own, only the header spacing and type.

---

### Separator
Anatomy: `hr.canon-separator` (`aria-orientation=vertical` optional) | `div.canon-separator` with text (lines drawn by `::before`/`::after`).

| | sm | md | lg |
|---|---|---|---|
| `separator-space` | 5.5px | 7.5px | 9.5px |
| total row (2×space + 1) | 12 | 16 | 20 |
| text gap to lines (input-inset) | 4 | 6 | 8 |
| text font / lh | 12/16 | 14/20 | 16/24 |

(theme/separator.css:12-52)
- Line: `hairline` thick in `--canon-theme-rule` (black/white 10%). Margin `space + (1px − hairline)/2`, so layout is identical at 0.5px hairlines (:28-38).
- Vertical: same line and margins on the inline axis.
- With text: color zinc-500 in both modes (no dark override), weight 400, input tracking (:39-47).

---

### Stack / Cluster / Grid
Anatomy: `.canon-stack` (column), `.canon-cluster` (wrap row, centered, `[data-align=end]` child pushes right), `.canon-grid` (`data-columns` 2–6, `--canon-grid-min` default 16rem = 256px).

`data-gap` steps per surrounding data-size (theme/stack.css:11-29). The default gap is `md`. `none` = 0. Values are not inherited; each element sets its own (core/stack.css:45-49):

| data-gap | sm | md (default size) | lg |
|---|---|---|---|
| none | 0 | 0 | 0 |
| sm | 4 (0.25rem) | 8 (0.5rem) | 12 (0.75rem) |
| **md (default)** | 12 (0.75rem) | 16 (1rem) | 20 (1.25rem) |
| lg | 16 (1rem) | 24 (1.5rem) | 32 (2rem) |
| xl | 24 (1.5rem) | 32 (2rem) | 40 (2.5rem) |

- Core fallbacks if the theme is absent: sm 8, md 16, lg 24, xl 32 (core/stack.css:13,46-49).
- Grid columns: `repeat(auto-fit, minmax(max(min(gridMin,100%), (100% − (cols−1)·gap)/cols), 1fr))`, so `data-columns` is a maximum (core/stack.css:34).
- No visual styling.

---

### Toolbar
Anatomy: `.canon-toolbar[role=toolbar]` (`aria-orientation=vertical` → column, start-aligned) > Buttons, Button Groups, Selects, `hr.canon-separator[aria-orientation=vertical]`.
- gap 8 (row and column), wraps (theme/toolbar.css:11-13).
- A button with `aria-expanded=true` is held at bg-active (:14-16).
- The comment says lone buttons are "low neutral" Buttons. The CSS does not enforce this; it is authoring guidance (`data-emphasis=low data-intent=neutral`).

---

### Empty State
Anatomy: `.canon-empty-state[data-intent=danger]` > `.canon-empty-state-icon` > `.canon-icon`, `.canon-empty-state-title`, `.canon-empty-state-description`, `.canon-empty-state-actions`.

| | sm | md | lg |
|---|---|---|---|
| hexagon badge | 80 | 96 | 112 |
| icon | 32 | 40 | 48 |
| actions margin-top (form-gap) | 12 | 16 | 20 |
| text font / lh | 12/16 | 14/20 | 16/24 |

(theme/empty-state.css:14-61; form-gap theme/form-layout.css:17-31)
- Column, centered, gap 4. The icon has margin-bottom 12.
- Hexagon: `clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)`. Fill `radial-gradient(circle at 50% 65%, paper (L white / D zinc-900) 0%, L zinc-100 / D zinc-800 70%)`. Icon L zinc-400 / D zinc-500.
- Danger: gradient to L red-50 / D `color-mix(red-500 15%, zinc-900)`; icon L red-500 / D red-400.
- Title: weight 500, L zinc-900 / D white. Description: max-width 512 (32rem), L zinc-500 / D zinc-400. Actions: gap 8, centered, wrap.

---

### Stat
Anatomy: `.canon-stats[data-lines]` > `.canon-stat` > `.canon-stat-label` [> `a.canon-stat-link`], `.canon-stat-value` (empty → "—"; may hold `.canon-skeleton`), `.canon-stat-change[data-direction=up|down|flat][data-intent]`, `.canon-stat-description`, `.canon-stat-chart` > `svg`.

| | sm | md | lg |
|---|---|---|---|
| value font / lh | 24/32 | 30/36 | 36/44 |
| text (label/change/desc) font / lh | 12/16 | 14/20 | 16/24 |
| label→value step | 4 | 4 | 8 |
| change/description step | 4 | 6 | 8 |
| arrow icon | 16 | 16 | 20 |
| chart height | 32 | 40 | 48 |
| chart step | 8 | 12 | 16 |
| stats row gap | 24 | 32 | 40 |

(theme/stat.css:21-57)
- No frame or padding. Radius = button radius (used by the focus outline). Text L zinc-900 / D white, tracking −0.006em (:59-67).
- Label: weight 500, L zinc-500 / D zinc-400. Value: weight 600, tracking −0.02em, tabular nums; empty value L zinc-400 / D zinc-500. A skeleton in the value is 96 × 1em at button radius (:68-88).
- Change: gap 4, weight 500. Color: neutral L zinc-500 / D zinc-400; intent success/danger/warning/info = the `600` L / `400` D. Arrow mask is `1lh` tall, mirrored in RTL (:99-120).
- Chart color L zinc-400 / D zinc-500, or `tone 60%` with an intent (:121-129).
- Link: text color, underline transparent → currentColor on hover, 1px, offset 0.2em, `.12s`. Focus: the stat gets `outline:1px solid focus; offset 4px` (:132-151).
- `data-lines`: hairline rule at `−gap/2` before each stat; row `clip-path: inset(-0.5rem)` (:160-170).
- Grid min column 192px (12rem) (core/stat.css:73).

---

### Skeleton
Anatomy: `.canon-skeleton[aria-hidden][data-shape=block|circle|square][data-motion=sweep]`.

| shape | width | height | radius |
|---|---|---|---|
| line (default) | 100% | 8 | 999px |
| block | 64 (4rem) | H×0.625 = 20/25/30 | button radius 4/8/12 |
| circle | H×0.8 = 25.6/32/38.4 | same | 50% |
| square | icon 16/20/24 | icon | 4 |

(theme/skeleton.css:15-44)
- Base L zinc-100 / D zinc-800. Sweep highlight L zinc-200 / D zinc-700.
- Appears via `canon-fade-in .15s ease-out .3s both`, so it stays invisible for 300ms but keeps its space.
- Sweep: `linear-gradient(90deg, base, sweep 50%, base)` at 200% width, `1.5s ease-in-out .3s infinite`, background-position 100% → −100%. Under reduced motion only the fade remains.
- Loaded content (`[data-loaded] > *`) fades in 0.2s ease-out (:59-62).

---

### Spinner
Anatomy: `progress.canon-spinner` (no value) optionally inside `label.canon-spinner-label`; `data-delay="none"`.

| | none set | sm | md | lg |
|---|---|---|---|---|
| ring | 1em | 16 | 20 | **32** |
| words font / lh | inherit | 13/20 | 14/20 | 16/24 |

(theme/spinner.css:11-29)
- Color L zinc-500 / D zinc-400 (ring and words). Mask = loader arc (about 300°) over a full ring at 20%, stroke 1.5 at 24px.
- `canon-spin .8s linear infinite`, 2.4s under reduced motion.
- Label gap 0.5em. Core vertical-align −0.125em.
- Show delay: `@starting-style opacity:0` + `transition: opacity 0s .4s`, so it appears after 400ms (core/spinner.css:37-44).

---

### Accordion
Anatomy: `.canon-accordion` > `details.canon-accordion-item[open]` > `summary.canon-accordion-summary` (> [`.canon-icon`] `.canon-accordion-title` `.canon-accordion-description` [`.canon-tag`|`.canon-count`|`.canon-status`]; chevron `::after`) + `.canon-accordion-content`.

| | sm | md | lg |
|---|---|---|---|
| summary padding-block | 8 | 12 | 16 |
| title font / lh | 13/20 | 14/20 | 16/24 |
| description font / lh | 12/16 | 13/20 | 14/20 |
| content padding-bottom | 12 | 16 | 20 |
| leading icon | 16 | 16 | 20 |
| chevron | 16 (fixed) | 16 | 16 |

(theme/accordion.css:16-43)
- Hairline `rule` borders above the first row, between items and below the last. Rows have no box or horizontal padding. Nested accordions drop their outer lines; the last accordion in a card body has no bottom line (:45-63).
- Summary: grid with only the columns that are present, column-gap 12, radius 6. Focus = `outline:2px solid focus; offset:2px`, an outline rather than the box-shadow ring (:64-73).
- Title: weight 500, tracking −0.006em, text color L zinc-900 / D white. Description and icon: L zinc-500 / D zinc-400 (:74-88).
- Chevron: muted → currentColor on hover, rotates 180deg when open. `rotate .2s ease, background-color .12s` (:89-104).
- Content: L zinc-600 / D zinc-300, title size and lh. With icons it is indented `icon + 12` (:105-116).
- Open/close: `::details-content` block-size 0 ↔ auto, `.2s ease` with `interpolate-size: allow-keywords` (:117-127).
- `--_line` (zinc-200/800) is declared but unused.

---

### Code Block
Anatomy: `.canon-code-block` > [`.canon-code-block-header` > `.canon-code-block-title` + `.canon-button`s (copy, wrap `[command=--canon-wrap][aria-pressed]`)] + `pre > code` (`.tok.<type>` spans); or a lone corner `.canon-button`.

| | sm | md | lg |
|---|---|---|---|
| code font | 12 | 13 | 14 |
| padding (code; header inline-start) | 12 | 16 | 20 |
| header min-height | 40 | 40 | 48 |
| outer radius (table) | 8 | 12 | 16 |
| inner pre radius (table − 1) | 7 | 11 | 15 |

(theme/code-block.css:15-80)
- Frame: bg L white / D zinc-900, `border:1px transparent`, shadow `0 0 0 hairline edge` only. Unlike Card there is no raised shadow.
- Header: padding-block 4, padding-inline `pad 4`, hairline rule at the bottom, gap 4. Title: L zinc-500 / D zinc-400, weight 500, lh 20, ellipsis.
- Code: bg L zinc-50 / D `mix(zinc-800 50%, zinc-900)`, fg L zinc-800 / D zinc-200, JetBrains Mono, lh 1.6, no ligatures, tab-size 2, LTR, scrolls up to `--canon-code-block-max-height`.
- Corner button: 8px from top and right (physical right, even in RTL); pre padding-right `pad + H`; button bg = code bg, hover L zinc-100 / D zinc-800, active L zinc-200 / D zinc-700 (core/code-block.css:58-62).
- Focus on the scrolling pre puts the ring on the whole block (:84-89).
- Tokens: punctuation, operator, doctype and comment (italic) L zinc-500 / D zinc-400; tag, selector, function L blue-700 / D blue-400; attr, variable violet-700/400; string emerald-700/400; number amber-700/400; property sky-700/300; keyword, boolean rose-700/400 (:91-98).
- `--_line` (zinc-200/700) is declared but unused.

---

### Cross-component patterns noticed
- **Radius ladder** sm/md/lg 4/8/12 (button radius), reused by Button, Button Group, Skeleton block, Stat focus outline and the skeleton inside a Stat value. Segmented track is +2 (6/10/14) and its options −1 (3/7/11). Surfaces (Card, Code Block, Table) use 8/12/16. Tags 2/4/8; Kbd 2/4/6; Accordion row 6; Link 2. Pills (999px) for chips, counts, status tags and skeleton lines.
- **Height ladder** 32/40/48 (H). Chips and tags are H−8 (24/32/40); segmented options H−6; kbd and count 16/20/24 and 16.
- **"1px border always present"**: Button, Tag, Toggle Chip and Segmented subtract 1px from padding so every emphasis has the same box. Frames (Card, Code Block, Segmented track) use a transparent 1px border so forced colors show an edge.
- **Inner text inset** = control-padding − 1 + label-inset → text 12/16/20 from the button edge (Button, Toggle Chip with icon). Segmented: 10/14/18 from the option edge, 13/17/21 from the track edge. Icon→text = button-gap (2/2/0) + label-inset.
- **Type triplet** 12/14/16 on 16/20/24, tracking −0.007/−0.006/−0.004em (button and input tokens). Labels on interactive elements are weight 500. Small caps-style badges (kbd, count, status tag) are 10–12px, 600 weight, +0.01–0.03em, uppercase.
- **Focus**: box-shadow ring `0 0 0 2px ring-offset, 0 0 0 3px focus` plus `outline:2px transparent` for forced colors (Button, Group, Split, Segmented, Chip, Avatar, Card, Code Block). Text-ish items use an outline instead: Link 1px offset 2; Stat 1px offset 4; Accordion 2px offset 2; Tag-remove 2px offset −2. Grouped items get `z-index:1` on focus.
- **Hover is gated** by `@media (hover:hover)`. Focus-visible usually mirrors the hover look.
- **Tone recipe** (Button medium = Tag tint = Avatar seed = Badge): L tone-400 @15% bg + tone-700 fg / D tone-500 @20% bg + tone-300 fg. Hover and active step up the ladder +5% each (tint-2 → 3 → 4). Solid: tone-600, hover 500, active 700.
- **Neutral chrome**: rest line zinc-200 (D zinc-700/600), hover bg zinc-50 (D zinc-800), active zinc-100 (D zinc-700), labels zinc-900/700 (D white/zinc-100/200), icons zinc-500 (D zinc-400/300). Muted text zinc-500/400. Disabled text zinc-400 (D zinc-500/600). Disabled solid fill zinc-50 (D zinc-800).
- **Selected/chosen** = neutral-high inversion (zinc-900 bg + white; D white + zinc-900) for Toggle Chip and Button neutral-high. Segmented uses a white "card" with a 1px 6% ring plus a soft shadow. Button Group uses zinc-100 plus `inset 0 1px 2px` black 8%/40%.
- **Lines**: hairline (1px, 0.5px at 2dppx) in `rule` 10% for dividers (Card, Accordion, Separator, Code header, Stat lines). The `edge` 12% hairline ring is used as the frame instead of a border (Card, Code Block). Hairline dividers in joined controls are inset box-shadows that take no space.
- **Shadows**: `shadow-control` only under low-emphasis framed controls (low Button, Button Group, low split arrow), removed while pressed. `shadow-raised` plus edge on Card.
- **Motion**: color, bg and border transitions 0.12s (default ease). Small geometry and reveal effects 0.15s ease-out (chip check, avatar spotlight, chevron rotate 0.15–0.2s). Content fades 0.2s ease-out. Spin 0.8s linear (2.4s reduced). Pulse 1.6s. Skeleton sweep 1.5s. Press scale 0.98 (0.1s ease-out). Delayed reveals: skeleton 0.3s, spinner 0.4s. Reduced motion removes movement but keeps fades.
- **Density**: among these components only Avatar Group reads `--canon-density`. Sizes come from data-size alone. Avatar is the only component here with six distinct sizes.
- **Spacing steps** recur as 2/4/6/8/12/16/20/24 (rem quarters). Shell-inset 8/12/16 (+4 → 12/16/20 card gaps, +8 → 16/20/24 card padding) matches the Stack `md` gap 12/16/20 and the form-gap.

## B. Text-entry form family

Notation: `A / B` in a color means `light-dark(A, B)`. Sizes are sm / md / lg (xs→sm, xl/2xl→lg). `H` = `--canon-control-block-size` (32/40/48), `P` = `--canon-control-padding-inline` (8/10/12), `I` = `--canon-icon-size` (16/20/24). The live site's `css/canon/canon.css` was checked against src at text-input, select picker, option, combobox list and field values, and they match exactly.

**Density:** none of these components read `--canon-density`. In the whole theme only avatar-group, table and description-list use it. Field heights depend only on data-size.

### Shared input tokens (theme/text-input.css:12-36)
| token | sm | md | lg |
|---|---|---|---|
| `--canon-theme-input-inset` (text sits this far past P) | 0.25rem (4) | 0.375rem (6) | 0.5rem (8) |
| `--canon-theme-input-gap` (prefix·value·suffix) | 0.125rem (2) | 0.25rem (4) | 0.375rem (6) |
| `--canon-theme-input-icon-gap` (icon↔text block) | 2 | 2 | 0 |
| `--canon-theme-input-radius` | 4 | 8 | 12 |
| `--canon-theme-input-line-height` | 16 | 20 | 24 |
| `--canon-theme-input-tracking` | -0.007em | -0.006em | -0.004em |

Shadows (theme/base.css:297,300): `shadow-control` = `0 1px 2px rgb(0 0 0/.05)` / `rgb(0 0 0/.3)`. `shadow-floating` = `0 8px 24px rgb(0 0 0/.08)/.5, 0 2px 6px rgb(0 0 0/.06)/.3`.

### Text Input (the shared frame)
Anatomy: `.canon-text-input` (also the frame for `.canon-password/.canon-select/.canon-combobox/.canon-textarea/.canon-color/.canon-date/.canon-control`) > [`.canon-icon`] [`.canon-text-input-prefix`] `input` [`.canon-text-input-suffix`] [`.canon-icon`] [`.canon-button` clear/copy/reveal, `command="--canon-clear"`].

**Frame** (theme/text-input.css:42-59):
- border `1px solid --_border`; radius input-radius (4/8/12); bg white / zinc-900; `box-shadow: shadow-control`; text zinc-900 / white, 400 weight, line-height input-lh (16/20/24), input tracking; font-size = control font (12/14/16) (core/text-input.css:19).
- min-block-size H (32/40/48), box-sizing border-box, flex, align-items center (core/text-input.css:10-21).
- Native input is chromeless and fills the box. It has min-inline-size 4rem (64px) and reaches 20rem past both edges, and the box clips the overflow (core/text-input.css:29-44,137-144).

**Sizes:**
| | sm | md | lg |
|---|---|---|---|
| height | 32 | 40 | 48 |
| padding-inline = `P − 1px + inset` (:182) | 11 | 15 | 19 |
| text x from outer edge | 12 | 16 | 20 |
| flex gap = input-gap (:183) | 2 | 4 | 6 |
| icon size | 16 | 20 | 24 |
| edge icon from outer edge (=P) | 8 | 10 | 12 |
| icon↔text = icon-gap + inset | 6 | 8 | 8 |
| icon↔icon = icon-gap | 2 | 2 | 0 |
| font / lh | 12/16 | 14/20 | 16/24 |
| radius | 4 | 8 | 12 |

The icon margins come from `--_edge = −inset − bleed`, `--_toward-text = icon-gap + inset − input-gap − bleed`, and `--_toward-icon = icon-gap − input-gap − bleed` (:185-208).

**In-box buttons** (clear, show password, copy) (:191-193,212-227):
- size = I + 8 (24/28/32), i.e. `--canon-control-block-size: calc(I + 0.5rem)`; `--_bleed: 4px`.
- They sit 4/6/8 from the outer edge, and their edge is 2/4/4 from the text.
- radius `max(2px, input-radius − 4px)` = 2/4/8.
- fg = `--_muted` (zinc-400 / zinc-500). Hover, focus-visible or aria-pressed → zinc-600 / zinc-300.
- bg transparent; hover zinc-100 / zinc-800; active zinc-200 / zinc-700.
- Clear button: `visibility:hidden` while `:placeholder-shown`, so its space is kept (core/text-input.css:195).

**Prefix/suffix segments** (:154-175):
- full height, bleeding to the frame edge (the frame's corners round them).
- padding-inline `P − 1 + inset` (11/15/19).
- bg zinc-50 / zinc-800; text zinc-500 / zinc-400.
- inner divider `1px` zinc-200 / zinc-700.
- Prefix uses `order:-1`, suffix `order:1`.
- Disabled: bg zinc-100 / zinc-700, text zinc-400 / zinc-500.
- They truncate with an ellipsis and use `unicode-bidi: plaintext` (core:216-224).
- An affix that holds a control takes `color: inherit` (:140).

**States.** Only the variables change. Source order is success → warning → error → disabled (:43-97).

| state | `--_border` | hover | focus border | ring `--_ring` | disabled border |
|---|---|---|---|---|---|
| rest | zinc-200 / zinc-700 | zinc-400 / zinc-500 | blue-600 / blue-400 | blue-100 / blue-900 | zinc-200 / zinc-700 |
| success (`data-intent="success"`, `data-state="match"`, or field msg success) :63 | green-400 / green-500 | green-600 / green-400 | = hover | green-100 / green-900 | green-300 / green-800 |
| warning :70 | amber-400 / amber-500 | amber-600 / amber-400 | = hover | amber-100 / amber-900 | amber-300 / amber-800 |
| invalid (`aria-invalid="true"` or `:user-invalid`) :80 | red-400 / red-500 | red-600 / red-400 | = hover | red-100 / red-900 | red-300 / red-800 |

- **Hover** (`@media(hover:hover)`, only when not `:focus-within` and no `select:open`): border-color → `--_border-hover` (:103-107).
- **Focus** (`:has(> input|textarea|select:focus)`, not a trailing button): border → `--_border-focus`; `outline: 2px solid transparent` (for forced colors); `box-shadow: 0 0 0 3px var(--_ring)`. This 3px halo with no offset replaces shadow-control (:110-114).
- **Disabled** (`:has(> :disabled)`) (:90-97):
  - border becomes the softened intent color.
  - bg zinc-50 / zinc-800; `box-shadow:none`; text zinc-400 / zinc-500.
  - `--_muted` zinc-300 / zinc-600.
  - cursor not-allowed.
- **Readonly**: `border-style: dashed`; nothing else changes (:117-119).
- **Placeholder**: `--_muted` zinc-400 / zinc-500, opacity 1 (:121-124). Icons and affix text also use `--_muted` (:130-136).
- **Autofill**: text fill zinc-900 / white, and the bg transition is frozen at 600000s (:125-128).

**Motion:** `transition: border-color .12s, box-shadow .12s`. None with reduced motion (:58,229-233).

### Textarea
Anatomy: `.canon-textarea > textarea` (same frame, states and sizes as Text Input) (theme/text-input.css:249-258).
- `--_inset-block = (H − lh)/2 − 1px` = **7 / 9 / 11**. A one-row textarea is exactly H (32/40/48).
- `--_inset-inline = P − 1 + inset` = 11 / 15 / 19.
- `align-items: flex-start`.
- The textarea takes over the padding (`--canon-textarea-inset-block/-end`), so the scrollbar and resize handle sit at the frame's inner edge (core/text-input.css:148-154).
- `resize: none` (Canon never allows horizontal resize); min-block-size 1lh (core:210-213).

### Field
Anatomy: `.canon-field` grid with areas `"label action" / "control control" / "message counter"`. Children: `.canon-label`, `.canon-field-action`, the control box, `.canon-field-message`, `.canon-field-counter`. With a password: + `strength strength-label` / `rules` rows (core/field.css:10-47).
- Grid: `minmax(0,1fr) auto`, `row-gap:0`. Spacing between slots comes only from margins, because empty rows would otherwise still take the gap (core:17-19).
- `column-gap: 0.5rem (8)`, `align-items:center` (theme/field.css:7-10).
- **label→control: control `margin-block-start: 0.375rem (6px)`**, the same at every size (theme:11-13).
- **control→message/counter: `margin-block-start: 0.5rem (8px)`** (theme:14-16). Password strength and rules are also 8; strength-label margin-inline-start 12 (theme:18-23).
- Empty message or counter → `display:none` (core:80-87).
- `a.canon-field-action`: color `--canon-theme-focus` (blue-600 / blue-400), 0.8125rem (13px) (theme:25-28). A button action uses `margin-block: (1lh − H)/2`, so it doesn't grow the row (theme:29-31).

**Message** (also `.canon-choice-message`, `.canon-fieldset-message`) (theme:74-103):
- flex, align flex-start, gap 0.25rem (4).
- neutral color zinc-500 / zinc-400; type = label-description: **10/12/14px on 12/16/20 lh**, weight 400, tracking -0.0025/-0.007/-0.006em.
- `[data-intent]` adds a `::before` icon 1lh square, masked with currentColor:
  - danger: red-700 / red-300, triangle-alert
  - warning: amber-700 / amber-300, circle-alert
  - success: green-700 / green-300, circle-check

**Counter** (theme:37-69):
- same type as the message; zinc-500 / zinc-400; tabular-nums; align-self start.
- `data-state="near"` (the last 10%): amber-700 / amber-300, weight 500.
- `data-state="over"`: red-700 / red-300, weight 500.

**Over the soft limit** (theme:53-64):
- the input text becomes transparent over a mirror copy.
- excess `<mark>`: radius 2px, bg `color-mix(red-400 15%)` / `color-mix(red-500 20%)`, text red-700 / red-300.
- caret zinc-900 / white.
- `::selection`: `color-mix(blue-400 30%)` / `color-mix(blue-500 40%)`.

**Message motion** (theme:109-129):
- enter: opacity plus translate from `0 -0.25rem` (−4px), 0.15s ease-out.
- `block-size` also animates 0.15s where `interpolate-size` is supported.
- reduced motion: no transition.

**Label beside** (`data-label="start"`) (core/base.css:625-670):
- columns `minmax(0, var(--canon-label-width,33%)) 1fr auto`; column-gap `--canon-label-gap` 1rem (16).
- label `margin-block-start: max(0, (H − 1lh)/2)` (md: 10px), which puts it level with the first line of the box.
- control margin-top 0. Message and counter sit under the control; the action sits under the label.
- On a container it applies only when the container is ≥32rem (512px). Form rows and repeater items keep labels above.

### Label
Anatomy: `.canon-label` (flex wrap) > `.canon-label-text` [> `.canon-label-optional`] [`.canon-label-info` button + `.canon-tooltip`] [`.canon-label-description` (basis 100%)] (core/label.css:14-52).

| | sm | md | lg |
|---|---|---|---|
| font / lh | 12/16 | 14/20 | 16/24 |
| tracking | -0.007em | -0.006em | -0.004em |
| description font / lh | 10/12 | 12/16 | 14/20 |
| description tracking | -0.0025em | -0.007em | -0.006em |
| description gap (margin-top) | 4 | 6 | 8 |
| info icon (= label lh) | 16 | 20 | 24 |
(theme/label.css:11-38,40-46)

- `column-gap: 0.25rem (4)`.
- Text: weight 500, zinc-900 / white (theme:48-51).
- **Required**: added automatically when a sibling or descendant is `:required`. It is `::after "*"` (empty alt text), margin-inline-start 4px, red-700 / red-300, weight 600 (theme:56-61).
- **Optional** (an author's span floated to the inline end): margin-start 4, **zinc-500 in both themes (no dark variant)**, weight 400 (theme:63-67).
- **Info button**: round (50%), zinc-400 / zinc-500. Hover, focus-visible or `aria-expanded` → zinc-600 / zinc-300; `transition: color .12s`. Focus ring = `0 0 0 2px white / zinc-900, 0 0 0 3px var(--canon-theme-focus)` (an offset ring: 2px gap + 1px ring), outline 2px transparent with offset 2 (theme:72-96).
- **Tooltip** inside a label is forced to sm: padding 4/6, radius 4, 12/16px, -0.007em. Edge-aligned placements shift by `lh/2 − 15px`, which keeps the arrow centered on the icon (theme:102-115).
- **Description**: zinc-500 / zinc-400, 400 (theme:117-124).

### Password
Anatomy: `.canon-password` (Text Input frame) > `input` + `.canon-button` (reveal, `order:2`). Then in the field: `meter.canon-password-strength` + `.canon-password-strength-label`, `.canon-password-rules` > `.canon-password-rules-title` + `ul > li.canon-password-rule[data-state=met|error]`.

The box, spacing and states are Text Input's (theme/text-input.css:181-208).

**Caps Lock indicator** (theme/password.css:58-73):
- `::after` icon of size I, zinc-600 / zinc-300, `order:1`.
- margin-start `icon-gap + inset − input-gap` (6/8/8 from the text).

**Strength bar** (theme/password.css:19-35):
- 4px tall, radius 6. Track zinc-200 / zinc-700. It is one size and does not follow data-size.
- fill uses a round end and animates `--canon-theme-strength` over 0.25s.

| value | width | fill | label text |
|---|---|---|---|
| 1 | 25% | red-500 / red-600 | red-600 / red-400 |
| 2 | 50% | yellow-500 / yellow-600 | yellow-700 / yellow-400 |
| 3 | 75% | lime-500 / lime-600 | lime-700 / lime-400 |
| 4 | 100% | green-600 / green-700 | green-700 / green-400 |

**Strength label**: 12/16, 500, -0.006em; default zinc-600 / zinc-400 (theme:39-51).

**Rules** (theme:85-125):
- grid, gap 8; 12/16px.
- title: 500, zinc-900 / white, -0.007em.
- each row: gap 4, a 16px marker. The dot is 87.5% (14px) of the marker; the text is 400 and -0.006em.

| rule state | dot | glyph | text |
|---|---|---|---|
| pending | zinc-300 / zinc-600 | none | zinc-600 / zinc-400 |
| met | green-600 | white check | zinc-900 / white |
| error | red-700 | white "!" | red-700 / red-300 |

**Rules reveal** (`data-reveal`) (theme:130-149):
- opening: block-size 0.3s ease; rows animate opacity and translate over 0.2s, staggered `sibling-index × 50ms`.
- collapse: 0.2s, rows go to opacity 0 and −4px.

### Number Input
Anatomy: `.canon-number` > `button[command=--canon-step-down]` `input[type=number]` `button[command=--canon-step-up]`. Variant: input first, then the two buttons stacked at the end. Plus `.canon-number-ticker` (core/number.css).

**Default (buttons on both sides)** (theme/number.css:18-73):
- Wrapper: radius input-radius, shadow-control, text zinc-900 / white, input lh and tracking; `transition: box-shadow .12s`.
- Input:
  - height H; min-width `2H − 16` = **48 / 64 / 80**; padding-inline `P + inset − 1` = 11/15/19.
  - border 1px `--_border`, radius 0, bg white / zinc-900, text centered, tabular-nums, field-sizing content.
  - `transition: border-color, background-color .12s`.
- Buttons: square, min-width H, padding 0, radius 0. The outer end corners take input-radius. The inner side has no border; the outer border is `--_border`.
  - bg zinc-100 / zinc-700 → hover zinc-200 / zinc-600 → active zinc-300 / zinc-500.
  - icon zinc-500 / white.
  - at the limit or disabled: icon zinc-300 / zinc-500, bg unchanged.

**Stacked-end variant** (`input:first-child ~ .canon-button`) (theme:83-137):
- Frame on the wrapper: height H, border 1px, bg white / zinc-900, `padding: 3px` (start 0), row-gap 1px.
- Input: transparent, padding `11/15/19` start and 8 end, margin-block −3.
- Buttons: width `H/2 + 4` = **20 / 24 / 28**; icon `H/2 − 6` = 10 / 14 / 18. Each button is ≈ (H − 9)/2 tall = 11.5 / 15.5 / 19.5.
  - Inner corners `max(2px, radius − 4px)` = 2/4/8: the up button rounds its top corners, the down button its bottom corners.
  - bg zinc-100 / zinc-800 → hover zinc-200 / zinc-700 → active zinc-300 / zinc-600.
  - icon zinc-500 / zinc-400.
- Readonly: dashed. Disabled: bg zinc-50 / zinc-800.

**States** (theme:140-165):
- invalid: red (same values as Text Input).
- hover: `--_border` → zinc-400 / zinc-500.
- focus: `--_border` → blue-600 / blue-400, plus the 3px ring.
- readonly: input border dashed.
- disabled: wrapper `box-shadow:none`, text zinc-400 / zinc-500, input bg zinc-50 / zinc-800.
- **No success or warning states, and no `--_border-disabled`** (unlike Text Input).

**Motion:** the step roll is 0.2s `cubic-bezier(0.2,0,0,1)`. The old value translates ±100% and fades as the new one comes in. Reduced motion: fade only (theme:171-222).

### Select
Anatomy: `.canon-select` (frame) > [`.canon-icon`] `select` [> `button > selectedcontent`] `option` [`.canon-option-label` `.canon-option-description` / `.canon-icon` / `.canon-avatar`], `optgroup`, `hr.canon-separator`, [`.canon-button[command=--canon-clear]`]. The chevron is the box's `::after`.

**Box** (theme/select.css:11-34): Text Input's frame and states.
- `--_pad = P − 1` (7/9/11); `--_gap = icon-gap + inset` (6/8/8); flex gap `--_gap`.
- The `select` reaches under the whole box: negative margin `--canon-select-start/end`, padded back by the same amounts (core/text-input.css:106-109).

| | sm | md | lg |
|---|---|---|---|
| select-start (text x inside border) | 11 | 15 | 19 |
| select-start with leading icon (`_pad + I + _gap`) | 29 | 37 | 43 |
| select-end (`_pad + I + _gap`) | 29 | 37 | 43 |
| select-end with clear button (`_pad + 2I + 8 + 2·_gap`) (combobox.css:95-97) | 59 | 73 | 83 |
| chevron size / from outer edge | 16 / 8 | 20 / 10 | 24 / 12 |

**Chevron and box states:**
- chevron: `chevron-down` (stroke 1.5) in `--_muted`; `rotate:180deg` while open, `transition: rotate .15s`.
- Open counts as focus: focus border + 3px ring (:36-39). Hover is suppressed while open (text-input.css:104).
- Placeholder = `option[value=""]:checked`: zinc-500 / zinc-400; when disabled, `inherit` (:43-48).
- Clear button: `visibility:hidden` unless the box is hovered or focused (`@media(hover:hover)`); hidden also when nothing is chosen (combobox.css:100-104, core/combobox.css:220).
- Value: one line, clipped. `selectedcontent` hides the option description (core/text-input.css:116-120,181).

**Picker** (`::picker(select)`, `appearance: base-select` only on `pointer: fine`) (theme:55-73):
- `min-inline-size: anchor + 0.5rem` (8px wider than the box); `margin: 4px 0 4px −4px`, so it sits 4px below and the option text lines up with the box text.
- padding `calc(0.25rem − 1px)` = 3px, plus a 1px transparent border (visible in forced colors) = 4px visual.
- radius `input-radius + 4` = **8 / 12 / 16**.
- bg white / zinc-900.
- `box-shadow: 0 0 0 hairline var(--canon-theme-edge), shadow-floating`: a hairline ring instead of a border.
- text zinc-900 / white; control font, input lh, input tracking.
- Position: block-end, spanning inline-end, flipping to block-start when there's no room (core:77-83).

**Option row** (theme:80-129). These rules are shared with `.canon-combobox-option`.

| | sm | md | lg |
|---|---|---|---|
| min-height (= H) | 32 | 40 | 48 |
| padding-inline (`P + inset` / `P`) | 12 / 8 | 16 / 10 | 20 / 12 |
| radius (= input radius) | 4 | 8 | 12 |
| padding-block | 0 | 0 | 0 |

- Rest: transparent, zinc-900 / white, weight 400.
- Hover, focus-visible or `[data-state=active]` (keyboard): bg `--_fill` = zinc-100 / zinc-800.
- Selected (`:checked` / `aria-selected=true`): weight 500, plus a tick (I-sized, currentColor) pushed to the end with `margin-inline-start:auto` and `padding-inline-start: --_gap`.
- Disabled: zinc-400 / zinc-600, no fill on hover.
- Danger (`data-intent="danger"`): text red-700 / red-300; fill `color-mix(red-400 15%, transparent)` / `color-mix(red-500 20%, transparent)`.

**Option extras** (theme:133-161):
- Leading icon or avatar: row padding-start drops to P (8/10/12); the icon has margin-end 6/8/8.
- Avatar = I square, font `0.4·I`.
- `.canon-option-description` sits inline: margin-start 0.5em, `--_muted`; when disabled, `inherit` (theme:155-161).

**Optgroup caption** (theme:167-187):
- 10px / 600 / lh 16px, +0.01em, uppercase, zinc-500 / zinc-400.
- padding-top 8; inset = `P + inset − 5px` (Chrome adds a 5px indent of its own).
- The first option in a group has margin-top 8, so a caption row is effectively 32px.
- Separators are `hr.canon-separator`, with space 5.5 / 7.5 / 9.5px each side (theme/separator.css:12-21).

**Select inside a Text Input** (a country code or currency segment) (theme:212-236):
- no frame, radius, bg or shadow of its own; a 1px zinc-200 / zinc-700 divider on its inner side.
- margins `−(P − 1 + inset)` / `(P − 1 + inset − input-gap)`.
- The outer Text Input shows focus for both (`:focus-within` or open).

**Motion:** picker opens 0.15s ease-out from opacity 0 and scale 0.97, and closes 0.1s ease-in (popups.css:29-45).

### Combobox
Anatomy: `.canon-combobox` (Select's box) > `select` (hidden once `.canon-combobox-popup` exists), `button.canon-combobox-trigger` > `.canon-combobox-value` (or `.canon-combobox-placeholder`) | `input.canon-combobox-input` (`data-search="inline"`), `ul.canon-combobox-tags > li > .canon-tag` (+ `li.canon-combobox-more`, `li.canon-combobox-input-item`), `[popover].canon-combobox-popup` > `.canon-combobox-search > input`, `[role=listbox].canon-combobox-list` > `.canon-combobox-option` / `.canon-combobox-caption` / `hr.canon-separator`, `.canon-combobox-empty`, `.canon-combobox-loading`, `mark.canon-combobox-match`.

**Box:** Select's box. Focus look (border + 3px ring) applies while the trigger or input is focused **or the popup is open**; the chevron rotates 180° while open (theme/combobox.css:28-35). Placeholder zinc-500 / zinc-400, opacity 1 (:36-49).

**Multi (tags)** (theme:13-25,53-77; theme/tag.css:10-45):

| | sm | md | lg |
|---|---|---|---|
| tag height (H − 8) | 24 | 32 | 40 |
| tag gap | 4 | 8 | 12 |
| arrow gap past tags | 4 | 4 | 8 |
| box padding-block / padding-start | 3 / 3 (4 from outer edge) | 3 / 3 | 3 / 3 |
| arrow margin-bottom `(H − 8 − I)/2` | 4 | 6 | 8 |
| tag font / radius | 12/16 / 2 | 14/20 / 4 | 16/24 / 8 |

- Tags take the box's size: md by default inside a combobox (tag.css:25).
- Box `align-items:flex-end`, so the arrow and clear button sit on the last row.
- Inline input after the tags: min-height H − 8, padding-start = tag-label-inset (2/4/6), min-width 4rem (core:189-192).
- `data-tags="collapse"`: a single row with a "+N" overflow item (core:209-212).
- Disabled box: tags switch to neutral zinc colors and the remove buttons are hidden (:81-90).

**Popup** = picker recipe (:137-151):
- min-width anchor + 8, margin 4 0 4 −4, padding 3 + 1px transparent border, radius input+4 (8/12/16).
- bg white / zinc-900; hairline edge + shadow-floating; weight 400.
- max-height `100dvh − 1rem`.

**Search row** (:155-172):
- height H, made from padding-block `(H − lh)/2` on top (8/10/12) and that minus 1 on the bottom (7/9/11), because of the hairline.
- padding-inline P (8/10/12) / P + inset (12/16/20).
- gap `icon-gap + inset` (6/8/8); search icon I in `--_muted`.
- `border-bottom: hairline solid var(--canon-theme-rule)`; placeholder zinc-500 / zinc-400.

**List** (:177-197):
- max-height `8.5·H` = **272 / 340 / 408**; scroll-padding-block 4.
- When options follow the search row directly: padding-top = separator-space (5.5/7.5/9.5px).
- Option rows are Select's. Selected = tick `::after` (same recipe as `::checkmark`).
- Active row = `[data-state=active]` fill (zinc-100 / zinc-800).

**Caption** (:201-210): 10px / 600 / 16px lh, uppercase, +0.01em, zinc-500 / zinc-400; padding-block 8 (32px row); padding-inline `P + inset` / P.

**Empty / Loading** rows (:217-241):
- min-height H; padding-inline P; zinc-500 / zinc-400.
- icon (search-x / loader) in `--_muted`, margin-end 6/8/8.
- loader spins 0.8s linear, slowed to 2.4s with reduced motion. They also get a separator-space margin under the search row.

**Match highlight** (:245-251): radius 2px; bg `color-mix(currentColor 14%, transparent)` / `24%`.

**Free-tag mode** (`data-search=inline data-creatable`, multiple, nothing left to pick): no chevron; `--canon-select-end: _pad` (+ `I + 8 + _gap` with a clear button) (:119-130).

**Motion** (popups.css:10-26, room.css:61-88):
- popup: opacity 0 → 1 and scale 0.97 → 1, 0.15s ease-out on open; 0.1s ease-in on close.
- tag leaving: fades 0.12s ease-out, then width collapses 0.18s ease-in-out.
- tag entering: width opens 0.18s, then fades in 0.12s.
- box height follows (`data-resizing`) 0.18s ease-in-out, delayed 0.12s when closing.
- reduced motion: fade only, no resize.

### Input OTP
Anatomy: `.canon-otp` > `input[maxlength]` (invisible overlay) + `.canon-otp-cells[aria-hidden]` > `.canon-otp-group` > `.canon-otp-cell[data-active][data-placeholder]`, `.canon-otp-separator` (core/otp.css).

| | sm | md | lg |
|---|---|---|---|
| cell (square, = H) | 32 | 40 | 48 |
| group of 3 width (1px overlap) | 96 | 120 | 144 |
| group gap `I/2 + 4` | 12 | 14 | 16 |
| separator width `I − 8` × 1px | 8 | 12 | 16 |
| group-end radius | 4 | 8 | 12 |

(theme/otp.css:15-27,67-115)
- Cells: border 1px `--_border`; bg `--_bg` white / zinc-900. Each cell after the first gets margin −1px and +1px width, so neighbors share one line. Only the group's ends are rounded.
- Separator: zinc-300 / zinc-700.
- Type: control font, 400, input lh and tracking, tabular-nums.
- **No `shadow-control` on cells**; Text Input has it.
- **Hover** (on the whole group): non-active cells → zinc-400 / zinc-500.
- **Active cell**: z-index 1, focus border blue-600 / blue-400, outline 2px transparent, `0 0 0 3px` ring blue-100 / blue-900. While empty it shows a caret: 1px × font-size, currentColor, blinking at 1s step-end.
- **Placeholder** char: `--_muted` zinc-400 / zinc-500.
- **Invalid**: same red set as Text Input.
- **Disabled**: hover = rest; bg zinc-50 / zinc-800; muted zinc-300 / zinc-600; text zinc-400 / zinc-500.
- No-JS fallback: one Text Input-style input, width `maxlength·1.5ch + 2P`, `letter-spacing:.5ch`.
- Motion: border and shadow 0.12s. Reduced motion: no transition and no blink.

### Form Layout
Anatomy: `.canon-form` (container `canon-form`) > `.canon-form-section` > `.canon-form-section-header` > `.canon-form-section-title` + `.canon-form-section-description`; `.canon-form-row` (subgrid label/box/message), `.canon-form-actions[data-sticky]`, `.canon-form-reveal` (core/form-layout.css).

| | sm | md | lg |
|---|---|---|---|
| `--canon-theme-form-gap` (field↔field, row column-gap, header→fields) | 12 | 16 | 20 |
| `--canon-theme-form-section-gap` | 24 | 32 | 40 |
| section title font / lh | 14/20 | 16/24 | 18/28 |

(theme/form-layout.css:17-35)
- Stacked children: `margin-top: form-gap` (:41-45).
- **Section + section**: `margin-top` AND `padding-top` both = section-gap, with a hairline `rule` border between. The comment says "24/32/40 apart, rule halfway", but the code gives **48/64/80 total**, with the rule at the midpoint (:46-50).
- Title: 600, zinc-900 / white, label tracking. Description: label-description type, zinc-500 / zinc-400, margin-top = description gap (4/6/8). Header margin-bottom = form-gap (:56-72).
- Row: column-gap = form-gap, row-gap 0. Below 24rem (384px) the row stacks, with row-gap = form-gap (:74-82). Fields in a row share a subgrid, so boxes line up (core:33-48).
- Actions: gap 8, margin-top = section-gap. Sticky: padding-block 12, `border-top: hairline rule`, bg white / zinc-950 (:84-92).
- Aside layout (`data-layout="aside"`, at ≥40rem/640px): header float 33%, content offset by 33% + 32px (core/base.css:610-623; theme :38).
- Reveal: a 2px zinc-200 / zinc-700 left line. margin-start `I/2 − 1`; padding-start `I/2 + choice-gap − 1` (choice-gap 6/8/8) (:94-98).

### Form Repeater
Anatomy: `.canon-repeater` > `.canon-repeater-item` (grid of 3 subgrid rows) > `.canon-field`… + `button[command=--canon-remove]`; `button[command=--canon-add]` (core/form-repeater.css).

| | sm | md | lg |
|---|---|---|---|
| item gap and field column gap | 8 | 8 | 12 |
| Add button offset under the last item | 12 | 16 | 16 |

(theme/form-repeater.css:13-32)
- Remove button: danger, low-emphasis icon button, as tall as the box. It is absolutely placed at the end of the box row, and the item reserves `padding-inline-end: H + gap` for it (core:48-57).
- Labels show on the first item only; later boxes drop the 6px label margin (theme:34-36).
- **Motion** (theme:45-70):
  - item padding animates 0.2s ease-in-out, delayed 0.15s.
  - Remove button fades 0.15s ease-out, delayed 0.2s.
  - item add/remove uses room.css: fade 0.15s plus height 0.2s ease-in-out.

### Save Bar
Anatomy: `.canon-save-bar` (sticky bottom, a scroll-state container) > `.canon-save-bar-status` (`margin-inline-end:auto`) + buttons (core/save-bar.css).
- gap 8; padding-block = shell-inset **8 / 12 / 16**; bg `--canon-theme-page-bg`, which is the paper, or zinc-50 / zinc-950 inside an app shell (theme/save-bar.css:13-16; app-shell.css:24-46).
- On a page it bleeds across `--canon-page-inset`.
- `::before` is a hairline `rule-faint` line on top: opacity 0, turning 1 when `scroll-state(stuck: bottom)`, with a 0.15s fade (:18-31).
- In a card: card padding, `border-top: hairline rule`, bg white / zinc-900 (:32-39).
- Status change: rises 4px and fades over 0.2s ease-out (fade only with reduced motion) (:43-53).

### Popups (shared motion) and Room
- popups.css:10-26: `.canon-menu/.canon-popover/.canon-combobox-popup/.canon-color-popup/.canon-calendar[popover]` and `select::picker(select)` share one motion.
  - closed: opacity 0, scale 0.97; transition 0.1s ease-in, including `display` / `overlay` allow-discrete.
  - open: 0.15s ease-out from `@starting-style` (opacity 0, scale 0.97).
  - Reduced motion: scale stays 1, fade only (:46-59).
  - Core keeps the select anchor 400ms after close, so close transitions must stay under 400ms (core/text-input.css:63-72).
- room.css (alert/banner/toast/repeater-item):
  - closing: fade-out 0.15s ease-out, then `room-close` 0.2s ease-in-out (height, padding, border and margins collapse to 0).
  - opening: room-open 0.2s, then fade-in 0.15s.
  - Inline variants for combobox tags: 0.12s / 0.18s.
  - Reduced motion: 0.15s fade only (:7-127).

### Cross-component patterns noticed
1. **Field frame recipe:**
   - 1px border: zinc-200 / zinc-700 at rest → zinc-400 / zinc-500 on hover → tone-600 / tone-400 on focus.
   - radius 4/8/12; bg white / zinc-900; `shadow-control` at rest.
   - focus = `0 0 0 3px` tone-100 / tone-900 halo with no offset, plus `outline: 2px solid transparent`.
   - Intents swap only the vars: base tone 400 / 500, hover and focus 600 / 400, ring 100 / 900, disabled border 300 / 800.
   - Disabled: bg zinc-50 / zinc-800, text zinc-400 / zinc-500, no shadow. Readonly: dashed border.
   - Hover is suppressed while focused or open. Transitions are 0.12s on border-color and box-shadow.
2. **Horizontal rhythm:** the box pads `P − 1 + inset` (11/15/19), so text sits P + inset (12/16/20) from the outer edge. Icons sit at P (8/10/12), icon↔text = icon-gap + inset (6/8/8), in-box buttons are I + 8 with radius = box radius − 4 (min 2). Option rows, captions, the search row and the picker offset all reuse this inset, so text lines up vertically from box to list.
3. **Option row recipe:**
   - min-height H, padding 0 / (P + inset) start / P end, radius = input radius.
   - hover or active fill zinc-100 / zinc-800 (danger: red-400 15% / red-500 20% with red-700 / red-300 text).
   - selected: weight 500 + trailing tick in currentColor.
   - disabled: zinc-400 / zinc-600.
   - description inline, 0.5em, muted. Captions are 10px / 600 / uppercase / +0.01em zinc-500 / zinc-400 in a 32px row.
4. **Popup surface recipe:**
   - 4px gap from the anchor, 8px wider than it (−4px start), padding 3 + 1px transparent border, radius = input radius + 4 (8/12/16).
   - bg white / zinc-900; `0 0 0 hairline var(--canon-theme-edge)` + `shadow-floating`.
   - list max 8.5 rows (8.5H); open 0.15s ease-out from scale 0.97, close 0.1s ease-in.
5. **Type ramp** (sm / md / lg):
   - label 12/16 · 14/20 · 16/24, weight 500, zinc-900 / white.
   - input text = same sizes, weight 400.
   - description, hint, message and counter one step down: 10/12 · 12/16 · 14/20, 400, zinc-500 / zinc-400.
   - intent message colors use the 700 / 300 shade of the tone. Required `*` is red-700 / red-300, 600. Placeholder and muted icons are zinc-400 / zinc-500.
6. **Vertical field spacing is fixed, not size-scaled:** label→box 6px, box→message 8px, message icon gap 4px. Only the label-description gap scales (4/6/8).
7. **Grouped segments** (OTP cells, number buttons, prefix/suffix, select-in-input): the members share 1px lines (−1px overlap or one-sided borders), only the outer ends take the radius, and inner radii are `max(2px, r − 4px)`.
8. **Muted neutrals reused everywhere:** zinc-100 / zinc-800 (hover fill), zinc-200 / zinc-700 (active fill, resting border), zinc-50 / zinc-800 (disabled bg). Dark mode generally uses the 900 surface and a 700 line.
9. **Motion vocabulary:** 0.12s (color, border, ring), 0.15s (popup open, message enter, chevron rotate, fades), 0.1s (popup close), 0.2s (room, rolls, status rise), `cubic-bezier(0.2,0,0,1)` for number rolls. Every one has a reduced-motion fallback that only fades.

## C. Choice controls and pickers

Notation: `a / b` = light / dark (the `light-dark()` pair). `c` = control size = `--canon-icon-size` (16 / 20 / 24 for sm / md / lg). `B` = `--canon-control-block-size` (32 / 40 / 48). "Choice focus ring" = `0 0 0 2px light-dark(white, zinc-900), 0 0 0 3px light-dark(blue-600, blue-300)`. Note that the dark blue is **blue-300** here, not the `--canon-theme-focus` dark value (blue-400). "Field ring" = border `blue-600 / blue-400` plus `0 0 0 3px blue-100 / blue-900` (Text Input's focus).

Verification: the live `https://recepkutuk.github.io/canon/css/canon/canon.css` is **byte-identical** to the repo's `css/canon/canon.css` (471,818 B). That build contains every src value spot-checked here. The live reference pages (checkbox, switch, date, time) give no numbers beyond "16 / 20 / 24px box" and agree with the CSS.

---

### Checkbox / Radio
Anatomy: `.canon-choice` > `input[type=checkbox|radio]` (box = `::before`, mark = `::after`), `.canon-choice-label`, `.canon-choice-hint`, `.canon-choice-message`. Grid areas: `"control label" / ". hint" / ". message"` (core/choice.css:11-24).

**Sizes** (`theme/choice.css:20-45`; label.css:13-37)
| | sm (xs, sm) | md (default) | lg (lg, xl, 2xl) |
|---|---|---|---|
| control (`--canon-icon-size`) | 16 | 20 | 24 |
| box (`::before` inset 5%) | 14.4 | 18 | 21.6 |
| checkbox radius (c/4, from the control, not the box) | 4 | 5 | 6 |
| radio dot (`::after` inset 37.5% = c/4) | 4 | 5 | 6 |
| check stroke (1.5 of 24 viewBox, scaled) | 1 | 1.25 | 1.5 |
| label gap `--canon-theme-choice-gap` | 0.375rem (6) | 0.5rem (8) | 0.5rem (8) |
| label font / line-height | 12 / 16 | 14 / 20 | 16 / 24 |
| label tracking | -0.007em | -0.006em | -0.004em |
| hint font / lh | 10 / 12 | 12 / 16 | 14 / 20 |
| hint margin-top (`label-description-gap`) | 4 | 6 | 8 |
| message margin-top | 4 | 4 | 4 |

- Vertical centering: the input gets `margin-top: max(0, (1lh - c)/2)` and the label gets `max(0, (c - 1lh)/2)` (core/choice.css:37,54). Because c = lh at every size, both are 0.
- Label weight 400, color `zinc-900 / white` (theme/choice.css:40-44).
- Check icon: `m9 12 2 2 4-4`. Dash: `M9 12h6`. Both stroke 1.5, round caps, 24 viewBox (base.css:428-429). The icon is a mask over `::after` inset 0 (the full control).

**Tone table** (vars `--_line`, `--_fill`, `--_mark`, `--_halo`; theme/choice.css:60-162)
| state | line (1px border) | fill | mark | halo (0 0 0 3px) |
|---|---|---|---|---|
| rest | zinc-400 / zinc-500 | transparent | transparent | transparent |
| hover (unchecked) | zinc-600 / zinc-300 | — | — | zinc-100 / zinc-800 |
| hover (checked) | unchanged | — | — | zinc-100 / zinc-800 |
| checked / indeterminate | zinc-900 / white | = line | white / zinc-900 | — |
| invalid (unchecked) | red-400 / red-500 | — | — | — |
| invalid + hover | red-600 / red-400 | — | — | red-100 / red-900 |
| disabled | zinc-200 / zinc-600 | = line (filled) | — | none (hover off) |
| disabled + checked | zinc-300 / zinc-600 | = line | zinc-100 / zinc-400 | — |

- Checked is **neutral ink (zinc-900 / white)**, not blue: "as a neutral high Button" (:47-59, :130-134).
- Halo is drawn as `box-shadow: 0 0 0 3px var(--_halo)` on `::before` (:75). Hover applies to the whole `.canon-choice` row (`:has(...):hover`), inside `@media (hover:hover)` (:138-153).
- Invalid applies only while unchecked (:135).
- Disabled row: label (and state text) `zinc-400 / zinc-500` (:270-272), cursor not-allowed (core :87-89).

**Focus** (:164-185): drawn on `.canon-choice-label::before`, extended back over the control. Geometry: `inset-inline-start: -(control-inline + gap + out)`, `inset-block: -out`, `inset-inline-end: -out`, where out = 0 for checkbox/radio and 2px for switch. Radius 0.125rem (2px), choice focus ring shadow. The result is a ring 2-3px outside the union box of control + label. Native outline: none.

**Motion** (:96-129)
- Press: `scale: 0.82` over 0.08s ease-out. Release: back over 0.2s `cubic-bezier(0.23,1,0.32,1)` with no overshoot.
- Box border/bg/halo: 0.12s. When it becomes checked, the box transition is 0.08s (:113-115).
- Check draw: `clip-path: inset(0 66% 0 0)` → `inset(0 33% 0 0)` over 0.22s `cubic-bezier(0.65,0,0.35,1)`, 0.05s delay. This reveals the stroke left-to-right, x 8.25 → 15.75 of 24.
- Radio dot: `scale 0 → 1` over 0.2s `cubic-bezier(0.23,1,0.32,1)`.
- Uncheck: the mark disappears instantly.
- Reduced motion: all transitions none, no press scale (:332-339).

---

### Switch
Anatomy: `.canon-choice` > `input[type=checkbox][role=switch]` (track = the input, thumb = `::after`), `.canon-choice-label`, optional `.canon-choice-state` > `.canon-choice-state-off` / `-on` (core/choice.css:61-85).

**Geometry** (theme/choice.css:187-231)
| | sm | md | lg |
|---|---|---|---|
| track W×H (`c*1.5 + 4px` × c) | 28×16 | 34×20 | 40×24 |
| outer ring (`box-shadow 0 0 0 2px` track color) → visual size | 32×20 | 38×24 | 44×28 |
| thumb (circle = c, flush in the box; the ring is the visible padding) | 16 | 20 | 24 |
| travel (`100% - c`) | 12 | 14 | 16 |
| label gap (choice-gap + 2px bleed) | 8 | 10 | 10 |

- Track radius 999px. Thumb shadow `0 0 0 1px rgb(0 0 0/.05), 0 1px 0 rgb(0 0 0/.05)` (:224).
- `--canon-theme-choice-bleed: 2px` pushes the focus ring 2px further out: 4-5px from the track box, 2-3px from its ring (:202).

**Tones** (`--_track` / `--_thumb`; :206-250)
| state | track | thumb |
|---|---|---|
| off | zinc-300 / zinc-700 | white / zinc-400 |
| on | zinc-900 / white | white / zinc-900 |
| invalid + off | red-400 / red-500 | (unchanged) |
| disabled off | zinc-200 / zinc-800 | zinc-100 / zinc-600 |
| disabled on | zinc-300 / zinc-600 | zinc-100 / zinc-400 |

- No hover look. No press scale.

**Motion**
- Thumb `inset-inline-start` 0.3s `cubic-bezier(0.34,1.56,0.64,1)` (overshoot spring).
- Typed `@property --canon-theme-switch-travel` (0 to 1, :7-11) animates on the same curve. `--_squeeze = sin(travel*180deg)*0.2`, `scale: (1+sq) (1-sq)`, so mid-travel the thumb is 120% wide × 80% tall (:225-230).
- Track bg/shadow 0.12s. Thumb bg 0.12s.

**State-text variant** (:252-269)
- The label moves above in Label type (weight 500, 12/16, 14/20 or 16/24).
- The switch row has `margin-top: 0.375rem + 2px` (8px). The state words sit beside it.
- Message margin-top 4 + 2 = 6px. The focus ring wraps the switch + words.

---

### Fieldset
Anatomy: `fieldset.canon-fieldset` > `.canon-fieldset-legend` (floated, so it acts as a flex item), `.canon-fieldset-hint`, items, `.canon-fieldset-message`. Layout: `flex row wrap`, each child `flex: 1 1 100%` (core/choice.css:104-126). `[data-orientation=horizontal]` lets items share rows, with `column-gap` = `--canon-fieldset-gap-inline` default 1.5rem (24).

| | sm | md | lg |
|---|---|---|---|
| `--canon-theme-fieldset-gap` (legend block → items; items → message) | 12 | 16 | 16 |
| `--canon-theme-fieldset-item-gap` (between items; each item's margin-top) | 8 | 8 | 12 |
| legend/hint margin-bottom (gap − item-gap) | 4 | 8 | 4 |
| switch items margin-top (item-gap + 4) | 12 | 12 | 16 |
| switch group legend margin-bottom (gap − item-gap − 2) | 2 | 6 | 2 |
| switch group message margin-top (gap + 2) | 14 | 18 | 18 |

- Legend: Label type, weight 500, `zinc-900 / white`. Required: `::after "*"`, 4px left margin, `red-700 / red-300`, weight 600 (theme/choice.css:295-307).
- Hint: label-description type `zinc-500 / zinc-400`, margin-top 4/6/8 (:276-310).
- Stacked `.canon-field + .canon-field` inside a non-horizontal fieldset: margin-top 1rem (16) (:346-348).

---

### Slider / Range Slider
Anatomy: box `.canon-control` (or a text-input-family class) holds `output` (value, before = start / after = end), `.canon-control-prefix`, `input[type=range]` (×2 for a range), `.canon-control-suffix`, `datalist > option` (marks). Grid: `"value-start prefix track suffix value-end" / ". . marks . ."`, track column `minmax(4rem,1fr)` (64px min) (core/slider.css:36-56).

**Geometry** (theme/slider.css:17-33)
| | sm | md | lg |
|---|---|---|---|
| track height (c/4) | 4 | 5 | 6 |
| thumb diameter (0.9c) | 14.4 | 18 | 21.6 |
| thumb ring (`border: c/4 solid line`) | 4 | 5 | 6 |
| visible thumb center dot (thumb − 2×ring) | 6.4 | 8 | 9.6 |
| prefix/suffix/value spacing (`--canon-control-gap`) | 6 | 8 | 10 |

- Track radius 999px. The thumb is the checked radio's look.
- Input block-size = `max(thumb, track)`. Thumb margin-top centers it: `(track − thumb)/2` (core :71,97).
- Fill: a `linear-gradient` over the track. The end position is `thumb/2 + (100% − thumb) * percent/100`, with `--canon-slider-percent` set by JS. A range uses `--canon-slider-start` / `-end`. The second input's track bg is none (core :58-68, :134-150).
- `data-state=front` raises the movable thumb (z-index 1).
- The box has no frame: border 0, bg none, padding-inline 0, gap 0 (:20-25).

**Tones**
| state | track | fill & thumb ring (`--_line`) | thumb center (`--_middle`) |
|---|---|---|---|
| rest | zinc-200 / zinc-700 | zinc-900 / white | white / zinc-900 |
| invalid | — | red-600 / red-500 | — |
| disabled | — | zinc-300 / zinc-600 | zinc-100 / zinc-400 |

- Focus: thumb box-shadow = choice focus ring (:41-46).
- No hover or press look. `--canon-slider-thumb-scale` is exposed in core but unset by the theme.

**Marks / min-max labels**
- Label-description type: 10/12, 12/16 or 14/20, `zinc-500 / zinc-400` (:49-54).
- Datalist margin-top 0.5rem (8). Inline padding = thumb/2.
- JS-placed options sit at `thumb/2 + (100% − thumb)*pct`, translated −pct% so the ends stay flush (core :171-196).

**Value output** (inverted tooltip; :63-187)
- Size: tooltip tokens. A slider with no `data-size` anywhere gets **md** (tooltip.css:28-36) even though tooltips default to sm.

| | sm | md | lg |
|---|---|---|---|
| padding (block × inline) | 4×6 | 6×8 | 8×12 |
| radius | 4 | 6 | 8 |
| font / lh | 12/16 | 14/20 | 16/24 |
| tracking | -0.007em | -0.006em | -0.004em |

- Colors: bg `zinc-900 / white`, 1px border `zinc-700 / zinc-200`, text `white / zinc-900`, shadow `0 1px 2px rgb(0 0 0/.05)`, weight 400, centered, min-width 1.875rem (30px).
- Position: `bottom: 50% + c/2 + 4px` (4px above the control), centered on the thumb. JS clamps it to the track, keeping the arrow 15px from the value's ends. In a range, the two values push apart with a 4px gap.
- Arrow: 14×10 (0.875×0.625rem) tooltip-arrow mask. Tip 4.5px past the border, 8px in from the corners. Stroke via a subtract mask. Drop shadow `0 1px 1px /.05`.
- Shown on hover (hover media) / focus-visible / active. Opacity + visibility transition 0.12s. In a range, each thumb's value shows on its own.
- Vertical (`.canon-field[data-orientation=vertical]`): length `--canon-slider-length: 10rem` (160). The value sits left of the thumb, `right: 50% + c/2 + 6px`, with the arrow rotated −90deg and `--_keep: 8px`.
- Reduced motion: output transition none.
- `theme/track-mark.css` is **not slider marks**. It is the Segmented/Tabs anchored "current" card: 0.3s `cubic-bezier(0.3,0.7,0.1,1)` on top/right/bottom/left, radius `button-radius − 1px`.

---

### Swatches
Anatomy: `.canon-swatches[role=radiogroup]` > `input[type=radio]` (swatch circle = `::before`, chosen dot = `::after`), optional `.canon-swatches-toggle` (added by JS with `data-collapse`). Color comes from `--canon-swatch`, else `attr(value type(<color>))` (core/swatches.css).

| | sm | md | lg |
|---|---|---|---|
| swatch (icon size) | 16 | 20 | 24 |
| circle (inset 5%) | 14.4 | 18 | 21.6 |
| chosen dot (inset 37.5%) | 4 | 5 | 6 |
| gap `(B − c)/2` | 8 | 10 | 12 |
| box padding (gap − 1) → +1px border = gap | 7 | 9 | 11 |
| box radius (input radius) | 4 | 8 | 12 |
| box height = B | 32 | 40 | 48 |

- Box: 1px `zinc-100 / zinc-800` border, bg `white / zinc-900`. The box itself has no shadow (theme/swatches.css:19-25).
- Swatch fill = color over `--canon-theme-color-checker`: 8px conic checker at 15% black / 15% white (color-picker.css:8).
- Inner edge: `inset 0 0 0 hairline` at `rgb(0 0 0/.1)` / `rgb(255 255 255/.15)` (:28).
- Chosen dot: always `white` (not themed) (:45).
- Hover: halo `0 0 0 3px blue-100 / blue-900` (**blue**, unlike choice's zinc halo). Transition box-shadow 0.12s.
- Focus: edge + choice focus ring (:52-57). Disabled: opacity 0.45.
- Collapsible (`:has(> .canon-swatches-toggle)`):
  - Box border becomes Text Input's: `zinc-200 / zinc-700`, hover `zinc-400 / zinc-500`.
  - Open or keyboard-focused: border `blue-600 / blue-400` + `0 0 0 3px blue-100 / blue-900`. Individual swatch rings are suppressed.
  - Border/shadow transition 0.12s (:64-80).
- Toggle chevron: icon size, `zinc-400 / zinc-500`, `rotate -90deg` closed, `90deg` open (mirrored in RTL), `0.2s ease` (:99-122).
- Expand/collapse: non-chosen swatches go to inline-size 0, margin-start −gap, opacity 0, scale 0.6. Transition: inline-size / margin / scale 0.2s ease, opacity 0.15s ease, `display 0.2s allow-discrete`, with `@starting-style` (:127-143).

---

### Color Picker
Anatomy: `.canon-color` (Text Input frame) > `input[type=color]` + `.canon-color-swatch` + chevron (`::after`). Popup `.canon-color-popup[popover]` (or inline) > `.canon-color-area` > `.canon-color-thumb`; `.canon-color-tools` > `.canon-color-eyedropper` + `.canon-color-sliders` > `input.canon-color-hue`, `input.canon-color-opacity`; `.canon-color-fields` > `.canon-select` + `.canon-color-values` (`.canon-text-input` ×1/3) + `.canon-color-percent`; `.canon-color-caption`; `.canon-swatches`.

**Trigger box** (theme/color-picker.css:16-61)
- Inner pad `(B − c)/2 − 1` = 7 / 9 / 11, so 8 / 10 / 12 from the outside.
- Swatch and chevron are icon size (16 / 20 / 24), 8px apart (`gap: 0.5rem`).
- Swatch = 90% circle with the checker and the hairline edge (as in Swatches).
- Chevron color `--_muted` (`zinc-400 / zinc-500`).
- Open: field ring + chevron `rotate 180deg` (0.15s).

**Popup**
| prop | value |
|---|---|
| width | 21.5rem (344), max `100vw − 1rem` |
| offset from box | 0.25rem (4) |
| padding | `1rem − 1px` (15, +1 border = 16) |
| gap between rows | 1rem (16) |
| radius | 1rem (16) |
| bg / text | white / zinc-900 ; zinc-900 / white |
| border (inline mode) | 1px zinc-300 / zinc-600; invalid red-600 / red-500 |
| popover mode | border transparent; `0 0 0 hairline var(--canon-theme-edge), var(--canon-theme-shadow-floating)` |
| icon size inside | 1.25rem (20), fixed |
| disabled (inline) | opacity 0.45 |

**Area**
- Square (`aspect-ratio 1`, about 312px at 344 wide), radius 0.25rem (4), ring `0 0 0 1px zinc-200 / zinc-700`.
- Focus: choice focus ring (:104-113).
- Gradients: `to top #000→transparent`, `to right #fff→transparent`, over the hue.

**Thumbs**
- Area thumb 1.5rem (24). Slider thumbs 1rem (16), margin-top −2px.
- Fill = opaque color, `inset 0 0 0 3px white, 0 0 0 1px zinc-900`. These are **not light-dark()**: identical in dark.
- Slider-thumb focus adds `0 0 0 3px blue-600 / blue-300`, so a 2px blue band shows past the 1px line (:187-216).

**Tools**
- Gap 16. Eyedropper: 2.5rem (40) square, radius 0.5rem (8), bg `zinc-100 / zinc-700`, hover `zinc-200 / zinc-600` (0.12s), pipette icon 20px `zinc-500 / zinc-400`, focus = choice ring (:126-160).
- Sliders: column gap 4. Input height 16. Track 0.75rem (12), radius 0.375rem (6), inset hairline line `rgb(0 0 0/.2)` / `rgb(255 255 255/.2)`. The opacity track sits over the checker (:161-186).

**Fields** (sm controls)
- Gap 8. Format select 4.5rem (72).
- Values flex-basis 5rem (80) for hex, 9.75rem (156) for 3 joined inputs. Joined inputs use −1px overlap, square inner corners, and the focused one gets z 1.
- Percent 3.75rem (60), right-aligned text, `margin-inline-start: auto`.
- `#` / `%` affixes become plain muted text with no segment (:218-265).

**Caption**
- 0.625rem (10) / 1rem (16) lh, weight 600, uppercase, tracking 0.01em, `zinc-500 / zinc-400`, margin-bottom −0.5rem (−8) (:269-277).

**Popup swatches**
- 1.5rem (24), gap 0.75rem (12), no frame/padding, margin-bottom 1rem (16) (:278-286).

---

### Date family (Date input, Calendar, Day strip)
Anatomy:
- Date box: `.canon-date` (Text Input frame) > hidden `input[type=date]` (×2 for a range), `.canon-date-segments[data-part=start|end][data-empty]` > `.canon-date-segment`, `.canon-date-literal`, `.canon-date-placeholder`; `.canon-date-arrow`; `.canon-date-button`.
- Calendar: `.canon-calendar[data-view][popover?]` > `.canon-calendar-month` > `.canon-calendar-header` (`.canon-button` prev/next, `.canon-calendar-title`, `.canon-calendar-spacer`, `.canon-calendar-selects`) + `.canon-calendar-body` > `table.canon-calendar-weeks?` + `table.canon-calendar-grid` > `th[data-unavailable]`, `td[aria-selected][data-in-range][data-range-start|end][data-preview][data-in-week]` > `button.canon-calendar-cell[data-outside][aria-disabled][aria-current=date]`; `.canon-calendar-presets` > `.canon-button[aria-pressed]`.
- Strip: `.canon-date-strip` > `.canon-button` prev/next, `.canon-date-strip-days` > `button.canon-date-strip-day[aria-pressed][aria-disabled][aria-current]` > `.canon-date-strip-weekday`, `.canon-date-strip-number`, `.canon-date-strip-month`.

**Date box** (theme/date.css:7-44)
- Segment: padding-inline 0.0625rem (1px), radius 0.125rem (2). Focused segment bg `zinc-200 / zinc-700`.
- Empty segment, literal, placeholder and arrow: `--_muted` (`zinc-400 / zinc-500`).
- Range arrow: icon size, margin-inline = `--canon-theme-input-inset` (4 / 6 / 8).
- Calendar button icon: muted.
- Focus-within or calendar open: field ring.

**Calendar frame** (:64-89)
| | sm | md | lg |
|---|---|---|---|
| `--_pad` (c − 8): radius | 8 | 12 | 16 |
| padding (pad − 1, +1 border) | 7 | 11 | 15 |
| `--_split` (c): gap between months / presets / weeks column | 16 | 20 | 24 |
| cell = B (square) | 32 | 40 | 48 |
| grid width (7B) | 224 | 280 | 336 |
| cell radius (input radius) | 4 | 8 | 12 |
| font / lh (control type) | 12/16 | 14/20 | 16/24 |
| today-dot bottom `(B − 1lh)/2 − 4px` | 4 | 6 | 8 |
| month select width (2B + 4) | 68 | 84 | 100 |
| year select width (2B + 12) | 76 | 92 | 108 |
| select picker max-height (5B + 8) | 168 | 208 | 248 |

- bg `white / zinc-900`, text `zinc-900 / white`.
- Inline: 1px border `zinc-300 / zinc-800` + `box-shadow 0 0 0 1px light-dark(transparent, rgb(0 0 0/.5))` (a dark-only black halo).
- Popover: border transparent + hairline edge + floating shadow, offset 4.
- The base rule's `zinc-400 / zinc-700` border (:70) is always overridden by the two rules above.
- Disabled: opacity 0.45.
- Month column gap 1rem (16): header → weekdays → days.
- Second month and presets: `padding-inline-start: split − 1` + `border-inline-start: hairline solid var(--canon-theme-rule)` (:109-113).
- Selects gap 4.
- Header buttons: Button minimal icon buttons with fg `zinc-900 / white`. A plain title (multi-month) has weight 400 (:115-120).
- Rows 8 apart (`td` padding-top 0.5rem). Weekday `th` padding-bottom 1rem (16), weight 400, `zinc-500 / zinc-400`. `th[data-unavailable]` `zinc-300 / zinc-700` (:123-133).

**Day cell states** (:134-209). Tokens `--_chosen: zinc-900 / white`, `--_on-chosen: white / zinc-900`, `--_band: zinc-200 / zinc-700`, `--_band-muted: zinc-400 / zinc-500`.
| state | bg | text | radius |
|---|---|---|---|
| rest | none | inherit, weight 500 | input radius |
| outside month | — | zinc-400 / zinc-500 | — |
| disabled | — | zinc-300 / zinc-700 (no hover) | — |
| hover (hover media) | zinc-100 / zinc-800 | — | — |
| selected | `--_chosen` | `--_on-chosen` | — |
| in-range (between) | `--_band` | inherit | 0, rounded at range ends and at row first/last td |
| range start/end | `--_chosen` | `--_on-chosen` | outer side rounded |
| preview (range in progress) | `--_band` | `--_band-muted` | — |
| outside + in-range | `color-mix(in srgb, var(--_band) 40%, transparent)` | `--_band-muted` | — |
| today | `::after` 4px circle `currentColor`, at bottom (see table) | — | — |
| focus-visible | choice focus ring, z 1 | — | — |

- Hover is a step lighter than the band, so it never reads as chosen. Focus stays blue.
- Weeks column (:211-236):
  - Width `B + split + 1`, margin-end `split − 1`, padding-end split, hairline rule on the end side.
  - The selected week number is `--_chosen`. Its days (`[data-in-week]`) get the band, rounded at the row ends.
- Presets (:363-366): Button minimal, fg `zinc-500 / zinc-400`, pressed bg (`--canon-theme-bg-active`) `zinc-200 / zinc-700`.
- Motion:
  - Cell bg/color 0.12s.
  - Month turn: tbody `canon-turn-next` / `-previous` (from opacity 0, translate ±0.75rem = ±12px) over 0.2s `cubic-bezier(0.2,0,0,1)`. The header and weekdays stay put. RTL flips the direction.
  - Reduced motion: fade only (`canon-fade-in`), no cell transitions (:368-399).

**Day strip** (:237-361)
| | sm | md | lg |
|---|---|---|---|
| `--_pad` (c − 8): gap, radius | 8 | 12 | 16 |
| padding (block × inline, +1 border) | 3×7 | 3×11 | 3×15 |
| day width (B + 2·pad) | 48 | 64 | 80 |
| day padding-block | 4 | 4 | 4 |
| number box height (B) | 32 | 40 | 48 |
| weekday/month font (control − 2) / lh (input-lh − 4) | 10/12 | 12/16 | 14/20 |
| day radius | 4 | 8 | 12 |

- Frame: border `zinc-300 / zinc-800`, dark extra `0 0 0 1px rgb(0 0 0/.5)`, bg `white / zinc-900`. Disabled: opacity 0.45. Prev/next buttons fg `zinc-900 / white`.
- Weekday `zinc-500 / zinc-400`, month `zinc-400 / zinc-500`, both weight 400. Number weight 500.
- Hover `zinc-100 / zinc-800` (not on pressed/disabled). Disabled text `zinc-300 / zinc-700`.
- Pressed: bg `--_chosen`, number `--_on-chosen`, weekday `color-mix(on-chosen 75%, transparent)`, month 60%.
- Focus: choice ring.
- Chosen fill glides between days via anchor positioning: `::before` on `.canon-date-strip-days`, 0.3s `cubic-bezier(0.3,0.7,0.1,1)`, off while `data-turning`.
- Turning: 0.2s slide 12px + fade, same keyframes as the calendar.

---

### Time
Anatomy: `.canon-time` > hidden `input[type=time]` (×2 for a range), `.canon-time-segments` > `.canon-time-cell[data-type][data-empty][data-active]` > `.canon-time-value` + `button.canon-time-step[data-direction=up|down]` ×2; `.canon-time-literal` (":"); `.canon-time-arrow`.

| | sm | md | lg |
|---|---|---|---|
| cell (B square) | 32 | 40 | 48 |
| cell gap `--_gap` | 4 | 4 | 6 |
| range arrow gap `--_arrow-gap` | 8 | 8 | 12 |
| radius (input radius) | 4 | 8 | 12 |
| inner radius `max(0, r − 1)` | 3 | 7 | 11 |
| grow `(B + 8)/4` | 10 | 12 | 14 |
| active cell height (B + 2·grow) | 52 | 64 | 76 |
| period cell padding-inline (pad/2), min-width B | 4 | 5 | 6 |
| native fallback padding-inline (pad + inset − 1) | 11 | 15 | 19 |

Only lg / xl / 2xl change the gaps (theme/time.css:23-32).

**Cell** (:51-75)
- 1px border `zinc-200 / zinc-700`, bg `white / zinc-900`, `--canon-theme-shadow-control`, text `zinc-900 / white`, input lh / tracking.
- Empty value shows "--" in `zinc-400 / zinc-500`. Literal and arrow `zinc-400 / zinc-500`.

**Steps / tabs** (:77-103)
- At rest: inset-inline 2px, height 4px, bg `zinc-100 / zinc-800`. Radius inner-radius on the outer corners, 2px on the inner corners. Not clickable.
- Active: inset 3px, height = grow, radius `inner − 2`, chevron mask at icon size in `zinc-500 / zinc-400`.
- Arrow hover `zinc-200 / zinc-700`, pressed `zinc-300 / zinc-600`.
- Hit area extends `3px + 0.75rem` (15px) outward (:123-161).

**States**
- Hover (not active): border `zinc-400 / zinc-500`, tabs `zinc-200 / zinc-700`.
- Active (focused): z 2, grows from its middle (`margin-block: −grow`) over its neighbours, border `blue-600 / blue-400`, `0 0 0 3px blue-100 / blue-900`, transparent 2px outline for forced colors.
- Invalid: all non-active cells `red-400 / red-500`. Active: `red-600 / red-400` + `0 0 0 3px red-100 / red-900`.
- Disabled: border `zinc-200 / zinc-700`, bg `zinc-50 / zinc-800`, no shadow, text `zinc-400 / zinc-500`, steps hidden.
- Read-only: dashed border, steps hidden, no grow (:163-187).

**Motion**
- Shrink: block-size / margin 0.1s ease-out.
- Grow: 0.15s `cubic-bezier(0.2,0,0,1)`.
- Border/shadow 0.12s. Tab size 0.1s → 0.15s on activation.
- Chevron opacity 0.12s with 0.05s delay.
- Reduced motion: none.

---

### Rich Text
Anatomy: `.canon-textarea[data-rich]` > hidden `textarea` + `.canon-toolbar.canon-rich-toolbar[data-size]` + `.canon-rich-area[contenteditable][data-empty][data-placeholder][data-grow]` (core/rich-text.css).

**Frame** (theme/rich-text.css:16-37; text-input.css:249-257)
- Textarea's frame (Text Input border, radius, shadow and states), with padding 0.
- Focus in the area applies the field ring to the whole box.
- Toolbar: padding 0.5rem (8), bottom border `hairline solid var(--canon-theme-rule)`. JS sets the toolbar's `data-size` to `sm`, or `md` when the box is lg/xl/2xl (src/js/rich-text.js:191-192).
- Area padding:

| | sm | md | lg |
|---|---|---|---|
| block `(B − lh)/2 − 1` | 7 | 9 | 11 |
| inline `pad-inline − 1 + input-inset` | 11 | 15 | 19 |

- Height: `rows × 1lh` (default 2 rows). `data-max-lines` → min = rows, max = N lines. `data-grow` → unbounded.
- Placeholder: `::before`, muted.

**Typography inside the area**

Values in parentheses are at md (14px).

| element | rule |
|---|---|
| block spacing | `> * + *` margin-top 0.75em (10.5) |
| h2 / h3 / h4 | 1.375em (19.25) / 1.2em (16.8) / 1em (14); weight 600; lh 1.3 |
| ul/ol | padding-start 1.5em; nested lists margin 0 |
| blockquote | border-start 2px `zinc-300 / zinc-600`, padding-start 0.75em, text `zinc-600 / zinc-400` |
| pre | padding 0.5em 0.75em, radius 4, bg `zinc-100 / zinc-800`, mono 0.875em, ligatures off, pre-wrap |
| inline code | padding 0 4px, radius 2, bg `zinc-100 / zinc-700`, text `zinc-700 / zinc-100`, mono 0.875em, box-decoration clone |
| code in h1-h3 | padding 0.0625em 0.3em, radius 0.2em, 0.8em |
| code in link | bg `blue-50 / blue-950`, color inherit |
| a | `blue-600 / blue-400`, underline 1px, `color-mix(currentColor 40%, transparent)`, offset 0.2em |
| hr | border-top hairline `--canon-theme-rule` |

The h1 code rule exists, but h1 itself is unstyled (only h2-h4).

---

### Cross-component patterns noticed
- **One size ladder drives everything.** c (icon 16/20/24) sets control glyphs. B (32/40/48) sets cells, boxes and day squares. Derived numbers:
  - quarter-c: checkbox radius, radio dot, slider track, slider ring.
  - 0.9c: box, thumb, swatch circle.
  - c − 8: calendar/strip padding and radius.
  - (B − c)/2: swatch and color-box inset.
  - (B + 8)/4: time grow.
- **Inner-border math.** Paddings are written `X − 1px` so the content sits X from the outside edge including the 1px border (calendar, strip, popup, swatches, textarea).
- **Selection is neutral ink, not brand.** Checked/on/selected = `zinc-900 / white` fill with a `white / zinc-900` mark/text. Blue is reserved for focus (rings, active field borders) and for the swatch hover halo. Implementers swapping themes should map "chosen" to the ink token and "focus" to the focus token separately.
- **Two focus recipes.**
  - Discrete controls (choice, slider thumb, swatch, calendar cell, strip day, area, eyedropper): `2px paper gap + 1px blue-600/blue-300`.
  - Text-like fields (date, time active cell, color box, rich text, collapsible swatches): border `blue-600/blue-400` + `3px blue-100/blue-900` halo.
  - The choice-ring dark color (blue-300) differs from `--canon-theme-focus` dark (blue-400), which label-info uses.
- **Hover = halo or one step lighter.** Choice halo 3px `zinc-100/800`. Calendar/strip hover bg `zinc-100/800`, one step lighter than band `zinc-200/700`. Time/fields border `zinc-200→zinc-400` (dark `700→500`).
- **Disabled greys** reuse the same pairs: empty `zinc-200 / zinc-600`, filled `zinc-300 / zinc-600` with a `zinc-100 / zinc-400` mark (choice, switch, slider). Composite widgets use `opacity: 0.45` instead (swatch, calendar, strip, color popup).
- **Invalid:** idle line `red-400 / red-500`. Hover/active `red-600 / red-400` + `red-100 / red-900` halo. Slider fill `red-600 / red-500`.
- **Surfaces:** popover = transparent border + `hairline edge` + `shadow-floating`. Inline panel = 1px `zinc-300 / zinc-800|600` border, plus a dark-only `0 0 0 1px rgb(0 0 0/.5)` (calendar, strip). Dividers = `hairline solid --canon-theme-rule`.
- **Motion vocabulary:**
  - 0.12s for color/border/shadow.
  - 0.08s press-in → 0.2s `cubic-bezier(0.23,1,0.32,1)` release.
  - 0.3s `cubic-bezier(0.34,1.56,0.64,1)` spring (switch only).
  - 0.3s `cubic-bezier(0.3,0.7,0.1,1)` anchored glide (tabs, segmented, strip).
  - 0.2s `cubic-bezier(0.2,0,0,1)` content turn/grow, 12px slide.
  - Every component honors `prefers-reduced-motion` (fade only or none).
- **Hover rules are always inside `@media (hover: hover)`.** State is swapped via private custom properties (`--_line`, `--_fill`, `--_halo`, `--_band`...) rather than per-state property overrides. This maps well to Vuetify CSS variables.
- **Mismatch with the brief:** `theme/track-mark.css` is not slider marks. It is the Segmented/Tabs sliding card. Slider marks are datalist rules in core/slider.css + theme/slider.css:48-57.

## D. Data, layout & navigation

Size-scaled helper tokens referenced below (sm / md / lg; xs→sm, xl/2xl→lg). md is default.

| token | sm | md | lg | source |
|---|---|---|---|---|
| control block-size | 32 | 40 | 48 | base |
| control padding-inline | 8 | 10 | 12 | base |
| control font-size | 12 | 14 | 16 | base |
| icon size | 16 | 20 | 24 | base |
| input-inset | 4 | 6 | 8 | `text-input.css:14-30` |
| input-radius | 4 | 8 | 12 | `text-input.css:17-33` |
| input-line-height / button-line-height | 16 | 20 | 24 | `text-input.css:18-34`, `base.css:475-495` |
| input/button tracking | -0.007em | -0.006em | -0.004em | same |
| button-gap | 2 | 2 | 0 | `base.css:472-492` |
| button-label-inset | 4 | 6 | 8 | `base.css:473-493` |
| button-radius | 4 | 8 | 12 | `base.css:474-494` |
| form-gap | 12 | 16 | 20 | `form-layout.css:19-31` |
| shell-inset | 8 | 12 | 16 | `app-shell.css:24-32` |
| shell-brand-gap | 10 | 12 | 16 | `app-shell.css:25-33` |

Line tokens: `rule` = black 10% / white 10%; `rule-faint` = black 7% / white 8%; `edge` = black 12% / white 12%; `hairline` 1px (0.5px at ≥2dppx) (`base.css:290-293,329`). Focus ring everywhere = `0 0 0 2px ring-offset, 0 0 0 3px focus` + `outline: 2px solid transparent` (forced-colors fallback). ring-offset = white / zinc-900.

Density: `--canon-density` compact -1 / comfortable 0 / spacious 1; **absent ⇒ 0** in table & description list (`core/base.css:423-425`).

---

### Table
Anatomy: `.canon-table` (frame, scrolls x) > `table` > `caption`? `thead th` / `tbody tr td` / `tfoot`; cell attrs `data-align="center|end"`, `data-wrap="none|normal"`; frame attrs `data-lines="grid|none"`, `data-striped`, `data-hover`, `data-frame="none"`.

**Sizes**
| | sm | md | lg | formula / cite |
|---|---|---|---|---|
| frame radius | 8 | 12 | 16 | `theme/table.css:20-29` |
| header row height | 32 | 40 | 48 | `= control` `:90` |
| body/foot row, compact | 32 | 40 | 48 | `control + (density+1)*16` `:33,86` |
| body/foot row, comfortable (default) | 48 | 56 | 64 | |
| body/foot row, spacious | 64 | 72 | 80 | |
| cell padding-inline | 12 | 16 | 20 | `control-pad + input-inset` `:82` |
| cell padding-block | 7 | 7 | 7 | `calc(0.5rem - 1px)` — 8 less the 1px row line `:81` |
| caption padding | 12 block / 12·16·20 inline | | | `:117-118` |

- Font: control font-size (12/14/16), `tabular-nums` (`core/table.css:21-22`); line-height & tracking = input's (16/20/24; -0.006em md) `theme:75-76`.
- Body text: zinc-900 / white, weight 400 `:74,83`.
- Header (`thead th`): weight 500, color zinc-500 / zinc-400 (muted), `white-space: nowrap`, NOT uppercase, no own background in plain Table `:92-93`; `border-block-end: hairline rule` `:91`.
- Footer cells: weight 500, hairline rule above `:97-101`.
- Caption: start-aligned, weight 600, hairline rule below `:116-120`.
- Row separators: `border-block-start: hairline solid rule` on every row after the first (`tr + tr > *`) `:95-98`. `data-lines="none"` drops them `:103-105`. `data-lines="grid"` adds `border-inline-start: hairline rule` between cells `:107-108`.
- Cells: `vertical-align: middle`, start-aligned; numeric columns use `data-align="end"`; `border-collapse: separate; border-spacing: 0` (`core:19-20,27-40`).
- Avatar in cell: margin-inline-end 8 `:111-114`.

**Frame / surfaces**
- bg `--_bg` = white / zinc-900 `:34`; border 1px transparent (forced-colors only) + ring `box-shadow: 0 0 0 hairline edge` (12%) — no drop shadow `:38-41`.
- `data-frame="none"`: no border/radius/shadow, transparent bg (`--_bg: Canvas`) `:43-49`.
- Focus-visible on scrollable frame: Button ring `:69-72`.
- `--_line` (zinc-200 / zinc-700) is declared `:32` but unused — all lines use `rule`.

**Row fill states** (single property chain so they never fight: `bg = hovered ?? picked ?? striped ?? transparent`) `:53-55`
| state | light | dark | cite |
|---|---|---|---|
| stripe (even rows, `data-striped`) | zinc-50 | `color-mix(in srgb, zinc-800 50%, zinc-900)` | `:35,57` |
| hover (`data-hover`, hover-capable only) | zinc-100 | zinc-800 | `:36,60-63` |
| selected (Data Table) | zinc-50 | zinc-800 | `:37` |
| selected on striped table | zinc-100 | zinc-800 | `:66-68` |
Priority: hover > selected > stripe. Motion: `background-color 0.12s` `:55`.

### Data Table
Anatomy: `.canon-data-table` (flex column) > `.canon-data-table-toolbar` (search `.canon-text-input[type=search]`, `[data-panel=filters|columns]` buttons, `[data-align=end]`) · `.canon-data-table-chips` > `.canon-data-table-chip` (`-chip-edit > span*`, `-chip-values`, `-chip-remove`) · `.canon-table` (th[aria-sort] > `button.canon-data-table-sort`; `[data-column=select|actions]`; `[data-pin]`/`[data-pinned=start|end]`/`[data-pin-edge]`; `.canon-data-table-filter` header button; `.canon-data-table-edit > .canon-data-table-value`; `.canon-data-table-truncate`; `tbody[data-canon-skeleton]`; `.canon-empty-state`) · `.canon-pagination` · `.canon-data-table-bulk[popover]` (`-bulk-clear`, `-bulk-count`, `.canon-separator`, actions). Popovers: `.canon-data-table-filters`, `-filter-panel` (`-filter-rows > -filter-row`, `-filter-footer`), `.canon-data-table-columns > .canon-data-table-column` (`-grip`, choice, pin button).

**Layout**
- Gap between toolbar / chips / table / pagination: 16 `theme/data-table.css:21`.
- All cells `nowrap` unless `data-wrap="normal"` (`core:41-43`); `.canon-data-table-truncate` max 16rem (256) default (`--canon-truncate`), ellipsis; `data-cut="middle"` keeps end (`core:80-102`).

**Toolbar & search** (`theme:364-369`)
- items gap 12; search field width 12.5rem (200); `data-align="end"` → `margin-inline-start:auto`.

**Filter chips** (`theme:370-436`)
- chips row-gap 8, column-gap 16.
- chip = joined segments: each `min-block-size: control*0.75` (24 / 30 / 36), padding-inline 8 (remove: 4), border 1px `--_seg-line` zinc-200 / zinc-700, bg `--_seg-bg` zinc-50 / zinc-800, text zinc-900 / white, input type (control size, input LH/tracking); segments overlap by -1px.
- radius: only outer ends 2px (0.125rem).
- remove “x” icon (icon-size) zinc-500 / zinc-400 → hover/focus zinc-900 / white.
- hover / focus segment bg zinc-100 / zinc-700. Focus: ring, z-index 1, radius 2.
- values gap 4.

**Header filter button** `.canon-data-table-filter` (`theme:438-460`): list-filter icon, icon-size, margin-inline-start 8, radius 2, color inherits header (muted) → hover/focus/expanded zinc-900 / white.

**Sort indicator** (`theme:23-56`)
- sort button: gap 8 label→arrow, radius 2, inherits header type (500, muted).
- arrow = icon-size mask: unsorted `arrow-down-up`; sorted `arrow-up`, descending rotated 0.5turn with `rotate 0.2s ease`.
- hover / focus text zinc-900 / white, `color 0.12s`. No separate “sorted column” cell tint.

**Selection**
- select column width = min-width = `control + 16` (48 / 56 / 64 = comfortable row height), padding-inline 0, checkbox centered (`theme:58-62`, `core:44-59`).
- selected row: `--_picked: --_selected` (zinc-50 / zinc-800; zinc-100 on striped) via `tr:has(:checked)` `theme:202-204`.
- actions column: `inline-size:0` (shrink), padding-inline 8 `theme:63-65`.

**Sticky header & pinned columns**
- thead cells sticky top 0, z 2, bg = table bg (`--_bg`) `core:72-79`, `theme:207-209`.
- pinned cells sticky at `--canon-pin-offset`, z 1; pinned header z 3 (`core:60-79`).
- pinned cells paint `hovered ?? picked ?? striped ?? bg`, `background-color 0.12s` `theme:212-215`.
- start-pinned data column: `border-inline-end: hairline rule`; end-pinned: `border-inline-start: hairline rule`; select column gets the line only while scrolled (`[data-scroll-start] [data-pin-edge]`) `theme:220-226`.
- scroll shadow = hard 4px band, no blur: `box-shadow: ±4px 0 0 --_band`, band = black 5% / white 5% (mirrored in RTL) `theme:20,227-238`.
- pinnable header `th[data-pin]`: padding-inline-end `cell-pad + icon + 8` = 36 / 44 / 52; pin icon at end inset 12/16/20, vertically centered, currentColor `theme:239-251`.

**Inline edit cell** (`theme:76-201`)
- cell padding 0; `.canon-data-table-edit` fills: min-height control, padding-inline `control-pad + input-inset - 1` = 11/15/19, border 1px transparent, radius input-radius (4/8/12), gap 8.
- hover (not disabled): border zinc-200 / zinc-700; focus: same border + ring. `border-color 0.12s, color 0.12s`.
- status mark 16×16 at end (absolute at 3px from end while idle): saving = loader spin 0.8s linear, value zinc-400 / zinc-500; saved = check green-600 / green-400, fades 0.2s; failed = border red-400 / red-500 + circle-alert red-600 / red-400; changed = 6px amber-500 / amber-400 dot at top-end 4px.
- choice cell saving: opacity 0.6.
- editor overlay `[data-canon-editor]`: absolute, z 4, full cell width, vertically centered; select/combobox/date `max-content`, min 100% (`core:140-156`).

**Loading / empty**
- `aria-busy="true"` swaps in `tbody[data-canon-skeleton]`: line skeletons width `--canon-skeleton-length` (default 80%), square for select, circle for actions (`theme:255-261`).
- empty state padding-block 64 (4rem) `theme:262-264`.

**Bulk bar** (floating popover) `theme:293-339`, `core:204-229`
- position fixed, centered, bottom `--canon-bulk-offset` 24 (1.5rem); width min `min(100vw-32, 768)`, max `min(100vw-32, 1024)`.
- padding 7 + 1 transparent border = 8; items gap 8; radius `input-radius + 4` = 8 / 12 / 16 (comment says “12/16/20” — code gives 8/12/16).
- surface: white / zinc-900; `box-shadow: 0 0 0 hairline edge, shadow-floating`; text zinc-900 / white, control font-size, input LH.
- count: weight 500, padding-inline 4 (0 start after Clear), tabular-nums.
- vertical separator before actions: stretch, margin-block 4, pushes actions to end; `<640px` window → full-width 1px horizontal line, margin 4 0.
- motion: enter/exit opacity 0→1 + translateY 8→0, 0.15s ease-out (display/overlay allow-discrete).

**Filter & columns popovers** (`theme:463-525`)
- filter panels max-width `min(640, 100vw-32)`; filter row gap 8; rows gap 16; fields min-width 192; footer gap 8, margin-top & padding-top form-gap (12/16/20) + hairline rule top.
- columns popover padding 4; separator margin-block 4; column row gap 4, padding 4, radius button-radius; dragging bg zinc-100 / zinc-800.
- grip zinc-400 / zinc-500 → hover/focus zinc-900 / white, radius 2.
- pin toggle: fg zinc-500 / zinc-300, hover bg zinc-50 / zinc-800, pressed bg zinc-100 / zinc-700, border zinc-200 / zinc-600; unpinned toggle opacity 0 until row hover/focus-visible.

**Motion summary**: row/pinned bg 0.12s; sort color 0.12s, arrow rotate 0.2s ease; bulk 0.15s ease-out; edit mark fade 0.2s. All `none` under reduced motion.

### Description List
Anatomy: `dl.canon-description-list` > `div` (item) > `dt` (term, optional `.canon-icon`), `dd`+, optional action (Button/Link). Attrs: `data-columns="2|3"`, `data-label="start"`, `data-lines="none"`.

- Columns: auto-fill, each ≥ 16rem (256), column-gap `--canon-description-list-gap` 32 (2rem) (`core/description-list.css:17-32`).
- Item: `min-block-size = control + (density+1)*16` — same as Table body rows: compact 32/40/48, comfortable 48/56/64, spacious 64/72/80 (`theme/description-list.css:18,29`); padding-block 7; column-gap 16; `align-content: center` `:24-32`.
- Lines: `border-block-start: hairline rule` on every item; first row hidden via `clip-path: inset(1px -1rem -1rem -1rem)` `:31-37`; `data-lines="none"` removes `:38-43`.
- Type: control font-size, input LH/tracking; `dt` weight 500 zinc-500 / zinc-400 (= table header); `dd` zinc-900 / white `:19-23,44-47`.
- Stacked: dd 4px under dt; dd+dd 4 `:48-53`.
- Empty `dd` → “—” zinc-400 / zinc-500 `:54-56`, `core:49-51`.
- Icon term: dt is a control-sized square (32/40/48) with centered icon zinc-500 / zinc-400; item gap 8; first dd offset `(control - LH)/2` = 8 / 10 / 12 `:67-82`.
- `data-label="start"` (container ≥ 32rem / 512): term beside value; action margin-block `(LH - control)/2` = -8/-10/-12 `:83-91`.
- Action: grid col -2, centered `core:44-48`.

### Filter Bar
Anatomy: `form.canon-filter-bar[role=search]` > `.canon-text-input` · `.canon-filter-bar-facet` > `button.canon-filter-bar-button` (`.canon-icon`?, `-label`, `-value`) + `.canon-popover` · `.canon-toggle-chip` · `[command=--canon-clear]` · `.canon-filter-bar-count` · `.canon-filter-bar-apply`; `data-active` on bar/facet; `[data-align=end]`.

- Row: flex wrap, gap 8 (rows and items) `core/filter-bar.css:14-19`.
- Search width 16rem (256), max 100% `theme/filter-bar.css:19-22`; chips height = control `:23-25`.
- Facet button (`:26-43`): height control (32/40/48); pill radius 999; border 1px; weight 500, control font-size, button LH/tracking; gap button-gap (2/2/0).
  - padding-inline start `control-pad - 1 + label-inset` = 11 / 15 / 19; end `control-pad - 1` = 7 / 9 / 11; with leading icon start = 7 / 9 / 11 `:33,44-46`.
  - label→value: no gap (`margin -button-gap`) `:51-53`.
  - chevron ::after icon-size, margin-start label-inset, rotates 180° open, `rotate 0.15s` `:57-69`.
- States (fg / icon / bg / line):
  | state | light | dark |
  |---|---|---|
  | rest | zinc-700 / zinc-500 / transparent / zinc-200 | zinc-200 / zinc-400 / transparent / zinc-700 |
  | hover | bg zinc-50, line zinc-300 | bg zinc-800, line zinc-600 |
  | open / :active | bg zinc-100 | bg zinc-700 |
  | has value (`data-active`) | white on zinc-900 (line = bg) | zinc-900 on white |
  | value + hover | zinc-800 | zinc-200 |
  | value + open/active | zinc-700 | zinc-300 |
  (`:27-30,70-94`); forced colors: Highlight.
- Focus: ring w/ explicit offset white / zinc-900, outline-offset 2 `:95-99`.
- Popover: grid gap 8, min-width 12rem (192) `:100-104`.
- Count: zinc-500 / zinc-400, control size, tabular-nums `:110-114`.
- Motion: bg/border/color 0.12s; Clear-all fades in 0.15s ease-out via `@starting-style` `:42,133-140`.

### Pagination
Anatomy: `nav.canon-pagination` > `.canon-pagination-summary` · `.canon-pagination-size` (label + Select) · `ol > li > a|button` (`-first`, `-prev`, page numbers `[aria-current=page]`, `.canon-pagination-gap`, `.canon-pagination-current` “Page 2 of 30”, `-next`, `-last`; `.canon-pagination-label`) · `form.canon-pagination-jump`. `data-display="label"` shows arrow words. `.canon-load-more` > `-status` + Button.

- Outer row gap 8 row / 16 column; info pushes list to end (`margin-inline-start:auto`) (`theme/pagination.css:23`, `core:28-30`).
- List gap 8 `:28-30`.
- Page item: min square control (32/40/48) `core:40-41`; padding-inline `label-inset - 1` = 3/5/7; border 1px transparent; radius button-radius 4/8/12; weight 500; button LH/tracking; tabular-nums `:31-37`.
- Arrow buttons: gap button-gap; label mode padding-inline `control-pad - 1` = 7/9/11 `:38-47`.
- Colors:
  | part | light | dark |
  |---|---|---|
  | numbers (`--_strong`) | zinc-900 | white |
  | arrow icon | zinc-500 | zinc-300 |
  | hover bg (not current) | zinc-100 | zinc-800 |
  | pressed bg | zinc-200 | zinc-700 |
  | current page | border zinc-200, no fill | border zinc-700 |
  | disabled / no href | zinc-300 | zinc-600 |
  | ellipsis gap | zinc-400 | zinc-400 (not switched) |
  | info (summary, labels) | zinc-500 | zinc-400 |
  (`:19-22,61-80,92`). Arrow icon → strong on hover.
- “Page X of Y”: padding-inline label-inset, weight 400, input type `:95-100`. Summary/labels weight 400, input type, nowrap `:101-107`.
- Size/jump groups gap 8; jump input min 2.5em, `field-sizing: content`, centered `:108-117`.
- Focus: ring. Motion: bg/color 0.12s.
- Load more: gap form-gap (12/16/20); status zinc-500 / zinc-400, input type, tabular `:133-142`.

### App Shell · Sidebar · Top Bar
Anatomy: `.canon-app-shell` (grid areas `"sidebar bar" "sidebar main"`) > `.canon-sidebar` (`-header` > `-brand` (img/svg + `-brand-name`) + toggle Button; `-body` > Nav Lists; `-footer`) · `header.canon-top-bar` (`-start`, `-end`) · `main`. Sidebar `data-display="icon"` = rail; `data-drawer="open|closed"`; toggle `[command=--canon-toggle-sidebar]`.

**Sizes**
| | sm | md | lg | formula / cite |
|---|---|---|---|---|
| sidebar width | 264 | 264 | 264 | `--canon-sidebar-width: 16.5rem` (core default 16rem overridden) `theme/app-shell.css:40` |
| rail width | 48 | 64 | 80 | `control + 2*inset` `:80-82` |
| sidebar padding-block | 8 | 12 | 16 | inset `:60` |
| sidebar children padding-inline | 12 | 16 | 20 | `inset + 4` (end −1 for its line) `:65-69` |
| rail children padding-inline | 8 | 12 | 16 | inset (end −1) `:83-86` |
| gap header→body→footer | 24 | 32 | 40 | `control - 8` `:59` |
| sidebar header min-height | 32 | 40 | 48 | control, gap 8 `:92-95` |
| brand mark | 24 | 32 | 40 | `control - 8` `:111-114` |
| brand mark→name gap | 10 | 12 | 16 | brand-gap `:103` |
| top bar min-height | 48 | 64 | 80 | `control + 2*inset` `:122` |
| top bar padding | 8 / 16 / 7 | 12 / 20 / 11 | 16 / 24 / 15 | top inset, inline inset+8, bottom inset−1 `:123` |
| top bar item gap (and start/end groups) | 12 | 16 | 20 | `inset + 4` `:121,128-131` |
| sticky offset under bar | 48 | 64 | 80 | `banners + control + 2*inset` `:49-51` |

- Rail width equals bar height, so the corner is square.
- Sidebar body: `margin-block -4; padding-block 4` (focus-ring room), thin scrollbar; rail hides scrollbar `:71-75,89-91`.
- Brand: padding-inline 4, radius button-radius, control font-size, weight 600, button LH/tracking `:102-110`.

**Surfaces & lines**
- Page bg inside shell `--canon-theme-page-bg` = zinc-50 / zinc-950 (outside shell = paper: white / zinc-950) `:41,45-48`.
- Sidebar & top bar: white / zinc-900, text zinc-900 / white `:62-63,125-126`.
- Lines: sidebar `border-inline-end`, top bar `border-block-end`: `hairline solid rule-faint` (7% / 8%) — a step lighter than in-content `rule` `:61,124`.
- No shadow on docked sidebar/bar.

**Drawer (narrow)**: container `< 40rem` (640) shell width `:167-171`; drawer z 4, overlaps via `margin-inline-end: -width`, `shadow-overlay`, slides `translate -100%` 0.2s ease `:172-181`, `core:69-72`; scrim `rgb(0 0 0 / 0.3)` over shell, z 3, fade 0.2s `:183-195`.

**z-index**: sidebar 3, top bar 2, drawer 4, scrim 3 (`core:34,41,70`).

**Motion**: rail collapse animates `inline-size` + `padding` 0.2s ease (`interpolate-size: allow-keywords`) `:57-58,66`; toggle chevron rotates 180° 0.2s ease `:153-158`. Count on icon button hangs `-5px` past top-end `:206-209`.

### Nav List
Anatomy: `nav.canon-nav-list` > `.canon-nav-list-heading`? + `ul > li` > `a.canon-nav-list-item` (`.canon-icon`, `.canon-nav-list-label`, `.canon-tag`?, `.canon-count`?) [+ action `.canon-button`]; sections `details.canon-nav-list-section > summary.canon-nav-list-item + ul`. Current: `aria-current="page"` or `[data-current]`. `data-display="icon"` = rail.

| | sm | md | lg | formula / cite |
|---|---|---|---|---|
| item min-height | 32 | 40 | 48 | control `theme/nav-list.css:52` |
| item padding-inline | 8 | 10 | 12 | `(control - icon)/2` (icon as far from edge as from top) `:53` |
| item radius | 4 | 8 | 12 | button-radius `:54` |
| gap between items | 8 | 10 | 12 | `control/4` `:26,35` |
| icon→label gap | 6 | 8 | 8 | `button-gap + label-inset` `:28,51` |
| sub-list gap & margin-block | 8 | 12 | 16 | `control/2 - 8` `:27,121-123` |
| sub-list indent | 22 | 28 | 32 | `icon + label-gap` (aligns with labels) `:124` |
| row action margin-end | 0 | 4 | 8 | `(control - 32)/2` `:127-129` |

- Type: control font-size, button LH/tracking, weight 400; text zinc-900 / white `:29-32,55`.
- Icon: zinc-500 / **white** (dark icons not muted) `:58-60`.
- Hover: zinc-50 / `color-mix(zinc-800 50%, transparent)` `:61-65`.
- **Current**: bg zinc-100 / zinc-700, weight 500, icon inherits text color (zinc-900 / white) `:66-72`. Open section's current summary unfilled `:74-76`.
- Focus: ring w/ offset white / zinc-900, outline-offset 2 `:77-81`.
- Heading: 10px (0.625rem), weight 600, LH 16, tracking 0.01em, **uppercase**, muted zinc-500 / zinc-400, padding 8 block / control-pad inline; 16px above each group after the first `:37-49`.
- Count: plain number 12px, weight 500, muted, tabular, at row end (hidden while row action visible) `:94-102,135-137`.
- Tag: forced small (20px tall, 12px text, 2px radius) `:84-93`.
- Section chevron: icon-size, muted, -90° closed → 0° open, `rotate 0.15s` `:103-119`.
- Row action button: opacity 0 until li hover/focus-within (always on touch) `:130-134`.
- Rail: items square (width = control, padding 0, centered); sub-pages in a floating panel: margin-start 16, min-width 192, gap 2, padding 3+1 = 4, radius `input-radius + 4` = 8/12/16, white / zinc-900, `0 0 0 hairline edge, shadow-floating`, z 10 (`:139-161`, `core:69-84`).
- Motion: bg/color 0.12s.

### Page Header
Anatomy: `header.canon-page-header` (grid `"trail trail" "title actions" "description description"`) > `.canon-page-header-back` | `.canon-breadcrumb` · `.canon-page-header-title` > `h1` + status/rename Button · `.canon-page-header-description` · `.canon-page-header-actions`. `data-sticky`.

| | sm | md | lg | cite |
|---|---|---|---|---|
| title size / line-height | 20 / 28 | 24 / 32 | 30 / 36 | `theme/page-header.css:17-29` |
| padding-block | 8 | 12 | 16 | shell-inset `:34` |
| trail → title | 8 | 12 | 16 | shell-inset `:39` |
| title → description | 6 | 8 | 10 | `inset/2 + 2` `:78` |
| button-in-title margin-block | -2 | -4 | -6 | `(title-LH - control)/2` `:74-76` |

- Title: weight 600, tracking -0.015em, zinc-900 / white; parts gap 8 `:65-71,35`.
- Title↔actions column-gap 16; actions gap 8, right-aligned `:33,84-86`. Narrow (< 24rem / 384 own width) actions wrap below, margin-top 6/8/10 `core:58-65`, `theme:87-91`.
- Back link & description: control font-size, input LH/tracking, muted zinc-500 / zinc-400; back gap 4, radius 2, icon 1.15em, hover/focus zinc-900 / white, `color 0.12s` `:41-64,77-83`.
- Sticky: bg page-bg, z 1, top = sticky-offset − tuck, bleeds across `--canon-page-inset`; bottom `hairline rule-faint` line appears only when stuck (scroll-state), `opacity 0.15s` (`core:66-73`, `theme:95-111`).
- Inline rename: margin-inline -4, padding 0 4, radius button, bg zinc-100 / zinc-800 + focus ring `:115-123`.

### Split Pane
Anatomy: `.canon-split-pane` > pane · `.canon-split-pane-handle[role=separator][aria-orientation]` · pane. `--canon-split-size` (default 50%); `data-state="resizing"`.

- Grid `minmax(0, size) auto minmax(0,1fr)`; panes scroll independently (`core/split-pane.css:13-29`).
- Line: 1px, zinc-200 / zinc-800 `theme/split-pane.css:14-24`.
- Hit area: 8px (::before ±4px) `:25-34`.
- Grip pill (::after): 4×24, radius 2, zinc-300 / zinc-600, centered (horizontal handle: 24×4) `:35-53`.
- Hover / focus / dragging: line + grip blue-500 / blue-400 (literal blue, not `--focus`), grip grows to 32 long `:60-90`.
- Motion: bg 0.12s; grip size 0.15s `cubic-bezier(0.2,0,0,1)`; hover transition-delay 0.15s (no flash) `:45,54-59`.
- z-index handle 1; resizing: `user-select:none`, panes `pointer-events:none` (`core:30-53`).

### Breadcrumb
Anatomy: `nav.canon-breadcrumb > ol > li > a` (… `[aria-current=page]`), optional `button.canon-breadcrumb-more` (opens Menu). Separators = `li + li::before`.

- Row min-height control (32/40/48), no side padding `theme/breadcrumb.css:29`.
- Type: control font-size, weight 400, input LH/tracking `:31-34`.
- Gap (items and inside li, around separators) 6 / 8 / 8 `:14-23,36-39`.
- Separator: chevron-right mask, icon-size, quiet color; mirrored RTL `:40-48`.
- Colors: link & more zinc-500 / zinc-400; current, separators, link icons zinc-400 / zinc-500 (quieter than links); hover/focus/expanded zinc-900 / white `:26-28,53-81`.
- Radius 2 on links (focus ring shape); ring offset white / zinc-900 `:49-51,67-70`. Motion color 0.12s.

### Tabs
Anatomy: `.canon-tabs` > `.canon-tabs-list[role=tablist]` (or `nav.canon-tabs-list`) > `.canon-tab` (`.canon-icon`, `.canon-tab-label`, `.canon-count`) + `.canon-tabs-more`; `.canon-tabs-panel`. Selected: `aria-selected="true"` / `aria-current="page"`. `data-fill`, `data-display="icon"`.

**Style = segmented track with raised card, NOT an underline indicator.**

| | sm | md | lg | formula / cite |
|---|---|---|---|---|
| track inset | 3 | 3 | 3 | padding 2 + 1px transparent border `theme/tabs.css:28-30` |
| track radius | 6 | 10 | 14 | `button-radius + 2` `:31` |
| track total height | 32 | 40 | 48 | = control |
| tab height | 26 | 34 | 42 | `control - 6` `:44` |
| tab radius | 3 | 7 | 11 | `button-radius - 1` `:46` |
| tab padding-inline | 8 | 10 | 12 | control-pad `:45` |
| gap between tabs | 2 | 2 | 2 | `:27` |
| icon/label/count gap | 6 | 6 | 6 | `:43` |
| panel margin-top | 12 | 16 | 20 | `inset + 4` `:106-109` |

- Track: zinc-100 / zinc-800, width fit-content (full with `data-fill` or folding) `:25,32-37`.
- Tab type: control font-size, weight 500, button LH/tracking `:49-52`.
- States:
  | state | fg light / dark | bg |
  |---|---|---|
  | rest | zinc-500 / zinc-400 | transparent |
  | hover | zinc-950 / white | — |
  | :active | — | zinc-200 @60% / zinc-700 @60% (color-mix w/ transparent) |
  | selected | zinc-950 / white | card white / zinc-700 + shadow |
  | disabled | zinc-400 / zinc-600 | — |
  (`:41,68-88`)
- Selected card shadow: `0 0 0 1px black 6% / white 6%`, `0 1px 2px black 8% / black 40%`, `0 1px 3px black 5% / black 20%` `:23-24`.
- Count in tab: zinc-200 bg / zinc-600 text (dark zinc-700 / zinc-300); on selected inverted zinc-900 / white (dark white / zinc-900) `:90-98`.
- Icon-only tabs: square `control - 6` `:64-67`.
- Focus: ring, z 1, outline-offset 2 `:99-105`; panel focus ring, radius button.
- Motion: bg 0.12s, color 0.15s, shadow 0.12s `:53`. Card glides between tabs via anchor positioning: one `::before` on the track, `top/right/bottom/left 0.3s cubic-bezier(0.3, 0.7, 0.1, 1)` (`theme/track-mark.css:13-61`; shared with Segmented Control). Fallback: each tab paints its own card.
- More button: same as tab, margin-end 3, reserves `--canon-tabs-more-size` at strip end.

---

### Live site cross-check
Fetched live `reference/table.html`, `tabs.html`, `app-shell.html`, `nav-list.html`. They match the repo but give only prose: table header 32/40/48, text 12/14/16, radius 8/12/16, comfortable +16 / spacious +32; tabs “raised card … glides”; shell narrow breakpoint 640px; nav rows control-tall, quarter-control apart. No conflicts with repo CSS. One mismatch is inside the repo itself: the bulk-bar comment says corners are 12/16/20, but the code (`input-radius + 4`, same as Popover) gives 8/12/16.

### Cross-component patterns noticed
- **Surface stepping (light / dark):** page in shell zinc-50 / zinc-950 → chrome (sidebar, top bar) and content panels (table frame, cards, bulk bar, popovers) white / zinc-900. Chrome lines use `rule-faint` (7% / 8%). In-content lines use `rule` (10%). Floating or framed edges use a `edge` (12%) ring drawn as `box-shadow: 0 0 0 hairline` (not a border; a transparent 1px border is kept for forced colors). Floating surfaces add `shadow-floating`, drawers `shadow-overlay`. Docked chrome has no shadow.
- **Tone ladder for interactive fills (light → dark):** hover zinc-50 → selected/pressed zinc-100 → stronger press zinc-200. Dark mirrors this on zinc-800 / zinc-700. Table hover is one step stronger (zinc-100) because stripes and selection already use zinc-50. Nav hover in dark is zinc-800 at 50%.
- **“Current item” recipe:** neutral fill one step up (nav zinc-100 / zinc-700; tab white card / zinc-700 with ring+shadow), weight 400→500, icon goes from muted to text color. Pagination current is the exception: zinc-200 / zinc-700 outline, no fill. Breadcrumb current goes *quieter* (zinc-400). Active filter facet inverts (zinc-900 fill, white text).
- **Muted text** is always zinc-500 / zinc-400: table headers, dt, descriptions, counts, back link, breadcrumb links. Quieter text is zinc-400 / zinc-500 (empty values, separators, current crumb). Strong text is zinc-900 (or zinc-950 in tabs) / white. Hovering muted links moves them to strong text.
- **Heading type ramp:** page title 20/24/30 on 28/32/36, weight 600, tracking -0.015em → table caption at control size, weight 600 → table header / dt at control size, weight 500, muted, sentence case → nav section heading 10px, weight 600, uppercase, tracking 0.01em, muted (the only uppercase heading).
- **Geometry derives from control size:** rows = control + density×16; shell inset 8/12/16 drives sidebar padding, bar height (control + 2×inset = rail width), page-header spacing and tab panel offset (inset + 4). Cell inline padding = control-pad + input-inset (12/16/20) so cell text lines up with text-field text.
- **Radii:** button-radius 4/8/12 for items (nav, pagination, brand); +2 for tab track, −1 for tabs; input-radius + 4 (8/12/16) for floating panels; table frame 8/12/16; 2px for inline focus targets (sort, links, chips); 999 for filter pills.
- **Motion:** state colors 0.12s; chevrons and fades 0.15s; structural motion 0.2s ease (rail, drawer, sort arrow); tab card glide 0.3s `cubic-bezier(0.3,0.7,0.1,1)`. Everything turns off under `prefers-reduced-motion`. Hover styles sit inside `@media (hover: hover)`.
- **Focus** is the same everywhere: 2px ring-offset + 1px focus color (3px total), on top of a transparent 2px outline.

## E. Overlays & feedback

Source: `src/css/core/*.css` (mechanics) + `src/css/theme/*.css` (look). Verified: live `https://recepkutuk.github.io/canon/css/canon/canon.css` is byte-identical to repo `css/canon/canon.css`, and every non-blank line of the theme files below appears in it → **repo = live**. Live reference pages (dialog/tooltip/toast) carry prose only, no numbers; no conflicts with CSS.

Size-scale tokens used below (sm / md / lg; md is default unless noted; `xs`→sm, `xl`/`2xl`→lg):

| token | sm | md | lg | src |
|---|---|---|---|---|
| `--canon-theme-input-radius` | 4px | 8px | 12px | text-input.css:17,25,33 |
| `--canon-theme-input-inset` (label inset in rows) | 4px | 6px | 8px | text-input.css:14,22,30 |
| `--canon-theme-input-icon-gap` | 2px | 2px | 0 | text-input.css:16,24,32 |
| `--canon-theme-input-line-height` | 16px | 20px | 24px | text-input.css:18,26,34 |
| `--canon-theme-input-tracking` | -0.007em | -0.006em | -0.004em | text-input.css |
| `--canon-theme-button-label-inset` | 4px | 6px | 8px | base.css:473-493 |
| `--canon-theme-form-gap` | 12px | 16px | 20px | form-layout.css:19-31 |
| `--canon-theme-form-title-size / lh` | 14/20 | 16/24 | 18/28 | form-layout.css:21-34 |
| `--canon-theme-separator-space` | 5.5px | 7.5px | 9.5px | separator.css:14-20 |
| `--canon-theme-shell-inset` | 8px | 12px | 16px | app-shell.css:24-32 |
| panel radius = input-radius + 0.25rem | 8px | 12px | 16px | menu.css:34 |

Shadows (base.css:296-301): raised `0 1px 2px 6%/30%, 0 1px 3px 4%/20%`; floating `0 8px 24px 8%/50%, 0 2px 6px 6%/30%`; overlay `0 24px 48px -12px 18%/60%, 0 4px 12px 6%/30%` (black alpha light/dark).

Every floating/card surface draws its edge as **`box-shadow: 0 0 0 var(--canon-theme-hairline) var(--canon-theme-edge)`** (1px, 0.5px at ≥2dppx; edge = black/white 12%) plus a `1px solid transparent` border that only shows in forced colors. So: border-box size includes a 1px invisible border; paddings are written `calc(X - 1px)` to compensate.

---

### Dialog
Anatomy: `dialog.canon-dialog[data-width=sm|lg]` > (`form`: display:contents) > `.canon-dialog-header` (`.canon-dialog-title` + close `.canon-button`) / `.canon-dialog-body` (> `.canon-dialog-section`*) / `.canon-dialog-footer` (children `[data-align=end]` push right).

**Sizes** (core/dialog.css:16-30)
| width | value | expr |
|---|---|---|
| sm | 400px (25rem) | `inline-size: min(var(--canon-dialog-width), 100% - 2rem)` |
| md (default) | 640px (40rem) | " |
| lg | 896px (56rem) | " |
| max-block-size | `calc(100% - 2rem)` (viewport −32px) | core:18 |
- Centered `margin: auto`; `overflow: hidden`; open → `display:flex; column` (core:25-28). Body `flex:1 1 auto; min-block-size:0; overflow:auto; overscroll-behavior:contain` (core:54-59). Header/footer `flex:none`.
- `html:has(.canon-dialog:modal) { overflow:hidden }` — page scroll lock (core:69-71).

**Surface** (theme/dialog.css:18-28)
- radius **24px** (1.5rem) :20
- bg `light-dark(white, zinc-900)` :21 (note: dark = zinc-900, not paper zinc-950)
- shadow `hairline edge, --canon-theme-shadow-overlay` :22
- text `light-dark(zinc-900, white)` :23; font `--canon-control-font-size` (14px md), lh `input-line-height` (20px), tracking input :24-26
- border `1px solid transparent` :19

**Backdrop** (:33-36): `light-dark(rgb(255 255 255 / .85), rgb(9 9 11 / .75))` = paper-ish white 85% / zinc-950 75%; `backdrop-filter: blur(4px)`. (Light mode backdrop is a *white* wash, not a dark scrim.)

**Header** (:51-61): grid `minmax(0,1fr) auto`, align center; `column-gap: 16px`; padding-block `16px / calc(16px - 1px)=15px`; padding-inline `24px start / 16px end`; `border-block-end: hairline solid --canon-theme-rule`. Height = 16 + 40 (md button) + 15 + 1 = **72px**. No close button → `min-block-size: calc(control-block-size + 2rem)` = 72px (md) :58-61.
**Title** (:62-67): 16px / 24px lh, weight 600, tracking -0.004em; margin 0 (core:51).
**Body / section** (:69-82): `display:grid; align-content:start; gap: 24px; padding: 24px`. Body holding sections → gap 0, padding 0; sections stack with `border-block-start: hairline solid rule` between.
**Footer** (:83-87): flex wrap, align center; `gap: 12px`; padding `23px 24px 24px` (top = 24−1); `border-block-start: hairline rule`. Height = **88px** with md buttons (comment :50).

**Motion** (:27-49, :116-121)
| state | props | dur | easing |
|---|---|---|---|
| open (via `@starting-style`) | opacity 0→1, `scale .98→1` | 0.15s | ease-out |
| close (`:not([open])`) | opacity→0, scale→.98 | 0.15s | ease-out |
| backdrop open/close | opacity 0↔1 | 0.15s | ease-out |
| display/overlay | `allow-discrete` | 0.15s | — |
| reduced motion | opacity only (scale dropped) | 0.15s | ease-out |

### Drawer (dialog `[data-side=start|end]`)
- core/dialog.css:77-94: `--canon-drawer-width` sm **320px**/md **480px**/lg **640px**; `inline-size: min(width, 100% - 3rem)` (always ≥48px of page visible); `block-size: calc(100% - 2*inset)`; margin = `--canon-drawer-inset`; end → `margin-inline-start:auto`.
- theme :93-115: `--canon-drawer-inset: 8px` (floats 8px from top/side/bottom); same panel look as dialog (24px radius **all corners**, hairline, overlay shadow, same backdrop+blur).
- Motion: `translate 0.25s ease-out` from `calc(100% + 2*8px)` off its edge (RTL mirrored :104-105, :113-114); no fade/scale on panel (opacity 1, scale none :98-101); backdrop fades 0.15s. Reduced motion: `transition: none` on drawer (appears instantly), backdrop still fades :120.

### Command Palette
Anatomy: `dialog.canon-command-palette` > `.canon-command-search` (`.canon-icon` + `input`) / `.canon-command-list` > `.canon-command-group` (`.canon-command-heading`, `.canon-command-item` > icon, `.canon-command-label`, `.canon-command-hint`, `.canon-kbd`; `mark.canon-command-match`) / `.canon-command-empty` / `.canon-command-footer`.
- Size (core/command-palette.css:16-27): `inline-size: min(640px, 100% - 32px)`; `max-block-size: min(480px, 100% - 32px)`; `margin-block: 12vh auto` (pinned near top so it doesn't jump as list shrinks).
- Surface (theme :17-28): radius **16px**; bg white/zinc-900; hairline edge + **overlay** shadow; text zinc-900/white; 14/20 (md).
- Backdrop :29-31: same color as Dialog, **no blur**.
- Search row :33-47: `gap 12px; min-block-size: control+16 = 56px (md)`; padding-inline 20px; hairline rule under; type **16px/24px**; icon `--_muted` (zinc-500/zinc-400); placeholder zinc-400/zinc-500, opacity 1.
- List :48-53: padding 8px; group + group margin-top 4px.
- Heading :54-63: = Menu heading (10px/16 600 uppercase, 0.01em, padding-block 8px, inline pad+inset 16px md, muted).
- Item :64-85: = Menu item (min-h control, pad-inline control, radius input-radius, gap icon-gap); active `[aria-selected=true]` bg zinc-100/zinc-800; label inset 6px md; hint muted; kbd padding 0 4px radius 2px; match font-weight 600 (no highlight bg).
- Empty :89-94: padding 32px 16px, centered, muted. Footer :95-102: gap 16px; padding 10px 16px; hairline rule above; 12px/16px muted.
- Motion: **none** (opens/closes instantly, by design :15-16). Forced colors: active item `outline 2px Highlight, offset -2px`.

---

### Popups (shared floating-surface motion) — theme/popups.css
Applies to `.canon-menu, .canon-popover, .canon-combobox-popup, .canon-color-popup, .canon-calendar` `[popover]` and `select::picker(select)`.
| phase | opacity | scale | dur | easing | src |
|---|---|---|---|---|---|
| closed / closing | 0 | 0.97 | **0.1s** | ease-in | :10-14 |
| open | 1 | 1 | **0.15s** | ease-out | :15-20 |
| entry start (`@starting-style`) | 0 | 0.97 | — | — | :21-26 |
| reduced motion | fade only (scale 1) | — | same | same | :46-59 |
- `display`/`overlay` `allow-discrete` same duration. No transform-origin set (scales from center). No translate/slide.

### Popover
Anatomy: `[popover].canon-popover[role=dialog]` > `.canon-popover-title`, content, optional `.canon-form`.
- Position (core/popover.css:12-25): `position-area: self-block-end span-self-inline-end` (below trigger, start-aligned); fallbacks flip-block, flip-inline, both; `max-block-size: 100%`; `overflow:auto`.
- theme/popover.css:13-27: `margin-block: 4px` (offset from trigger); padding `calc(form-gap - 1px)` → **12/16/20px** total incl. border; `inline-size: max-content; max-inline-size: min(384px, 100vw - 16px)`; radius **8/12/16** (input-radius + 4); bg white/zinc-900; hairline edge + **floating** shadow; text zinc-900/white; font control size, weight 400, input lh/tracking.
- Children `> * + *` margin-top = form-gap (12/16/20) :28-33; `p` margins trimmed :41-46.
- Title :34-40: zinc-900/white, form-title-size 14/16/18px, lh 20/24/28, 600, label tracking.
- Motion: Popups recipe.

### Menu
Anatomy: `[popover].canon-menu[role=menu][data-submenu?][data-menubar?][data-split-button?]` > `.canon-menu-item` (button/a; children `.canon-icon | .canon-avatar`, `.canon-menu-label`, `.canon-kbd`) · `.canon-menu-group[role=group]` > `.canon-menu-heading` · `hr.canon-separator`.

**Panel** (theme/menu.css:27-47)
| prop | value |
|---|---|
| min-inline-size | `max(calc(anchor-size(inline) + 0.5rem), 8rem)` → trigger width +8px, ≥128px |
| margin-block | 4px (gap from trigger) |
| margin-inline | -4px start (shifts left 4px so item text aligns with trigger text) |
| padding | `calc(4px - 1px)` = 4px incl border |
| radius | 8 / 12 / 16 |
| bg / text | white/zinc-900 · zinc-900/white |
| shadow | hairline edge + floating |
| type | control font 12/14/16, weight 400, lh 16/20/24 |
| submenu | min-w 128px; margin-block -4px; margin-inline -4px 0 (overlaps parent edge 4px, first item level with parent item) :43-47 |
| menubar menu | margin-block 8px (menubar.css:44-46) |
| split-button menu | margin-inline 0 (split-button.css:88) |
- Core (core/menu.css:19-41): position-area below/start-span, flips; submenu `self-inline-end span-self-block-end`; `overflow-y:auto`, `max-block-size:100%`; open → flex column.

**Item row** (:51-67)
| | sm | md | lg |
|---|---|---|---|
| min-block-size | 32 | 40 | 48 |
| padding-inline | 8 | 10 | 12 |
| radius | 4 | 8 | 12 |
| gap (icon↔label) | 2 | 2 | 0 |
| label padding-inline | 4 | 6 | 8 |
| icon size | 16 | 20 | 24 |
- Text start = pad + inset = 12/16/20px.
- States: `:focus` (keyboard & hover both move focus via canon.js) and `[aria-expanded=true]` → bg `--_fill` zinc-100/zinc-800 :59-61. No transition on items.
- Icon color `--_muted` zinc-500/zinc-400 :28,65.
- Checked `[aria-checked=true]`: weight 500 + trailing `::after` tick (icon-size, `currentColor`, mask `--canon-theme-icon-tick`) :119-129.
- Submenu trigger `[aria-haspopup]`: trailing chevron-right in icon color; RTL `scale:-1 1` :130-136.
- Danger `[data-intent=danger]`: text red-700/red-300; icon currentColor; fill `light-dark(red-400 @15%, red-500 @20%)` (color-mix over transparent) :139-143.
- Disabled: zinc-400/zinc-600, icons currentColor, bg transparent :146-150.
- Shortcut kbd: padding 0 4px, radius 2px :112-115; Kbd look = 10px/16 600 uppercase 0.01em, text currentColor 55% (dark 80%), chip currentColor 8% (dark 29%), inset bottom hairline currentColor 25% (kbd.css:34-50).
- Avatar first-child: 24/32/40 avatar overhanging (margin-block -4, margin-inline-start -inset) :72-109.
- Heading (:154-163): padding-block 8px (32px row), inline `pad + inset` (12/16/20), muted, **10px/16px, 600, 0.01em, uppercase**.
- Separator: plain `hr.canon-separator`: hairline `--canon-theme-rule` with margin-block `space + (1px - hairline)/2` → row **12/16/20px**, full panel content width (no inline inset) (separator.css:28-32). `--canon-theme-menu-rule-space` (5.5/7.5/9.5) is declared in menu.css:16-25 but **unused** anywhere.
- Motion: Popups recipe.

### Menubar
Anatomy: `.canon-menubar[role=menubar]` > `.canon-menubar-item` (each `popovertarget` a `.canon-menu[data-menubar]`).
- Bar (theme/menubar.css:14-20): inline-flex; padding 4px (3+1 border); radius 8/12/16; bg white/zinc-900; **hairline edge only, no shadow**.
- Item (:21-30): min-h 32/40/48; padding-inline `control-pad + button-label-inset` = 12/16/20; radius 4/8/12; color **zinc-500 (both modes)**; weight 500; button lh 16/20/24 + tracking.
- States: open/focus-visible/hover (hover only under `@media (hover:hover)`) → bg zinc-100/zinc-800, text zinc-900/white :31-40; disabled zinc-300/zinc-700 :41-43. Menus open 8px under bar.

### Tooltip
Anatomy: `[popover=hint].canon-tooltip[data-placement?][data-size?]`, trigger `[interestfor]`; arrow = `::before` (border color) + `::after` (fill).

**Sizes** (theme/tooltip.css:19-44) — **sm is the default** (unlike controls)
| | sm (default) | md | lg |
|---|---|---|---|
| padding-block | 4 | 6 | 8 |
| padding-inline | 6 | 8 | 12 |
| radius | 4 | 6 | 8 |
| font / lh | 12/16 | 14/20 | 16/24 |
| tracking | -0.007em | -0.006em | -0.004em |
- Slider value tooltip uses md :29.

**Surface** (:46-68)
- **Light tooltip, not inverted**: bg `light-dark(white, zinc-900)`; border **1px solid** `light-dark(zinc-200, zinc-700)` (real border, not hairline); text zinc-900/white; shadow **raised** (`box-shadow`, not filter).
- offset 4px (`margin-block-end`, flips per placement :82-92); `inline-size: max-content; min-inline-size: 30px (1.875rem); max-inline-size: min(320px, 100vw - 16px)`; weight 400; `text-align:center`; `overflow-wrap: break-word`. Side placements lean text toward trigger :95-96.
- Position (core/tooltip.css:16-27): `position-area: self-block-start span-all` (above, centered); flips; `container-type: anchored`.

**Arrow** (:106-142): 14×10px (0.875×0.625rem) SVG mask tab with rounded tip; tip 4.5px past border; `top: anchor(bottom) - 5px`; horizontally `clamp(left+8px, aim-7px, right-22px)` (stays 8px from corners, aims at trigger center); `::before` painted border color + `drop-shadow(0 1px 1px rgb(0 0 0 / .05))`; `::after` bg color minus stroke mask (`mask-composite: subtract`). Below → `scale: 1 -1`; sides → rotate ±90deg; follows flips via `@container anchored(fallback: …)` :176-203.

**Motion / timing**
- Show: opacity 0→1 **0.12s ease-out** (`@starting-style`) :72-79. Hide: **instant**. Opacity only (no scale/translate; would detach the fixed arrow). No reduced-motion override (fade only already).
- Delays (js/canon.js:9597-9653, interestfor polyfill): **show 500ms**, **hide 250ms**, 0ms when another tooltip is already open (warm handoff); Escape hides; touch ignored.

---

### Alert
Anatomy: `.canon-alert[data-intent=info|success|warning|danger][data-emphasis=high][data-state=opening|closing]` > `::before` icon · `.canon-alert-title` · `.canon-alert-description` (p/ul/ol) · `.canon-alert-actions` · `button.canon-alert-close`.
- Layout (core/alert.css:16-24): grid `auto minmax(0,1fr) auto auto`, areas `"icon title actions close" "icon description actions close"`, align start; container `canon-alert` inline-size. `< 20rem (320px)`: actions drop to row 3 under text, close spans 3 rows (:67-72). Close hidden with `scripting:none`.

**Surface** (theme/alert.css:12-27)
| prop | value |
|---|---|
| padding | 12px; **8px end** when close present :28-30 |
| radius | 12px |
| bg / text | white/zinc-900 · zinc-900/white (Card surface) |
| edge | hairline `--canon-theme-edge` (box-shadow) |
| intent bar | extra box-shadow `-4px 0 0 0 var(--_bar)` → 4px strip **outside** the start edge (RTL +4px) :23,31-33 |
| elevation | **none** (in-page) |
| type | 14px/20px, -0.006em |

**Intents** (:40-43) — bar = 500 (dark 400); icon tone = 600 (dark 400), warning tone = amber-500/amber-400.
| intent | bar | icon tone | icon |
|---|---|---|---|
| info | blue-500/400 | blue-600/400 | icon-info |
| success | green-500/400 | green-600/400 | circle-check |
| warning | amber-500/400 | amber-500/400 | triangle-alert |
| danger | red-500/400 | red-600/400 | circle-alert |
- Icon 20×20 mask in `--_tone` :34-39. **Surface not tinted** by intent (only bar + icon).
- Title weight 500 :44-46. Description zinc-500/zinc-400; lists indent 20px; `> * + *` 4px :47-55.
- Spacing: text margin-start 12px when icon (`--_lead`) :59-64; close margin-start 12px :65-67; actions gap 8px, margin-block -6px (vertically overhangs to center a 32px button on 20px line), margin-start 12px; narrow: margin-top 8px, start = lead :68-78.
- Close (:80-106): 28×28, radius 6px, margin-block -4px; X icon 16px; color zinc-500/zinc-400; hover (`hover:hover` only) bg zinc-100/zinc-800, color zinc-900/white; focus-visible ring `0 0 0 2px surface, 0 0 0 3px focus`; `transition: background-color .12s, color .12s`.
- **High emphasis** (:115-154): solid `--_solid` bg + border, text `--_on`, no shadow (no bar). none: zinc-900/white inverted; info blue-600 / success green-600 / danger red-600 with white; warning **amber-400 with amber-950 text**. Icon `--_on`; description + close `--_on @80%`; close hover bg `--_on @15%`; ring `2px solid, 3px on`; links inherit; buttons inverted: bg `--_on`, fg `--_solid`, hover `mix(on 88%, solid)`, active `mix(on 78%, solid)`.
- Forced colors: bar → `border-inline-start-width: 4px` :159-171.
- Motion: Room (below).

### Banner
Anatomy: `.canon-banner[data-intent][data-emphasis=high]` > `::before` icon · `.canon-banner-title` · `.canon-banner-description` · `.canon-banner-actions` · `button.canon-banner-close`; parent `[data-canon-banners]` (canon.js).
- Layout (core/banner.css:15-59): flex wrap, align center, single line; actions `margin-inline-start:auto`; close goes to end alone if no actions. Sticky in `[data-canon-banners]`: `position: sticky; top: var(--canon-banner-offset); z-index: 5`.
- Surface (theme/banner.css:16-35): **no radius**, full-width strip; `border-block-end: hairline solid --_line`; column-gap 12px, row-gap 4px; min-block-size **40px**; padding-block 8px; padding-inline `shell-inset + 4px` = 12/**16**/20px; end 8px with close; 14px/20px -0.006em; text zinc-900/white.
- No intent: bg zinc-100/zinc-900, line `--canon-theme-rule`.
- **Intent tint** (:36-39): bg `light-dark(<hue>-50, color-mix(in srgb, <hue>-950 70%, zinc-950))`; line `<hue>-200 / <hue>-900`; icon tone same as Alert (600/400; warning 500/400).
- Icon 20px :40-46. Title 500. Description **zinc-600/zinc-300** (stronger than Alert's 500/400) :50-52. Actions gap 8px.
- Close (:56-81): 28px, radius 6px, X 16px, zinc-500/zinc-400; hover bg `color-mix(currentColor 12%)` (adapts to tint), color zinc-900/white; **focus: `outline 2px solid focus; offset 1px`** (differs from Alert's box-shadow ring); transition bg/color 0.12s.
- High emphasis: same solid table as Alert (:85-125); focus outline color `--_on`.
- Motion: Room.

### Toast
Anatomy: `[popover].canon-toaster` > `.canon-toast[data-intent][data-emphasis][data-timer][data-paused][data-state][data-duration]` > `::before` icon · `.canon-toast-title` · `.canon-toast-description` · `.canon-toast-actions` · `button.canon-toast-close` · `::after` timer line.

**Toaster** (core/toast.css:15-36; theme/toast.css:20-23, 61-65)
- fixed bottom-end, inset **16px**; `inline-size: min(384px, 100vw - 32px)`; `max-block-size: 100dvh - 32px`; `pointer-events:none` (toasts auto); gap 8px; display grid, align end, `interpolate-size: allow-keywords`.
- Max **3** visible; 4th dismisses oldest (canon.js:3275). Durations: **5000ms**, **10000ms if it has actions**, `data-duration="none"` persistent (canon.js:3281-3284). Re-shown above a newer modal dialog.

**Toast** (theme/toast.css:24-40)
| prop | value |
|---|---|
| padding | 12px block; 12px start / 8px end |
| radius | 12px |
| bg | `light-dark(white, **zinc-800**)` (one step lighter than other dark surfaces) |
| text | zinc-900/white |
| shadow | hairline edge + **floating** |
| type | 14px/20px -0.006em |
| intent | bar shadow `-4px 0 0 0 <hue>-500/400` prepended :145-155; icon tone 600/400 (warning 500/400) |
- Parts identical to Alert: lead 12px, close margin-start 12px, title 500, description zinc-500/zinc-400, actions gap 8 / margin-block -6 / start 12; `<20rem` stacking (:160-188).
- Close (:190-214): 28px, r6, margin-block -4px, X 16px; hover (**not** gated by hover media) bg **zinc-100/zinc-700**, text zinc-900/white; focus ring 2px surface(white/zinc-800) + 3px focus.
- Timer `[data-timer]` (:224-252): toast padding-bottom `12px + 12px`; `::after` line 2px tall, radius 1px, 4px from bottom, 12px from sides; track zinc-200/zinc-700; fill intent bar color (none: zinc-400/zinc-500; high: `--_on` on `--_on @25%` track); `animation: canon-toast-timer var(--canon-toast-duration,5s) linear forwards` shrinking background-size 100%→0 toward start; `[data-paused]` pauses; kept under reduced motion.
- High emphasis (:261-299): solid table as Alert, but keeps **floating shadow** (no edge, no bar).

**Stack** (:61-103) — `--canon-toast-index` (0 = front/newest), `--canon-toaster-count`, `--canon-toast-offset`, `--canon-toaster-front-height`, `--canon-toaster-height` set by canon.js.
- Collapsed: all in grid cell 1/1; `translate: 0 calc((index - count + 1) * 12px)`; `scale: 1 - index*0.05`; `transform-origin: 50% 100%`; non-front: block-size = front height, clip, opacity `1 - index*0.25`, content + bar hidden (opacity 0).
- Expanded on `:hover`/`:focus-within`: `translate: 0 -offset`, scale 1, spread 8px apart (newest at top, per comment; JS offset), toaster `min-block-size: toaster-height`, pointer-events auto.

**Motion**
| event | props | dur | easing |
|---|---|---|---|
| enter (`@starting-style`) | opacity 0→1, translate +8px→stack pos | 0.2s (opacity) / 0.35s (translate in toaster) | ease / `cubic-bezier(0.3,0.7,0.1,1)` |
| restack / expand | translate, scale, block-size | 0.35s | `cubic-bezier(0.3,0.7,0.1,1)` |
| opacity, box-shadow | — | 0.2s | ease |
| child content fade | opacity | 0.2s | ease |
| leave (`[data-state=closing]` in toaster) | `@keyframes canon-toast-leave` → opacity 0, scale .96 | 0.2s | ease-out, forwards |
| close btn hover | bg, color | 0.12s | ease |
| reduced motion | all transitions none; leave = `canon-fade-out 0.15s ease-out` | | |
- Lone `.canon-toast` (outside toaster): `transition: opacity .2s ease, translate .2s ease`, enters from +8px :39-46; reduced → none :300-302.

### Room (theme/room.css) — enter/exit for Alert, Banner, Toast, Form Repeater item
- `[data-state=closing]` (:10-15): `pointer-events:none`, `overflow:clip`; `canon-fade-out 0.15s ease-out forwards`, **then** `canon-room-close 0.2s ease-in-out 0.15s forwards` (block-size `--canon-motion-height`→0, padding-block 0, border-block-width 0, negative margins `--canon-motion-gap-before/after` to eat flex/grid gap). Total 350ms.
- `[data-state=opening]` (:16-20): `canon-room-open 0.2s ease-in-out both` then `canon-fade-in 0.15s ease-out 0.2s both`. Total 350ms.
- `--canon-motion-height` / gap vars are set by canon.js (measured).
- Reduced motion (:115-127): only fade-out / fade-in 0.15s ease-out.
- Also defines shared keyframes `canon-fade-in`, `canon-fade-out` (used by skeleton, save-bar, number, date, toast).
- Combobox tags variant: fade 0.12s + inline collapse 0.18s; box resize 0.18s ease-in-out (closing delayed 0.12s) :58-114.

---

## Motion inventory

All in `src/css/theme/`. "RM" = `prefers-reduced-motion: reduce` behavior. Core sets motion only at core/spinner.css:38 (`opacity 0s 0.4s` show-delay), core/text-input.css:71 (`canon-keep-select-anchor 400ms`), core/slider.css:103,127 (inherit), core/base.css:605 (none).

**Overlays / feedback**
| component | trigger | property | dur | easing | RM | src |
|---|---|---|---|---|---|---|
| Dialog | open/close | opacity, scale .98↔1, display/overlay discrete | 0.15s | ease-out | opacity only | dialog.css:27-49,119 |
| Dialog backdrop | open/close | opacity | 0.15s | ease-out | kept | dialog.css:36 |
| Drawer | open/close | translate ±(100%+16px) | 0.25s | ease-out | none (instant) | dialog.css:96,120 |
| Command palette | — | none | — | — | — | command-palette.css:15 |
| Menu/Popover/Combobox/Color/Calendar/Select picker | open | opacity 0→1, scale .97→1 | 0.15s | ease-out | opacity only | popups.css:15-26 |
| same | close | opacity→0, scale→.97 | 0.1s | ease-in | opacity only | popups.css:10-14 |
| Tooltip | show | opacity | 0.12s | ease-out | same | tooltip.css:72-79 |
| Tooltip | hide | — | 0 | — | — | " |
| Tooltip | delay (JS) | show 500ms / hide 250ms / 0 warm | — | — | — | canon.js:9597 |
| Alert/Banner/Toast/Repeater | dismiss | fade-out 0.15s → room-close 0.2s (delay .15) | 0.35s total | ease-out / ease-in-out | fade-out 0.15s | room.css:10-15 |
| " | show | room-open 0.2s → fade-in 0.15s (delay .2) | 0.35s | ease-in-out / ease-out | fade-in 0.15s | room.css:16-20 |
| Alert/Banner/Toast close btn | hover | bg, color | 0.12s | ease | — (not overridden) | alert.css:88 banner.css:63 toast.css:198 |
| Toast | enter | opacity / translate +8px | 0.2s / 0.35s | ease / cubic-bezier(.3,.7,.1,1) | none | toast.css:73-75,105-110 |
| Toast | restack/expand | translate, scale, block-size | 0.35s | cubic-bezier(.3,.7,.1,1) | none | toast.css:73-75 |
| Toast | leave | opacity→0, scale→.96 | 0.2s | ease-out | fade-out 0.15s | toast.css:113-122,131 |
| Toast | timer line | background-size 100%→0 | 5s/10s (var) | linear | kept | toast.css:239 |
| Data-table bulk bar popover | open/close | opacity, translate 8px | 0.15s | ease-out | none | data-table.css:304-338 |
| App-shell drawer sidebar | open/close | translate -100% | 0.2s | ease | none | app-shell.css:174 |
| App-shell scrim | open/close | opacity, visibility (`rgb(0 0 0/.3)`) | 0.2s | ease | none | app-shell.css:186-190 |

**Loading / progress**
| component | property | dur | easing | RM | src |
|---|---|---|---|---|---|
| Spinner | `canon-spin` rotate 1turn ∞ | 0.8s | linear | slowed to 2.4s | spinner.css:21,31 |
| Spinner | appear delay | opacity 0s after 0.4s | step | — | core/spinner.css:38 |
| Button busy | canon-spin | 0.8s | linear | 2.4s | base.css:733,745 |
| Combobox loading | rotate ∞ | 0.8s | linear | 2.4s | combobox.css:232-239 |
| Data-table loading | canon-spin | 0.8s | linear | 2.4s | data-table.css:129,189 |
| Skeleton | fade-in after 0.3s delay | 0.15s | ease-out | kept | skeleton.css:22 |
| Skeleton sweep | bg-position 100%→-100% ∞ (200% gradient zinc-100→zinc-200→zinc-100; dark zinc-800/700) | 1.5s (delay .3) | ease-in-out | sweep removed, fade kept | skeleton.css:24-52 |
| `[data-loaded]` content | fade-in | 0.2s | ease-out | kept | skeleton.css:59-62 |
| Status pulse | box-shadow ring ∞ | 1.6s | ease-out | none | status.css:54-68 |
| Count update | scale pop 1.2 @40% | 0.25s | ease-out | none | count.css:19-25 |
| Save-bar status | rise 4px + fade | 0.2s | ease-out | fade only | save-bar.css:44-51 |

**Controls (hover/state)**
| component | property | dur | easing | RM | src |
|---|---|---|---|---|---|
| Button | bg, border, color 0.12s; scale (press) 0.1s | 0.12/0.1s | ease / ease-out | none | base.css:597,749 |
| Button chevron (`aria-haspopup`) | rotate 180° | 0.15s | ease | none | base.css:705 |
| Button copied icon | pop from scale .5 + fade | 0.2s | ease-out | none | base.css:761-768 |
| Text input / OTP / Number | border-color, box-shadow (+bg) | 0.12s | ease | none | text-input.css:58, otp.css:48,70, number.css:33-96 |
| OTP caret | blink | 1s | step-end ∞ | none | otp.css:106 |
| Number roll | translate text | 0.2s | cubic-bezier(0.2,0,0,1) | fade | number.css:176-221 |
| Select/Filter/Color chevron | rotate | 0.15s | ease | none | select.css:30, filter-bar.css:65, color-picker.css:30 |
| Choice (checkbox/radio) | scale pop | 0.2s (0.08s press) | cubic-bezier(0.23,1,0.32,1) | none | choice.css:106-128 |
| Checkbox tick draw | clip-path | 0.22s (delay .05) | cubic-bezier(0.65,0,0.35,1) | none | choice.css:121 |
| Switch thumb | inset/travel | 0.3s | cubic-bezier(0.34,1.56,0.64,1) (overshoot) | none | choice.css:227-229 |
| Choice box | border, bg, shadow | 0.12s | ease | none | choice.css:76,213 |
| Segmented / Button-group / Toggle-chip / Filter-bar / Pagination / Nav-list / Tabs / Table rows / Link / Breadcrumb / Tag / Label / Card | bg, border, color, shadow | 0.12s (tabs color 0.15s) | ease | none (most) | segmented.css:44 … card.css:39 |
| Toggle-chip check | inline-size, margin, opacity, padding | 0.15s | ease-out | none | toggle-chip.css:100-111 |
| Tabs / date strip indicator (track-mark) | top/right/bottom/left | 0.3s | cubic-bezier(0.3,0.7,0.1,1) | none | track-mark.css:42-43, date.css:337 |
| Accordion | chevron rotate 0.2s; content block-size 0.2s | 0.2s | ease | none | accordion.css:95,122 |
| Nav-list chevron | rotate | 0.15s | ease | none | nav-list.css:112 |
| Data-table sort icon | rotate | 0.2s | ease | none | data-table.css:40 |
| Field message | opacity, translate -4px, block-size | 0.15s | ease-out | none | field.css:110-127 |
| Slider value bubble | opacity, visibility | 0.12s | ease | none | slider.css:135 |
| Split-pane handle | bg 0.12s; size 0.15s | 0.15s | cubic-bezier(0.2,0,0,1) | none | split-pane.css:45 |
| Time picker | block-size 0.1s; scroll 0.15s | 0.1/0.15s | ease-out / cubic-bezier(0.2,0,0,1) | none | time.css:66-140 |
| Date month turn | slide | 0.2s | cubic-bezier(0.2,0,0,1) | fade-in | date.css:351-396 |
| Password strength | `--canon-theme-strength` 0.25s; rules block-size 0.3s; items stagger 50ms×index | 0.2-0.3s | ease | none | password.css:28-155 |
| Avatar-group spotlight | opacity, scale | 0.15s | ease-out | opacity only | avatar-group.css:76,113 |
| Avatar image | opacity | 0.2s | ease-out | — | avatar.css:263 |
| Swatches | rotate / width / opacity / scale | 0.2s (opacity .15) | ease | none | swatches.css:106-149 |
| Form repeater | padding 0.2s delay .15; remove btn fade 0.15 | — | ease-in-out / ease-out | none | form-repeater.css:46-68 |
| App-shell sidebar collapse | inline-size, padding | 0.2s | ease | none | app-shell.css:58-66 |
| Page header sticky shadow | opacity | 0.15s | ease | — | page-header.css:105 |

**Canon motion vocabulary**: micro-state 0.12s ease; reveal/open 0.15s ease-out; close 0.1s ease-in; layout/room 0.2s ease-in-out; slide panel 0.25s ease-out; spatial settle 0.3–0.35s `cubic-bezier(0.3,0.7,0.1,1)`; snappy small 0.15–0.2s `cubic-bezier(0.2,0,0,1)`; spinner 0.8s linear (2.4s RM). RM rule: drop scale/translate/size, keep opacity fades; spinners slow rather than stop.

## Z-index inventory

Overlays (dialog, drawer, command palette, menu, popover, tooltip, toaster, select picker) use the **top layer** (`<dialog>.showModal`, `popover`) → **no z-index**. canon.js re-shows the toaster after a newer modal so it stays on top (canon.js:3272). For Vuetify, keep Vuetify's overlay z stack (≥2000) and order: dialog < menu/tooltip opened from it < snackbar.

| z | selector | purpose | src |
|---|---|---|---|
| 5 | `[data-canon-banners] > .canon-banner` | sticky banners above shell | core/banner.css:25 |
| 4 | `.canon-app-shell > .canon-sidebar[data-drawer]` | mobile drawer sidebar | core/app-shell.css:70 |
| 4 | `[data-canon-editor]` | data-table cell editor | core/data-table.css:142 |
| 3 | `.canon-app-shell > .canon-sidebar` | sidebar | core/app-shell.css:34 |
| 3 | app-shell drawer scrim `::after` (`rgb(0 0 0/.3)`) | under drawer | theme/app-shell.css:186 |
| 3 | data-table thead pinned cell | | core/data-table.css:78 |
| 2 | `.canon-app-shell > .canon-top-bar` | sticky top bar | core/app-shell.css:41 |
| 2 | data-table thead cells | sticky header | core/data-table.css:75 |
| 1 | data-table pinned cells | | core/data-table.css:62 |
| 1 | `.canon-page-header[data-sticky]` | | core/page-header.css:70 |
| 1 | `.canon-form-actions[data-sticky]` | | core/base.css:721 |
| 1 | `.canon-save-bar` | | core/save-bar.css:17 |
| 10 | `[data-display=icon] .canon-nav-list-section > ul` | collapsed-rail flyout | core/nav-list.css:81 |
| 1000−sibling-index / 1001 | avatar-group stacking / spotlight | | theme/avatar-group.css:64,80 |
| 1–2 (local) | focus-visible lift in grouped controls (button-group, split-button, segmented, tabs-more, color values, select-in-input, otp cell, calendar cell, time cell, chip buttons), input overlays (combobox tags/button, slider thumbs, color input, prefix/suffix controls), card link layering (0/1), avatar image/badge (1/2), split-pane handle, tabs-more | local stacking only | core: otp:46, nav-list:64, combobox:84,218, split-pane:33,71, tabs:24, card:84,88, slider:152, avatar:41,59, color-picker:44, text-input:160; theme: otp:90, button-group:88, tabs:101, slider:115, select:214, time:114, split-button:78, segmented:76, date:195, color-picker:245, avatar:279, data-table:432 |
| −1 | field limit mirror; track-mark/date-strip indicator under tabs (with `isolation:isolate` on parent) | | core/field.css:55; theme/track-mark.css:47; theme/date.css:327 |

## Cross-component patterns noticed

- **Floating surface recipe** (Menu, Popover, Select/Combobox list, Toast, Data-table bulk bar): `border: 1px solid transparent` + `box-shadow: 0 0 0 hairline edge(12%), shadow-floating`; bg white / **zinc-900** dark (Toast: zinc-800); text zinc-900/white; radius = input-radius + 4px (8/12/16) [Toast: fixed 12px]; padding written `calc(N - 1px)`; 4px offset from trigger (`margin-block: .25rem`); open 0.15s ease-out from scale .97, close 0.1s ease-in. **Overlay surface** (Dialog, Drawer, Command palette): same but `shadow-overlay`, radius 24px (palette 16px), white 85% / zinc-950 75% backdrop, blur 4px (palette none). **Tooltip** is the outlier: light surface with a real 1px zinc-200/zinc-700 border + raised shadow.
- **Intent surface recipe**: Alert & Toast keep a neutral surface and signal intent with a 4px **outside start bar** (`box-shadow: -4px 0 0 0 <hue>-500 / dark 400`) + 20px icon in `<hue>-600 / dark 400` (warning: amber-500/400 for both). Banner instead **tints**: bg `<hue>-50` / dark `mix(<hue>-950 70%, zinc-950)`, line `<hue>-200 / <hue>-900`. Menu danger tint: `<red>-400 15%` / dark `red-500 20%` over transparent, text red-700/red-300. **High emphasis** everywhere: solid `<hue>-600` + white (warning amber-400 + amber-950; none = inverted zinc-900/white), secondary text/close at `on 80%`, close hover `on 15%`, buttons inverted with hover `mix(on 88%, solid)`, active `mix(on 78%, solid)`.
- **Item-row recipe** (Menu item, Command item, Menubar item, Nav list): row = control height 32/40/48, padding-inline 8/10/12, radius = input-radius 4/8/12, label extra inset 4/6/8 (so text starts 12/16/20 from row edge), icon 16/20/24 in zinc-500/zinc-400 with 2/2/0 gap; active/hover/keyboard fill zinc-100 / dark zinc-800, no transition; disabled zinc-400/zinc-600; heading 10px/16 600 uppercase +0.01em muted in a 32px row aligned to label start; container padding 4px (menu) / 8px (palette list).
- **Feedback-part recipe** (Alert, Toast; Banner similar): 12px padding (8px end with close), 14/20 text, title 500, description muted, all inter-part spacing 12px via margins (not gap), actions gap 8px with margin-block -6px, close 28px r6 with 16px X and margin-block -4px, container query < 320px wraps actions under text.
- **Dark-mode surface ladder**: page zinc-950 → panels/dialogs/menus/tooltips zinc-900 → toast zinc-800 → hover fill zinc-800 (on 900) / zinc-700 (on toast).
- **Hairline rules inside surfaces**: `--canon-theme-rule` (10%) at `--canon-theme-hairline`, with adjacent padding reduced by 1px to keep the 4px grid (dialog header 15px bottom, footer 23px top).

---

## 5. Theming and customization mechanisms Canon exposes

| Mechanism | How | Ref |
|---|---|---|
| **Replace the theme** | Link a different stylesheet instead of `css/canon/canon.css`. The markup and `canon.js` stay the same. | themes page, README |
| **Build on Canon's theme** | `@import url("../canon/canon.css");`, then put overrides in `@layer canon.theme { … }`. "Start by changing tokens, since they restyle all components at once. Then add component rules for what makes your look distinct." | <https://recepkutuk.github.io/canon/reference/themes.html> |
| **From scratch** | `@layer canon.core, canon.theme, canon.hints; @import url("…/canon.core.css");`, then style everything. Each component's spec lists the theme's obligations. | decisions §CSS architecture |
| **Unlayered app CSS** | Beats every Canon layer with no specificity fights. Use it for small tweaks. | getting-started |
| **Palette slots** | Redefine `--canon-theme-{zinc,blue,green,amber,red}-{50..950}`. Every component follows. | `css/carbon/carbon.css:211-269` |
| **Global semantic tokens** | `focus`, `hairline`, `edge`, `rule`, `rule-faint`, `shadow-{raised,control,floating,overlay}`, `font-mono`, and `font-family` / `font-feature-settings` on `:root`. Carbon, for example, flattens every shadow except floating and overlay to `0 0 transparent`. | carbon.css:271-288 |
| **Size scale** | `--canon-control-{block-size,padding-inline,font-size,gap}-{sm,md,lg}` and `--canon-icon-size-{sm,md,lg}`. Ant and Fluent use 24/32/40, Bootstrap 31/38/48, Canon 32/40/48. | `css/*/*.css` |
| **Shape and type per size** | `:root, [data-size] { --canon-theme-button-radius; --canon-theme-input-radius; --canon-theme-tooltip-radius; --canon-theme-kbd-radius; --canon-theme-table-radius; --canon-theme-{button,input}-{line-height,tracking}; --canon-theme-label-*; … }` | carbon.css:306-328 |
| **Spacing** | `--canon-gap-{sm,md,lg,xl}` per size | `T:stack.css` |
| **Density default** | Components read `var(--canon-density, <default>)`. A theme may pick a default. | |
| **Layout knobs** | `--canon-sidebar-width` (16.5rem, 264px), `--canon-label-width` (33%), `--canon-label-gap` (1rem), `--canon-form-aside` (33%), `--canon-form-aside-gap` (2rem), `--canon-grid-min` (16rem), `--canon-slider-length` (12rem) | core and theme |
| **Seed colors** | `--canon-seed-colors: 17` plus per-slot hues. An identity number maps to a color, and authors never pick colors. | `T:seed.css` |
| **Strings and i18n** | `--canon-text-*`, `i18n/<lang>.css` via `:lang()` | `C:base.css`, `i18n/` |
| **Light/dark** | The theme declares `color-scheme`. Apps force a scheme by setting `color-scheme: light` or `dark` on any subtree. | decisions |
| **Hints (author side)** | `data-size` (xs…2xl), `data-density`, `data-display="icon"`, `data-orientation`, `data-placement`, `data-gap`, `data-columns`, `data-align`, `data-fill`, `data-width` (dialog), `data-frame`, `data-lines`, `data-striped`, `data-hover` (table), `data-label="start"` (form label column) | decisions Contract rule 1 |

What a *theme* is not allowed to change, because the contract wins: label visibility, focus visibility, the `aria-disabled` reachability, and logical (RTL-safe) properties.

**Mapping to c-style.** Canon's mechanism already matches our goal of "colors per theme, everything else Canon". We should mirror Canon's **step-slot palette** (an accent ladder, a neutral ladder and intent ladders), keep shape, size, type and motion as fixed Canon tokens, and drive Vuetify's theme colors from the generated ladders. Hover, active, tint and halo should be derived **by step** as described in §3.

---
## 6. What's load-bearing (the global rules behind about 80% of the look)

1. **Inter with alternates.** Use `InterVariable` with `font-feature-settings: "ss01","cv11","cv04","cv03","cv02"`. Control text is 14/20, weight 400 for input values and 500 for actions and labels, with slightly negative tracking (−0.006em at 14px).
2. **Control heights are 32/40/48** (sm/md/lg; md is the default). Horizontal padding is 8/10/12 plus a 4/6/8 label inset. Icons are 16/20/24, Lucide at stroke 1.5. Vertical padding is derived from height and line-height and is never set directly.
3. **Radii are 4/8/12** for buttons, inputs and tags at sm/md/lg. Tables and cards are larger (12 at md). Nested corners use `radius ± 1–2px`.
4. **Neutral zinc ladder with a single accent ladder.** Secondary text is 500/400. Control frames are 200/700. Hover fill is 100/800. Disabled fill is 50/800.
5. **Emphasis × intent through step and tint relationships.**
   - high = solid 600; hover 500; active 700.
   - medium = tint 15%, then 20%, then 25%.
   - low = transparent with a 200 border and `shadow-control`; hover tint 8%.
   - minimal = transparent; hover tint 8%.
   - Disabled = grey, whatever the intent.
6. **Lines and depth.** Lines inside components are see-through hairlines (black or white at 10%, 0.5px on retina). Control frames are 1px solid. Floating surfaces use an edge at 12% plus one of four soft shadows (control, raised, floating, overlay), never a solid border.
7. **Surfaces.**
   - Light: a zinc-50 canvas with white surfaces.
   - Dark: a zinc-950 canvas, zinc-900 surfaces, zinc-800 for toasts and higher layers.
   - The dialog backdrop is a light wash (85% white) in light mode.
8. **Focus.**
   - Buttons and links: a 2px gap (white or zinc-900) and a 1px accent-600/400 ring, via box-shadow.
   - Fields: the border switches to accent-600 with a 3px accent-100/900 halo and no gap.
9. **Motion.**
   - Colors transition over 120ms with the default ease.
   - Press is `scale(.98)` over 100ms ease-out.
   - Chevrons rotate over 150ms.
   - No overshoot (except the Switch thumb spring) and no ripple. Respect `prefers-reduced-motion`.
10. **Spacing.** The grid is 4px, with gaps of 8/16/24/32 (sm, md, lg, xl at md size). Density only changes table and description-list rows: +0/16/32px over the control height (comfortable +16 by default).
