# Research vetting

Review of `canon.md`, `vuetify.md` and `coalesce.md` against `.refs/canon` (src/css), `.refs/vuetify` (tag v4.3.2), `.refs/coalesce` and the installed packages in `MyProject/MyCompany.MyProject.Web/node_modules`.

## Verdicts

| Doc | Verdict | Confidence |
|---|---|---|
| `canon.md` | Accurate. Every sampled number matched the CSS. One wrong role-map row, one overstated "no overshoot" rule and one loose "current = active rung" generalization were fixed. The live `canon.css` is byte-identical to the repo build (re-checked with `cmp`). | High |
| `vuetify.md` | Accurate on layers, theme emission, density math, `configFile` mechanics and SASS variable values. One count was wrong, and a layer-order trap was missing. | High |
| `coalesce.md` | Accurate on rendered components, hardcoded props and unlayered CSS. Some details describe source rather than 6.5.1, and the `mockEndpoint` import path given would break in a browser. Both are fixed. | Medium-high |

## Verified claims

`V` = `.refs/vuetify/packages/vuetify/src`, `T` = `.refs/canon/src/css/theme`, `PKG` = installed `coalesce-vue-vuetify3` 6.5.1, `WEB` = demo web project.

| # | Claim | Source | ✔/✘ |
|---|---|---|---|
| 1 | Canon control block-size 32/40/48, padding-inline 8/10/12, font 12/14/16, gap 6/8/10, icon 16/20/24 | `T/base.css:306-321` | ✔ |
| 2 | Button radius 4/8/12, line-height 16/20/24, tracking −.007/−.006/−.004em, gap 2/2/0, label inset 4/6/8 | `T/base.css:470-500` | ✔ |
| 3 | Button padding-block `max(0,(H−1lh)/2−1px)`, inline `pad−1px`, weight 500, 1px always-present border | `T/base.css:586-598` | ✔ |
| 4 | Tint ladder: light tone-400 at 8/15/20/25%, dark tone-500 at 10/20/25/30% | `T/base.css:567-570` | ✔ |
| 5 | Emphasis: high = 600, hover 500, active 700, white fg; medium = tint-2/3/4, fg 700/300; low = transparent + border-low + shadow-control; minimal = transparent, tint-1/2 | `T/base.css:574-626` | ✔ |
| 6 | Neutral high inverts (zinc-900 / white), hover 800/200, active 700/300 | `T/base.css:559-564` | ✔ |
| 7 | Disabled button grey: fg zinc-400/500, bg zinc-50/800; low and minimal variants as tabled | `T/base.css:664-680` | ✔ |
| 8 | Focus ring `0 0 0 2px ring-offset, 0 0 0 3px ring` + transparent 2px outline at offset 2; ring always the focus blue | `T/base.css:572,647-651` | ✔ |
| 9 | Semantic globals: ink, paper, success 700/400, warning 700/400, danger 600/400, focus blue-600/400, ring-offset white/zinc-900 | `T/base.css:277-285` | ✔ |
| 10 | edge 12%, rule 10%, rule-faint 7%/8%, hairline 1px → 0.5px at 2dppx | `T/base.css:290-293,329` | ✔ |
| 11 | Four shadows (control, raised, floating, overlay) with the stated light/dark alphas | `T/base.css:296-301` | ✔ |
| 12 | Field: border zinc-200/700, hover 400/500, focus blue-600/400 (border stays 1px), halo 3px blue-100/900, no gap | `T/text-input.css:42-109` | ✔ |
| 13 | Field intents: rest hue-400/500, hover = focus hue-600/400, halo hue-100/900; disabled bg zinc-50/800; read-only dashed | `T/text-input.css:62-114` | ✔ |
| 14 | Input radius 4/8/12, inset 4/6/8, gap 2/4/6 | `T/text-input.css:12-35` | ✔ |
| 15 | Label 12/16, 14/20, 16/24; description 10/12, 12/16, 14/20; gap 4/6/8 | `T/label.css:13-37` | ✔ |
| 16 | Checked checkbox/radio/switch = ink (zinc-900 / white) with inverted mark, not accent | `T/choice.css:130-134,232-235` | ✔ |
| 17 | Checkbox radius = control/4 (4/5/6); box inset 5%; choice focus ring dark = blue-300 | `T/choice.css:66-73,183` | ✔ |
| 18 | Unchecked checkbox line zinc-300/600 (canon.md §3.3) | `T/choice.css:61` = zinc-400/500 | ✘ fixed |
| 19 | Switch track `c*1.5+4`, 999px radius, off zinc-300/700, on zinc-900/white | `T/choice.css:203-235` | ✔ |
| 20 | "No overshoot or spring curves" anywhere | `T/choice.css:227-229` (switch spring 1.56) | ✘ fixed |
| 21 | Table radius 8/12/16; row = control + (density+1)·16px; header = control; rows ruled with `rule` | `T/table.css:20-41,81-98` | ✔ |
| 22 | Card radius = table radius, edge + shadow-raised | `T/card.css:35-37` | ✔ |
| 23 | Menu radius = input-radius + 4 (8/12/16), padding `4px−1px`, white/zinc-900 | `T/menu.css:32-35` | ✔ |
| 24 | Dialog radius 24px; backdrop white 85% / `rgb(9 9 11/.75)`, blur 4px | `T/dialog.css:20,33-35` | ✔ |
| 25 | Toast dark surface zinc-800, radius 12 | `T/toast.css:32-33` | ✔ |
| 26 | App-shell canvas zinc-50 / zinc-950 | `T/app-shell.css:45-46` | ✔ |
| 27 | Page title 20/28, 24/32, 30/36; tooltip radius 4/6/8 | `T/page-header.css:19-28`, `T/tooltip.css:23-42` | ✔ |
| 28 | Tabs = segmented track (zinc-100/800, radius btn+2) with a raised card; tab height control−6, radius btn−1 | `T/tabs.css:20-50` | ✔ |
| 29 | Nav current = zinc-100/700 fill | `T/nav-list.css:66-72` | ✔ (§3.6 wording fixed) |
| 30 | Alert intent bar 4px box-shadow hue-500/400; warning icon amber-500 | `T/alert.css:16-43` | ✔ |
| 31 | Inter from rsms.me with `ss01 cv11 cv04 cv03 cv02`; no body font-size | `T/base.css:24-30,322-323` | ✔ |
| 32 | Live canon.css byte-identical to repo build (471,818 B) | `curl … \| cmp` | ✔ |
| 33 | Vuetify layer order core{reset,base} < components < overrides < utilities{theme-base,typography,helpers,theme-background,theme-foreground} < final{transitions,trumps} | `V/styles/generic/_layers.scss` | ✔ |
| 34 | `tools.layer()` maps transitions/trumps to `final.*` | `V/styles/tools/_layer.scss` | ✔ |
| 35 | Theme stylesheet emitted in `@layer vuetify-utilities { theme-base / theme-background / theme-foreground }` | `V/composables/theme.ts:412-456` | ✔ |
| 36 | colors → `--v-theme-k: r,g,b[,a]` + overlay-multiplier (luma > .18); `variables` → `--v-k`, `#hex` → triplet, else verbatim | `V/composables/theme.ts:260-280` | ✔ |
| 37 | on-* auto-generated from `theme-on-dark/light` unless provided | `V/composables/theme.ts:311-327` | ✔ |
| 38 | Default theme variables (opacities, light/dark) and colors; `defaultTheme: 'system'` | `V/composables/theme.ts:146-233` | ✔ |
| 39 | `$body-font-family: var(--v-font-body, 'Roboto', sans-serif)`; compiled CSS keeps the var (93 uses) | `V/styles/settings/_variables.scss:20`, `dist/vuetify.css` | ✔ |
| 40 | Density = map multiplier × `$spacer` (4px) | `V/styles/tools/_density.sass` | ✔ |
| 41 | VBtn 36/28/24; sizes 20/28/44/52; min-width h×16/9, padding h/2.25 | `V/components/VBtn/_variables.scss`, `_mixins.scss` | ✔ |
| 42 | Named sizes: all 5 required plus 6 required keys | `V/components/VBtn/_mixins.scss:28-50` | ✔ |
| 43 | Field 56/48/40, input density (0,−2,−4), `16px + mod/2` literals, outline .38, focused 2px | `V/components/VField/*`, `VInput.sass:22-24` | ✔ |
| 44 | Selection control 40 (0,−1,−3), list (0,−1,−2), table 52/56 (0,−2,−4), chip 32, tabs 48 | component `_variables.scss` | ✔ |
| 45 | VBtn focus `::after` 2px currentColor at `.25 × multiplier`; no pressed rule in `tools.states` | `V/components/VBtn/VBtn.sass:51-61`, `tools/_states.sass` | ✔ |
| 46 | Tonal = underlay currentColor at `--v-activated-opacity`; outlined = `$border-width-root` currentColor | `V/styles/tools/_variant.sass` | ✔ |
| 47 | Elevation classes loop 0–5 only | `V/styles/utilities/_elevation.scss:14,19` | ✔ |
| 48 | Toolbar density is JS: −8/−16, prominent ×2 | `V/components/VToolbar/toolbar.ts:14-16` | ✔ |
| 49 | `vuetify/settings` = forwards `lib/styles/settings` + component-variables; resolved via exports `"./*"` | `_settings.scss`, `package.json:116` | ✔ |
| 50 | Plugin: `enforce:'pre'`, intercepts `vuetify/styles` + Vuetify-internal `.css`, virtual `@use configFile; @use target`, absolute configFile accepted, `none`/`sass` modes | `WEB/node_modules/vite-plugin-vuetify/dist/index.mjs` | ✔ |
| 51 | Installed: vuetify 4.3.2, vite-plugin-vuetify 2.1.3, vite 8.3.6, coalesce-vue(-vuetify3) 6.5.1 | `node_modules/*/package.json` | ✔ |
| 52 | Coalesce dist imports `vuetify/components` 26 times | 22 (`grep`) | ✘ fixed |
| 53 | `coalesce-vue-vuetify.css`: ~590 lines, 32 `!important`, 0 `@layer` | 589 / 32 / 0 | ✔ |
| 54 | c-select root `VTextField`; inner search `variant:"filled"`; c-input imports VSwitch/VCheckbox/VSelect/VAutocomplete/VFileInput/VTextarea | `PKG/dist/components/input/*.js` | ✔ |
| 55 | Toolbars `elevation:"4"`; table-toolbar `density:"comfortable"`, editor `"compact"`; c-table inline `--v-table-header-height:40px`; loader progress height 10 | `PKG/dist/components/**` | ✔ |
| 56 | `.v-toolbar__extension{height:49px!important}`, fixed-column `box-shadow rgba(0,0,0,.4)`, blur 12px | `PKG/dist/coalesce-vue-vuetify.css:453-512` | ✔ |
| 57 | `adminOverrides`/`adminExtensions` absent from 6.5.1 | `grep` of `PKG/dist` = 0 hits | ✔ (§1 wording clarified) |
| 58 | `mockEndpoint` usable in browser | `coalesce-vue/lib/test-utils.js` imports only AxiosClient | ✔, but `WEB/src/test-utils.ts` is vitest-bound (fixed) |
| 59 | Demo CSS order: roboto → FA → coalesce CSS → `vuetify/styles` → site.scss; defaults compact/outlined | `WEB/src/main.ts` | ✔ |
| 60 | c-datetime-picker `--date-picker-height` CSS | present in source only, not 6.5.1 | ✘ fixed (marked source-only) |

