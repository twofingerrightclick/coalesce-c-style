import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Navigation/App shell",
  tags: ["vuetify:VApp", "vuetify:VMain", "vuetify:VLayout", "vuetify:VAppBar", "vuetify:VNavigationDrawer", "vuetify:VFooter", "vuetify:VSystemBar"],
} satisfies Meta;

const nav = `
  <v-list nav density="compact">
    <v-list-item prepend-icon="fa fa-home" title="Home" link active />
    <v-list-item prepend-icon="fa fa-cogs" title="Admin" link />
    <v-list-item prepend-icon="fa fa-clipboard-list" title="Audit log" link />
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
    <v-layout style="height: 136px" class="border rounded"><v-app-bar :density="d" :title="'density ' + d"><template #append><v-btn icon="$search" aria-label="Search" /><v-btn icon="fa fa-ellipsis-h" aria-label="More" /></template></v-app-bar><v-main /></v-layout>
  </sb-section>
  <sb-section title="explicit primary">
    <v-layout style="height: 136px" class="border rounded"><v-app-bar color="primary" title="Primary"><template #append><v-btn icon="$search" aria-label="Search" /></template></v-app-bar><v-main /></v-layout>
  </sb-section>`,
);

export const NavigationDrawer = tpl(
  `<sb-row label="permanent, rail, temporary" stack>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer permanent>${nav}</v-navigation-drawer><v-main /></v-layout>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer permanent rail>${nav}</v-navigation-drawer><v-main /></v-layout>
    <v-layout class="border rounded" style="height: 260px"><v-navigation-drawer :model-value="true" temporary contained>${nav}</v-navigation-drawer><v-main /></v-layout>
  </sb-row>`,
);

export const ContentDrawer = tpl(
  `<v-layout class="border rounded" style="height: 420px">
    <v-main><div class="pa-4"><v-btn @click="drawer = true">Open widget details</v-btn></div></v-main>
    <v-navigation-drawer v-model="drawer" location="end" temporary width="360" rounded="xxl" class="overflow-hidden">
      <v-toolbar title="Widget details"><v-btn icon="$close" aria-label="Close details" @click="drawer = false" /></v-toolbar>
      <div class="cs-drawer-body">
        <v-list>
          <v-list-item title="Name" subtitle="Brass Bellows" />
          <v-list-item title="Category" subtitle="Whizbangs" />
        </v-list>
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" color="neutral" @click="drawer = false">Cancel</v-btn>
        <v-btn variant="flat" color="primary">Save</v-btn>
      </v-card-actions>
    </v-navigation-drawer>
  </v-layout>`,
  () => ({ drawer: ref(false) }),
);
