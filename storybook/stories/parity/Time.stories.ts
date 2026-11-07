import type { Meta } from "@storybook/vue3-vite";
import { CsTimeField, CsTimeInput, CsTimeRangeField } from "coalesce-c-style";
import { parity } from "./_parity";

export default { title: "Parity/Time" } satisfies Meta;

// Canon's cells are drawn by canon.js, so each pair names its part with
// `data-parity-target` on both sides. Canon's clock follows `lang` (the
// frame is `en`, a 12-hour language): 24-hour examples set `en-GB`.

const components = { CsTimeField, CsTimeInput, CsTimeRangeField };

const cell = (type: string) => ({
  cs: `data-parity-target=".cs-time-cell[data-type=${type}]"`,
  canon: `data-parity-target=".canon-time-cell[data-type=${type}]"`,
});
const hour = cell("hour");
const period = cell("period");

const vuetify = `<div style="display:grid;gap:24px;justify-items:start">
  <cs-time-field model-value="08:00" label="Starts at" format="24hr" data-parity="time-label" data-parity-target=".cs-time-field__label" />
  <cs-time-input model-value="08:00" format="24hr" aria-label="Rest" data-parity="time-cell" ${hour.cs} />
  <cs-time-input model-value="08:00" format="24hr" aria-label="Value" data-parity="time-value" data-parity-target=".cs-time-cell[data-type=hour] .cs-time-value" />
  <cs-time-input format="24hr" aria-label="Empty" data-parity="time-empty" data-parity-target=".cs-time-cell[data-type=hour] .cs-time-value" />
  <cs-time-input model-value="08:00" format="24hr" aria-label="Tab" data-parity="time-tab" data-parity-target=".cs-time-cell[data-type=hour] .cs-time-step[data-direction=up]" />
  <cs-time-input model-value="08:00" format="24hr" aria-label="Literal" data-parity="time-literal" data-parity-target=".cs-time-literal" />
  <cs-time-input model-value="08:00" format="24hr" aria-label="Row" data-parity="time-row" data-parity-target=".cs-time-segments" />
  <cs-time-input model-value="14:30" format="ampm" aria-label="Period" data-parity="time-period" ${period.cs} />
  <cs-time-input :model-value="['08:00', '16:30']" range format="24hr" aria-label="Range" data-parity="time-arrow" data-parity-target=".cs-time-arrow" />
  <cs-time-input model-value="08:00" format="24hr" size="small" aria-label="Small" data-parity="time-sm" ${hour.cs} />
  <cs-time-input model-value="08:00" format="24hr" size="large" aria-label="Large" data-parity="time-lg" ${hour.cs} />
  <cs-time-input model-value="03:15" format="24hr" error aria-label="Error" data-parity="time-error" ${hour.cs} />
  <cs-time-input model-value="08:00" format="24hr" disabled aria-label="Disabled" data-parity="time-disabled" ${hour.cs} />
  <cs-time-input model-value="08:00" format="24hr" readonly aria-label="Read-only" data-parity="time-readonly" ${hour.cs} />
</div>`;

const canonTime = (id: string, attrs: string, input: string, lang = "en-GB", size = "") =>
  `<div class="canon-field" lang="${lang}"${size ? ` data-size="${size}"` : ""}><div class="canon-time" data-parity="${id}" ${attrs}>${input}</div></div>`;

const canon = `<div style="display:grid;gap:24px;justify-items:start">
  <div class="canon-field" lang="en-GB" data-parity="time-label" data-parity-target=".canon-label-text"><div class="canon-label"><label class="canon-label-text" for="p-label">Starts at</label></div><div class="canon-time"><input type="time" id="p-label" value="08:00"></div></div>
  ${canonTime("time-cell", hour.canon, `<input type="time" aria-label="Rest" value="08:00">`)}
  ${canonTime("time-value", `data-parity-target=".canon-time-cell[data-type=hour] .canon-time-value"`, `<input type="time" aria-label="Value" value="08:00">`)}
  ${canonTime("time-empty", `data-parity-target=".canon-time-cell[data-type=hour] .canon-time-value"`, `<input type="time" aria-label="Empty">`)}
  ${canonTime("time-tab", `data-parity-target=".canon-time-cell[data-type=hour] .canon-time-step[data-direction=up]"`, `<input type="time" aria-label="Tab" value="08:00">`)}
  ${canonTime("time-literal", `data-parity-target=".canon-time-literal"`, `<input type="time" aria-label="Literal" value="08:00">`)}
  ${canonTime("time-row", `data-parity-target=".canon-time-segments"`, `<input type="time" aria-label="Row" value="08:00">`)}
  ${canonTime("time-period", period.canon, `<input type="time" aria-label="Period" value="14:30">`, "en-US")}
  ${canonTime("time-arrow", `data-parity-target=".canon-time-arrow"`, `<input type="time" aria-label="Start" value="08:00"><input type="time" aria-label="End" value="16:30">`)}
  ${canonTime("time-sm", hour.canon, `<input type="time" aria-label="Small" value="08:00">`, "en-GB", "sm")}
  ${canonTime("time-lg", hour.canon, `<input type="time" aria-label="Large" value="08:00">`, "en-GB", "lg")}
  ${canonTime("time-error", hour.canon, `<input type="time" aria-label="Error" value="03:15" aria-invalid="true">`)}
  ${canonTime("time-disabled", hour.canon, `<input type="time" aria-label="Disabled" value="08:00" disabled>`)}
  ${canonTime("time-readonly", hour.canon, `<input type="time" aria-label="Read-only" value="08:00" readonly>`)}
</div>`;

const base = parity("Time: cells, label, tabs, period, range arrow, sizes, states", vuetify, canon);
export const Time = { ...base, render: () => ({ ...(base.render as () => object)(), components }) };
