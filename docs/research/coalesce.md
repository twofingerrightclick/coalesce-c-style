# Coalesce Vue components: styling research

Scope: `coalesce-vue-vuetify3` (the `c-*` components) on Vuetify 4, as used by the demo app. This covers what we need to restyle them to Canon.

Path abbreviations:
- `SRC` = `.refs/coalesce/src/coalesce-vue-vuetify3/src` (clone at `3097a4a`, version `0.1.0-local`, newer than 6.5.1)
- `CV` = `.refs/coalesce/src/coalesce-vue/src`
- `WEB` = `MyProject/MyCompany.MyProject.Web`
- `PKG` = `WEB/node_modules/coalesce-vue-vuetify3` (installed **6.5.1**). Vuetify installed is **4.3.2**.

---

## 1. Philosophy: metadata-driven wrappers over stock Vuetify

- Each `c-*` component reads generated metadata through `for` (a prop name, a metadata object, or a type name) and `model` (a ViewModel, ListViewModel, or API caller). From that metadata it works out the label (`displayName`), hint (`description`), `persistent-hint` (true when a description exists), validation `rules`, and `aria-label`. It then renders **ordinary Vuetify components**. See `buildVuetifyAttrs` in `SRC/components/c-metadata-component.ts:334-392`.
- **Passthrough.** Attributes that aren't props are spread onto the Vuetify component they delegate to. `buildVuetifyAttrs` spreads `...attrs` *after* the computed `label`/`hint`/`rules`, so callers can override them. `c-select`, `c-datetime-picker`, `c-select-*` and `c-admin-create-btn` set `inheritAttrs: false` and re-bind `inputBindAttrs`, which still includes `class` and `style`. `c-input` passes all named slots except `default` through to the Vuetify input (`SRC/components/input/c-input.vue:316-320`). The docs say the same: "all other attributes are passed through to the delegated-to component" (https://intellitect.github.io/Coalesce/stacks/vue/coalesce-vue-vuetify/components/c-input.html).
- **Vuetify global `defaults` reach Coalesce's inner components.** The dist imports real components from `vuetify/components` (for example, the `c-select.js` header imports `VTextField, VMenu, VList, VChip...`). That means `defaults.VTextField` applies to `c-input` (string/number), **`c-select`** (its root is a `v-text-field`, not `v-select`/`v-autocomplete`), and `c-datetime-picker`. `defaults.VSelect` applies to enum `c-input` and `c-list-page-size`. `defaults.VCombobox` applies to `c-select-values` and `c-select-string-value`. `defaults.VAutocomplete` applies only to enum-collection `c-input`.
  - **Explicit props beat defaults.** Coalesce hardcodes `density`, `variant`, `color` and `elevation` in many templates (listed in §2), so defaults can't change those spots.
  - `c-*` components are not Vuetify components, so keys like `defaults.CSelect` or `defaults.CAdminTable` do nothing. To scope defaults, wrap the c- components in `<v-defaults-provider>`. Coalesce does this itself in `c-admin-audit-log-page.vue:38-91` (`global: { density, variant, hideDetails, clearable }`).
- **Coalesce registers no Vuetify defaults, aliases, theme, or icon set.** `createCoalesceVuetify` (`SRC/install.ts`) only provides metadata, `adminOverrides` (swap the input/display component per metadata value) and `adminExtensions` (inject components into admin toolbars, rows and headers). Both are source only; neither exists in 6.5.1's dist. Admin pages resolve their inputs through `resolveAdminInputComponent` (source only; 6.5.1 hardcodes `c-input`).

### c-input dispatch (`SRC/components/input/c-input.vue:296-571`)
| metadata | renders |
|---|---|
| string / number | `VTextField` (`type` set from subtype: email/tel/color/url, or number); `VTextarea` for `multiline` or the `textarea` prop; password subtype → wrapper adding `append-inner-icon="fa fa-eye"` |
| boolean | `VSwitch` (`VCheckbox` with the `checkbox` prop) |
| enum | `VSelect` (item-props → `subtitle: description`) |
| enum[] | `VAutocomplete` multiple + `chips` + `closable-chips` |
| file / file[] | `VFileInput` |
| date | `c-datetime-picker` |
| model / model[] (value role) | `c-select` |
| `[ManyToMany]` collection | `c-select-many-to-many` |
| primitive[] | `c-select-values` |
| anything else | default slot, else a legacy `div.input-group > label + p > c-display.subtitle-1` (Vuetify 1 class names, effectively unstyled) |

