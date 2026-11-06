import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Pickers/Sliders, color, rating",
  tags: ["vuetify:VSlider", "vuetify:VRangeSlider", "vuetify:VColorPicker", "vuetify:VRating"],
} satisfies Meta;

export const Slider = tpl(
  `<sb-row label="default" stack><v-slider v-model="v" label="Volume" hide-details /><v-slider v-model="v" color="primary" thumb-label="always" hide-details /></sb-row>
  <sb-row label="ticks / step" stack><v-slider v-model="v" :step="10" show-ticks="always" hide-details /><v-slider v-model="v" :ticks="{ 0: 'Low', 50: 'Mid', 100: 'High' }" show-ticks="always" step="50" hide-details /></sb-row>
  <sb-row label="disabled / readonly / error" stack><v-slider v-model="v" disabled hide-details /><v-slider v-model="v" readonly hide-details /><v-slider v-model="v" :error-messages="['Too loud.']" /></sb-row>
  <sb-row label="vertical"><v-slider v-model="v" direction="vertical" hide-details /></sb-row>
  <sb-row label="range" stack><v-range-slider v-model="range" hide-details /><v-range-slider v-model="range" color="primary" strict thumb-label hide-details /></sb-row>`,
  () => ({ v: ref(40), range: ref([20, 70]) }),
);

export const ColorPicker = tpl(
  `<sb-row label="modes" wrap>
    <v-color-picker v-model="color" />
    <v-color-picker v-model="color" show-swatches hide-canvas />
    <v-color-picker v-model="color" mode="hsla" elevation="0" border />
  </sb-row>`,
  () => ({ color: ref("#2563eb") }),
);

export const Rating = tpl(
  `<sb-row label="default"><v-rating v-model="r" /></sb-row>
  <sb-row label="half, hover"><v-rating v-model="r" half-increments hover color="warning" active-color="warning" /></sb-row>
  <sb-row label="readonly, density, size"><v-rating :model-value="3" readonly density="compact" size="small" /><v-rating :model-value="4" size="large" /></sb-row>
  <sb-row label="disabled"><v-rating :model-value="2" disabled /></sb-row>`,
  () => ({ r: ref(3.5) }),
);
