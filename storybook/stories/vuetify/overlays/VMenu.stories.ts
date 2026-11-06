import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Overlays/VMenu", tags: ["vuetify:VMenu"] } satisfies Meta;

export const Open = tpl(
  `<div style="height: 340px">
    <v-menu :model-value="true" :close-on-content-click="false" persistent>
      <template #activator="{ props }"><v-btn v-bind="props" append-icon="$dropdown">Actions</v-btn></template>
      <v-list>
        <v-list-subheader>Record</v-list-subheader>
        <v-list-item prepend-icon="$edit" title="Edit" />
        <v-list-item prepend-icon="$plus" title="Duplicate" active />
        <v-list-item prepend-icon="$file" title="Export" disabled />
        <v-divider />
        <v-list-item prepend-icon="$delete" title="Delete" base-color="error" />
      </v-list>
    </v-menu>
  </div>`,
);

export const Activators = tpl(
  `<sb-row label="click / hover">
    <v-menu><template #activator="{ props }"><v-btn v-bind="props">Click</v-btn></template><v-list><v-list-item title="One" /><v-list-item title="Two" /></v-list></v-menu>
    <v-menu open-on-hover><template #activator="{ props }"><v-btn v-bind="props">Hover</v-btn></template><v-list><v-list-item title="One" /><v-list-item title="Two" /></v-list></v-menu>
    <v-menu location="end"><template #activator="{ props }"><v-btn v-bind="props" icon="fa fa-ellipsis-h" aria-label="More" variant="text" /></template><v-list density="compact"><v-list-item title="Compact one" /><v-list-item title="Compact two" /></v-list></v-menu>
  </sb-row>`,
);