**c-input adds no `c-input` class.** The class goes onto the Vuetify root (`.v-input.v-text-field`, …), so there is no CSS hook unique to c-input.

---

## 2. Per-component anatomy

Format: Vuetify components rendered · own classes · own CSS · props that affect appearance. `!` = `!important`.

### Inputs
- **c-select** (`SRC/components/input/c-select.vue`, 1634 lines). Root is `v-text-field.c-select` with `role=combobox`, plus `c-select--is-menu-active` and `c-select--multiple`. Selected items render as `span.v-select__selection`, with `v-chip size="small"` when multiple. The menu is `v-menu` (contentClass `c-select__menu-content`) > `v-sheet` > **search `v-text-field` hardcoded `variant="filled" density="compact"` and `prepend-inner-icon="fa fa-search"`**, then `v-list density="compact" max-height=302`, with `v-list-item`s, a `v-checkbox-btn` when multiple, and `.c-select__create-item` (`--end`). Empty state uses `div.grey--text` (a Vuetify 2 class, dead in v3/v4). Overflow note uses `.text-grey.font-italic`.
  CSS (lines ~1500-1634): `.c-select .v-field{min-height:var(--v-input-control-height,56px)}`, `.v-input__details{padding-inline:16px}`, rotating `$dropdown` icon, `.v-list-item.pending-selection` overlay opacities, `.c-select__create-item .v-list-item__prepend{width:40px}`. Props: `menuProps`, `listProps`, slots `item`, `selected-item`, `list-item`, `list-item-outer`, plus every v-text-field slot.
- **c-select-many-to-many**: `c-select.c-select-many-to-many` with `multiple`. No CSS of its own.
- **c-select-values**: `v-combobox.c-select-values` with `multiple chips closable-chips`. **c-select-string-value**: `v-combobox.c-select-string-value`. Neither has CSS.
- **c-datetime-picker** (`SRC/components/input/c-datetime-picker.vue`): `v-text-field.c-datetime-picker` (plus `has-today-btn`), or a native `type=date/time/datetime-local` field with the `native` prop. `append-inner-icon` is `fa fa-calendar-alt` / `fa fa-clock` plus `cursor-pointer`. The menu `.c-datetime-picker__menu` contains `v-card.d-flex` > `v-date-picker` (`:rounded="false"`, `color` default `"primary"`, `datePickerProps`) + `v-divider` + `c-time-picker` + `v-btn.c-datetime-picker__close-btn` (`icon="$complete"`, `size=x-small`).
  CSS (source; 6.5.1 has no `--date-picker-height`; it does keep the 300px width and 32px header, see §6): hardcoded 300px picker width, `--date-picker-height:396/448px`, `.v-date-picker-header{font-size:32px;padding:6px 14px}`, `.v-date-picker-month__day{width:36px} .v-btn{font-size:14px!}`, hides `.v-picker-title`, 3-column months grid, xs breakpoint `@media (max-width:600px)`.
- **c-time-picker** (internal; `SRC/components/input/c-time-picker.vue`): `v-sheet.c-time-picker` > `v-sheet.c-time-picker-header` (`color` prop, default primary) > `.c-time-picker__columns` > `.c-time-picker__column(-hour|-minute|-meridiem)` > native `button.c-time-picker__item` (active = `c-time-picker__item-active bg-{color}`). CSS: 32px/40px header, `border-radius:8px`, padding `5px 14px`, `max-height:328px`, custom webkit scrollbar, `color-mix` with `--v-theme-on-surface` / `--v-theme-surface`.
- **c-list-filters** (`c-list-filters.vue`): `v-btn.c-list-filters variant="text"` > `v-badge color="secondary"` + `v-icon` (`fa fa-filter` / `fa fa-columns`). The menu holds `v-card.c-list-filters--card` > `v-list density=compact`. Each property's sub-menu is a `v-btn size=small height=32` (active → `color=primary variant=flat`) opening `v-card.c-column-filter-card` (`min-width:350px; max-width:500px`) > **c-list-filter-input** (`div.c-filter-row`, scoped `padding:8px 0`). That contains `v-btn-group variant=outlined density=compact` with `color=primary`/`flat` toggles and a `color="error"` Remove button, then `v-select`/`c-select`/`c-input`/`v-text-field`, all **hardcoded `density=compact variant=outlined`**. The Reset item has an inline `style="margin-left:2px;margin-right:-21px"`.
- **c-list-pagination**: `div.c-list-pagination.grey--text` (flex, space-between, `font-size:16px`) > `c-list-page-size` + `c-list-range-display` + `c-list-page`.
- **c-list-page**: `div.c-list-page` (flex; `> *{margin:0 .5em!}`; `font-size:16px`). Contains `v-btn variant=outlined size=x-small icon` with `$prev`/`$next`, and `v-text-field.current-page type=number density=compact variant=outlined hide-details` (width 100px). The CSS also targets v2 selectors (`.v-input__slot`, `.v-input__append-inner`) that no longer exist.
- **c-list-page-size**: `div.c-list-page-size` > `v-select.c-list-page-size--dropdown` (`variant=outlined density=compact hide-details`, max-width 110px). It has the same dead v2 selectors.

