# Developing coalesce-c-style

This README covers working on c-style itself. For installation, app configuration and compatibility, start with the [main README](README.md) or the [package usage reference](packages/c-style/README.md).

## Repository layout

| Path | What |
|---|---|
| `packages/c-style/` | The package (`c-style`, `coalesce-c-style/vite`, `coalesce-c-style/settings`, `coalesce-c-style/styles`, `coalesce-c-style/tokens`, `coalesce-c-style/icons`, `coalesce-c-style/fonts/inter`) and its unit tests |
| `storybook/` | Storybook (`c-style-storybook`): every component, Foundations pages, `Parity/*` stories against Canon's vendored CSS, and a mocked Coalesce domain |
| `verify/` | Playwright (`c-style-verify`): `app/` measures the demo app, `parity/` measures Storybook, `capture/` writes screenshots |
| `MyProject/` | Demo Coalesce app that adopts c-style, and the pnpm workspace root. `/c-style` is the fixture page the app specs measure; `/dashboard`, `/workspace`, `/settings` are the showcase views |
| `docs/` | `plan.md` (decisions), `progress.md` (log, mechanisms, deviations), `research/`, `showcase/` (the screenshots in the main README) |

### Running

Run pnpm only from `MyProject/`, with `--filter`; inside `packages/c-style`, `storybook` or `verify` pnpm treats the folder as its own project and relinks the store.

```sh
cd MyProject
pnpm install
```

- **Demo app:** `dotnet run --project MyCompany.MyProject.AppHost` (from `MyProject/`); the web project serves Vite at https://localhost:48110 with hot reload. The demo uses SQLite in memory: no Docker, SQL Server, connection string, or migration command is needed. Data resets whenever the web process restarts. The SQL Server migrations project is retained from the starter template but is not part of demo startup.
- **Storybook:** `pnpm --filter c-style-storybook storybook`, then http://localhost:6006. The toolbar switches theme, accent and font.

### Tests

```sh
cd MyProject
pnpm --filter coalesce-c-style test                        # unit (vitest): colour math, themes, icons, layer order, tokens, CSS lint
pnpm --filter c-style-verify test --project app   # demo app specs (app running)
pnpm --filter c-style-verify storybook            # every story renders, parity gate, coverage and accent sweep (Storybook running)
pnpm --filter c-style-verify baseline             # screenshots (CAPTURE=1; CAPTURE_DIR=screenshots/<name>)
```

Type checks: `tsc --noEmit` in `packages/c-style` and `verify`; `vue-tsc --noEmit` in `storybook` and `MyProject/MyCompany.MyProject.Web` (each from its `node_modules/.bin`). `PARITY_DUMP=<file>` makes the parity gate write its differences instead of failing.

## Workspace package

In a pnpm workspace, link the package instead:

```jsonc
// package.json of the app
"dependencies": {
  "coalesce-c-style": "workspace:*"
}
```

The workspace uses the TypeScript and SCSS in `src/`. The published package ships the same files built to `dist/` (`pnpm --filter coalesce-c-style build`).

## What is styled where

Paths beginning with `src/` or `test/` in this section and the upgrade checklist are relative to `packages/c-style/`.

In order of preference; a change uses the first channel that can express it.

1. **SASS settings** (`src/styles/settings.scss`, `_sizes.scss`, `_typography.scss`): sizes, radii, type scale, density maps, paddings, shadows (`$shadow-key` → theme variables), colours that name a theme role.
2. **Blueprint defaults** (`src/defaults.ts`): prop choices such as `VBtn { color: 'primary', variant: 'tonal' }`, neutral minimal buttons inside toolbars, tables, fields, lists, alerts and toasts; outlined text inputs with the label above; `VAlert`/`VSnackbar` outlined; inset tabs; neutral choices and pickers; ripple off.
3. **Theme** (`src/theme/`): every colour and every light/dark difference, as Vuetify theme colours plus role variables (`--v-primary-text`, `--v-frame`, `--v-shadow-raised`, …).
4. **`@layer vuetify-overrides`** (`src/styles/overrides/`, one partial per family): what no variable, default or theme key reaches, for example the button tint rungs, the field frame and halo, the label above, choice lines, the segmented track, the menu tick. Rules read tokens and theme variables only: no hex, no `!important`, specificity ≤ (0,3,0).
5. **Sublayer `vuetify-utilities.c-style`** (`tone.repoint`): custom-property re-points that have to beat Vuetify's theme classes on the same element (button labels at the tone's text step, hover and press solids, disabled greys, admin toolbars' `bg-primary`). Custom properties only.
6. **Unlayered `.c-*` rules** (`src/styles/coalesce/`): Coalesce's own unlayered CSS and inline styles. Every selector starts with a `.c-` class; `!important` only against Coalesce's inline styles.
7. **c-style components** (`src/components/`, CSS in `src/styles/components/`, `@layer vuetify-components`): Canon-style segmented time inputs that complement Vuetify's `v-time-picker`. Same token-only rule as the overrides.

### Coalesce

