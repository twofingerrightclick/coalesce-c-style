# Canon Time: inventory for c-style

Sources: `.refs/canon/docs/components/time.md` (contract), `src/css/core/time.css` + `src/css/theme/time.css` (look), `src/js/time.js` (behaviour), `reference/time.html` + `reference/playground/time.js` (examples). The live reference page (https://recepkutuk.github.io/canon/reference/time.html) matches the vendored copy section for section. Summary in `canon.md` §4 C "Time".

Canon has **one** time component, `.canon-time`: a native `<input type="time">` (two for a range) that canon.js covers with a row of framed cells. There is no clock dial, no popover picker, no duration or date-time field (the spec lists those as "not in the contract"). Everything else is a variant of the one box.

## Variants

| Variant | Canon markup | Cells | Value |
|---|---|---|---|
| Time | `.canon-time > input[type=time]` | hour `:` minute | `HH:MM` |
| Empty | no `value` | `--` `:` `--` in the placeholder colour | `""` |
| Step | `step="900"` (seconds) | same; arrows and keys move minutes by 15 | `HH:MM` |
| With seconds | `step` under 60 (`step="1"`), or a value with seconds | hour `:` minute `:` second | `HH:MM:SS` |
| 12-hour | nearest `lang` with a 12-hour cycle (en-US) | hour (1–12) `:` minute, then a day-period cell (AM / PM, no literal before it) | still 24-hour `HH:MM` |
| 24-hour | `lang` with a 23-hour cycle (en-GB, de) | hour (0–23) `:` minute | `HH:MM` |
| Range | two inputs in one box, each `aria-label` ("Start", "End"), field `role=group` + `aria-labelledby` | start cells, arrow (Lucide arrow-right, icon size), end cells | two `HH:MM` |
| Overnight range | `data-overnight` on the box | as range | end may be earlier than start |
| Sizes | `data-size` sm / md / lg on the field, box or a container | cell 32 / 40 / 48 | — |
| Error | `aria-invalid="true"` or `:user-invalid` | every cell red | — |
| Disabled | `disabled` | grey cells, no tabs, out of the tab order | — |
| Read-only | `readonly` | dashed cells, no tabs, focusable, no grow | — |
| RTL | `dir="rtl"` | cells follow the direction, digits keep their order; Left/Right reversed | — |

## Anatomy (what canon.js draws)

```html
<div class="canon-time">
  <input type="time" tabindex="-1" aria-hidden="true">            <!-- invisible, under the cells -->
  <div class="canon-time-segments" role="group" aria-labelledby="…">   <!-- range: data-part="start|end" -->
    <span class="canon-time-cell" data-type="hour">                    <!-- data-active, data-empty -->
      <span class="canon-time-value" role="spinbutton" contenteditable inputmode="numeric"
            aria-label="Hours" aria-valuemin="0" aria-valuemax="23" aria-valuenow="8" aria-valuetext="8">08</span>
      <button class="canon-time-step" data-direction="up" tabindex="-1" aria-label="Later hour"></button>
      <button class="canon-time-step" data-direction="down" tabindex="-1" aria-label="Earlier hour"></button>
    </span>
    <span class="canon-time-literal" aria-hidden="true">:</span>
    <span class="canon-time-cell" data-type="minute">…</span>
  </div>
  <!-- range: <span class="canon-icon canon-time-arrow" data-icon="arrow-forward" aria-hidden="true">, then the end input and cells -->
</div>
```

## Measurements (theme/time.css)

| | sm | md | lg |
|---|---|---|---|
| cell (square, control height) | 32 | 40 | 48 |
| cell gap (around the `:`) | 4 | 4 | 6 |
| range arrow gap | 8 | 8 | 12 |
| radius (input radius) | 4 | 8 | 12 |
| inner radius `max(0, r − 1)` | 3 | 7 | 11 |
| grow `(B + 8) / 4` per side | 10 | 12 | 14 |
| active cell height | 52 | 64 | 76 |
| period cell padding-inline (control pad / 2), min-width B | 4 | 5 | 6 |
| type (control font / input line-height) | 12/16 | 14/20 | 16/24 |
| icon (chevron mask, arrow) | 16 | 20 | 24 |

- Cell: 1px line zinc-200 / zinc-700, bg white / zinc-900, control shadow, text zinc-900 / white, input tracking, tabular figures, centred.
- Literal `:` and range arrow: zinc-400 / zinc-500. Empty cell text `--` zinc-400 / zinc-500.
- Tabs (step buttons at rest): inset 2px, 4px tall, zinc-100 / zinc-800, outer corners = inner radius, inner corners 2px, not clickable.
- Hover (not active): line zinc-400 / zinc-500, tabs zinc-200 / zinc-700.
- Active (focused): z-index 2, grows by `grow` up and down (`margin-block: −grow`, so neighbours don't move), line blue-600 / blue-400, `0 0 0 3px` blue-100 / blue-900, 2px transparent outline (forced colours). Steps: inset 3px, `grow` tall, radius `inner − 2` outside / 2 inside, chevron (24-unit path `m6 9 6 6 6-6`, stroke 1.5) masked at icon size in zinc-500 / zinc-400; hover zinc-200 / zinc-700, pressed zinc-300 / zinc-600. Each step's hit area reaches `3px + 12px` past the cell.
- Error: non-active cells red-400 / red-500; active red-600 / red-400 + 3px red-100 / red-900.
- Disabled: line zinc-200 / zinc-700, bg zinc-50 / zinc-800, no shadow, text zinc-400 / zinc-500, `not-allowed`, steps hidden.
- Read-only: dashed line, steps hidden, active cell does not grow.
- Motion: shrink (block-size, margin) 0.1s ease-out; grow 0.15s `cubic-bezier(0.2, 0, 0, 1)`; line/shadow 0.12s; chevron opacity 0.12s after 0.05s; none under reduced motion.

## Keyboard model (time.js)

| Input | Canon behaviour |
|---|---|
| Tab / Shift+Tab | one stop per cell (each spinbutton `tabindex=0`); the step buttons are not stops; disabled cells leave the order |
| Left / Right | previous / next cell within the same time (reversed under RTL); no wrap at the ends |
| Up / Down | step the cell, wrapping (59 → 00, 23 → 00, 12 → 1, PM ↔ AM); minutes and seconds move by `step` and carry nothing into the hour; an off-step value snaps to the next step in that direction; an empty cell starts from now (minutes/seconds rounded down to the step) |
| Digits | fill the cell; it moves on once it can't take more (two digits, or a first digit `d` with `d0 > max`: 3–9 for 24-hour hours, 2–9 for 12-hour, 6–9 for minutes); a digit that would overflow starts over (`buffer + d > max` → `d`); 12-hour `0` waits for a second digit |
| `:` `.` space | move on, if the cell has a value |
| A / P | in the period cell: AM / PM |
| Backspace | while typing, drop the last typed digit; else clear the cell; an empty cell goes back one cell |
| Delete | as Backspace but never moves back |
| Paste | `14:30`, `2:30 pm`, `14.30.05` fill every cell |
| Enter | submits the enclosing form (`requestSubmit`) |
| Wheel | over the active cell only: a notch is a step (trackpads: every 40px) |
| Pointer | a press in a cell focuses it (focus is held: `mousedown` default prevented); the active cell's steps step on `pointerdown`, repeat after 0.4s every 60ms, stop on up/leave/cancel; a click without a pointer (`detail === 0`, assistive tech) steps once; a press on the box or label goes to the first empty cell, else the hour |
| Escape, Home/End, PageUp/PageDown | not handled by Canon (no popover; Escape belongs to whatever popover hosts the field) |

Value: a complete time sets the input (`input` + `change`); clearing any cell empties it. Leaving an incomplete time fires `change` and marks the input invalid ("Enter a complete time."). Range: an end before the start is invalid ("The end time is before the start time.") unless `data-overnight`. `min`, `max` and `step` mismatches use the browser's own messages.

## ARIA

- `.canon-time-segments`: `role="group"`, named by the input's label (`aria-labelledby`) or `aria-label`; copies `aria-invalid`, `aria-describedby`, `aria-required` from the input. A range's groups are each named by their own input ("Start", "End") inside the field's group.
- Each value: `role="spinbutton"`, `aria-label` Hours / Minutes / Seconds / AM/PM, `aria-valuemin`/`max` (0–23 or 1–12, 0–59, period 0–1), `aria-valuenow` (absent when empty), `aria-valuetext` (the number, the period name, or "Empty"), `aria-disabled`, `aria-readonly`, `inputmode` numeric (text for the period), `contenteditable` only while focused and editable (phones get a number keyboard).
- Steps: `tabindex=-1`, named "Later hour" / "Earlier minute" / "Switch AM/PM".
- Literals and the arrow: `aria-hidden`.

## c-style mapping

| Canon | c-style |
|---|---|
| `.canon-time` box | `CsTimeInput` (bare), `CsTimeField` (with label, hint, messages, rules: VInput) |
| range, `data-overnight` | `CsTimeRangeField` (`overnight`), `CsTimeInput range` |
| `step` | `step` (seconds); `use-seconds` also shows seconds |
| `lang` 12/24 | `format: 'ampm' \| '24hr'`; unset follows Vuetify's current locale through `Intl` |
| `data-size` | `size: 'small' \| 'default' \| 'large'` |
| `aria-invalid`, `disabled`, `readonly` | `error` / `error-messages` / rules, `disabled`, `readonly` (also from a VForm) |
| `min`, `max` | `min`, `max` (invalid, as Canon) plus Vuetify's `allowed-hours` / `allowed-minutes` / `allowed-seconds` (stepping skips disallowed values; typed ones are invalid) |
| (none) | Home / End (first / last allowed value of the cell), PageUp / PageDown (a larger step: hours 6, minutes and seconds the first multiple of `step` ≥ 10) — WAI-ARIA spinbutton keys Canon leaves out |