## Corrections made

1. `canon.md` §3.3: "Strong frame" row (zinc-300/600 for checkbox, radio and switch) split into checkbox/radio line zinc-400/500 (hover 600/300) and switch track off zinc-300/700.
2. `canon.md` §2.10 and §6.9: "no overshoot" now notes the Switch thumb's overshoot spring.
3. `canon.md` §3.6: "current page uses the active rung" was narrowed. It holds for Button. Nav List uses a neutral zinc-100/700 fill, and Tabs use a raised card.
4. `vuetify.md` §5.3: Coalesce `vuetify/components` imports changed from 26 to 22.
5. `vuetify.md` §5.2: added the layer-order trap. A c-style stylesheet loaded before `vuetify/styles` would declare `vuetify-overrides` first and sink below the component layer.
6. `coalesce.md` §1: clarified that neither `adminOverrides` nor `adminExtensions` exists in 6.5.1. The old wording implied that `adminOverrides` did.
7. `coalesce.md` §2 c-datetime-picker: marked the `--date-picker-height` CSS as source-only.
8. `coalesce.md` §3: the opacity and multiplier variables are plain numbers, not rgb triplets.
9. `coalesce.md` §6: import `mockEndpoint` from `coalesce-vue/lib/test-utils`, not `WEB/src/test-utils.ts`. The latter calls the vitest global `afterEach` and imports `@vue/test-utils`.

