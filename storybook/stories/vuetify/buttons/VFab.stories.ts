import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Buttons/VFab", tags: ["vuetify:VFab", "vuetify:VSpeedDial"] } satisfies Meta;

export const Fab = tpl(
  `<sb-row label="icon"><v-fab icon="$plus" aria-label="Create" /><v-fab icon="$plus" color="primary" aria-label="Create" /></sb-row>
  <sb-row label="extended"><v-fab prepend-icon="$plus" text="New person" extended color="primary" /></sb-row>
  <sb-row label="sizes"><v-fab v-for="s in ['x-small','small','default','large','x-large']" :key="s" :size="s" icon="$plus" :aria-label="s" /></sb-row>`,
);

export const SpeedDial = tpl(
  `<div style="height: 260px; display: flex; align-items: flex-end">
    <v-speed-dial location="top center" model-value :persistent="true" attach>
      <template #activator="{ props }"><v-fab v-bind="props" icon="$plus" color="primary" aria-label="Actions" /></template>
      <v-btn key="1" icon="$edit" aria-label="Edit" />
      <v-btn key="2" icon="$delete" aria-label="Delete" />
      <v-btn key="3" icon="$info" aria-label="Info" />
    </v-speed-dial>
  </div>`,
);