### Display
- **c-display** (`SRC/components/display/c-display.vue`): a bare `<span>` (or the `element` prop) with **no class**. Variants: `<a href>` for url/email/tel; `<img>` for url-image; `span.c-display--color-swatch` (1em, radius .5em) for color; inline `white-space:pre-wrap` for multiline; password renders `<i class="fa fa-eye pr-1">` with `.c-password-display`. Booleans render "✓"/"✗" text.
- **c-admin-display** (`SRC/components/admin/c-admin-display.vue`): `router-link` for navigations and collection counts, `<a href="#">` to download binaries, otherwise c-display. No classes.
- **c-loader-status** (`SRC/components/display/c-loader-status.vue`): `transition-group.c-loader-status` > `v-alert.c-loader-status--messages.c-loader-status--errors|--success` (`type` error/success, `density` prop, Retry `v-btn variant=outlined prepend-icon=$loading`) > `ul > li.c-loader-status--message`, then `.c-loader-status--progress-group` > `v-progress-linear.c-loader-status--progress` with **height default 10px, color default "primary"** (props). It sets the inline var `--c-loader-status-progress-height`. CSS covers transitions and `ul{padding-left:20px}`. The `loaders` flags (`no-initial-content`, `no-progress`, `no-placeholder`, …) control visibility.
- **c-table** (`SRC/components/display/c-table.vue`): `div.c-table(.c-table--editable)` > c-loader-status > **`v-table` with inline `style="--v-table-header-height: 40px"`** (`tableProps`). Headers are `th.text-left.sortable.prop-{name}`, with a sort icon `v-icon fa fa-caret-up/down`. Cells are `td.prop-{name}` holding c-display, or in editable mode c-input (`density=compact variant=outlined hide-details=auto label=""`). CSS: `img{max-height:50px;max-width:150px}`, editable td padding 0 and `.v-field{font-size:14px}` / `.v-input{min-width:120px}`, `th .v-icon{font-size:16px}`. The sticky `.fixed-column-right` actions column uses `color-mix(surface 70%)`, `backdrop-filter:blur(12px)`, **`box-shadow:-2px 2px 4px rgba(0,0,0,.4)`** and `border-top-left-radius:8px`, with `.v-theme--dark &` variant using `brightness(3)`. A Firefox hack sets `border-radius:0!` on any ancestor of `.fixed-column-right`.
- **c-list-range-display**: `span.c-list-range-display` > `--start`, `--end`, `--total`.
- **c-app-update-alert**: `v-snackbar.c-app-update-alert color="primary" location="bottom left"`.

