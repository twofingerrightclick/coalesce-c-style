import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../_helpers";

export default { title: "Pages/Settings form" } satisfies Meta;

export const SettingsForm = tpl(
  `<v-container style="max-width: 760px">
    <h1 class="text-headline-small mb-1">Workspace settings</h1>
    <p class="text-medium-emphasis mb-6">Applies to everyone in Northwind Traders.</p>
    <v-card title="General" subtitle="Name and contact details" class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6"><v-text-field label="Workspace name" model-value="Northwind Traders" /></v-col>
          <v-col cols="12" md="6"><v-text-field label="Contact email" type="email" model-value="ops@northwind.example.com" hint="We send billing notices here." persistent-hint /></v-col>
          <v-col cols="12" md="6"><v-select label="Time zone" :items="['America/Los_Angeles','America/New_York','Europe/London']" model-value="America/Los_Angeles" /></v-col>
          <v-col cols="12" md="6"><v-autocomplete label="Admins" :items="['Ada Lovelace','Grace Hopper','Alan Turing']" multiple chips closable-chips :model-value="['Ada Lovelace']" /></v-col>
          <v-col cols="12"><v-textarea label="Description" rows="3" model-value="Wholesale food distribution." /></v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card title="Notifications" class="mb-6">
      <v-card-text>
        <v-switch v-model="digest" label="Weekly digest" hide-details />
        <v-checkbox v-model="mentions" label="Email me when I'm mentioned" hide-details />
        <v-radio-group v-model="freq" label="Alert frequency" inline hide-details><v-radio label="Immediately" value="now" /><v-radio label="Hourly" value="hour" /><v-radio label="Daily" value="day" /></v-radio-group>
      </v-card-text>
    </v-card>
    <v-alert type="warning" variant="tonal" title="Danger zone" text="Deleting the workspace removes every record and can't be undone." class="mb-6">
      <template #append><v-btn color="error" variant="flat">Delete workspace</v-btn></template>
    </v-alert>
    <div class="d-flex justify-end ga-2"><v-btn variant="text">Cancel</v-btn><v-btn variant="flat" color="primary">Save changes</v-btn></div>
  </v-container>`,
  () => ({ digest: ref(true), mentions: ref(false), freq: ref("hour") }),
);
