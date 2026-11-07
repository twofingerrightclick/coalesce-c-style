# Inter thickness and missing font weights

Investigated 2026-11-07 against the working tree, installed Vuetify 4.3.2, and the running Storybook. The initial investigation was research only; the user subsequently authorized the fixes recorded below.

## Main finding: Chunkiness differs because of font smoothing

The user's observation is reproducible in `Foundations/Chunkiness` with `font:inter`. C Style looks thinner even where both sides compute to the same font weight.

Vuetify applies `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` on `html`. Canon leaves smoothing at its browser default (`auto`). This is inherited by the component text. In the macOS Chromium audit, temporarily setting C Style's smoothing to `auto` visibly closes the thickness difference without changing any weights. This is a rendering difference, not a missing medium font file. Smoothing effects are platform dependent.

Sources: [installed Vuetify global styles](../../packages/c-style/node_modules/vuetify/lib/styles/elements/_global.sass), lines 5–12; [Canon root styles](../../canon/src/css/theme/base.css), lines 322–327; [C Style typography overrides](../../packages/c-style/src/styles/overrides/_type.scss).

Measured text elements in the exact Chunkiness story:

| Role | C Style | Canon |
|---|---:|---:|
| Save / Create button | 500 | 500 |
| Checkbox / switch label | 400 | 400 |
| Inbox nav item | 400 | 400 |
| Tag label | 500 | 500 |
| Alert title | 500 | 500 |
| Overview tab | 500 | 500 |
| User column header | 500 | 500 |

Both sides report `InterVariable`, matching stylistic features (`ss01`, `cv11`, `cv04`, `cv03`, `cv02`), `font-optical-sizing: auto`, and normal font variation settings. Inter's upright variable font is loaded in both documents. Both declarations support weights 100–900.

Downloaded Canon's font from the exact URL in its CSS and compared it with `inter-ui/variable/InterVariable.woff2`: both SHA-256 hashes are `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`. [Bundled Inter import](../../packages/c-style/src/fonts/inter.css), [Canon font declarations](../../canon/src/css/theme/base.css), lines 25–37.

## Confirmed missing adjustments elsewhere

1. **Radio-group heading:** the `Plan` heading in `Parity/Choices / Radio` computes to **400**, versus **500** on Canon's fieldset legend. Vuetify's VLabel sets size and tracking but no weight; the radio-group heading therefore inherits regular weight. Add a targeted rule for `.v-radio-group > .v-input__control > .v-label`. Keep ordinary radio, checkbox and switch labels at 400. Sources: [VLabel styles](../../packages/c-style/node_modules/vuetify/lib/components/VLabel/VLabel.sass), [radio-group styles](../../packages/c-style/node_modules/vuetify/lib/components/VRadioGroup/VRadioGroup.sass), [Canon fieldset legend](../../canon/src/css/theme/choice.css), lines 295–301.

2. **Toast title/message:** `Invoice saved` in `Parity/Surfaces / Toast` computes to **400**, versus **500** on Canon's toast title. C Style's story places the title in the snackbar's default content slot, which uses `$snackbar-font-weight` (body-medium = 400). The separate `title` prop uses `$snackbar-title-font-weight` (700), also different from Canon's 500. Define the title/message mapping explicitly: a Canon-style short toast needs 500, while a separate description should remain 400. Sources: [toast story](../../storybook/stories/parity/Surfaces.stories.ts), [snackbar settings](../../packages/c-style/node_modules/vuetify/lib/components/VSnackbar/_variables.scss), lines 14–17, [snackbar styles](../../packages/c-style/node_modules/vuetify/lib/components/VSnackbar/VSnackbar.sass), lines 62–68, [Canon toast title](../../canon/src/css/theme/toast.css), lines 169–172.

## Other role gaps identified in source

