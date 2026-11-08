# Canon parity acceptance criteria

This document defines how to assess **Canon versus Vuetify + c-style and Coalesce + c-style**. It is an assessment contract, not a report that parity has been achieved. Record results against a commit and an explicit component/state matrix; an untested cell remains unverified.

## Sources and precedence

- [Implementation plan](plan.md), especially decisions §1, family milestones §4, inventory §5 and verification §6, supplies the intended visual contract.
- [Canon research](research/canon.md) and the vendored Canon assets rendered by [CanonFrame](../storybook/src/components/CanonFrame.vue) supply reference values and markup.
- [General parity gate](../verify/parity/parity.spec.ts) supplies the executable exception predicates. [Measurement helper](../verify/lib/measure.ts) supplies comparison semantics. Read their current source when evaluating a result; do not maintain a second allowlist here.
- Focused [parity tests](../verify/parity/) and [application assertions](../verify/app/) cover details the general gate cannot establish. [Known differences](../packages/c-style/docs/canon-differences.md) describes the package's adaptation policy.

The plan contains historical implementation decisions, not proof of current behavior. For example, it specifies Inter as the default, while the current package and [Storybook font presets](../storybook/src/fonts.ts) use Public Sans by default and offer Inter explicitly. Record such changes instead of treating every difference from the original plan as a regression. An undocumented conflict between intent and executable assertions requires a finding and a decision, not an automatic pass.

## Scope and comparison setup

Assess each primitive, its Coalesce consumers, and relevant full-page compositions separately. A passing Vuetify primitive does not establish parity for a `c-*` composite with hard-coded props, additional labels, menus or unlayered CSS. Use the family and Coalesce inventories in plan §5 to select coverage. Components without a direct Canon equivalent use cited Canon token/spec assertions and composition review; label those results as spec conformance, not direct pair parity.

Use matching content, values, intent, emphasis, size, theme, state and available space. Pair corresponding rendered parts with `data-parity`; use `data-parity-target` when a Vuetify wrapper is not the visible Canon counterpart. Compare text-bearing children, field outlines, overlays and pseudo-elements when those own the appearance. A transparent root or a container's inherited font does not prove its children match.

The Storybook harness renders Canon in an iframe with its own CSS and JavaScript. Some stories use static popover CSS to display open surfaces in flow without transitions. Those fixtures establish resting appearance only; they do not establish real anchoring, collision handling, transitions or interaction behavior.

Exclude intentional harness counterexamples from parity claims: `Parity/Smoke` is expected to report differences. The general gate excludes it. Verify that pairs exist before interpreting measurements; inventory coverage and clean rendering are separate checks from visual equivalence.

## Required matrix

For every assessed family, record applicable cells below. Mark an inapplicable cell with a reason; mark missing evidence as unverified.

| Axis | Acceptance requirement |
| --- | --- |
| Size | Check applicable small, medium and large variants. Base control heights are 32/40/48px and icon boxes 16/20/24px; use component-specific Canon dimensions where appropriate (tags, choice glyphs, in-box actions, etc.). VBtn `x-small` is the 28px in-box action; `small/default/large` map to sm/md/lg and `x-large` collapses to lg. Shared `.cs-size-*` contexts were removed; check per-component size props where supported and record missing support. |
| Density | Do not equate compact density with sm. Plan §1 neutralizes most density changes; tables retain a density axis. Check Coalesce's explicit compact props and table density mappings against the relevant assertions. |
| Theme | Check light and dark independently, including backgrounds, text, lines, shadows, disabled tones, focus and selected states. A light result does not imply a dark result. |
| Brand | Check the Canon palette for direct color parity and at least one non-default brand (plan: `#7c3aed`). For branded themes compare generated role tokens and tone relationships rather than demanding Canon blue. The current brand render sweep covers canon/violet/emerald/rose/orange; a render-only pass does not prove token equality. |
| Font | Use Inter on both sides for direct text metrics; `compareParity` requests it and waits for fonts. Assess the shipped Public Sans default separately for hierarchy, wrapping, clipping and layout. Custom-font results must identify the font and loading status. |
| Variant and intent | Cover relevant high/medium/low/minimal mappings (`flat/tonal/outlined/text`), neutral and semantic intents, and selected/current treatment. Canon selected controls use neutral ink by default; do not assume every explicit application color should be neutralized. |
| State | Check rest, hover, keyboard focus/focus-visible, pressed, disabled, readonly, selected/checked/indeterminate, error, loading and open/closed wherever applicable. Include combinations such as error + focus and disabled + selected when supported. Drive real interaction on both sides; a resting fixture is insufficient evidence. |
| Composition | Check labels, hints, validation, icons, trailing actions, nested controls, teleported menus, multiline/wide content and actual Coalesce admin consumers. Review clipping, alignment, overflow and layout at relevant viewport widths. |
| Motion and access | Check applicable transitions, ripple/press behavior, reduced-motion behavior, visible keyboard focus and forced-color treatment against the component contract. The computed-style parity list alone does not verify these behaviors or general accessibility. |

