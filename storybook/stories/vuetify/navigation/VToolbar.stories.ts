import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Navigation/VToolbar", tags: ["vuetify:VToolbar"] } satisfies Meta;

export const Toolbars = tpl(
  `<sb-section v-for="d in ['default','comfortable','compact']" :key="d" :title="'density ' + d">
    <v-toolbar :density="d" title="Person">
      <v-divider vertical inset />
      <v-btn prepend-icon="$plus" variant="text">Create</v-btn><v-btn prepend-icon="$loading" variant="text">Reload</v-btn>
      <v-spacer /><v-btn icon="$search" aria-label="Search" />
    </v-toolbar>
  </sb-section>
  <sb-section title="extended (Coalesce admin pattern), elevation 4">
    <v-toolbar extended density="comfortable" elevation="4" title="Person">
      <template #extension><v-text-field class="mx-4" density="comfortable" single-line hide-details prepend-inner-icon="fa fa-search" label="Search" style="max-width: 320px" /></template>
    </v-toolbar>
  </sb-section>
  <sb-section title="color primary / flat / floating">
    <v-toolbar color="primary" title="Primary" class="mb-4" />
    <v-toolbar flat title="Flat" class="mb-4" />
    <v-toolbar floating><v-text-field hide-details single-line prepend-inner-icon="$search" label="Floating" /></v-toolbar>
  </sb-section>`,
);