## No contradictions found between the docs
- Layer precedence: `vuetify.md` puts Canon CSS for Vuetify internals in `vuetify-overrides`. `coalesce.md` makes Canon overrides of Coalesce rules unlayered, because Coalesce's CSS is unlayered. These cover different targets and agree. The planner should record the two-tier rule explicitly. Unlayered CSS also beats Vuetify utilities, so the unlayered tier must only use `.c-*`-scoped selectors.
- Canon's own `canon.core/theme/hints` layers don't matter here, because c-style re-expresses Canon through Vuetify and won't ship Canon CSS.

## Open gaps and risks
- **Field frame color.** Vuetify's outlined border is `currentColor` × `--v-field-border-opacity` (.38). Canon uses an opaque zinc-200 frame, a zinc-400 hover and a 1px accent focus with a 3px halo. Opacity tuning only approximates zinc-200 on white surfaces, so expect CSS on `.v-field__outline__*` plus `$field-focused-border-width: 1px`. The halo needs CSS.
- **Field height.** Vuetify field min-height is `max(control-height, font×lh + paddings)` with the literal `16px + mod/2` paddings. Reaching Canon's 32/40/48 needs `$field-font-size: 14px`, `$input-line-height`, and either `--v-field-padding-*` overrides or a custom density map. A density map alone isn't enough.
- **Button sizing model.** Vuetify derives padding from height (`h/2.25`) and min-width (`h×16/9 = 72px at 40`). Canon pads 9px + 6px label inset with no min-width. Use `$button-named-sizes` (all 5 sizes required) and set `min-width: 0`.
- **Emphasis tints.** Vuetify tonal uses one alpha (`--v-activated-opacity`), on `currentColor`, which is the text color (tone-700) rather than tone-400. Canon's medium emphasis is a tone-400 tint at 15/20/25%. It needs CSS or a per-color variable, and dark mode switches to tone-500.
- **Hover and active model.** Vuetify state overlays add `currentColor` × opacity on top. Canon replaces the background (`bg-hover`, `bg-active`). High emphasis hover = 500 (lighter) can't come from an overlay of white text. Needs CSS that sets the overlay to 0 and changes the background.
- **Press.** Canon has no ripple and uses `scale: .98`. Set `defaults.global.ripple: false` and add the press scale in CSS.
- **Theme color bloat.** Adding 50–950 ladders as theme `colors` makes every key emit `--v-theme-*`, an overlay multiplier, `bg-*`/`text-*`/`border-*` classes and an auto `on-*`, per theme. For 5 hues × 11 steps × 2 themes that's sizeable. Consider putting ladders in `variables` (emitted as `--v-<key>` triplets, no classes) and only roles in `colors`.
- **`variations`** uses Vuetify's lighten/darken, not a Tailwind-like ladder. A ladder generator (e.g. OKLCH) must live in c-style JS.
- **Auto on-colors** pick #FFF/#000 by contrast. Canon high emphasis is always white on 600, except warning, which is amber-950 on amber-400. Set `on-*` explicitly.
- **Checkbox and radio glyphs** come from FA (`fas fa-check-square`, `far fa-square`, `far fa-dot-circle`). Canon draws them in CSS: a 1px box at radius c/4 with an ink fill and a 1.5-stroke check. Options are custom SVG icon aliases (component icons) or CSS replacing `.v-selection-control__input` content. The demo's FA must stay loaded for Coalesce's literal `fa fa-*` classes.
- **Icons.** Canon uses Lucide at 1.5 stroke; the demo uses FA 7. Decide whether Lucide becomes the default set with FA kept only for Coalesce literals.
- **Inter loading.** Canon loads InterVariable from rsms.me (Google Fonts strips the cv/ss features). The demo bundles `@fontsource/roboto`. Pick self-hosted or the rsms CDN (unverified: whether `@fontsource-variable/inter` keeps the cv/ss features), then set `--v-font-body` via theme `variables` and `font-feature-settings` in CSS.
- **Dark mode.** Canon uses `light-dark()` and `color-scheme`; Vuetify uses `.v-theme--dark` and `defaultTheme: 'system'`. Mapping is per-theme color values. Dark surfaces step 950 → 900 → 800, and Canon's light theme uses a zinc-50 canvas with white surfaces. These map to `background` / `surface` / `surface-bright|light` plus custom keys.
- **Focus ring.** VBtn has a fixed `::after` 2px currentColor at .25. Canon wants a 2px offset gap plus a 1px accent ring via box-shadow. Needs CSS on `.v-btn:focus-visible::after` (or suppress it and add a box-shadow), and the same for other focusables.
- **`configFile` cost.** Not measured: about 100 SASS compiles at cold start and on every settings save. Benchmark before committing to SASS-heavy tokens. Runtime CSS variables are the fallback.
- **6.5.1 vs source.** Style against `PKG/dist` CSS. Don't copy selectors from `.refs/coalesce`.