Plan §6 requests sm/lg and state coverage, but the general `parity.spec.ts` loop only explicitly switches light/dark and reads the pairs present in each fixture. It does not automatically iterate sizes or interact with every state. Cite focused tests or manual evidence for those cells instead of inferring coverage from that gate.

## What counts as a match

Assess geometry (height, visible padding/gaps, alignment, radius), type (family, size, line height, tracking, weight), tone (foreground, fill, line, composited opacity), icon geometry, edge/shadow, and state behavior. The general helper reads bounding-box block/inline size and computed padding, top border width/color, radius, font size/line height/weight/tracking, color, background and shadow.

Its current numerical tolerances are 0.5px for single pixel lengths, 1.5 per RGB channel on a 0–255 scale and 0.01 alpha. Shadows discard transparent layers and compare sorted layers with normalized colors; non-color shadow geometry is compared as serialized text. Other values compare exactly. These are measurement tolerances, not a license to accept a systematic spacing error or a visible mismatch.

A pair passes only within its recorded scope after unexpected differences are resolved and relevant visual/interaction review is complete. The helper measures only the first matching selector per side; repeated rows or instances need explicit selection or separate evidence. Screenshots support assessment of composition and rendered text; plan §6 deliberately does not make pixel snapshots a gate because of font and anti-aliasing noise.

## Allowed differences and exception review

The executable `expected` rules in the [general gate](../verify/parity/parity.spec.ts) distinguish framework structure from accepted visual deviations. They currently include:

- Structural filters: padding on inner boxes, transparent roots with child fills, content-driven widths, invisible borders, container typography, masks versus avatar radii, child-drawn field outlines, and different mechanisms for edges, bars or selection fills.
- Scoped dimensional allowances: framed container heights (up to 4px on named containers) and the menu separator allowance (up to 8px).
- Documented deviations: selected neutral/segment tones, dark disabled button and group lines, pagination height, radio-group/hint spacing, and nav spacing.

This summary is navigational; exact IDs, properties, conditions and limits live in the predicates. Some predicates are broad (all padding, all inline widths, transparent root backgrounds and named container text). A difference filtered by one of these rules is **excluded from the automated gate**, not evidence that the final pixels match. Inspect the actual painted/text-bearing part and record the residual finding. Container text exclusions are why focused tests such as [font weights](../verify/parity/font-weights.spec.ts) matter.

For every applicable exception, record its source predicate, affected component/part/property, actual and reference values, theme/size/state, rationale and corroborating evidence. Distinguish “same visible result through different structure” from “accepted visual deviation.” A newly discovered mismatch is not allowed merely because it resembles an existing one. Any proposed exception change needs a scoped rationale and corresponding review of tests and package documentation; do not widen a predicate or copy current output into a baseline simply to obtain green results.

`PARITY_DUMP=<file>` writes unexpected differences and returns without asserting them. A dump run is diagnostic evidence, never a passing gate. Likewise `CAPTURE=1` screenshot capture asserts nothing. Stories tagged `allow-request-errors` tolerate a narrowly defined mocked 4xx failure in the render sweep; that does not excuse unrelated runtime failures.

## Evidence and recording

Store an assessment with the change or review record, using the template below. Link this contract rather than copying it into every report. Record exact commands and outcomes; do not describe a command as run if it was only inspected or proposed.

```markdown
Assessment: <component/family or composition>
Commit / dependency versions / date:
Reference: <Canon asset/research section and story ID or app route>
Environment: <browser/version, OS, viewport, DPR, fonts loaded>
Scope: <Vuetify primitive, Coalesce consumer, or spec-only composite>
Matrix: <sizes × themes × brands/fonts × variants × states actually checked>
Automated evidence: <command, result, test names, report/artifact paths>
Visual/interaction evidence: <screenshots, states driven, reviewer and findings>
Differences: <part/property; Canon → actual; exception predicate or open issue>
Unverified / inapplicable: <cells and reasons>
Outcome: <pass within scope | pass with documented deviations | fail | unverified>
Follow-up: <owner/issue and required next evidence, if any>
```

Run the relevant focused tests together with the general gate and affected app assertions; use the verification package's scripts/configuration for the actual project and server URLs. The configured default is Chromium at 1440×900, Storybook `http://localhost:6006`, and app `https://localhost:48110` (overridable through `STORYBOOK_URL`/`APP_URL`). Record additional browsers and viewports explicitly. Follow plan §6's server ownership constraints when working against the Aspire demo.

At review checkpoints, keep full-page and per-story screenshots under `verify/screenshots/<milestone>/` as specified in the plan, view them, and link the paths in the assessment. That directory is gitignored; preserve/share artifacts through the review system when evidence must outlive a workspace. A clean story render, an inventory with no missing stories, passing unit tests, or a general parity pass is useful evidence with a specific scope; none alone establishes complete Canon parity.
