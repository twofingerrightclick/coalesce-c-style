# c-style design-fidelity review (post M17)

Reviewer pass, 2026-11-06. Reviewed `packages/c-style/src`, the demo app (`https://localhost:48110`), Storybook `Parity/*`, and Canon's live reference site. Nothing in the repo was changed except this file.

Evidence lives in the session scratchpad: `/private/tmp/claude-501/-Users-austenfrostad-kepler-tasks-eaf810a5-b91c-4f71-8b69-5adf30184a07/7951fc68-a396-431d-909d-380898743feb/scratchpad/review/`
- `parity.json`: every `data-parity` pair in all 25 Parity stories, light/canon, dark/canon and light/violet, 18 computed properties each (`parity.mjs`, summarised by `summ.py`).
- `shots/`: app pages × light/dark (`app-*.png`), kitchen states (`kitchen-{menu,dialog,toast,select}-{light,dark}.png`), Canon live pages (`canon-*.png`), each Parity story (`parity-*-{light,dark}.png`).
- `probe1–4.mjs`, `canonm.mjs`, `sbp.mjs`: the measurement scripts quoted below.

## Overall verdict

The foundation is right. At md, Canon's load-bearing rules (§6 of canon.md) are met almost everywhere they can be measured: Inter with alternates, 32/40/48 controls, 4/8/12 radii, the zinc and accent ladders, the emphasis × intent tints, hairlines and edge + shadow depth, the focus ring and field halo, and the 0.12s/0.98 motion. Button colours match Canon exactly in light and dark at every emphasis, intent and state (rest/hover/active/focus-visible/disabled). The only parity diffs on buttons are a `color()` vs `rgb()` notation difference and the dark disabled tones already listed as a deviation. Fields, menus, dialogs, tooltips, the table, the shell and nav also match on the live pages.

What's still off falls into three groups:
1. **A few components are still oversized** compared with Canon's real defaults. The worst are tags and stacked choice controls.
2. **Some intent colours still come out as Vuetify's solid fills**, most visibly toasts.
3. **The parity harness has blind spots.** Some pairings hide real deltas, and the same blind spots let two of the findings above through.

The architecture holds up: 0 `!important` in `overrides/`, 6 in `coalesce/` (each justified by inline styles), about 460 non-comment lines of CSS in total, and no overrides partial near 150 lines. Its weak spots are a handful of over-broad or internals-dependent selectors and a size-context API that is only half built.

## Ranked findings

Severity: **H** = visible on typical Coalesce pages or against the user's chunkiness priority; **M** = visible in common components; **L** = polish or hygiene.

### 1. H — Tags are a size too big (32px / 14px; Canon's default is 24px / 12px)
- Evidence: in Canon, **sm is the default tag size at `:root`** (canon.md §4 Tag, "sm is the default at :root"). The live `tag.html` measures `.canon-tag` at h 24, 12/16, padding 3. c-style's `v-chip` is h 32, 14/21, radius 4 (`sbp.mjs parity-data--tag`). The Parity story didn't catch it because `CanonFrame` sets `data-size="md"` on `<html>` and `<body>`, which forces Canon's md tag (see finding 9).
- Why it matters: every status chip, `c-select-values` chip and `c-display` tag list is 33% taller than Canon's. This is chunkiness the user would notice.
- Fix (SASS lever): `$chip-height: 24px`, `$chip-font-size: .75rem`, and adjust `$chip-padding-ratio` so text sits 6px in. Set `$chip-label-border-radius: 2px` and line-height 16. Keep md (32) only where Canon uses it, via nested defaults (`VCombobox`/`VAutocomplete`: `{ VChip: { size: 'default' } }` once the named sizes are remapped). This also fixes the open deviation "chip small is 26".

### 2. H — Toasts with an intent are solid green or red blocks
- Evidence: `parity-surfaces--toast-light.png`. `v-snackbar color="success"` gives a solid green-600 bar with white text. Canon's intent toast is the white / zinc-800 surface with a 4px `-4px 0 0 <hue>-500` bar and a 600 icon. Plain toasts match: white, r12, edge + floating, 48 vs 46 tall.
- Why it matters: `color="success"/"error"` is the common way apps raise toasts. This is the most "Vuetify-looking" thing left. Progress lists it only as "intent bar not implemented".
- Fix: blueprint `VSnackbar: { variant: 'outlined' }`, so `color` becomes the tone context instead of `bg-*`. Then move the outlined-alert recipe in `_surface.scss` (surface fill, edge, bar from `--cs-tone-bar`, icon in the intent) into a shared selector, `:is(.v-alert, .v-snackbar__wrapper)--variant-outlined`, rather than writing a second recipe. That is one rule family for two components, per the §3f escalation rule.

