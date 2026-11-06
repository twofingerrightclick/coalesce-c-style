import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Text entry" } satisfies Meta;

export const TextInput = parity(
  "Text Input: empty, value, icons, prefix/suffix",
  `<div style="display:grid;gap:16px;max-width:320px">
    <v-text-field placeholder="Placeholder" hide-details data-parity="ti-empty" data-parity-target=".v-field" />
    <v-text-field model-value="Text" hide-details data-parity="ti-value" data-parity-target=".v-field" />
    <v-text-field model-value="Text" prepend-inner-icon="$prev" append-inner-icon="$next" hide-details data-parity="ti-icons" data-parity-target=".v-field" />
    <v-text-field model-value="Text" prefix="Prefix" suffix="Suffix" hide-details data-parity="ti-affix" data-parity-target=".v-field" />
    <v-text-field model-value="Text" disabled hide-details data-parity="ti-disabled" data-parity-target=".v-field" />
  </div>`,
  `<div style="display:grid;gap:16px;max-width:320px">
    <div class="canon-text-input" data-parity="ti-empty"><input type="text" aria-label="Empty" placeholder="Placeholder"></div>
    <div class="canon-text-input" data-parity="ti-value"><input type="text" aria-label="Value" placeholder value="Text"></div>
    <div class="canon-text-input" data-parity="ti-icons"><span class="canon-icon" data-icon="chevron-left" aria-hidden="true"></span><input type="text" aria-label="Icons" placeholder value="Text"><span class="canon-icon" data-icon="chevron-right" aria-hidden="true"></span></div>
    <div class="canon-text-input" data-parity="ti-affix"><span class="canon-text-input-prefix" aria-hidden="true">Prefix</span><input type="text" aria-label="Affixes" placeholder value="Text"><span class="canon-text-input-suffix" aria-hidden="true">Suffix</span></div>
    <div class="canon-text-input" data-parity="ti-disabled"><input type="text" aria-label="Disabled" placeholder value="Text" disabled></div>
  </div>`,
);

export const Field = parity(
  "Field: label above, hint, error",
  `<div style="display:grid;gap:24px;max-width:320px">
    <v-text-field label="Display name" placeholder="e.g. Jane Doe" persistent-placeholder hide-details data-parity="field-basic" />
    <v-text-field label="Email" model-value="jane@example.com" hint="We never share it." persistent-hint data-parity="field-hint" />
    <v-text-field label="Username" model-value="j" :error-messages="['At least 3 characters.']" data-parity="field-error" />
  </div>`,
  `<div style="display:grid;gap:24px;max-width:320px">
    <div class="canon-field" data-parity="field-basic"><div class="canon-label"><label class="canon-label-text" for="f1">Display name</label></div><div class="canon-text-input"><input id="f1" type="text" placeholder="e.g. Jane Doe"></div></div>
    <div class="canon-field" data-parity="field-hint"><div class="canon-label"><label class="canon-label-text" for="f2">Email</label></div><div class="canon-text-input"><input id="f2" type="text" placeholder value="jane@example.com" aria-describedby="f2-d"></div><p class="canon-field-message" id="f2-d">We never share it.</p></div>
    <div class="canon-field" data-parity="field-error"><div class="canon-label"><label class="canon-label-text" for="f3">Username</label></div><div class="canon-text-input"><input id="f3" type="text" placeholder value="j" aria-invalid="true" aria-describedby="f3-e"></div><p class="canon-field-message" id="f3-e" data-intent="danger">At least 3 characters.</p></div>
  </div>`,
);

export const Select = parity(
  "Select: empty, chosen",
  `<div style="display:grid;gap:16px;max-width:320px">
    <v-select :items="['Option 1','Option 2','Option 3']" placeholder="Please select" persistent-placeholder hide-details data-parity="select-empty" data-parity-target=".v-field" />
    <v-select :items="['Option 1','Option 2','Option 3']" model-value="Option 1" hide-details data-parity="select-chosen" data-parity-target=".v-field" />
  </div>`,
  `<div style="display:grid;gap:16px;max-width:320px">
    <div class="canon-select" data-parity="select-empty"><select aria-label="Empty"><option value="" hidden selected>Please select</option><option>Option 1</option><option>Option 2</option></select></div>
    <div class="canon-select" data-parity="select-chosen"><select aria-label="Chosen"><option selected>Option 1</option><option>Option 2</option></select></div>
  </div>`,
);

export const Date = parity(
  "Date input",
  `<div style="max-width:320px"><v-text-field label="Date" type="date" model-value="2025-10-10" hide-details data-parity="date" data-parity-target=".v-field" /></div>`,
  `<div style="max-width:320px"><div class="canon-field"><div class="canon-label"><label class="canon-label-text" for="d1">Date</label></div><div class="canon-date" data-parity="date"><input type="date" id="d1" value="2025-10-10"></div></div></div>`,
);
