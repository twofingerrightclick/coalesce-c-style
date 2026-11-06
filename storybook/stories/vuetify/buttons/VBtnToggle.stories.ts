import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Buttons/VBtnToggle", tags: ["vuetify:VBtnToggle"] } satisfies Meta;

export const SegmentedControl = tpl(
  `<sb-row label="single, mandatory"><v-btn-toggle v-model="view" mandatory><v-btn value="list">List</v-btn><v-btn value="board">Board</v-btn><v-btn value="calendar">Calendar</v-btn></v-btn-toggle></sb-row>
  <sb-row label="multiple"><v-btn-toggle v-model="format" multiple><v-btn value="b" icon="$complete" aria-label="Bold" /><v-btn value="i" icon="$edit" aria-label="Italic" /><v-btn value="u" icon="$minus" aria-label="Underline" /></v-btn-toggle></sb-row>
  <sb-row label="color"><v-btn-toggle v-model="view" color="primary"><v-btn value="list">List</v-btn><v-btn value="board">Board</v-btn></v-btn-toggle></sb-row>
  <sb-row label="disabled"><v-btn-toggle v-model="view" disabled><v-btn value="list">List</v-btn><v-btn value="board">Board</v-btn></v-btn-toggle></sb-row>`,
  () => ({ view: ref("list"), format: ref(["b"]) }),
);
