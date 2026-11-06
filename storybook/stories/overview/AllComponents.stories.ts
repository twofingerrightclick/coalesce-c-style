import type { Meta } from "@storybook/vue3-vite";
import AllComponents from "@/components/AllComponents.vue";

export default { title: "Overview/All components" } satisfies Meta;

export const AllComponentsPage = {
  name: "All components",
  render: () => ({ components: { AllComponents }, template: `<AllComponents />` }),
};
