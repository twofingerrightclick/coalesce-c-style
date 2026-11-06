import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Buttons/VBtnGroup", tags: ["vuetify:VBtnGroup"] } satisfies Meta;

export const Variants = tpl(
  `<sb-row v-for="v in ['outlined', 'tonal', 'flat', 'text']" :key="v" :label="v">
    <v-btn-group :variant="v"><v-btn>Day</v-btn><v-btn>Week</v-btn><v-btn>Month</v-btn></v-btn-group>
    <v-btn-group :variant="v" color="primary" divided><v-btn icon="$prev" aria-label="Previous" /><v-btn>Today</v-btn><v-btn icon="$next" aria-label="Next" /></v-btn-group>
  </sb-row>
  <sb-row label="density"><v-btn-group v-for="d in ['default','comfortable','compact']" :key="d" :density="d" variant="outlined" divided><v-btn>{{ d }}</v-btn><v-btn icon="$dropdown" aria-label="More" /></v-btn-group></sb-row>`,
);
