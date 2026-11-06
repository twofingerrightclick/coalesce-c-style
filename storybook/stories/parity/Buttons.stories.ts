import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Buttons" } satisfies Meta;

const emphases = [
  ["high", "flat"],
  ["medium", "tonal"],
  ["low", "outlined"],
  ["minimal", "text"],
] as const;
const intents = [
  ["", "primary"],
  ["neutral", "neutral"],
  ["danger", "error"],
] as const;

const canonBtn = (e: string, i: string, extra = "") =>
  `<button type="button" class="canon-button" data-emphasis="${e}"${i ? ` data-intent="${i}"` : ""} data-parity="btn-${e}-${i || "accent"}"${extra}><span class="canon-button-label">Save</span></button>`;
const vBtn = (e: string, v: string, i: string, color?: string, extra = "") =>
  `<v-btn variant="${v}"${color ? ` color="${color}"` : ""} data-parity="btn-${e}-${i || "accent"}"${extra}>Save</v-btn>`;

const rows = (extraCanon = "", extraV = "") =>
  emphases.map(([e, v]) => ({
    canon: `<div style="display:flex;gap:12px;margin-bottom:12px">${intents.map(([i]) => canonBtn(e, i, extraCanon)).join("")}</div>`,
    vuetify: `<div style="display:flex;gap:12px;margin-bottom:12px">${intents.map(([i, c]) => vBtn(e, v, i, c, extraV)).join("")}</div>`,
  }));

export const Button = parity(
  "Button: emphasis (rows) × intent accent / neutral / danger",
  rows().map((r) => r.vuetify).join(""),
  rows().map((r) => r.canon).join(""),
);

export const ButtonDisabled = parity(
  "Button: disabled",
  rows("", " disabled").map((r) => r.vuetify).join(""),
  rows(" disabled").map((r) => r.canon).join(""),
);

export const ButtonIcons = parity(
  "Button: icon + label, icon only",
  `<div style="display:flex;gap:12px">
    <v-btn prepend-icon="$plus" data-parity="btn-icon-label">Create</v-btn>
    <v-btn icon="$edit" aria-label="Edit" data-parity="btn-icon-only" />
  </div>`,
  `<div style="display:flex;gap:12px">
    <button type="button" class="canon-button" data-parity="btn-icon-label"><span class="canon-icon" data-icon="plus" aria-hidden="true"></span><span class="canon-button-label">Create</span></button>
    <button type="button" class="canon-button" data-display="icon" data-parity="btn-icon-only"><span class="canon-icon" data-icon="pencil" aria-hidden="true"></span><span class="canon-button-label">Edit</span></button>
  </div>`,
);

export const ButtonGroup = parity(
  "Button Group",
  `<v-btn-group variant="outlined" divided data-parity="group"><v-btn data-parity="group-first">Bold</v-btn><v-btn>Italic</v-btn><v-btn>Underline</v-btn></v-btn-group>`,
  `<div class="canon-button-group" role="group" aria-label="Text style" data-parity="group">
    <button type="button" class="canon-button" data-parity="group-first"><span class="canon-button-label">Bold</span></button>
    <button type="button" class="canon-button"><span class="canon-button-label">Italic</span></button>
    <button type="button" class="canon-button"><span class="canon-button-label">Underline</span></button>
  </div>`,
);

export const SegmentedControl = parity(
  "Segmented Control",
  `<v-btn-toggle :model-value="'week'" mandatory data-parity="seg">
    <v-btn value="day" data-parity="seg-option">Day</v-btn><v-btn value="week" data-parity="seg-selected">Week</v-btn><v-btn value="month">Month</v-btn>
  </v-btn-toggle>`,
  `<div class="canon-segmented" role="radiogroup" aria-label="Calendar view" data-parity="seg">
    <label class="canon-segmented-option" data-parity="seg-option"><input type="radio" name="view" value="day"><span class="canon-segmented-label">Day</span></label>
    <label class="canon-segmented-option" data-parity="seg-selected"><input type="radio" name="view" value="week" checked><span class="canon-segmented-label">Week</span></label>
    <label class="canon-segmented-option"><input type="radio" name="view" value="month"><span class="canon-segmented-label">Month</span></label>
  </div>`,
);