## Canon→Vuetify mapping questions the planner must decide
1. **Emphasis → variant.** high→`flat` with a color; medium→`tonal` (re-tinted); low→`outlined` (with a tone-200 border, not currentColor); minimal→`text`. Or define aliases (`CanonBtnHigh`, …) whose defaults set the variant. Which is the c-style API?
2. **Neutral intent.** Canon's default button intent is accent (blue), and neutral is explicit. Vuetify's default `VBtn` color is none (on-surface). Should the default map to `primary` or neutral?
3. **Size → size/density.** Map Canon sm/md/lg (32/40/48) to Vuetify `size` small/default/large via `$button-named-sizes`, and fields via density compact/comfortable/default? Or make Vuetify's `default` = Canon md (40) and drop density for buttons? What do x-small and x-large become?
4. **Density.** Canon density only affects table rows (+0/16/32). Should Vuetify `density` be repurposed as Canon *size* for fields, with table density mapped to Canon density?
5. **Palette → theme.** Which keys go in `colors` (roles: primary, secondary?, success, warning, error, info, surface, background, on-*) and which in `variables` (ladders)? What is `secondary` in a one-accent system?
6. **Ladder generation.** Generate from one brand color at runtime (JS in the blueprint) or at build time? Which algorithm reproduces Tailwind-like step spacing? Neutral: plain zinc or brand-tinted?
7. **Selected = ink.** Should checkbox, radio, switch and selected list items use `on-surface` (ink) rather than `primary`? That overrides the demo's `VSwitch: { color: 'primary' }` default.
8. **Radius.** Should `$border-radius-root` be 8px with `$rounded` redefined to Canon's {4, 8, 12, 24 dialog, 12 card/table}? Or keep per-component radii?
9. **Typography.** Map Canon's ramp onto MD3 `$typography` roles (body-medium = 14/20, label-large = button 14/20/500, title-large = card title 16/24/600…)? And set the literal font-size variables (`$field-font-size` and others)?
10. **Elevation.** Map Canon's 4 shadows to `$shadow-key`/`$shadow-ambient` levels (1 = control, 2 = raised, 3 = floating, 5 = overlay) and set component `*-elevation` variables to match. Should cards get edge + raised rather than Vuetify's border?
11. **Coalesce admin toolbars** are `color="primary"` via `titledAdminPage`. Keep them, or make them neutral surfaces per Canon?
