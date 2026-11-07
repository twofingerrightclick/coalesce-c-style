# Documented unfinished work

Audited November 6, 2026 by the Terra agent against the current implementation.
This is a backlog inventory, not authorization to implement every item.
Milestone notes are historical; later fixes take precedence. Drawer styling
remains unfinished; the attempted VDialog adaptation was reverted.

## Confirmed gaps and deferred work

| Area | Remaining work | Evidence |
|---|---|---|
| Time inputs | English-only accessibility and validation strings; resetting a partially cleared time to null leaves internal cells visible because the model is already null. | `docs/progress.md:644`; `CsTimeSegments.ts:24,86`, `CsTimeInput.ts:74` under `packages/c-style/src/components/time/` |
| Overlays and menus | Dedicated BottomSheet, Hotkey and ListGroup treatment; danger menu-row styling and submenu chevrons. VKbd received geometry and uppercase styling later, but still differs in theme colors. | `docs/progress.md:319,344`; `src/styles/overrides/_overlay.scss`, `_data.scss`; `src/styles/settings.scss` |
| Tables | Selected-row fill, filter chips and bulk bar treatment; generic pinned columns. Coalesce's right pinned action column has since been styled. | `docs/progress.md:344`; `src/styles/overrides/_data.scss`; `src/styles/coalesce/_list.scss` |
| Feedback | Banner intent tints, toast stacking/timer/Canon entrance, skeleton sweep. | `docs/progress.md:307`; package README's Known deviations; `src/styles/settings.scss` |
| Pickers and media | Slider value-tooltip/mark details; weekday header, calendar row spacing and inline calendar border. Calendar, Rating, FileUpload, Carousel and media have global styling levers rather than dedicated Canon treatment. | `docs/progress.md:368`; `src/styles/overrides/_pickers.scss` |
| Fields and choices | Prefix/suffix wells and in-box clear/reveal details; choice press/check animations. | `docs/progress.md:228,241`; field and choice override partials |
| Shell components | BottomNavigation, SystemBar and Footer retain global styling rather than dedicated Canon treatment. Stepper was styled later. | M13 in `docs/progress.md`; package README's Known deviations |
| Styling API | Optional `field()` and `press()` mixins remain deferred. | `docs/review/tokens-review.md:55`; public `src/tokens.scss` |
| Verification | Coalesce parity compositions and a general sm/lg parity sweep remain documented omissions; later specialized size tests cover some components. Method/audit monospace and page-dimension differences remain recorded. | `docs/progress.md:391,398`; `verify/parity/` |

Source paths beginning with `src/` in this table are relative to
`packages/c-style/`. Some global-only components have no exact Canon
counterpart, so dedicated treatment requires a design decision.

## Accepted differences

The package README's [Known deviations](../../packages/c-style/README.md#known-deviations-from-canon)
is the maintained inventory of intentional or constrained differences:
typography defaults, several color steps, message spacing, chip remove
segments, tab crossfades, sidebar spacing, pagination measurement, standalone
link styling, tooltip arrows, dialog transition, today indicators and choice
stacking outside forms. These should not automatically be treated as bugs.

## Historical notes that are stale

- Segmented controls, snackbar intent bars, chip sizes, scoped choice stacks,
  overlay scoping and explicit CSS layer ordering received later fixes.
- VKbd is partly styled; it is no longer entirely untouched.
- Coalesce's pinned right action column is implemented; generic pinned-column
  treatment is a separate gap.
- Picker grid overflow and the icon TODO received later fixes.
- Form spacing is now scoped through VForm.
- A VTimePicker replacement was explicitly dropped from scope.

