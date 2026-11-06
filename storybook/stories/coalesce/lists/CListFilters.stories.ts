import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { find, people, user } from "../_support";

export default { title: "Coalesce/Lists/c-list-filters", tags: ["coalesce:CListFilters", "coalesce:CListFilterInput"] } satisfies Meta;

const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await user.click(canvasElement.querySelector<HTMLElement>(".c-list-filters")!);
  await find(".c-list-filters--card");
};

export const Closed = tpl(
  `<sb-row label="no filters"><c-list-filters :list="list" /></sb-row>
  <sb-row label="column selection"><c-list-filters :list="list" column-selection /></sb-row>`,
  () => ({ list: people() }),
);

export const ActiveBadge = tpl(`<c-list-filters :list="list" />`, () => {
  return { list: people({ filter: { status: "0", isActive: "true" } }) };
});

export const Open = tpl(`<div style="height: 520px"><c-list-filters :list="list" /></div>`, () => {
  return { list: people({ filter: { status: "0" } }) };
}, { play: openMenu });

export const SubFilterOpen = tpl(`<div style="height: 560px"><c-list-filters :list="list" /></div>`, () => {
  return { list: people({ filter: { status: "0" } }) };
}, {
  play: async (ctx) => {
    await openMenu(ctx);
    await user.click(await find(".c-list-filters--card .v-list-item .v-btn"));
  },
});
