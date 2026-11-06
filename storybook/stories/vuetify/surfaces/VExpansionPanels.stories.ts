import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VExpansionPanels", tags: ["vuetify:VExpansionPanel"] } satisfies Meta;

export const Variants = tpl(
  `<sb-section v-for="v in ['default','accordion','inset','popout']" :key="v" :title="v">
    <v-expansion-panels :variant="v" :model-value="[0]" multiple>
      <v-expansion-panel title="Open panel" text="Panel body text, revealed when open." />
      <v-expansion-panel title="Closed panel" text="Hidden." />
      <v-expansion-panel title="Disabled panel" disabled text="Hidden." />
    </v-expansion-panels>
  </sb-section>
  <sb-section title="custom title"><v-expansion-panels v-model="open"><v-expansion-panel><v-expansion-panel-title expand-icon="$plus" collapse-icon="$minus">Custom icons</v-expansion-panel-title><v-expansion-panel-text>Body</v-expansion-panel-text></v-expansion-panel></v-expansion-panels></sb-section>`,
  () => ({ open: ref(0) }),
);
