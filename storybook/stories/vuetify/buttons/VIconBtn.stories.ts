import type { Meta } from "@storybook/vue3-vite";
import { btnVariants, tpl } from "../../_helpers";

export default { title: "Vuetify/Buttons/VIconBtn", tags: ["vuetify:VIconBtn"] } satisfies Meta;

export const Variants = tpl(
  `<sb-row v-for="v in variants" :key="v" :label="v">
    <v-icon-btn :variant="v" icon="$edit" aria-label="Edit" />
    <v-icon-btn :variant="v" icon="$delete" color="error" aria-label="Delete" />
    <v-icon-btn :variant="v" icon="$close" disabled aria-label="Close" />
    <v-icon-btn :variant="v" icon="$loading" loading aria-label="Reload" />
  </sb-row>
  <sb-row label="sizes"><v-icon-btn v-for="s in ['x-small','small','default','large','x-large']" :key="s" :size="s" icon="$plus" :aria-label="s" /></sb-row>
  <sb-row label="active"><v-icon-btn icon="$ratingFull" active aria-label="Starred" /></sb-row>`,
  () => ({ variants: btnVariants }),
);
