import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Overlays/VDialog", tags: ["vuetify:VDialog", "vuetify:VOverlay", "vuetify:VBottomSheet"] } satisfies Meta;

export const Open = tpl(
  `<v-dialog :model-value="true" max-width="480" persistent>
    <v-card title="Delete person?" subtitle="This can't be undone.">
      <v-card-text>Ada Lovelace and her 3 tags will be removed. Audit history is kept.</v-card-text>
      <v-card-actions><v-spacer /><v-btn variant="text">Cancel</v-btn><v-btn variant="flat" color="error">Delete</v-btn></v-card-actions>
    </v-card>
  </v-dialog>`,
);

export const Form = tpl(
  `<v-dialog :model-value="true" max-width="560" persistent scrollable>
    <v-card title="New person">
      <v-divider />
      <v-card-text>
        <v-text-field label="Name" class="mb-2" /><v-text-field label="Email" type="email" class="mb-2" /><v-select label="Status" :items="['Active','On leave']" />
      </v-card-text>
      <v-divider />
      <v-card-actions><v-spacer /><v-btn variant="text">Cancel</v-btn><v-btn variant="flat" color="primary">Create</v-btn></v-card-actions>
    </v-card>
  </v-dialog>`,
);

export const Overlay = tpl(
  `<div style="position: relative; height: 240px" class="d-flex align-center justify-center border rounded">
    <p>Content under a contained overlay</p>
    <v-overlay :model-value="true" contained persistent class="align-center justify-center"><v-progress-circular indeterminate color="primary" /></v-overlay>
  </div>`,
);

export const BottomSheet = tpl(
  `<v-bottom-sheet :model-value="true" persistent>
    <v-card title="Share"><v-list><v-list-item prepend-icon="$file" title="Copy link" /><v-list-item prepend-icon="$upload" title="Export" /></v-list></v-card>
  </v-bottom-sheet>`,
);
