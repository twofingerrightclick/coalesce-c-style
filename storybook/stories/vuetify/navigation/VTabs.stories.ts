import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Navigation/VTabs", tags: ["vuetify:VTabs", "vuetify:VTab", "vuetify:VWindow"] } satisfies Meta;

export const Tabs = tpl(
  `<sb-section title="default + window">
    <v-tabs v-model="tab"><v-tab value="a">Overview</v-tab><v-tab value="b">Activity</v-tab><v-tab value="c">Settings</v-tab><v-tab value="d" disabled>Disabled</v-tab></v-tabs>
    <v-window v-model="tab" class="pa-4"><v-window-item value="a">Overview panel</v-window-item><v-window-item value="b">Activity panel</v-window-item><v-window-item value="c">Settings panel</v-window-item></v-window>
  </sb-section>
  <sb-section title="color, grow, icons"><v-tabs v-model="tab" color="primary" grow><v-tab value="a" prepend-icon="$info">Overview</v-tab><v-tab value="b" prepend-icon="$calendar">Activity</v-tab><v-tab value="c" prepend-icon="fa fa-cogs">Settings</v-tab></v-tabs></sb-section>
  <sb-section title="density"><v-tabs v-for="d in ['default','comfortable','compact']" :key="d" :density="d" v-model="tab"><v-tab value="a">{{ d }}</v-tab><v-tab value="b">Second</v-tab></v-tabs></sb-section>
  <sb-section title="vertical"><v-tabs v-model="tab" direction="vertical" style="max-width: 200px"><v-tab value="a">Overview</v-tab><v-tab value="b">Activity</v-tab><v-tab value="c">Settings</v-tab></v-tabs></sb-section>`,
  () => ({ tab: ref("a") }),
);
