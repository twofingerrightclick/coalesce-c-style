import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VCard", tags: ["vuetify:VCard"] } satisfies Meta;

export const Anatomy = tpl(
  `<sb-row label="full" stack>
    <v-card title="Card title" subtitle="Subtitle in a muted tone" text="Body text explains what this card holds. Cards group related content and actions.">
      <v-card-actions><v-spacer /><v-btn variant="text">Cancel</v-btn><v-btn variant="flat" color="primary">Save</v-btn></v-card-actions>
    </v-card>
    <v-card>
      <v-card-item prepend-icon="$info" append-icon="$close">
        <v-card-title>With item</v-card-title><v-card-subtitle>prepend + append</v-card-subtitle>
      </v-card-item>
      <v-divider />
      <v-card-text>Divider between header and body.</v-card-text>
    </v-card>
    <v-card title="Loading" loading text="Progress bar along the top." />
  </sb-row>`,
);

export const Variants = tpl(
  `<sb-row label="variants" stack>
    <v-card v-for="v in ['elevated','flat','tonal','outlined','text','plain']" :key="v" :variant="v" :title="v" text="Card body" />
  </sb-row>
  <sb-row label="color" stack><v-card v-for="c in ['primary','success','error']" :key="c" :color="c" variant="tonal" :title="c" text="Card body" /></sb-row>
  <sb-row label="states" stack><v-card title="Link" link href="#" text="Hoverable" /><v-card title="Disabled" disabled text="Disabled card" /><v-card title="Hover elevation" hover text="Raises on hover" /></sb-row>`,
);

export const Elevation = tpl(
  `<sb-row label="elevation" stack><v-card v-for="e in [0,1,2,3,4,5]" :key="e" :elevation="e" :title="'elevation ' + e" text="Card body" /></sb-row>`,
);
