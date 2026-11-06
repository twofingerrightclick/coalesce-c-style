import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Choices/VRadio", tags: ["vuetify:VRadio", "vuetify:VRadioGroup"] } satisfies Meta;

export const States = tpl(
  `<sb-row label="group"><v-radio-group v-model="pick" label="Plan" hide-details><v-radio label="Free" value="free" /><v-radio label="Team" value="team" /><v-radio label="Enterprise" value="ent" /></v-radio-group></sb-row>
  <sb-row label="inline"><v-radio-group v-model="pick" inline hide-details><v-radio label="Free" value="free" /><v-radio label="Team" value="team" /></v-radio-group></sb-row>
  <sb-row label="disabled"><v-radio-group v-model="pick" disabled inline hide-details><v-radio label="Free" value="free" /><v-radio label="Team" value="team" /></v-radio-group></sb-row>
  <sb-row label="color"><v-radio-group v-model="pick" color="primary" inline hide-details><v-radio label="Free" value="free" /><v-radio label="Team" value="team" /></v-radio-group></sb-row>
  <sb-row label="error"><v-radio-group :error-messages="['Pick one.']" inline><v-radio label="Free" value="free" /><v-radio label="Team" value="team" /></v-radio-group></sb-row>`,
  () => ({ pick: ref("team") }),
);
