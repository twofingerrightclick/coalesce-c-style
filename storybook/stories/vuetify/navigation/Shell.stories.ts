import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Navigation/App shell",
  tags: ["vuetify:VApp", "vuetify:VMain", "vuetify:VLayout", "vuetify:VAppBar", "vuetify:VNavigationDrawer", "vuetify:VFooter", "vuetify:VSystemBar"],
} satisfies Meta;

const nav = `
  <v-list nav density="compact">
    <v-list-item prepend-icon="fa fa-home" title="Home" active />
    <v-list-item prepend-icon="fa fa-cogs" title="Admin" />
    <v-list-item prepend-icon="fa fa-clipboard-list" title="Audit log" />
  </v-list>`;

export const Shell = tpl(
  `<v-layout class="border rounded" style="height: 420px">
    <v-system-bar><v-icon icon="$info" class="me-1" />System bar<v-spacer />12:00</v-system-bar>
    <v-app-bar title="MyProject" density="compact"><template #prepend><v-app-bar-nav-icon @click="drawer = !drawer" /></template><v-btn icon="fa fa-moon" aria-label="Theme" /></v-app-bar>
    <v-navigation-drawer v-model="drawer">${nav}</v-navigation-drawer>
    <v-main><div class="pa-4">Main content</div></v-main>
    <v-footer app>Footer · v1.0</v-footer>
  </v-layout>`,
  () => ({ drawer: ref(true) }),
);

export const AppBar = tpl(
  `<sb-section v-for="d in ['default','prominent','comfortable','compact']" :key="d" :title="d">
    <v-layout style="height: 136px" class="border rounded"><v-app-bar :density="d" :title="'density ' + d" :color="d == 'default' ? 'primary' : undefined"><template #append><v-btn icon="$search" aria-label="Search" /><v-btn icon="fa fa-ellipsis-h" aria-label="More" /></template></v-app-bar><v-main /></v-layout>
  </sb-section>`,
);

export const NavigationDrawer = tpl(
  `<sb-row label="permanent, rail, temporary" stack>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer permanent>${nav}</v-navigation-drawer><v-main /></v-layout>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer permanent rail>${nav}</v-navigation-drawer><v-main /></v-layout>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer :model-value="true" temporary contained>${nav}</v-navigation-drawer><v-main /></v-layout>
  </sb-row>`,
);
