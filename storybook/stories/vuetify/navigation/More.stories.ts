import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Navigation/More",
  tags: ["vuetify:VBreadcrumbs", "vuetify:VBottomNavigation", "vuetify:VStepper", "vuetify:VStepperVertical", "vuetify:VSlideGroup", "vuetify:VItemGroup", "vuetify:VItem"],
} satisfies Meta;

export const Breadcrumbs = tpl(
  `<sb-row label="default"><v-breadcrumbs :items="items" /></sb-row>
  <sb-row label="divider"><v-breadcrumbs :items="items" divider="/" /></sb-row>
  <sb-row label="icon"><v-breadcrumbs :items="items"><template #prepend><v-icon icon="fa fa-home" size="small" class="me-2" /></template></v-breadcrumbs></sb-row>
  <sb-row label="density compact"><v-breadcrumbs :items="items" density="compact" /></sb-row>`,
  () => ({ items: [{ title: "Admin", href: "#" }, { title: "Person", href: "#" }, { title: "Ada Lovelace", disabled: true }] }),
);

export const BottomNavigation = tpl(
  `<v-layout class="border rounded" style="height: 160px">
    <v-main />
    <v-bottom-navigation v-model="nav" :active="true" color="primary">
      <v-btn value="home"><v-icon icon="fa fa-home" /><span>Home</span></v-btn>
      <v-btn value="search"><v-icon icon="$search" /><span>Search</span></v-btn>
      <v-btn value="settings"><v-icon icon="fa fa-cogs" /><span>Settings</span></v-btn>
    </v-bottom-navigation>
  </v-layout>`,
  () => ({ nav: ref("home") }),
);

export const Stepper = tpl(
  `<sb-section title="horizontal">
    <v-stepper v-model="step" :items="['Details', 'Company', 'Review']" show-actions>
      <template #item.1><v-text-field label="Name" /></template>
      <template #item.2><v-select label="Company" :items="['Northwind', 'Contoso']" /></template>
      <template #item.3>Ready to save.</template>
    </v-stepper>
  </sb-section>
  <sb-section title="vertical">
    <v-stepper-vertical v-model="step">
      <v-stepper-vertical-item title="Details" value="1" :complete="step > 1">Name and email.</v-stepper-vertical-item>
      <v-stepper-vertical-item title="Company" value="2" :complete="step > 2">Pick a company.</v-stepper-vertical-item>
      <v-stepper-vertical-item title="Review" value="3">Confirm.</v-stepper-vertical-item>
    </v-stepper-vertical>
  </sb-section>`,
  () => ({ step: ref(2) }),
);

export const SlideAndItemGroup = tpl(
  `<sb-section title="v-slide-group"><v-slide-group v-model="slide" show-arrows style="max-width: 520px"><v-slide-group-item v-for="n in 12" :key="n" :value="n" v-slot="{ isSelected, toggle }"><v-btn class="ma-1" :color="isSelected ? 'primary' : undefined" @click="toggle">Item {{ n }}</v-btn></v-slide-group-item></v-slide-group></sb-section>
  <sb-section title="v-item-group"><v-item-group v-model="item" class="d-flex ga-2"><v-item v-for="n in 4" :key="n" :value="n" v-slot="{ isSelected, toggle }"><v-card :variant="isSelected ? 'tonal' : 'outlined'" :color="isSelected ? 'primary' : undefined" width="120" height="72" class="d-flex align-center justify-center" @click="toggle">Card {{ n }}</v-card></v-item></v-item-group></sb-section>`,
  () => ({ slide: ref(3), item: ref(2) }),
);