### Admin
- **c-admin-table-page**: `v-container.c-admin-table-page fluid .type-{Model}` (`margin-bottom:50vh`) > c-admin-table + `c-admin-methods.c-admin-table-page--methods` (`margin-top:30px`). Props: `type`, `list`, `color` (default null), `autoSave`. Page sizes are hardcoded to `[10,25,100,500]`.
- **c-admin-table**: `v-card.c-admin-table.type-{Model}` > c-admin-table-toolbar > `.c-admin-page--description` (an `<i class="fa fa-info-circle">` plus text, `font-size:12px; margin:4px 16px; opacity:.9`) > `v-card-text` > c-table (admin) + `c-admin-create-btn.my-2` + `c-list-pagination.mt-4`. The row actions cell is `td.c-admin-table--actions`, with raw `<i class="v-icon notranslate fa fa-save|fa-edit|fa-ellipsis-h|fa-trash-alt">` inside `v-btn icon` (variants `text`, Save `color=success` elevated when dirty). CSS: row hover `cursor:pointer` and `background: rgba(var(--v-border-color), var(--v-hover-opacity))`; links `text-decoration:none; filter:brightness(1.2)` on hover.
- **c-admin-table-toolbar**: **`v-toolbar extended density="comfortable" elevation="4" :color`** with class `c-admin-table-toolbar`. Main row: `v-toolbar-title.c-admin-table-toolbar--model-name`, `v-divider vertical`, `c-admin-create-btn` (`variant=text`, `$plus`), Reload (`$loading`), Edit/Lock (`$edit` / `fa fa-lock`), all `variant="text"`, then `.c-admin-table-toolbar--range` and `c-list-page`. Extension row: search **`v-text-field.c-admin-table-toolbar--search density="comfortable" single-line prepend-inner-icon="fa fa-search"`**, c-list-filters, c-list-page-size. CSS: `.v-btn{min-width:auto}`, `input[type=text]{caret-color:currentColor!}`, **`.v-toolbar__extension{height:49px!}`**, `.c-list-page,.c-list-page-size{margin-right:8px}`.
- **c-admin-editor-page**: `v-container.c-admin-editor-page.type-{Model}` (`max-width:1300px; margin-bottom:50vh`; methods `margin-top:30px`). Props `type`, `id`, `color` (default `""`), `autoSave`.
- **c-admin-editor**: `v-card.c-admin-editor` > **`v-toolbar.c-admin-editor--toolbar density="compact" elevation="4"`** (title with inline `style="flex:0 1 auto"`; Save/Delete/Reload `v-btn` with `fa fa-save`, `fa fa-trash-alt`, `$loading`) > `.c-admin-page--description` > `v-card-text.pt-2` > c-loader-status > `v-form` > one **`v-row.c-admin-editor--row.prop-{name} no-gutters`** per prop. Each row has `v-col.c-admin-editor--label-col cols=12 md=2` (bold, right-aligned at ≥960px, `padding:0 12px 0 0!`, `padding-top:10px!`, `min-height:40px`) and a value column holding `.c-admin-editor--input-row` > `.c-admin-editor--input-col` (an input with **`density=compact variant=outlined hide-details=auto label=""`**) + `.c-admin-editor--aux-col` (`v-btn variant=outlined` with `fa fa-ellipsis-h` or `fa fa-external-link-alt` using the v2 class `black--text`; `v-card outlined rounded.c-admin-editor--img-preview`). `v-card-actions` holds Save or `v-chip.c-admin-editor--autosave-chip color=success variant=tonal`. CSS also targets v2 `.v-input--switch/.v-input--checkbox`.
- **c-admin-methods**: `v-card.c-admin-methods` > `v-toolbar.c-admin-methods--toolbar density=compact :color` ("Actions") > `v-expansion-panels.c-methods variant=accordion` > `v-expansion-panel.method-{name}` > title + `.c-admin-method--description` (12px, opacity .7) > c-admin-method.
- **c-admin-method**: `div.c-method` > `v-row.c-method--section.c-method--params` (a `v-col` grid of inputs, `density=compact variant=outlined`) + `.c-method--results` with Execute/Preview/Download **`v-btn color="primary"`** and `c-loader-status style="min-height:55px"`. The result is `<h3>Result:` plus `pre.c-method--result-value` or `.c-method--result-null` (**`color:#999`**). CSS: `.c-method--section > .v-col:first-child{font-size:18px}`.
- **c-admin-audit-log-page**: `v-container.c-admin-audit-log-page` > `v-card` > `v-toolbar.c-admin-table-toolbar extended density=comfortable :color` (color default **"primary"**). Its extension wraps filters (`v-combobox`, `v-text-field`, `c-input`, `c-select`, with inline pixel widths) in a `v-defaults-provider`, then `v-table.c-audit-logs--table` (`--v-table-header-height:auto!`). It renders many `<pre>` blocks plus `text-grey` / `text-success` / `text-error` time-delta classes. CSS: `@mixin small` (0.75rem!, letter-spacing!), monospace detail cells, nested property tables with `color-mix` borders, and **`tr:hover td{background:rgba(0,0,0,.1)}`** (not theme-aware).
- **c-admin-create-btn** (internal): `v-btn.c-admin-table-toolbar--button-create` (or a `v-menu` + `v-list` when there are multiple concrete types) with the `$plus` icon. Its `<style>` block is empty.

