import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VSheet", tags: ["vuetify:VSheet", "vuetify:VDivider"] } satisfies Meta;

export const Sheets = tpl(
  `<sb-row label="color">
    <v-sheet v-for="c in ['surface','background','surface-variant','primary']" :key="c" :color="c" class="pa-4" width="160" height="80">{{ c }}</v-sheet>
  </sb-row>
  <sb-row label="border/rounded"><v-sheet border rounded class="pa-4" width="160">border rounded</v-sheet><v-sheet border rounded="lg" class="pa-4" width="160">rounded lg</v-sheet><v-sheet elevation="2" rounded="lg" class="pa-4" width="160">elevation 2</v-sheet></sb-row>`,
);

export const Divider = tpl(
  `<sb-row label="horizontal" stack><div><p>Above</p><v-divider /><p>Below</p></div><div><p>Thick</p><v-divider thickness="2" /><p>Below</p></div><div><p>Inset</p><v-divider inset /><p>Below</p></div></sb-row>
  <sb-row label="vertical"><span>Left</span><v-divider vertical style="height: 24px" /><span>Right</span></sb-row>
  <sb-row label="with text"><div style="width: 320px"><v-divider>or</v-divider></div></sb-row>
  <sb-row label="opacity/color"><div style="width: 320px"><v-divider color="primary" opacity="1" /></div></sb-row>`,
);