- **Banner titles:** Canon explicitly uses 500; Vuetify VBannerText has no title/description weight distinction. Current C Style banner overrides only align its parts. Establish title markup before adding a title-specific rule; applying 500 to all banner text would also thicken descriptions. [Canon banner](../../canon/src/css/theme/banner.css), line 48; [C Style surfaces](../../packages/c-style/src/styles/overrides/_surface.scss).
- **Table semantics:** column headers already use 500. Canon additionally sets footer cells to 500, captions to 600, and body row-header cells to 400. Vuetify applies 500 to `th` across table sections, while `td` and captions have no equivalent Canon role mapping. Audit these separately rather than raising the whole table weight. [Canon table](../../canon/src/css/theme/table.css), lines 80–120; [Vuetify table styles](../../packages/c-style/node_modules/vuetify/lib/components/VTable/VTable.sass), lines 118–137.

Field labels above inputs already have an explicit 500 rule; alert titles, chips and card titles also have weight settings. The type ramp already distinguishes 400 body, 500 label and 600 title roles. Mapping a typography role does not automatically apply it to every Vuetify component with a similar name. Sources: [field label override](../../packages/c-style/src/styles/overrides/_field.scss), lines 75–87; [settings](../../packages/c-style/src/styles/settings.scss), lines 180–182, 240, 273; [type ramp](../../packages/c-style/src/styles/_typography.scss), lines 13–28. Vuetify documents its component-specific [table header weight setting](https://vuetifyjs.com/en/api/v-table).

## Why existing checks missed this

The parity harness compares computed `font-weight` but not smoothing. Its expected-difference rules also exclude typography for several container pairs (including alerts, choices, fields, tables and toasts), without consistently checking their text children. Chunkiness has element-resolution coverage but is outside the `Parity/` stories selected by the main parity regression test. Sources: [comparison properties](../../verify/lib/measure.ts), lines 5–9; [container exclusions and story selection](../../verify/parity/parity.spec.ts), lines 42–48 and the `stories` filter; [Chunkiness markup](../../storybook/stories/foundations/Chunkiness.stories.ts).

Recommended implementation order: match Canon's font smoothing in C Style's typography override; add targeted group-heading and toast weights; resolve banner/table role mappings; then check actual text children and font smoothing in the parity suite. Avoid a global weight increase: it would incorrectly thicken ordinary choices, input values and body copy.

Validation performed: computed-style comparison in local macOS Chromium, confirmation of loaded variable fonts, exact font-file hash comparison, and before/after screenshots with only smoothing changed in the audit browser. No production files were changed and no application build was run.

## Implemented after review

- The existing `vuetify-overrides` root typography rule now sets both vendor smoothing properties to `auto`. This inherits across all font choices and remains overridable by application CSS.
- The radio-group heading now uses 500 through a direct-child selector, preserving ordinary choice labels at 400.
- Snackbar message and title Sass weights are 500. A content box containing a separate title uses 400 for its description; the title retains 500.
- A title-plus-description snackbar example makes the distinction reviewable in Storybook.
- Focused browser regression checks cover inherited smoothing, application overrides, and the affected text weights. Banner and table semantic mappings remain separate follow-up work; the existing Chunkiness column headers already use 500.

Implementation validation: all 14 focused Playwright checks passed together against local Storybook; the verification project's TypeScript check passed. Weight checks cover light/dark themes and Public Sans/Inter. No application build was run.

## Token cleanup and second review

The follow-up cleanup replaced the new literal weights with an internal `weight($role)` lookup into the shared typography ramp. Snackbar Sass settings retain `!default` customization. Table body row headers now use the body weight, footer cells the label weight, and captions the title weight; typography utilities can still override them.

Vuetify has no banner title prop, so the documented `#text` slot example uses the existing `text-label-large` title and `text-body-medium` description utilities. Plain text banners retain body weight. This requires no custom component or additional banner styling API.

Validation: 22 combined browser checks and two focused Sass tests passed; verification TypeScript and Storybook Vue TypeScript checks passed. Terra independently reviewed the scoped changes and reported no actionable findings. No application build was run.
