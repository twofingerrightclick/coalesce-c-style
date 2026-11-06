import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VSnackbar", tags: ["vuetify:VSnackbar", "vuetify:VSnackbarQueue"] } satisfies Meta;

export const Snackbars = tpl(
  `<sb-row v-for="c in [undefined, 'success', 'error', 'primary']" :key="c ?? 'default'" :label="c ?? 'default'">
    <div style="position: relative; height: 72px; width: 560px">
      <v-snackbar :model-value="true" contained :timeout="-1" :color="c" location="bottom left">Saved 3 changes.<template #actions><v-btn variant="text">Undo</v-btn></template></v-snackbar>
    </div>
  </sb-row>
  <sb-row label="multi-line"><div style="position: relative; height: 96px; width: 560px"><v-snackbar :model-value="true" contained :timeout="-1" multi-line>A longer message that wraps onto a second line to show how multi-line snackbars lay out.</v-snackbar></div></sb-row>
  <sb-row label="timer"><div style="position: relative; height: 72px; width: 560px"><v-snackbar :model-value="true" contained :timeout="-1" timer="primary">With a timer bar.</v-snackbar></div></sb-row>`,
);

export const Queue = tpl(
  `<div style="position: relative; height: 200px">
    <v-btn @click="queue.push({ text: 'Message ' + (++n), timeout: -1 })">Add message</v-btn>
    <v-snackbar-queue v-model="queue" contained closable />
  </div>`,
  () => ({ queue: ref([{ text: "Queued message", timeout: -1 }]), n: ref(1) }),
);
