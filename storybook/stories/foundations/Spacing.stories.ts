import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../_helpers";

export default { title: "Foundations/Spacing and sizes" } satisfies Meta;

export const Spacing = tpl(
  `<sb-row v-for="n in [0,1,2,3,4,5,6,8,10,12,16]" :key="n" :label="'pa-' + n">
    <sb-measure :props="['padding-top']"><div :class="'pa-' + n" style="background: rgb(var(--v-theme-primary), .15); display: inline-block"><div style="width: 16px; height: 16px; background: rgb(var(--v-theme-primary))" /></div></sb-measure>
  </sb-row>
  <sb-row label="ga-*"><div v-for="n in [1,2,3,4,6]" :key="n" :class="'d-flex ga-' + n" class="me-6"><div v-for="i in 3" :key="i" style="width: 16px; height: 16px; background: rgb(var(--v-theme-primary))" /></div></sb-row>`,
);

// The public size tokens (c-style's `cStyleTokens`; colours and shadows are
// in Foundations/Colors and Shape and depth).
const tokens = [
  "--cs-control-height", "--cs-control-pad", "--cs-control-font", "--cs-control-lh", "--cs-control-gap", "--cs-control-tracking",
  "--cs-icon", "--cs-radius", "--cs-surface-radius", "--cs-gap-sm", "--cs-gap-md", "--cs-gap-lg", "--cs-gap-xl", "--cs-hairline",
];

export const Tokens = tpl(
  `<sb-section title="--cs-* size tokens" note="Canon md values on :root, read from the computed style; the public contract app CSS may use (c-style/tokens). Per-instance sizes come from Vuetify's named sizes (size=&quot;small&quot; / &quot;large&quot;) or the control-box mixin.">
    <div style="font-size: 12px; font-family: ui-monospace, monospace"><sb-measure :props="tokens"><div /></sb-measure></div>
  </sb-section>`,
  () => ({ tokens }),
);
