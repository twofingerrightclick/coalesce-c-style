# c-style version and compatibility research

Checked 2026-11-12. Documentation research only; no test suites were rerun.

## Findings

- The public npm registry currently assigns `coalesce-c-style`'s `latest` dist-tag to **6.5.1-cs.5**. Read directly from the [registry metadata](https://registry.npmjs.org/coalesce-c-style). The local [publish workflow](../../.github/workflows/publish.yml) explicitly publishes with `--tag latest`.
- Installing by package name normally follows the registry's `latest` tag; explicitly requesting `@latest` selects that tag. A prerelease-looking version can be installed through a dist-tag. Exact version selection remains useful for reproducibility, but is not required merely because the version contains `-cs`. See [npm install documentation](https://docs.npmjs.com/cli/v11/commands/npm-install/).
- The [c-style manifest](../../packages/c-style/package.json) declares Vue `^3.5.0` and Vuetify `^4.3.0` peers, plus Sass `^1.80.0`, Vite `^7.0.0 || ^8.0.0`, and vite-plugin-vuetify `^2.1.0`. Coalesce is a development dependency, not a runtime dependency or peer. Thus c-style does not enforce an exact matching Coalesce version. Its Vuetify support does not currently include Vuetify 3 or Vuetify 4.0–4.2.
- The same manifest declares its development baseline as Coalesce 6.5.1, Vuetify 4.3.2, and Vue `^3.5.33`; the [workspace lockfile](../../MyProject/pnpm-lock.yaml) resolves Vue 3.5.44. These are repository environment facts, not evidence that all versions inside peer ranges were tested.
- Despite the package name, **coalesce-vue-vuetify3 6.5.1 supports both Vuetify 3 and 4**. Its [published manifest](https://registry.npmjs.org/coalesce-vue-vuetify3/6.5.1), fetched directly from npm, declares Vue `^3.5.4`, Vuetify `^3.7.1 || ^4.0.0`, and `coalesce-vue` exactly `6.5.1`. The [official changelog](https://coalesce.intellitect.com/changelog.html#_6-3-0) records Vuetify 4 support being added in Coalesce 6.3.0.
- Vue and Vuetify are application-selected peers, rather than one fixed Vuetify version shipped inside Coalesce. Coalesce 6.5.1 also changed Vue to a peer dependency, as documented in its [official changelog](https://coalesce.intellitect.com/changelog.html#_6-5-1).

## Wording implications

Lead installation with `pnpm add coalesce-c-style` (or `coalesce-c-style@latest` for explicit tag selection). Explain `<Coalesce version>-cs.<build>` as the Coalesce baseline used for development and verification, rather than an enforced compatibility lock. A matching release is the closest tested baseline when available; other Coalesce releases may work when their Vue/Vuetify requirements overlap, but those combinations have not all been verified.

Describe c-style as designed for Vuetify 4, currently requiring 4.3 or newer within major 4. Avoid promising compatibility across every Vuetify 4 release or advertising Vuetify 3 support. Coalesce's own broader Vuetify support does not extend c-style's declared range.
