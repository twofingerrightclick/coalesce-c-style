import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { person } from "../_support";
import { AuditLogViewModel, PersonViewModel } from "@/domain/viewmodels.g";
import { fixtureDto } from "@/mocks";
import { mapToModel } from "coalesce-vue";
import * as $metadata from "@/domain/metadata.g";

export default {
  title: "Coalesce/Admin/c-admin-editor",
  tags: ["coalesce:CAdminEditor", "coalesce:CAdminEditorPage"],
} satisfies Meta;

/** Existing record; url and reference rows show their aux buttons, avatarUrl its preview. */
export const Edit = tpl(`<c-admin-editor :model="p" />`, () => ({ p: person(1) }));

export const Create = tpl(`<c-admin-editor :model="p" />`, () => ({ p: new PersonViewModel() }));

/** Edit is denied for AuditLog, so every row renders as a display. */
export const ViewOnly = tpl(`<c-admin-editor :model="log" />`, () => {
  const log = new AuditLogViewModel();
  log.$loadCleanData(mapToModel(fixtureDto("AuditLog", 1001), $metadata.AuditLog));
  return { log };
});

export const Dirty = tpl(`<c-admin-editor :model="p" />`, () => {
  const p = person(2);
  p.name = "Grace Brewster Hopper";
  p.age = 85;
  return { p };
});

export const Validation = tpl(`<c-admin-editor :model="p" />`, () => {
  const p = person(3);
  p.name = "";
  p.age = 200;
  return { p };
});

export const Props = tpl(`<c-admin-editor :model="p" :props="['name', 'email', 'company', 'status']" color="primary" />`, () => ({ p: person(1) }));

export const Page = tpl(`<c-admin-editor-page type="Person" :id="1" />`);

export const PageAutoSave = tpl(`<c-admin-editor-page type="Person" :id="2" auto-save />`);

export const PageCreate = tpl(`<c-admin-editor-page type="Person" />`);

// Story-level tags must be literal for Storybook's indexer, hence the spread.
export const PageLoadError = { ...tpl(`<c-admin-editor-page type="Person" :id="404" />`), tags: ["allow-request-errors"] };
