import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { withMocks } from "../_support";

export default { title: "Coalesce/Admin/c-admin-audit-log-page", tags: ["coalesce:CAdminAuditLogPage"] } satisfies Meta;

export const Populated = tpl(`<c-admin-audit-log-page type="AuditLog" />`);

export const ColorPrimary = tpl(`<c-admin-audit-log-page type="AuditLog" color="primary" />`);

export const Empty = tpl(`<c-admin-audit-log-page type="AuditLog" />`, undefined, {
  beforeEach: withMocks({ empty: true }),
});
