import type { Meta } from "@storybook/vue3-vite";
import ColorFoundations from "@/components/foundations/ColorFoundations.vue";
import { colors, tpl } from "../_helpers";

export default { title: "Foundations/Colors" } satisfies Meta;

export const Theme = { render: () => ({ components: { ColorFoundations }, template: `<ColorFoundations />` }) };

export const InUse = tpl(
  `<sb-row v-for="c in colors.slice(1)" :key="c" :label="c">
    <v-sheet :color="c" class="pa-3" width="120">bg-{{ c }}</v-sheet>
    <span :class="'text-' + c">text-{{ c }}</span>
    <v-btn :color="c" variant="flat">flat</v-btn><v-btn :color="c" variant="tonal">tonal</v-btn><v-btn :color="c" variant="outlined">outlined</v-btn>
    <v-chip :color="c">chip</v-chip><v-alert :type="['success','warning','error','info'].includes(c) ? c : undefined" :color="c" density="compact" variant="tonal" :text="c" style="max-width: 200px" />
  </sb-row>
  <sb-row label="surfaces"><v-sheet v-for="s in ['background','surface','surface-bright','surface-light','surface-variant']" :key="s" :color="s" class="pa-3 border" width="140">{{ s }}</v-sheet></sb-row>`,
  () => ({ colors }),
);
