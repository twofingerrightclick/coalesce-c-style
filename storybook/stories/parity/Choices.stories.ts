import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Choices" } satisfies Meta;

export const Checkbox = parity(
  "Checkbox: unchecked, checked, indeterminate, disabled",
  `<v-form class="d-flex flex-column ga-2">
    <v-checkbox label="Unchecked" :model-value="false" hide-details data-parity="cb-off" />
    <v-checkbox label="Checked" :model-value="true" hide-details data-parity="cb-on" />
    <v-checkbox label="Indeterminate" indeterminate hide-details data-parity="cb-mixed" />
    <v-checkbox label="Disabled" disabled hide-details data-parity="cb-dis" />
    <v-checkbox label="Disabled, checked" :model-value="true" disabled hide-details data-parity="cb-dis-on" />
  </v-form>`,
  `<div style="display:grid;gap:8px">
    <div class="canon-choice" data-parity="cb-off"><input type="checkbox" id="c1"><label class="canon-choice-label" for="c1">Unchecked</label></div>
    <div class="canon-choice" data-parity="cb-on"><input type="checkbox" id="c2" checked><label class="canon-choice-label" for="c2">Checked</label></div>
    <div class="canon-choice" data-parity="cb-mixed"><input type="checkbox" id="c3"><label class="canon-choice-label" for="c3">Indeterminate</label></div>
    <div class="canon-choice" data-parity="cb-dis"><input type="checkbox" id="c4" disabled><label class="canon-choice-label" for="c4">Disabled</label></div>
    <div class="canon-choice" data-parity="cb-dis-on"><input type="checkbox" id="c5" disabled checked><label class="canon-choice-label" for="c5">Disabled, checked</label></div>
  </div>
  <script>document.getElementById("c3").indeterminate = true;</script>`,
);

export const Radio = parity(
  "Radio group",
  `<v-radio-group model-value="free" label="Plan" hint="You can change this later." persistent-hint data-parity="radio-group">
    <v-radio label="Free" value="free" data-parity="radio-on" /><v-radio label="Team" value="team" data-parity="radio-off" /><v-radio label="Enterprise (contact sales)" value="ent" disabled data-parity="radio-dis" />
  </v-radio-group>`,
  `<fieldset class="canon-fieldset" data-parity="radio-group"><legend class="canon-fieldset-legend">Plan</legend><p class="canon-fieldset-hint">You can change this later.</p>
    <div class="canon-choice" data-parity="radio-on"><input type="radio" id="r1" name="plan" checked><label class="canon-choice-label" for="r1">Free</label></div>
    <div class="canon-choice" data-parity="radio-off"><input type="radio" id="r2" name="plan"><label class="canon-choice-label" for="r2">Team</label></div>
    <div class="canon-choice" data-parity="radio-dis"><input type="radio" id="r3" name="plan" disabled><label class="canon-choice-label" for="r3">Enterprise (contact sales)</label></div>
  </fieldset>`,
);

export const Switch = parity(
  "Switch: off, on, hint, disabled",
  `<v-form class="d-flex flex-column ga-2">
    <v-switch label="Off" :model-value="false" hide-details data-parity="sw-off" />
    <v-switch label="On" :model-value="true" hide-details data-parity="sw-on" />
    <v-switch label="Maintenance mode" :model-value="true" hint="Visitors see a maintenance page." persistent-hint data-parity="sw-hint" />
    <v-switch label="Disabled" disabled hide-details data-parity="sw-dis" />
  </v-form>`,
  `<div style="display:grid;gap:8px">
    <div class="canon-choice" data-parity="sw-off"><input type="checkbox" role="switch" id="s1"><label class="canon-choice-label" for="s1">Off</label></div>
    <div class="canon-choice" data-parity="sw-on"><input type="checkbox" role="switch" id="s2" checked><label class="canon-choice-label" for="s2">On</label></div>
    <div class="canon-choice" data-parity="sw-hint"><input type="checkbox" role="switch" id="s3" checked><label class="canon-choice-label" for="s3">Maintenance mode</label><p class="canon-choice-hint">Visitors see a maintenance page.</p></div>
    <div class="canon-choice" data-parity="sw-dis"><input type="checkbox" role="switch" id="s4" disabled><label class="canon-choice-label" for="s4">Disabled</label></div>
  </div>`,
);
