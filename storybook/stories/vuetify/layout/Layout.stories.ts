import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Layout/Grid and providers",
  tags: ["vuetify:VContainer", "vuetify:VRow", "vuetify:VCol", "vuetify:VSpacer", "vuetify:VThemeProvider", "vuetify:VDefaultsProvider", "vuetify:VLocaleProvider"],
} satisfies Meta;

export const Grid = tpl(
  `<v-container class="border rounded">
    <v-row><v-col v-for="n in 3" :key="n" cols="12" md="4"><v-sheet border rounded class="pa-4">col md-4</v-sheet></v-col></v-row>
    <v-row dense><v-col cols="8"><v-sheet border rounded class="pa-4">cols 8, dense row</v-sheet></v-col><v-col><v-sheet border rounded class="pa-4">auto</v-sheet></v-col></v-row>
    <v-row no-gutters align="center"><v-col cols="auto"><v-sheet border class="pa-2">auto</v-sheet></v-col><v-spacer /><v-col cols="auto"><v-sheet border class="pa-2">spacer pushes me</v-sheet></v-col></v-row>
  </v-container>`,
);

export const ThemeProvider = tpl(
  `<sb-row label="light / dark islands">
    <v-theme-provider theme="light" with-background class="pa-4 rounded border"><v-btn color="primary" variant="flat">Light</v-btn><v-text-field label="Field" class="mt-2" style="width: 200px" /></v-theme-provider>
    <v-theme-provider theme="dark" with-background class="pa-4 rounded border"><v-btn color="primary" variant="flat">Dark</v-btn><v-text-field label="Field" class="mt-2" style="width: 200px" /></v-theme-provider>
  </sb-row>`,
);

export const DefaultsProvider = tpl(
  `<v-defaults-provider :defaults="{ global: { density: 'compact' }, VBtn: { variant: 'outlined', color: 'primary' }, VTextField: { variant: 'underlined' } }">
    <sb-row label="scoped defaults"><v-btn>Outlined by default</v-btn><v-text-field label="Underlined by default" style="width: 240px" /></sb-row>
  </v-defaults-provider>`,
);

export const LocaleProvider = tpl(
  `<v-locale-provider rtl><sb-row label="rtl"><v-text-field label="Right to left" prepend-inner-icon="$search" style="width: 240px" /><v-btn prepend-icon="$next">Next</v-btn></sb-row></v-locale-provider>`,
);