---

## 3. Styling hook surface

- **Global CSS.** All component `<style>` blocks plus `SRC/shared.scss` compile into a single **`PKG/dist/coalesce-vue-vuetify.css`** (590 lines, 32 `!important`, **no `@layer`**). The JS never imports it: per-component entries in `dist/components/**` import only Vuetify and Vue. Apps must import it themselves via the exports `coalesce-vue-vuetify3/styles.css` or `/styles` (`PKG/package.json` exports). `CoalesceVuetifyResolver` (`SRC/build.ts`) maps `CSelect` to `coalesce-vue-vuetify3/components/input/c-select.js` and so on, without CSS.
- **shared.scss utilities**: `.hide-non-error-details` (an opt-in wrapper that collapses empty `.v-messages`, mostly v2 selectors), `.c-password-display`, `.c-display--color-swatch`, `.c-admin-page--description`, and color-input swatch tweaks on `.v-text-field input[type=color]`.
- **Class naming** is BEM-ish but inconsistent. Block `c-foo`, element `c-foo--bar` (double hyphen, as in `c-admin-table-toolbar--search` and `c-loader-status--progress`), sometimes `c-foo__bar` (`c-select__menu-content`, `c-time-picker__item`, `c-datetime-picker__menu`), and modifiers `c-foo--mod` (`c-table--editable`, `c-select--multiple`). Per-model and per-prop hooks: `.type-{ModelName}`, `.prop-{propName}`, `.th-{value}`, `.method-{name}`.
- **Theme usage.** Coalesce CSS reads `--v-theme-surface`, `--v-theme-on-surface` and `--v-border-color` as rgb channel triplets, and `--v-hover-opacity`, `--v-theme-overlay-multiplier` and `--v-medium-emphasis-opacity` as plain numbers. Vuetify 4 still emits both forms (`WEB/node_modules/vuetify/lib/composables/theme.js:123-135`). Template colors use the theme keys `primary`, `secondary`, `success`, `error` and the `grey` palette (`text-grey`).
- **Admin layout**: `v-container` > `v-card` (table/editor) whose first child is a `v-toolbar` (color passed from the page, elevation 4, comfortable/extended for tables, compact for the editor) > optional description > `v-card-text` content > a separate `v-card` of `v-expansion-panels` for methods. Tables are plain `v-table`, not `v-data-table`.

---

## 4. How the template app wires it

- `WEB/src/main.ts`:
  - CSS import order: `@fontsource/roboto` → `@fortawesome/fontawesome-free/css/all.css` (FA **7.1**) → `coalesce-vue-vuetify3/styles.css` → `vuetify/styles` → `@/styles/site.scss`.
  - `createVuetify({ icons: { defaultSet: "fa", aliases, sets: { fa } } })` from `vuetify/iconsets/fa`. The `$dropdown`/`$plus`/`$loading` aliases resolve to FA classes.
  - `defaults`: `{ density: "compact", variant: "outlined" }` for `VTextField, VTextarea, VSelect, VCombobox, VAutocomplete, VField, VInput`, plus `VSwitch: { color: "primary" }`.
  - `theme.themes.light/dark.colors` are empty TODOs, so the app runs on Vuetify's stock palette (primary `#1867C0`).
  - Then `createCoalesceVuetify({ metadata: $metadata })` and `import "@/viewmodels.g"`. The latter has the side effect of filling `ViewModel.typeLookup` / `ListViewModel.typeLookup`, which the admin pages need.
- `WEB/vite.config.ts`: `unplugin-vue-components` with `CoalesceVuetifyResolver`, `vite-plugin-vuetify` with `autoImport: true` (Vuetify component CSS is loaded per component), no Sass `configFile`, and a single `styles` chunk to keep CSS order stable.
- `WEB/src/styles/site.scss`: `a{text-decoration:none}`; restores `ul/ol` padding inside `.v-application`; `.v-input__details{align-items:normal;padding-top:3px;overflow:visible}`; `.v-icon{--fa-display:inline-flex}`; dashed outlines/switch borders for `.v-input--readonly` (`border-style:dashed!`).
- `WEB/src/App.vue`: `v-app` > `v-app-bar color="primary" density="compact"` + `v-navigation-drawer` + `v-main > router-view` (fade transition) + `<c-app-update-alert/>`. A dark-mode switch calls `useTheme().change()`.
- `WEB/src/router.ts`: `/admin/:type` (name **`coalesce-admin-list`**) → `CAdminTablePage`; `/admin/:type/edit/:id?` (name **`coalesce-admin-item`**) → `CAdminEditorPage`; `/admin/audit` → `CAdminAuditLogPage` with `type: "AuditLog"`. Each goes through `titledAdminPage`, which **passes `color: "primary"`**, so admin toolbars are primary-filled. That makes `titledAdminPage` the natural place to change the color or wrap the pages in `<v-defaults-provider>`.

