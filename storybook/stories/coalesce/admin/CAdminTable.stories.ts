import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { find, people, user } from "../_support";

export default {
  title: "Coalesce/Admin/c-admin-table",
  tags: ["coalesce:CAdminTable", "coalesce:CAdminTableToolbar", "coalesce:CAdminCreateBtn", "coalesce:CAdminTablePage"],
} satisfies Meta;

export const Toolbar = tpl(
  `<sb-row label="read"><c-admin-table-toolbar :list="list" /></sb-row>
  <sb-row label="editable"><c-admin-table-toolbar :list="list" editable /></sb-row>
  <sb-row label="color primary"><c-admin-table-toolbar :list="list" color="primary" /></sb-row>`,
  () => ({ list: people({ filter: { status: "0" } }) }),
);

export const Read = tpl(`<c-admin-table :list="list" />`, () => ({ list: people() }));

export const Columns = tpl(
  `<c-admin-table :list="list" :columns="['name', 'email', 'company', 'status', 'isActive', 'lastLogin']" />`,
  () => ({ list: people() }),
);

/** Edit mode with one row changed and not yet saved. */
export const EditableDirty = tpl(`<c-admin-table :list="list" :columns="['name', 'email', 'status', 'isActive', 'age']" />`, () => ({ list: people({ pageSize: 5 }) }), {
  play: async ({ canvasElement }) => {
    await find(".c-admin-table tbody tr", canvasElement);
    const edit = [...canvasElement.querySelectorAll<HTMLElement>(".c-admin-table-toolbar .v-btn")].find((b) => b.textContent?.includes("Edit"))!;
    await user.click(edit);
    await user.type(await find<HTMLInputElement>(".c-admin-table tbody tr td input", canvasElement), " (edited)");
  },
});

export const AutoSave = tpl(`<c-admin-table :list="list" auto-save :columns="['name', 'email', 'status']" />`, () => ({ list: people({ pageSize: 5 }) }));

export const PageWithMethods = tpl(`<c-admin-table-page type="Person" />`);

export const PageColorPrimary = tpl(`<c-admin-table-page type="Company" color="primary" />`);