### 3. H — Stacked checkboxes, radios and switches sit 40px apart (Canon: 28)
- Evidence: every `cb-*`, `radio-*` and `sw-*` pair has block-size 40 vs 20. The radio group is 172 vs 134. Live Canon `.canon-choice` is h 20 with an 8px fieldset item gap (canon.md Fieldset: `item-gap` 8 at md), so the pitch is 28. c-style's pitch is 40 (kitchen `checkbox row` h 40). M14 *added* `.v-radio-group .v-selection-control { min-height: var(--v-input-control-height) }`, which moved radios toward Vuetify's 40 rather than Canon's 28.
- Why it matters: any settings form or filter panel with a list of options is about 43% taller than Canon's.
- Fix: keep 40 for a *lone* checkbox or switch that has to line up with 40px fields (the Coalesce editor's bool rows). Inside groups, re-point the variable rather than the property: `.v-radio-group, .v-selection-control-group { --v-input-control-height: 20px }` plus `row-gap: 8px` on the group (12 for switches). Ideally drop the M14 min-height rule. It's one rule in `_choice.scss` and reads tokens. For a column of separate `v-checkbox` inputs (no group wrapper), the `cs-form` gap rule already adds 16, which is too much for choices. Consider `.cs-form .v-checkbox + .v-checkbox { margin-top: 8px - (40-20) }`, or document "wrap choices in a `v-radio-group`/fieldset".

### 4. M — Audit page "Entity Type" filter renders with no label and no value
- Evidence: `/admin/audit` toolbar (`shots/audit-toolbar.png`, `probe4.mjs`). The first select's field is `v-field--dirty` with an empty display, and its `.v-field-label` "Entity Type" is `visibility: hidden`, so the user sees a blank 250px select. Vuetify hides a single-line label once the field is dirty. Before c-style the label floated above, so it stayed visible.
- Fix: this is a side effect of the toolbar `cs-label-inside` + `singleLine` path. Option A: in toolbars, set `persistentPlaceholder: false` and `placeholder` = the label, so a blank-dirty field still shows the label text. This is awkward because the placeholder isn't set from the label automatically. Option B (simpler): find out why Coalesce's audit type select is dirty with an empty value. It probably holds `""` or an unmatched value; a `:clearable` or `null` default fixes it at the source. Check the baseline before deciding. Either way, add the audit toolbar to `form.spec.ts` with an assertion that every toolbar field shows either a label or a value.

### 5. M — Admin list toolbar: 113px of chrome before the first row; the "Showing 1 - 10 of 40" summary is 16px ink
- Evidence (`probe1.mjs`): `.c-admin-table-toolbar` is 56 + 56 + 1 = 113px (main row plus extension). The summary text is 16/24 in ink at y 80, centred. Canon's pagination summary is control type (14/20) in muted (zinc-500), the same as c-style's own bottom `.c-list-pagination`. The toolbar's "Page [1] of 4" jump field is 100px wide for one digit; Canon's jump input is `min 2.5em, field-sizing: content`.
- Why it matters: it's the first thing on every admin page, and it reads heavy.
- Fix (unlayered `.c-*`, `_list.scss`): add the toolbar's range display to the existing pagination type rule (one selector). Optionally make the extension row `control + 8` (48) instead of 56, so the two rows read as one toolbar with Canon's 8px toolbar row-gap (8 + 40 + 8 + 40 + 8 = 104 rather than 112). The jump field width is Coalesce's inline style; leave it unless it's trivial.

### 6. M — Nav-list heading is 12px instead of Canon's 10px caps
- Evidence: `parity-navigation--nav-list` `nav-heading` font-size 12 vs 10, and padding-inline 6 vs Canon 10 (control padding). Vuetify uses a separate `$list-nav-subheader-font-size: .75rem` that c-style doesn't set; the menu subheader is already correct at 10.
- Fix (SASS, one line): `$list-nav-subheader-font-size: 0.625rem`. Quick win.

### 7. M — Segmented control (VBtnToggle) renders as a button group, not Canon's track
- Evidence: `parity-buttons--segmented-control`. Options are 40 tall vs 34, radius 8/0 vs 7, there's a frame border, and rest options are ink instead of muted. The kitchen "Day | Week | Month" reads as an outlined button group. Already a deviation (M7).
- Why it matters: medium. VBtnToggle is the common Vuetify way to build a view switcher.
- Fix: the inset-tabs recipe (`_nav.scss`) already draws Canon's track and card. Either recommend `v-tabs` (with `inset`) for view switches in the docs, or reuse the same track rule for `.v-btn-toggle` through the shared partial: `fill` track, 3px inset, 34px items, muted rest, card on `.v-btn--active`. Don't add a third recipe.

### 8. M — Over-broad overlay selectors
- `.v-overlay__content .v-list-item--active` (tick, no fill) and `.v-overlay__content .v-list-item:focus-visible { box-shadow: none }` (`_overlay.scss`) match every list inside **any** overlay, including a `v-dialog` with a selectable or nav list and a bottom sheet. A list in a dialog then loses its active fill and its focus ring.
- `.v-btn.text-neutral:not(:active, .v-btn--active, [aria-expanded='true']) .v-icon` is (0,4,0), above plan §3d's (0,3,0) ceiling. It's harmless, but the rule is in the plan.
- Fix: scope the menu rules to `:is(.v-menu, .v-select__content, .v-autocomplete__content, .v-combobox__content) > .v-overlay__content`. Same behaviour in menus and pickers, nothing elsewhere.

### 9. M — The parity harness hides deltas (and hid #1)
- **CanonFrame forces `data-size="md"`.** In Canon, tooltips and tags default to **sm**, so the harness compares them against md (tooltip 34 tall/14px vs the real 26/12 — c-style is *right* and the harness says wrong; tag the reverse). Fix: let a story opt out of the size attribute, or pass `size: null` for Tooltip/Tag stories.
- **Some stories don't render the real Vuetify composite.** `Parity/Overlays/Dialog` is a bare `v-card rounded="xl"` (radius 16, elevation 2, footer 60 vs 88) rather than a `v-dialog`, so none of `_overlay.scss`'s dialog rules or `$dialog-*` are exercised. The real kitchen dialog *does* match (24 radius, overlay shadow, 72 header, 88 footer, scrim white .85 + blur 4). `Parity/Overlays/Menu` is a bare `v-list`, not a `v-menu`, so the `VMenu` nested defaults (pa-1, row radius 8) aren't measured: its rows are full-bleed and square. Fix: render `v-dialog`/`v-menu` with `attach` + `:model-value="true"` (the Tooltip story already does this) and put `data-parity` on `.v-overlay__content > *`.
- **Some pairs measure different boxes.** Toast pairs the `v-snackbar` root with `.canon-toast` (diff says radius 0 vs 12); text-input and select pair the `v-input`, not `.v-field` (border 0 vs 1, radius 0 vs 8). These are noise that hides real diffs. Re-point `data-parity` onto `.v-field` and `.v-snackbar__wrapper` (Vue `content-props`/`class` hooks).
- Net effect: of roughly 25 stories, the raw diff report is dominated by structural noise (padding vs label inset, underlay vs background). Nobody can read it as a regression gate. A small allowlist of known-equivalent structural diffs (what `summ.py` does) would make it one.

### 10. M — Size contexts are half-built public API
- `.cs-size-sm/.cs-size-lg` change the `--cs-*` tokens, so icons, label-above, alerts, breadcrumbs, form gap and c-admin rows follow them. Vuetify's own runtime variables don't (button, field, list, table heights stay md; M14b was skipped). In a `.cs-size-sm` region, a 16px icon sits inside a 40px button next to a 40px field with a 12px label above. Storybook exposes this as a global.
- Fix: either do M14b (re-point `--v-btn-height`, `--v-field-*`, list item min-height and so on per context; about 30 lines in one shared partial), or stop advertising the classes: remove the Storybook size global and mark `.cs-size-*` internal. Don't leave it in between.

### 11. L — Layer order: the `c-style` sublayer isn't in the order statement
- `tone.repoint` emits `@layer vuetify-utilities { @layer c-style {} }`. Its rank depends on being the first mention *after* Vuetify's five utility sublayers. That holds today because `layerOrderCss` lists those five first. But if Vuetify adds a utility sublayer in a minor release, and bundled CSS order puts c-style's file first, the new layer would rank above `c-style` and every button and tag re-point would silently stop applying.
- Fix: append `c-style` explicitly in `layerOrderCss` and `_layers.scss` (`…theme-foreground,c-style;`). Add a plumbing assertion that compares `vuetify/lib/styles/layers.css` with `layerOrderCss` minus `c-style`, so a Vuetify upgrade that changes its layers fails a test instead of mis-ranking silently.

### 12. L — Internals-dependent rules that a Vuetify minor could break
None of these is wrong today; list them in the upgrade checklist:
- The menu tick hijacks Vuetify's `.v-list-item::after` (its focus border). If Vuetify moves focus styling back to `::after`, the tick and focus collide.
- The dialog header/body/footer chain `.v-dialog > .v-overlay__content > :is(.v-card, form > .v-card) > :is(.v-card-item, .v-card-title)` breaks with any wrapper (`v-form` instead of `form`, a `v-sheet`). Prefer `.v-dialog .v-card > .v-card-item` (one descendant hop).
- `$field-density: -3` on a 52px base relies on Vuetify's hard-coded `16px + density/2` padding math. It's clever and documented; a change to that formula moves every field. `size.spec.ts`'s "every field exactly 40" catches it, so it's fine.
- `$button-margin-start-multiplier: -6.666…` is the same kind of risk, and also covered by a spec.
- `.v-tabs--inset` + `.v-tab__slider` as the card is Vuetify 4 specific.
- About 25 `__element` selectors in total (`probe`: `.v-selection-control__input` ×5, `.v-field__outline` ×4, `.v-overlay__content` ×4, …). That's reasonable for this scope.

### 13. L — Adoption leaks into the app
- Apps must pass `color: null` to the audit route and drop `color: "primary"` from `titledAdminPage`, or they get a blue toolbar. This is the only Coalesce change that isn't zero-touch.
- Fix: in `coalesce/_admin.scss`, re-point the toolbar tone, for example `:is(.c-admin-table-toolbar, .c-admin-editor--toolbar, .c-admin-audit-log-page .v-toolbar).bg-primary { --v-theme-primary: var(--v-theme-surface); --v-theme-on-primary: var(--v-theme-on-surface) }` in the `c-style` sublayer. Then adoption is the blueprint plus the two imports plus the Vite plugin.
- The package ships TypeScript source (`exports["."] → ./src/index.ts`). That's fine inside the monorepo, but it needs a build step (M19) before any external app can use it.

### 14. L — Smaller fidelity deltas (verified, cheap or optional)
| Item | Measured | Canon | Lever |
|---|---|---|---|
| Admin table cells wrap (dates on 2 lines) | 2-line cells in 56 rows | Data Table cells `nowrap` unless `data-wrap` | `_list.scss`: `.c-table td { white-space: nowrap }`; optional, since it widens tables |
| Dialog primary action | tonal (medium) | Canon examples use high (solid) for the confirm | R3 decision; fine, but `v-dialog` card actions could default the last button to `flat` only if the user wants it |
| Snackbar height | 48 | 46 | `$snackbar-content-padding: 12px` + `min-height` 0; trivial |
| Nav sidebar inset | items 243 wide, 10 in | 232 wide, 16 in | known deviation; leave |
| Pagination row | 48 container | 40 | Vuetify's `nav` margin; leave |
| Date picker controls | `‹ Nov ⌄ › ‹ 2026 ⌄ ›` | `November 2026  ‹ ›` | `VDatePicker` `controlVariant: 'modal'`/header slot; optional |
| Color picker inputs | large empty boxes (kitchen) | — | low traffic; leave |

## Chunkiness verdict (the user's top concern)

| Area | c-style | Canon md default | Verdict |
|---|---|---|---|
| Icons | 20 (16 in sm buttons), Lucide 1.5 | 20 | ✔ done |
| Buttons / fields / list rows / nav items / tabs | 40 | 40 | ✔ |
| Table header / rows | 40 / 56 | 40 / 56 (comfortable is Canon's default; compact = 40) | ✔ faithful. If the user still finds 56 heavy, `VTable`/`VDataTable` `density: 'compact'` gives Canon-compact 40 with no CSS, but that's a deliberate departure from Canon's default. Row actions are 40×40 in both. |
| App bar | 48 (demo `density="compact"`) | 64 | lighter than Canon; fine |
| Admin toolbars | 2 × 56 = 113 | ≈ one 56 row + toolbar row-gap 8 | slightly heavy, see #5 |
| **Tags** | **32 / 14px** | **24 / 12px** | ✘ see #1 |
| **Stacked choices** | **40 pitch** | **28 pitch** | ✘ see #3 |
| Tooltip | 26 / 12px | 26 / 12px (sm default) | ✔ |
| Body text | `.v-main` 16/24 | page body 16, controls 14 | ✔ components set their own 14 |
| Line-heights | 14/20, 12/16, 16/24 throughout | same | ✔ |

## Deviations listed in progress.md: which matter

**Matter visually (fix):**
- Snackbar intent bar not implemented → #2 (H).
- VBtnToggle gets the Button Group look → #7 (M).
- Chip `small` is 26 → folded into #1.
- Unsorted sort arrow hidden until hover (Canon shows `arrow-down-up`). Low-medium: users can't tell columns are sortable. Lever: a VDataTable `sort-icon`/header slot isn't global, so either accept it or add a `_data.scss` rule that shows Vuetify's hidden sort icon at `quiet` opacity.
- Toolbar fields with single-line labels → #4.

**Fine to keep (invisible or defensible):**
- Field height via density −3 on a 52 base (deviation 1). Clever, spec-covered.
- Success white on green-600 at 3.3:1, and emerald/orange presets at 3.6–3.8. This is Canon's own choice; it's documented.
- Ladder model, theme in `src/theme/`, `$elevation-overlay-step`, x-large = large.
- Disabled dark low/minimal fg zinc-500 vs Canon zinc-600, and outlined disabled line zinc-700 vs zinc-800. The parity diff shows exactly these, and they're barely perceptible.
- Messages at medium-emphasis .6 instead of zinc-500 (≈ the same colour); error message 600 vs 700.
- Unchecked hover line staying zinc-400; label ink zinc-950 vs zinc-900.
- Dark alert icon 600 vs 400. Slightly dull in dark, low priority; it would need a `--v-<intent>-icon` role.
- Dialog open/close transition, missing tooltip arrow, breadcrumb `/` instead of a chevron (VBreadcrumbs `divider` accepts a slot; the demo could pass `$next` if wanted).
- Nav current dark zinc-800 vs zinc-700, tab card dark zinc-800 vs zinc-700. One step, fine.
- Demo app bar at 48.
- Today = ring instead of dot in the date picker; calendar cells 41 vs 40.
- No Coalesce Parity stories. The app specs cover them; fine.

## Quick wins (each < 30 min, all on a preferred lever)

1. `$list-nav-subheader-font-size: 0.625rem` (#6). SASS.
2. Tag size remap: `$chip-height`, `$chip-font-size`, padding ratio, radius (#1). SASS.
3. `VSnackbar: { variant: 'outlined' }` plus widening the outlined-alert selector to snackbars (#2). Blueprint plus one shared selector.
4. Toolbar range display to muted 14/20 (#5). One selector in `_list.scss`.
5. Add `c-style` to the layer order statement, plus the upgrade test (#11).
6. Scope the menu tick/focus rules to menu and picker overlays (#8).
7. Fix the Parity Dialog/Menu stories to render real `v-dialog`/`v-menu`, and let Tooltip/Tag frames drop `data-size` (#9).
8. Re-point admin/audit toolbars off `bg-primary` so adopters don't edit routes (#13).

## Leave alone

- The button colour machinery (underlay tint rungs + `tone.repoint`). It matches Canon exactly across 3 intents × 4 emphases × 5 states × 2 modes, and it's the most valuable part of the package.
- Field frame, halo and label-above. They match the live Canon site (40 frame, 6px label gap, blue-600 + blue-100 halo; dark blue-400 + blue-900).
- Table geometry (40/56, 7/16 cells, rule hairlines, muted header, 40px row actions). It's identical to live Canon `data-table.html`.
- Shell: bar and drawer on `rule-faint`, 264 sidebar, 40px nav items 10 apart, icons muted at .6 (≈ zinc-500).
- The unlayered `.c-*` partials with `!important` only against inline styles. It's the correct trade-off, and it's linted.
- Tooltip at 12/16 radius 4. Correct for Canon's sm-default tooltip, even though the Parity harness flags it.