---

## 5. Risks and targeting strategy

### Cascade layers (Vuetify 4)
- Vuetify 4 puts all its CSS in layers: `vuetify-core` < `vuetify-components` < `vuetify-overrides` < `vuetify-utilities` < `vuetify-final` (`WEB/node_modules/vuetify/lib/styles/layers.css`). `coalesce-vue-vuetify.css` and `site.scss` are **unlayered**, so they beat every Vuetify rule regardless of specificity or import order, including utility classes like `pa-*`, `text-*` and `elevation-*`. The main.ts import order no longer matters for Vuetify vs Coalesce.
- Canon overrides of Coalesce's own rules have to be unlayered too, loaded **after** `coalesce-vue-vuetify3/styles.css`, with equal or higher specificity. Reserve `!important` for the 32 places where Coalesce uses it. Canon tweaks to plain Vuetify internals can go in `@layer vuetify-overrides`, the slot Vuetify reserves for this.
- Alternative: `@import "coalesce-vue-vuetify3/styles.css" layer(coalesce)`, with `coalesce` declared before Canon's layer. Normal Coalesce rules would then lose to Canon by layer order. The catch is that layered `!important` beats unlayered `!important`, which makes Coalesce's `!important`s harder to override. Use this only if Canon CSS is also layered.

### Hardcoded values that fight a design system
| what | where | fix level |
|---|---|---|
| Toolbars `elevation="4"`, `density` comfortable/compact, `extended` | table-toolbar, editor, audit page | CSS on `.c-admin-table-toolbar`, `.c-admin-editor--toolbar`, `.c-admin-methods--toolbar` (box-shadow, height) |
| Toolbar `:color` = page `color` prop (router passes `"primary"`) | router.ts `titledAdminPage` | App: change or drop `color`; or style via theme (`primary`) |
| `.v-toolbar__extension{height:49px!}` | c-admin-table-toolbar.vue | CSS with `!important` |
| Inner search field `variant="filled" density="compact"`, `fa fa-search` | c-select menu | CSS on `.c-select__menu-content .v-field` |
| Toolbar search `density="comfortable"` | c-admin-table-toolbar | CSS `.c-admin-table-toolbar--search` |
| `density=compact variant=outlined` forced on editor/table/method/filter inputs | c-admin-editor, c-table, c-admin-method, c-list-filter-input, c-list-page(-size) | Can't be changed with defaults. If Canon's field style ≠ outlined, restyle `.v-field--variant-outlined` globally (Vuetify-overrides layer) |
| Buttons `variant="text"`/`outlined`, `color="primary"/"success"/"error"`, `v-badge color="secondary"` | toolbars, methods, filters, row actions | Theme colors (primary/secondary/success/error) + global `.v-btn` variant styling |
| Raw `<i class="v-icon fa ...">` and literal `fa fa-*` strings (search, filter, columns, undo, caret-up/down, save, edit, trash-alt, ellipsis-h, lock, info-circle, asterisk, external-link-alt, eye, calendar-alt, clock, download) | many | **FontAwesome must stay loaded**. Aliases (`$dropdown`, `$plus`, `$loading`, `$edit`, `$prev`, `$next`, `$close`, `$delete`, `$complete`) can be remapped via `icons.aliases`; literal strings can't. Check the FA5 names still render under FA7 |
| `v-progress-linear` height 10px, color primary | c-loader-status props | Per-use `height`/`color` props, or CSS `.c-loader-status--progress` (also set `--c-loader-status-progress-height`) |
| `--v-table-header-height:40px` inline | c-table | `.c-table .v-table{--v-table-header-height:X !important}` |
| Fixed column `box-shadow rgba(0,0,0,.4)`, blur, 8px radius | c-table `.fixed-column-right` | CSS |
| Row hover `rgba(var(--v-border-color),var(--v-hover-opacity))` | c-admin-table | CSS (theme-aware already) |
| `font-size:16px` pagination; 12px descriptions; 18px method label; 32px picker headers; 14px editable cells | various | CSS on the c- classes |
| `#999` result-null; audit `tr:hover rgba(0,0,0,.1)`; `color-mix` greys | c-admin-method, audit page | CSS |
| Legacy v2 classes (`grey--text`, `black--text`, `subtitle-1`, `input-group`, `outlined`/`sm`/`small` attrs) | c-select, c-list-pagination, c-admin-editor, c-input fallback, c-admin-method | No-ops today; can be targeted, e.g. `.c-list-pagination` color |
| `max-width:1300px`, `margin-bottom:50vh` | admin pages | CSS if Canon has a page-width token |

