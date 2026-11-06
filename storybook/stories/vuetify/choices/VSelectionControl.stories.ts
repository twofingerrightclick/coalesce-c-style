import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Choices/VSelectionControl",
  tags: ["vuetify:VSelectionControl", "vuetify:VSelectionControlGroup"],
} satisfies Meta;

export const Group = tpl(
  `<v-selection-control-group v-model="value" multiple>
    <v-selection-control v-for="v in ['Read','Write','Admin']" :key="v" :value="v" :label="v" true-icon="$checkboxOn" false-icon="$checkboxOff" type="checkbox" />
  </v-selection-control-group>
  <p class="text-caption mt-2">Selected: {{ value.join(', ') }}</p>`,
  () => ({ value: ref(["Read"]) }),
);
