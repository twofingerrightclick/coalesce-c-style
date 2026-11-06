import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Overlays/VKbd", tags: ["vuetify:VKbd", "vuetify:VHotkey"] } satisfies Meta;

export const Kbd = tpl(
  `<sb-row label="v-kbd"><v-kbd>Ctrl</v-kbd> + <v-kbd>K</v-kbd><v-kbd>Esc</v-kbd><v-kbd>⌘</v-kbd></sb-row>
  <sb-row label="v-hotkey"><v-hotkey keys="ctrl+k" /><v-hotkey keys="meta+shift+p" /><v-hotkey keys="alt+enter" variant="flat" /></sb-row>`,
);
