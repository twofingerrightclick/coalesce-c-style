import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { pending, withMocks } from "../_support";
import { PersonViewModel } from "@/domain/viewmodels.g";

export default { title: "Coalesce/Display/c-loader-status", tags: ["coalesce:CLoaderStatus"] } satisfies Meta;

const load = (id: number) => {
  const vm = new PersonViewModel();
  vm.$load(id).catch(() => {});
  return vm;
};

const block = `
  <c-loader-status :loaders="{ 'no-initial-content': [vm.$load] }" style="max-width: 480px">
    <v-card :title="vm.name" :subtitle="vm.email" />
  </c-loader-status>`;

export const Success = tpl(block, () => ({ vm: load(1) }));

export const Loading = tpl(
  `<sb-row label="progress" stack>${block}</sb-row>
  <sb-row label="custom height/color" stack><c-loader-status :loaders="vm.$load" :height="4" color="success" /></sb-row>`,
  () => ({ vm: load(1) }),
  { beforeEach: pending("/Person/get/") },
);

export const ErrorWithRetry = tpl(
  `${block}
  <div class="mt-4"><c-loader-status :loaders="vm.$load" density="compact" show-retry /></div>`,
  () => ({ vm: load(404) }),
);

export const SaveSuccess = tpl(
  `<v-btn class="mb-4" @click="vm.$save()">Save</v-btn>
  <c-loader-status :loaders="vm.$save" show-success style="max-width: 480px" />`,
  () => {
    const vm = new PersonViewModel();
    vm.$loadCleanData({ personId: 1, name: "Ada Lovelace" });
    vm.$save();
    return { vm };
  },
);

export const FailingSave = tpl(
  `<c-loader-status :loaders="vm.$save" style="max-width: 480px" />`,
  () => {
    const vm = new PersonViewModel();
    vm.$loadCleanData({ personId: 1, name: "Ada Lovelace" });
    vm.$save().catch(() => {});
    return { vm };
  },
  { beforeEach: withMocks({ fail: /\/Person\/save/ }) },
);
