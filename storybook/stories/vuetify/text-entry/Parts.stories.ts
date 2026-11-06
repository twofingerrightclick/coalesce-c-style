import type { Meta } from "@storybook/vue3-vite";
import { fieldVariants, tpl } from "../../_helpers";

export default {
  title: "Vuetify/Text entry/Field parts",
  tags: ["vuetify:VField", "vuetify:VLabel", "vuetify:VMessages", "vuetify:VCounter", "vuetify:VInput"],
} satisfies Meta;

export const VField = tpl(
  `<sb-row v-for="v in variants" :key="v" :label="v" stack>
    <v-field :variant="v" label="Label"><div class="pa-4">custom content</div></v-field>
    <v-field :variant="v" label="Active" active focused><input class="v-field__input" value="focused" /></v-field>
    <v-field :variant="v" label="Error" error active><input class="v-field__input" value="error" /></v-field>
  </sb-row>`,
  () => ({ variants: fieldVariants }),
);

export const VLabel = tpl(
  `<sb-row label="default"><v-label>Label text</v-label></sb-row>
  <sb-row label="text prop"><v-label text="From the text prop" /></sb-row>`,
);

export const VMessages = tpl(
  `<sb-row label="hint"><v-messages active :messages="['A hint below the field.']" /></sb-row>
  <sb-row label="error"><v-messages active color="error" :messages="['Name is required.', 'Must be under 100 characters.']" /></sb-row>`,
);

export const VCounter = tpl(
  `<sb-row label="under"><v-counter active :value="6" :max="10" /></sb-row>
  <sb-row label="over"><v-counter active :value="12" :max="10" /></sb-row>`,
);

export const VInput = tpl(
  `<sb-row label="details" stack><v-input hint="Hint for a custom input" persistent-hint prepend-icon="$info"><div>Custom control</div></v-input></sb-row>
  <sb-row label="error" stack><v-input :error-messages="['Something is wrong.']"><div>Custom control</div></v-input></sb-row>`,
);