### Recommended split
1. **Vuetify theme** (`createVuetify.theme`): map Canon tokens to `primary/secondary/success/error/info/warning/surface/background/on-*`, plus `variables` (`border-color`, `border-opacity`, `hover-opacity`, `medium-emphasis-opacity`). Most Coalesce color comes through these.
2. **Vuetify `defaults`**: field variant, density, rounded and color for `VTextField/VSelect/VCombobox/VAutocomplete/VTextarea/VSwitch/VCheckbox/VBtn/VCard/VToolbar/VTable/VAlert/VChip`. This covers c-input, c-select, c-datetime-picker and the c-select-* components wherever Coalesce doesn't pass explicit props. Use `<v-defaults-provider>` in `titledAdminPage` for admin-only defaults.
3. **Icons**: keep the FA set (required); remap aliases if Canon uses different glyphs.
4. **Targeted CSS** (unlayered, after the Coalesce CSS) for: toolbar elevation/height, c-loader-status bar, c-table header height and fixed column, c-select menu search field, pagination typography, the admin editor label column, datetime/time picker headers and active item, audit log hovers.

---

## 6. Storybook coverage and mocking

### Infrastructure needed
- Preview setup like `WEB/src/main.ts`: Vuetify (same icons, defaults, theme), `createCoalesceVuetify({ metadata })`, `import "<domain>/viewmodels.g"` (typeLookup side effect), CSS imports in the same order, and a **vue-router with memory history** that defines routes named `coalesce-admin-list` and `coalesce-admin-item`. c-admin-table, c-admin-display and c-admin-editor call `useRouter`/`router.resolve`, and the table/editor pages use the query string through `useBindListParametersToQueryString`.
- **API mocking: `mockEndpoint`** from `coalesce-vue/lib/test-utils` (`CV/test-utils.ts:73`; 6.5.1 ships it as `coalesce-vue/lib/test-utils.js`, which imports only `AxiosClient`). It is not tied to vitest. Import it from `coalesce-vue/lib/test-utils` directly, not via `WEB/src/test-utils.ts`: that file also imports `@vue/test-utils` and calls the vitest global `afterEach` at module load, which throws in a browser. It adds an `AxiosClient` request interceptor that swaps `config.adapter` per request when the URL prefix matches (`"/Person/list"`) or the method metadata matches, and it fills in `page/totalCount/pageSize/pageCount` for list results. Returns `{ destroy() }`. URLs are relative to `AxiosClient.defaults.baseURL`. Register mocks in a decorator or loader, and destroy them on story change.
- **Local data without endpoints**: `new XViewModel().$loadCleanData({...})` / `$loadDirtyData` (`CV/viewmodel.ts:985-996`), and the `ListViewModel.$items = [...]` setter (`CV/viewmodel.ts:1577`). **Caveat**: c-table and the admin table wrap content in `c-loader-status` with `no-initial-content: [list.$load]`, so the table stays hidden until `$load` has run. Mock `/X/list` and call `list.$load()`; pagination and range also read `list.$load.totalCount/pageCount`. c-select fetches `/X/list` on open and `/X/get/{id}` when only a key is bound.
- **Metadata fixture**: the demo domain (`WEB/src/metadata.g.ts`) has only `User`, `Role`, `UserRole`, `AuditLog`, `AuditLogProperty` and `UserInfo`. It covers email, password, binary, date, boolean, enum, reference/collection navigations, one `manyToMany` and the audit log, but lacks number, multiline, color, url, url-image, tel, date-only/time, file and string-value methods. The richer `.refs/coalesce/src/test-targets/*.g.ts` (Person, Company, Course, ComplexModel with every subtype) is what Coalesce's own specs use. **It does not work with 6.5.1 as is**: its viewmodels import `createAbstractLoader`, which the installed `coalesce-vue` lacks (6.5.1 has `createAbstractProxyViewModelType`). Either generate a Storybook domain with the template's generator, or hand-trim test-targets to the needed types and drop the abstract-type code.

