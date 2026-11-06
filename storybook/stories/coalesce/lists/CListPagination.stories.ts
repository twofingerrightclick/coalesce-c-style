import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { mockEndpoint, people } from "../_support";

export default {
  title: "Coalesce/Lists/c-list-pagination",
  tags: ["coalesce:CListPagination", "coalesce:CListPage", "coalesce:CListPageSize", "coalesce:CListRangeDisplay"],
} satisfies Meta;

const all = `
  <sb-row label="c-list-pagination" stack><c-list-pagination :list="list" /></sb-row>
  <sb-row label="c-list-page"><c-list-page :list="list" /></sb-row>
  <sb-row label="c-list-page-size"><c-list-page-size :list="list" /></sb-row>
  <sb-row label="c-list-range-display"><c-list-range-display :list="list" /></sb-row>`;

export const FirstPage = tpl(all, () => ({ list: people({ page: 1 }) }));
export const MiddlePage = tpl(all, () => ({ list: people({ page: 2 }) }));
export const LastPage = tpl(all, () => ({ list: people({ page: 3 }) }));
export const CustomPageSizes = tpl(
  `<c-list-pagination :list="list" :page-sizes="[5, 15, 30]" />`,
  () => ({ list: people({ pageSize: 5 }) }),
);

/** `noCount` lists don't know their total; the server reports pageCount -1. */
export const UnknownCount = tpl(all, () => ({ list: people({ page: 2 }) }), {
  beforeEach: () => {
    const m = mockEndpoint("/Person/list", (cfg) => {
      const page = Number(cfg.params?.page ?? 1);
      return { wasSuccessful: true, list: [], page, pageSize: 10, pageCount: -1, totalCount: -1 };
    });
    return () => m.destroy();
  },
});
