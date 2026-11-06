import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../_helpers";

export default { title: "Foundations/Shape and depth" } satisfies Meta;

export const Radius = tpl(
  `<sb-row label="rounded-*">
    <sb-measure v-for="r in ['0','sm','','lg','xl','pill','circle']" :key="r" :props="['border-radius']"><v-sheet :class="r ? 'rounded-' + r : 'rounded'" border width="96" height="64" class="d-flex align-center justify-center">{{ r || 'rounded' }}</v-sheet></sb-measure>
  </sb-row>
  <sb-row label="components">
    <sb-measure :props="['border-radius']"><v-btn>Button</v-btn></sb-measure>
    <sb-measure :props="['border-radius']"><v-card width="120" height="64" title="Card" /></sb-measure>
    <sb-measure :props="['border-radius']"><v-chip>Chip</v-chip></sb-measure>
    <sb-measure :props="['border-radius']"><v-alert text="Alert" density="compact" style="width: 120px" /></sb-measure>
  </sb-row>`,
);

export const Elevation = tpl(
  `<sb-row v-for="e in [0,1,2,3,4,5]" :key="e" :label="'elevation-' + e">
    <sb-measure :props="['box-shadow']"><v-sheet :elevation="e" width="160" height="72" rounded="lg" class="d-flex align-center justify-center">{{ e }}</v-sheet></sb-measure>
  </sb-row>`,
);

export const Lines = tpl(
  `<sb-row label="border"><sb-measure :props="['border-top-color', 'border-top-width']"><v-sheet border width="160" height="48" /></sb-measure><sb-measure :props="['border-top-color']"><v-sheet border="md" width="160" height="48" /></sb-measure></sb-row>
  <sb-row label="divider"><div style="width: 320px"><sb-measure :props="['border-top-color', 'border-top-width', 'opacity']"><v-divider /></sb-measure></div></sb-row>`,
);
