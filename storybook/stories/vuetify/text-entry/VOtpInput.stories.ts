import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Text entry/VOtpInput", tags: ["vuetify:VOtpInput", "vuetify:VOtpField", "vuetify:VOtpGroup", "vuetify:VOtpSeparator"] } satisfies Meta;

export const States = tpl(
  `<sb-row v-for="v in ['outlined','filled','underlined','solo','plain']" :key="v" :label="v"><v-otp-input :variant="v" length="6" model-value="123" style="max-width: 360px" /></sb-row>
  <sb-row label="error"><v-otp-input length="4" model-value="12" error style="max-width: 280px" /></sb-row>
  <sb-row label="disabled"><v-otp-input length="4" model-value="12" disabled style="max-width: 280px" /></sb-row>
  <sb-row label="loading"><v-otp-input length="4" loading style="max-width: 280px" /></sb-row>
  <sb-row label="divider"><v-otp-input length="6" divider="–" style="max-width: 400px" /></sb-row>`,
);
