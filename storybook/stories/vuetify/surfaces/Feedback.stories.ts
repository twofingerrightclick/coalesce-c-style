import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Surfaces/Feedback",
  tags: ["vuetify:VEmptyState", "vuetify:VSkeletonLoader", "vuetify:VProgressCircular", "vuetify:VProgressLinear", "vuetify:VProgress"],
} satisfies Meta;

export const EmptyState = tpl(
  `<v-empty-state icon="$search" title="No results" text="Try a different search, or clear the filters." action-text="Clear filters" />
  <v-divider class="my-6" />
  <v-empty-state headline="404" title="Page not found" text="The page you asked for doesn't exist." />`,
);

export const SkeletonLoader = tpl(
  `<sb-row label="types" stack>
    <v-skeleton-loader v-for="t in ['card','article','list-item-avatar-two-line','table-row-divider','actions','chip','date-picker']" :key="t" :type="t" border />
  </sb-row>`,
);

export const ProgressCircular = tpl(
  `<sb-row label="indeterminate"><v-progress-circular indeterminate /><v-progress-circular indeterminate color="primary" /><v-progress-circular indeterminate size="small" /><v-progress-circular indeterminate size="large" /></sb-row>
  <sb-row label="value"><v-progress-circular v-for="v in [0,25,50,75,100]" :key="v" :model-value="v" color="primary" size="48">{{ v }}</v-progress-circular></sb-row>
  <sb-row label="width"><v-progress-circular v-for="w in [1,2,4,8]" :key="w" :width="w" :model-value="66" color="primary" /></sb-row>`,
);

export const ProgressLinear = tpl(
  `<sb-row label="value" stack><v-progress-linear v-for="v in [10,50,90]" :key="v" :model-value="v" color="primary" /></sb-row>
  <sb-row label="indeterminate" stack><v-progress-linear indeterminate /><v-progress-linear indeterminate color="primary" /></sb-row>
  <sb-row label="buffer" stack><v-progress-linear :model-value="30" buffer-value="60" color="primary" /><v-progress-linear :model-value="30" stream buffer-value="60" /></sb-row>
  <sb-row label="height" stack><v-progress-linear v-for="h in [2,4,10]" :key="h" :height="h" :model-value="60" rounded color="primary" /></sb-row>
  <sb-row label="striped" stack><v-progress-linear :model-value="60" height="12" striped color="success" /></sb-row>`,
);

export const Progress = tpl(
  `<sb-row label="linear, labelled" stack><v-progress label="Uploading" :model-value="40" /><v-progress label="Storage" :model-value="72" color="warning" /></sb-row>
  <sb-row label="circular" stack><v-progress type="circular" label="Sync" :model-value="60" /></sb-row>
  <sb-row label="indeterminate" stack><v-progress label="Working" indeterminate /></sb-row>`,
);