- Admin table, editor, methods and audit toolbars are card headers: no shadow, a rule below, a 56px main row and a 48px filter row. Coalesce fills them with `bg-primary` when the page gets `color="primary"` (the starter template's admin routes, and the audit page's own default); c-style re-points the toolbar's primary to the surface, so they stay neutral without touching routes.
- Pagination, the "Showing 1 - 10 of 40" range and page-size text use Canon's muted 14/20 info type; prev/next are Canon's frameless 40px arrow squares beside the 40px page field.
- The "Columns & Filters" active-filter count shows whole (the button clipped it).
- Row actions are neutral Lucide icons; the pinned actions column has a hairline and a flat 4px band instead of a blurred shadow.
- Editor labels are 14/20/500 ink, rows a form gap apart.
- The audit "Entity Type" filter keeps its label visible while it holds an empty value.
- The filter row's first control (table search, audit filters) sits 8px from the card edge, as the row's last control does; the search icon lines up with the title text. Below 600px the title and its dividers hide (Coalesce's `hidden-xs-only`, a class Vuetify 4 dropped).
- Editable `c-table` cells are Canon data table edit cells: the field spans the cell with no frame at rest, the field line under the pointer, the focus frame while typing (errors keep their line); values start under their header text and rows stay 56. Read-only cells in edit mode don't wrap.

## Upgrading Vuetify or Coalesce

c-style relies on some Vuetify and Coalesce internals. After an upgrade, run all suites (see [Tests](#tests)) and check these by hand if anything moved:

- **Layer order:** `test/layer-order.spec.ts` fails if Vuetify's `lib/styles/layers.css` changes. Update `src/layer-order.mjs` and `_layers.scss` together, keeping `c-style` last in `vuetify-utilities`.
- **Settings canary:** `verify/app/plumbing.spec.ts` checks the 8px button radius; if it fails, Sass loaded a second `vuetify/settings`.
- **Field padding math:** the −3 density on a 52px base depends on Vuetify's `16px + density/2` formula; `verify/app/size.spec.ts` pins every field at 40.
- **Button icon margins:** `$button-margin-start-multiplier: -6.67` assumes Vuetify's multiplier math; `verify/app/button.spec.ts` checks the 10px icon inset.
- **Menu tick** draws on `.v-list-item::after`, which Vuetify uses for its focus border; c-style's focus ring is a box-shadow. If Vuetify moves focus styling back onto `::after`, the tick and focus collide.
- **Dialog parts:** `.v-dialog > .v-overlay__content > :is(.v-card, form > .v-card) > :is(.v-card-item, .v-card-title)` breaks if the card is wrapped in anything else (`v-form`'s own wrapper, a sheet).
- **Inset tabs:** the segmented track uses Vuetify 4's `.v-tabs--inset` and `.v-tab__slider`. Tabs heading a card match `.v-card > .v-tabs:first-child` or `.v-card__loader + .v-tabs` (`verify/app/showcase.spec.ts`).
- **Tonal recipe:** the shared tonal underlay matches `[class*='--variant-tonal'] > [class*='__underlay']` and the text-step re-point `.text-<intent>` with `--variant-tonal|text|plain` classes; a renamed variant or underlay class drops it (`showcase.spec.ts` avatar/alert checks).
- **Popup motion:** `cs-popup` scales with `transform`, which Vuetify's `nullifyTransforms` undoes when it places an overlay. If Vuetify stops undoing transforms, menus near the viewport's bottom open the wrong way (`showcase.spec.ts` datetime check).
- **Chip sizes:** the per-size re-points override the literal values Vuetify's `chip-sizes` mixin emits (`--v-chip-height`, padding, font size, avatar height, media margins) and `.v-chip__close`'s `max-width`/`max-height` (`$chip-close-size`).
- **Avatar initials:** a numeric `size` only reaches the DOM as inline `width`/`height`, so the type rule matches `[style*=" height: Npx"]` for whole pixels 12–96 (`verify/app/data.spec.ts`); another unit or a fraction keeps the inherited type.
- **`__element` selectors** (`.v-selection-control__input`, `.v-field__outline`, `.v-overlay__content`, `.v-snackbar__content`, about 25 in all) assume Vuetify's internal markup.
- **Coalesce** (styled against `coalesce-vue-vuetify3@6.5.1`'s `dist`): toolbar class names and inline heights, `.c-admin-table-toolbar--range`, the pinned `.fixed-column-right`, `c-select`'s `filled` menu search, the raw FontAwesome sites (re-grep `dist` for `fa-` names; `test/coalesce-fa.spec.ts` fails on an unmapped one), the audit filters' markup, the `hidden-xs-only` toolbar classes, `.c-table--editable`'s cell padding rules (`verify/app/coalesce.spec.ts` checks the toolbar insets and edit cells), `c-list-page`'s direct child prev/next buttons and `c-list-filters`' badge (`verify/app/showcase.spec.ts`).
- **Parity gate:** `verify/parity/parity.spec.ts` (with Storybook running) compares every Parity story with Canon in light and dark. A failure lists the property that moved.

## Releasing

1. Set `version` in `packages/c-style/package.json` and verify its peer ranges and test-environment dependencies match the intended release. The READMEs refer to that manifest for compatibility instead of maintaining separate version tables.
2. Run the package tests, type checks, demo app tests, and Storybook rendering and parity suites listed above.
3. Commit, create the release tag, then push the commit and that tag: `git tag v6.5.1-cs.2 && git push --atomic origin main v6.5.1-cs.2`.
4. For a local release, pack from `MyProject/` with `pnpm --filter coalesce-c-style pack --pack-destination /tmp/coalesce-c-style-pack`, then publish that tarball with `npm publish /tmp/coalesce-c-style-pack/coalesce-c-style-6.5.1-cs.2.tgz --tag latest --access public --provenance=false`. Complete npm's browser authentication request. Local releases do not have CI provenance.
5. Alternatively, manually run the [publish workflow](.github/workflows/publish.yml) against the release tag. It checks the version, runs the package tests and stages the package with provenance. This requires an `NPM_ACCESS_TOKEN` repository secret with package write access; approve the resulting stage with `npm stage approve <stage-id>` or on npmjs.com. Tag pushes do not currently trigger the workflow.
