import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Overlays/VTooltip", tags: ["vuetify:VTooltip"] } satisfies Meta;

export const Locations = tpl(
  `<div style="padding: 64px 160px; display: flex; gap: 96px">
    <v-tooltip v-for="l in ['top','bottom','start','end']" :key="l" :location="l" :model-value="true" :text="'Tooltip ' + l">
      <template #activator="{ props }"><v-btn v-bind="props">{{ l }}</v-btn></template>
    </v-tooltip>
  </div>`,
);

export const Hover = tpl(
  `<v-tooltip text="Reload the list"><template #activator="{ props }"><v-btn v-bind="props" icon="$loading" aria-label="Reload" /></template></v-tooltip>`,
);
