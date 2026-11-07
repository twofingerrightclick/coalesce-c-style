import type { Meta } from "@storybook/vue3-vite";
import { fieldStories, people, tpl } from "../../_helpers";

export default { title: "Vuetify/Text entry/VAutocomplete", tags: ["vuetify:VAutocomplete"] } satisfies Meta;

const stories = fieldStories("v-autocomplete", { items: people, multiple: true, chips: true, closableChips: true }, [1, 3]);

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;

export const WrappedChips = tpl(
  `<div class="d-flex flex-column ga-4">
    <template v-for="component in ['v-autocomplete', 'v-select', 'v-combobox']" :key="component">
      <component :is="component" v-for="density in ['default', 'comfortable', 'compact']" :key="density"
        :density="density" :items="items" :model-value="[1, 3]" :label="component + ' / ' + density"
        multiple chips closable-chips prepend-inner-icon="$info" style="width: 240px" />
    </template>
  </div>`,
  () => ({ items: people }),
);

export const Open = tpl(
  `<div style="height: 360px; max-width: 320px"><v-autocomplete :items="items" label="Person" menu auto-select-first /></div>`,
  () => ({ items: people }),
);
