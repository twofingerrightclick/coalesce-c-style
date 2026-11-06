# c-style

c-style gives Vuetify 4 and Coalesce's `c-*` components the look of [Canon](docs/research/canon.md), a design system with a lighter and denser style than Material. It works through Vuetify's own levers (SASS settings, blueprint defaults, theme), with a small set of layered CSS for what those can't reach. Package docs, adoption steps and known deviations are in [packages/c-style/README.md](packages/c-style/README.md).

## Layout

| Path | What |
|---|---|
| `packages/c-style/` | The package (`c-style`, `c-style/vite`, `c-style/settings`, `c-style/styles`) and its unit tests |
| `storybook/` | Storybook (`c-style-storybook`): every Vuetify and Coalesce component, Foundations pages, and `Parity/*` stories that set c-style beside Canon's vendored CSS (`public/canon/`). A small Coalesce domain (`domain/`, generated into `src/domain/`) with mocked APIs drives the Coalesce stories |
| `verify/` | Playwright suites (`c-style-verify`): `app/` measures the demo app, `parity/` measures Storybook, `capture/` writes screenshots to `verify/screenshots/` |
| `MyProject/` | Demo Coalesce app (starter template) that adopts c-style; its `/c-style` route is the fixture page the app specs measure. `MyProject/` is also the pnpm workspace root |
| `docs/` | `plan.md` (decisions and milestones), `progress.md` (log, mechanisms, deviations), `research/` (Canon, Vuetify, Coalesce notes), `review/`, `spikes/` |

## Running

Run pnpm only from `MyProject/`, with `--filter`. Running it inside `packages/c-style`, `storybook` or `verify` makes pnpm treat that folder as its own project and relink the store.

```sh
cd MyProject
pnpm install
```

- **Demo app:** start the Aspire AppHost (`MyCompany.MyProject.AppHost`); the web project serves Vite through ASP.NET at https://localhost:48110. Frontend edits hot-reload. `/c-style` shows every styled component; `/admin` the Coalesce admin pages.
- **Storybook:** `pnpm --filter c-style-storybook storybook`, then http://localhost:6006. The toolbar switches theme (light / dark) and accent preset.

## Tests

```sh
cd MyProject
pnpm --filter c-style test                                 # unit (vitest): colour math, themes, icons, layer order, CSS lint
pnpm --filter c-style-verify test --project app            # demo app specs (app must be running)
pnpm --filter c-style-verify storybook                     # every story renders, parity gate, coverage + brand sweep (Storybook must be running)
pnpm --filter c-style-verify baseline                      # screenshots (CAPTURE=1; CAPTURE_DIR=screenshots/<name>)
```

Type checks: `node_modules/.bin/tsc --noEmit` in `packages/c-style` and `verify`, `node_modules/.bin/vue-tsc --noEmit` in `storybook` and `MyProject/MyCompany.MyProject.Web`.

The parity gate (`verify/parity/parity.spec.ts`) compares every `data-parity` pair in the `Parity/*` stories with Canon in light and dark, and fails on any difference it doesn't list as structural or as a documented deviation. `PARITY_DUMP=<file>` writes the differences instead of failing.
