import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Choices/VCheckbox", tags: ["vuetify:VCheckbox", "vuetify:VCheckboxBtn"] } satisfies Meta;

const grid = (attrs: string) => `
  <sb-row label="unchecked"><v-checkbox label="Notify me" :model-value="false" ${attrs} hide-details /></sb-row>
  <sb-row label="checked"><v-checkbox label="Notify me" :model-value="true" ${attrs} hide-details /></sb-row>
  <sb-row label="indeterminate"><v-checkbox label="Select all" indeterminate ${attrs} hide-details /></sb-row>
  <sb-row label="disabled"><v-checkbox label="Off" disabled ${attrs} hide-details /><v-checkbox label="On" :model-value="true" disabled ${attrs} hide-details /></sb-row>
  <sb-row label="readonly"><v-checkbox label="On" :model-value="true" readonly ${attrs} hide-details /></sb-row>
  <sb-row label="error"><v-checkbox label="Accept terms" :error-messages="['Required.']" ${attrs} /></sb-row>
  <sb-row label="hint"><v-checkbox label="Subscribe" hint="Weekly, no more." persistent-hint ${attrs} /></sb-row>`;

export const States = tpl(grid(""));
export const Colored = tpl(grid(`color="primary"`));

export const Sizes = tpl(
  `<sb-section title="density"><sb-row v-for="d in ['default','comfortable','compact']" :key="d" :label="d"><v-checkbox :density="d" label="Notify me" :model-value="true" hide-details /></sb-row></sb-section>`,
);

export const CheckboxBtn = tpl(
  `<sb-row label="v-checkbox-btn"><v-checkbox-btn :model-value="false" aria-label="a" /><v-checkbox-btn :model-value="true" aria-label="b" /><v-checkbox-btn indeterminate aria-label="c" /><v-checkbox-btn disabled aria-label="d" /></sb-row>`,
);
