import { setup, type Decorator, type Preview } from "@storybook/vue3-vite";
import { defineComponent, h, provide, watchEffect, type Component } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify, useTheme } from "vuetify";
import * as vuetifyComponents from "vuetify/components";
import * as vuetifyDirectives from "vuetify/directives";
import * as coalesceVuetify3 from "coalesce-vue-vuetify3";
import { createCoalesceVuetify, CAdminAuditLogPage, CAdminEditorPage, CAdminTablePage } from "coalesce-vue-vuetify3";
import { AxiosClient } from "coalesce-vue";
import { applyCStyleColors, cStyleBlueprint } from "c-style";

// CSS in the order c-style requires (plan §2.3).
import "@fortawesome/fontawesome-free/css/all.css";
import "coalesce-vue-vuetify3/styles.css";
import "vuetify/styles";
import "c-style/styles";
import "../src/storybook.css";

import $metadata from "@/domain/metadata.g";
// Side effect: fills ViewModel.typeLookup, which the admin components need.
import "@/domain/viewmodels.g";
import { mockDomain, mockFallback } from "@/mocks";
import { accents, globalsKey, type StoryGlobals } from "@/globals";
import SbSection from "@/components/SbSection.vue";
import SbRow from "@/components/SbRow.vue";
import Parity from "@/components/Parity.vue";
import CanonFrame from "@/components/CanonFrame.vue";
import SbMeasure from "@/components/foundations/Measure.vue";

AxiosClient.defaults.baseURL = "/api";
mockFallback();

// Story templates are compiled at run time, so everything is registered globally.
const vuetify = createVuetify({
  blueprint: cStyleBlueprint(),
  components: vuetifyComponents,
  directives: vuetifyDirectives,
});

const coalesceComponents: Record<string, Component> = Object.fromEntries(
  Object.entries(coalesceVuetify3 as Record<string, unknown>).filter(([name]) => /^C[A-Z]/.test(name)),
) as Record<string, Component>;

const coalesceVuetify = createCoalesceVuetify({ metadata: $metadata, components: coalesceComponents });

setup((app) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { render: () => null } },
      { path: "/admin/:type", name: "coalesce-admin-list", component: CAdminTablePage, props: true },
      { path: "/admin/:type/edit/:id?", name: "coalesce-admin-item", component: CAdminEditorPage, props: true },
      { path: "/admin/audit", component: CAdminAuditLogPage, props: { type: "AuditLog" } },
    ],
  });
  app.use(router);
  app.use(vuetify);
  app.use(coalesceVuetify);
  app.component("SbSection", SbSection);
  app.component("SbRow", SbRow);
  app.component("Parity", Parity);
  app.component("CanonFrame", CanonFrame);
  app.component("SbMeasure", SbMeasure);
});

const StoryShell = defineComponent({
  props: {
    globals: { type: Object as () => StoryGlobals, required: true },
    padded: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const theme = useTheme();
    provide(globalsKey, props.globals);
    watchEffect(() => {
      theme.change(props.globals.theme);
      const accent = props.globals.accent;
      applyCStyleColors(theme, accent in accents && accent != "canon" ? { primary: accents[accent] } : {});
    });
    return () =>
      h(vuetifyComponents.VApp, { class: "sb-app" }, () =>
        h(vuetifyComponents.VMain, () =>
          h(
            "div",
            { class: ["sb-canvas", { "sb-canvas--padded": props.padded }] },
            slots.default?.(),
          ),
        ),
      );
  },
});

const withCStyle: Decorator = (story, context) => ({
  components: { story, StoryShell },
  setup: () => ({
    globals: context.globals as StoryGlobals,
    padded: context.parameters.padded !== false,
  }),
  template: `<StoryShell :globals="globals" :padded="padded"><story /></StoryShell>`,
});

const preview: Preview = {
  decorators: [withCStyle],
  // Fresh in-memory data for every story. A story layers its own mocks on top
  // in its `beforeEach`.
  beforeEach: () => {
    const mocks = mockDomain();
    return () => mocks.destroy();
  },
  globalTypes: {
    theme: {
      description: "Vuetify theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      description: "Brand accent, applied with applyCStyleColors",
      toolbar: {
        title: "Accent",
        icon: "paintbrush",
        items: Object.entries(accents).map(([value, hex]) => ({ value, title: `${value} ${hex}` })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", accent: "canon" },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          "Overview",
          "Foundations",
          "Vuetify",
          ["Buttons", "Text entry", "Choices", "Surfaces", "Overlays", "Lists", "Data", "Navigation", "Pickers", "Media", "Layout"],
          "Coalesce",
          ["Inputs", "Display", "Lists", "Admin"],
          "Pages",
          "Parity",
        ],
      },
    },
  },
};

export default preview;
