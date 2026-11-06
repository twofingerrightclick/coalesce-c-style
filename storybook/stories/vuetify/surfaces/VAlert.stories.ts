import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VAlert", tags: ["vuetify:VAlert"] } satisfies Meta;

export const Types = tpl(
  `<sb-row v-for="t in ['success','info','warning','error']" :key="t" :label="t" stack>
    <v-alert :type="t" title="Alert title" text="Explains what happened and what to do next." />
    <v-alert :type="t" variant="tonal" text="Tonal, no title." closable />
    <v-alert :type="t" variant="outlined" border="start" text="Outlined with start border." />
  </sb-row>
  <sb-row label="neutral" stack><v-alert title="No type" text="An alert with no intent." /><v-alert icon="$info" text="Custom icon" variant="tonal" /></sb-row>`,
);

export const Variants = tpl(
  `<sb-row v-for="v in ['flat','elevated','tonal','outlined','text','plain']" :key="v" :label="v" stack><v-alert :variant="v" type="info" :text="v" /></sb-row>
  <sb-row label="density" stack><v-alert v-for="d in ['default','comfortable','compact']" :key="d" :density="d" type="warning" :text="d" /></sb-row>
  <sb-row label="prominent" stack><v-alert prominent type="error" title="Prominent" text="Larger icon." /></sb-row>`,
);
