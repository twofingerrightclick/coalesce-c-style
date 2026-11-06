import type { Meta } from "@storybook/vue3-vite";
import { useRouter } from "vue-router";
import { tpl } from "../_helpers";

export default { title: "Pages/Admin shell", parameters: { padded: false } } satisfies Meta;

// The demo app's shell (App.vue) around the memory router, opened at `path`.
const shell = (path: string) =>
  tpl(
    `<v-layout style="min-height: 100vh">
      <v-app-bar density="compact" title="MyProject">
        <template #prepend><v-app-bar-nav-icon /></template>
        <template #append><v-btn icon="fa fa-moon" aria-label="Theme" /></template>
      </v-app-bar>
      <v-navigation-drawer permanent>
        <v-list nav density="compact">
          <v-list-item prepend-icon="fa fa-home" title="Home" />
          <v-list-item prepend-icon="fa fa-cogs" title="People" :to="{ name: 'coalesce-admin-list', params: { type: 'Person' } }" />
          <v-list-item prepend-icon="fa fa-cogs" title="Companies" :to="{ name: 'coalesce-admin-list', params: { type: 'Company' } }" />
          <v-list-item prepend-icon="fa fa-cogs" title="Tags" :to="{ name: 'coalesce-admin-list', params: { type: 'Tag' } }" />
          <v-list-item prepend-icon="fa fa-clipboard-list" title="Audit log" to="/admin/audit" />
        </v-list>
      </v-navigation-drawer>
      <v-main><router-view v-slot="{ Component }"><component :is="Component" color="primary" /></router-view></v-main>
    </v-layout>`,
    () => {
      const router = useRouter();
      router.replace(path);
      return {};
    },
  );

export const PeopleTable = shell("/admin/Person");
export const PersonEditor = shell("/admin/Person/edit/1");
export const AuditLog = shell("/admin/audit");
