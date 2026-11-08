# Known deviations from Canon

c-style adapts Canon through Vuetify's component model. It retains framework behavior where the models differ, and explicit app props can change the result. Public Sans is included; Canon's Inter is available through the [font configuration](configuration.md#font).

Form composition belongs to the app. Vuetify inputs retain their native message-space policy, and standalone checkboxes and switches keep the same control-row height regardless of neighboring inputs (40px at the default size, versus Canon's 20px choice row). Explicit radio groups retain Canon-style internal spacing. See [Form composition](styling.md#form-composition) for layout and details options.

For the maintained acceptance criteria, read the repository's [parity gate](https://github.com/twofingerrightclick/coalesce-c-style/blob/main/verify/parity/parity.spec.ts) and its documented exceptions. The gate defines permitted visual differences instead of duplicating a changing list of measurements here.

When diagnosing a difference:

- Check the component's explicit props, retained app defaults and CSS first.
- Compare the matching release's component defaults, Sass settings and override rules; use the [component reference](components.md) to find those definitions.
- Read the parity criteria for known framework constraints and accepted differences.
- Use the [styling guide](styling.md) for custom app markup.

Repository parity tests and demo routes are development tools; they are not shipped in the npm package. Use the source tag matching the installed package when investigating release behavior.
