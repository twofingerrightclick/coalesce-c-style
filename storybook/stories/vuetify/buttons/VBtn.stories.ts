import type { Meta } from "@storybook/vue3-vite";
import { btnVariants, colors, sizes, tpl } from "../../_helpers";

export default { title: "Vuetify/Buttons/VBtn", tags: ["vuetify:VBtn"] } satisfies Meta;

export const VariantsByColor = tpl(
  `<sb-section title="variant × color" note="flat = high, tonal = medium (default), outlined = low, text = minimal (plan decision 1).">
    <sb-row v-for="v in variants" :key="v" :label="v">
      <v-btn v-for="c in colors" :key="c ?? 'default'" :variant="v" :color="c">{{ c ?? 'default' }}</v-btn>
    </sb-row>
  </sb-section>
  <sb-section title="Default props">
    <sb-row label="&lt;v-btn&gt;"><v-btn>Save</v-btn></sb-row>
  </sb-section>`,
  () => ({ variants: btnVariants, colors }),
);

export const States = tpl(
  `<sb-section v-for="v in variants" :key="v" :title="v">
    <sb-row label="rest"><v-btn :variant="v" color="primary">Save</v-btn><v-btn :variant="v">Cancel</v-btn></sb-row>
    <sb-row label="active"><v-btn :variant="v" color="primary" active>Save</v-btn><v-btn :variant="v" active>Cancel</v-btn></sb-row>
    <sb-row label="disabled"><v-btn :variant="v" color="primary" disabled>Save</v-btn><v-btn :variant="v" disabled>Cancel</v-btn></sb-row>
    <sb-row label="loading"><v-btn :variant="v" color="primary" loading>Save</v-btn><v-btn :variant="v" loading>Cancel</v-btn></sb-row>
  </sb-section>`,
  () => ({ variants: btnVariants }),
);

export const Sizes = tpl(
  `<sb-section title="size prop">
    <sb-row v-for="s in sizes" :key="s" :label="s">
      <v-btn :size="s" variant="flat" color="primary">Save</v-btn>
      <v-btn :size="s">Cancel</v-btn>
      <v-btn :size="s" prepend-icon="$plus">Create</v-btn>
      <v-btn :size="s" icon="$edit" aria-label="Edit" />
    </sb-row>
  </sb-section>
  <sb-section title="density">
    <sb-row v-for="d in ['default', 'comfortable', 'compact']" :key="d" :label="d"><v-btn :density="d" variant="flat" color="primary">Save</v-btn><v-btn :density="d">Cancel</v-btn></sb-row>
  </sb-section>`,
  () => ({ sizes }),
);

export const IconsAndShape = tpl(
  `<sb-row label="prepend/append"><v-btn prepend-icon="$plus">Create</v-btn><v-btn append-icon="$dropdown">Options</v-btn><v-btn prepend-icon="$loading" variant="text">Reload</v-btn></sb-row>
  <sb-row label="icon-only"><v-btn v-for="v in variants" :key="v" :variant="v" icon="$delete" :aria-label="v" /></sb-row>
  <sb-row label="rounded"><v-btn v-for="r in ['0', 'sm', 'lg', 'xl', 'pill']" :key="r" :rounded="r">{{ r }}</v-btn></sb-row>
  <sb-row label="block"><div style="width: 320px"><v-btn block variant="flat" color="primary">Block</v-btn></div></sb-row>
  <sb-row label="stacked"><v-btn stacked prepend-icon="$info">Stacked</v-btn></sb-row>
  <sb-row label="link"><v-btn href="#" variant="text">Anchor</v-btn><v-btn to="/" variant="outlined">Router link</v-btn></sb-row>`,
  () => ({ variants: btnVariants }),
);
