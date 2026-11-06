import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Choices/VSwitch", tags: ["vuetify:VSwitch"] } satisfies Meta;

export const States = tpl(
  `<sb-row label="off / on"><v-switch label="Active" :model-value="false" hide-details /><v-switch label="Active" :model-value="true" hide-details /></sb-row>
  <sb-row label="color"><v-switch label="Active" :model-value="true" color="primary" hide-details /><v-switch label="Active" :model-value="true" color="success" hide-details /></sb-row>
  <sb-row label="inset"><v-switch inset label="Inset" :model-value="true" hide-details /></sb-row>
  <sb-row label="flat"><v-switch flat label="Flat" :model-value="true" hide-details /></sb-row>
  <sb-row label="indeterminate"><v-switch indeterminate label="Mixed" hide-details /></sb-row>
  <sb-row label="loading"><v-switch loading="primary" label="Saving" :model-value="true" hide-details /></sb-row>
  <sb-row label="disabled"><v-switch disabled label="Off" hide-details /><v-switch disabled label="On" :model-value="true" hide-details /></sb-row>
  <sb-row label="readonly"><v-switch readonly label="On" :model-value="true" hide-details /></sb-row>
  <sb-row label="error"><v-switch label="Required" :error-messages="['Must be on.']" /></sb-row>`,
);
