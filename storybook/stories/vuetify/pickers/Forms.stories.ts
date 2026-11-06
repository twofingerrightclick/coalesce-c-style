import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Pickers/Files and editing",
  tags: ["vuetify:VFileUpload", "vuetify:VConfirmEdit", "vuetify:VForm", "vuetify:VValidation"],
} satisfies Meta;

export const FileUpload = tpl(
  `<sb-row label="default" stack><v-file-upload title="Drop a resume" /></sb-row>
  <sb-row label="compact, multiple" stack><v-file-upload density="compact" multiple clearable /></sb-row>`,
);

export const ConfirmEdit = tpl(
  `<v-confirm-edit v-model="name" style="max-width: 360px">
    <template #default="{ model, actions }">
      <v-card title="Edit name"><v-card-text><v-text-field v-model="model.value" label="Name" /></v-card-text><template #actions><v-spacer /><component :is="actions" /></template></v-card>
    </template>
  </v-confirm-edit>
  <p class="mt-2">Saved value: {{ name }}</p>`,
  () => ({ name: ref("Ada Lovelace") }),
);

export const FormValidation = tpl(
  `<v-form ref="form" v-model="valid" style="max-width: 420px" @submit.prevent>
    <v-text-field label="Name" :rules="[v => !!v || 'Name is required.']" class="mb-2" />
    <v-text-field label="Email" :rules="[v => /.+@.+/.test(v) || 'Enter an email.']" model-value="not-an-email" class="mb-2" />
    <v-validation :rules="[v => v > 0 || 'Pick at least one.']" :model-value="0" v-slot="{ errorMessages }"><div class="text-error text-caption">{{ [].concat(errorMessages).join(' ') }}</div></v-validation>
    <v-btn type="submit" color="primary" variant="flat" @click="$refs.form.validate()">Validate</v-btn>
    <span class="ms-4">valid: {{ String(valid) }}</span>
  </v-form>`,
  () => ({ valid: ref<boolean | null>(null) }),
);