### Stories
| component | stories / states | data needed |
|---|---|---|
| c-input | one per dispatch row in §1 (text, textarea, number, email, password, color, url, switch, checkbox, enum, enum[], file, file[], date→picker, model→select, m2m, primitive[]); readonly, disabled, error (rules), hint | ViewModel with each prop type; `/X/list` for model props |
| c-select | single, multiple, clearable, create item, loading, error, empty "No results", "Max N items", custom slots, menu open | `/X/list` (with search), `/X/get/{id}` |
| c-select-many-to-many | populated, add/remove | VM with `manyToMany` collection; far-side `/X/list`; middle-type save/delete |
| c-select-values | string[] / number[] chips | VM prop of primitive collection |
| c-select-string-value | suggestions open | static method returning `string[]` mocked via `mockEndpoint(meta.methods.x, …)` |
| c-datetime-picker | datetime, date, time, native, with `min/max`, today button, menu open (date+time panes), xs width | Date prop (dateKind variants) or standalone `v-model` + `date-kind` |
| c-time-picker (internal) | via c-datetime-picker `date-kind="time"` | – |
| c-display | each type/subtype, null, distance format, password toggle | VM with values |
| c-admin-display | reference nav link, collection count link, binary download | VM + router |
| c-loader-status | loading (progress), error alert with retry, success, `no-initial-content` placeholder | API callers in each state (mock the endpoint with a delay, `wasSuccessful:false`) |
| c-table | read-only, editable, sorted header, wide (fixed actions column) | ListViewModel + `/X/list` |
| c-list-filters | closed, open, sub-filter open, active badge | ListViewModel with `$params.filter` |
| c-list-pagination / c-list-page / c-list-page-size / c-list-range-display | first/middle/last page, unknown count (`pageCount:-1`) | loaded ListViewModel (`totalCount`, `pageSize`) |
| c-admin-table-toolbar | read-only, editable, with filters active | ListViewModel |
| c-admin-table | read, editable (dirty row save), autosave, with description | ListViewModel + `/X/list`, `/X/save`, `/X/bulkSave`, `/X/delete` |
| c-admin-table-page | full page (table + methods) | `type` or `list` prop; list + static method endpoints |
| c-admin-editor | create (no pk), edit, view-only, autosave chip, validation errors, url/model aux buttons, image preview | VM via `$loadCleanData`; `/X/save`; FK `/Y/list` |
| c-admin-editor-page | loaded, load error | `type`+`id`; `/X/get/{id}`; instance method endpoints |
| c-admin-methods / c-admin-method | params grid, void success, object result, file result (preview/download), error | method callers mocked by method metadata |
| c-admin-audit-log-page | populated, filters, hover | `AuditLog` type (demo metadata has it); `/AuditLog/list` with `properties` |
| c-app-update-alert | visible | stub update detection (it watches for new app builds), or render it directly with forced state |
| c-admin-create-btn (internal) | single type, multiple concrete types (menu) | via toolbar |

### Source vs installed (6.5.1) differences that matter
`diff` of the sourcemap `sourcesContent` against the clone:
- 6.5.1 lacks `adminExtensions` slots (`page-header`, `toolbar-actions`, `editor-actions`, `row-actions`) and `adminOverrides`; admin pages hardcode `c-input`/`c-display`.
- c-select in 6.5.1 lacks the `&:not(.c-select--multiple)` nowrap/min-width rules (long single selections can wrap) and `returnViewModel`.
- c-datetime-picker in 6.5.1 uses the older menu CSS (no `--mobile-width`/`--date-picker-height`, close button at `right/bottom: 8px` inside `.v-card`), `density="comfortable" scrollable` on the date picker, no `show-adjacent-months`, and hardcoded `fa fa-clock/fa-calendar-alt cursor-pointer` icons.
- c-admin-editor in 6.5.1 refreshes "Auto-saved X ago" on a 10s interval.

Style against **6.5.1's** `PKG/dist/coalesce-vue-vuetify.css`, the version actually installed. Recheck selectors when upgrading.
