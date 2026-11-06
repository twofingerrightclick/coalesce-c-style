import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { company, person } from "../_support";

export default { title: "Coalesce/Inputs/c-input", tags: ["coalesce:CInput"] } satisfies Meta;

/** One `c-input` per metadata prop name; label, hint and rules come from metadata. */
const rows = (props: string[], attrs = "") => `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px 24px; align-items: start">
    ${props.map((p) => `<div><div class="sb-row__label mb-1">${p}</div><c-input :model="person" for="${p}" ${attrs} /></div>`).join("\n")}
  </div>`;

const setup = () => ({ person: person(1) });

export const Strings = tpl(rows(["name", "bio", "email", "phone", "website", "avatarUrl", "favoriteColor", "password"]), setup);
export const Numbers = tpl(rows(["age", "salary", "rating"]), setup);
export const Booleans = tpl(
  `${rows(["isActive"])}<div class="mt-4"><div class="sb-row__label mb-1">isActive (checkbox prop)</div><c-input :model="person" for="isActive" checkbox /></div>`,
  setup,
);
export const Enums = tpl(rows(["status", "skills"]), setup);
export const Dates = tpl(rows(["birthDate", "startTime", "lastLogin", "createdAt"]), setup);
export const Binary = tpl(rows(["resume"]), setup);
export const Reference = tpl(rows(["company", "manager"]), setup);
export const ManyToMany = tpl(rows(["personTags"]), setup);
export const PrimitiveCollections = tpl(rows(["nicknames", "luckyNumbers"]), setup);
/** Company.employees is a plain collection with no input; c-input falls back to c-display. */
export const UnsupportedFallback = tpl(`<c-input :model="company" for="employees" />`, () => ({ company: company(1) }));

export const States = tpl(
  `<sb-section title="readonly">${rows(["name", "status", "isActive", "birthDate", "company"], "readonly")}</sb-section>
  <sb-section title="disabled">${rows(["name", "status", "isActive", "birthDate", "company"], "disabled")}</sb-section>
  <sb-section title="error (error-messages)">${rows(["name", "age"], ":error-messages=\"['Server says no.']\"")}</sb-section>
  <sb-section title="hint (metadata description)">${rows(["bio"])}</sb-section>`,
  setup,
);

export const AdminDensity = tpl(
  `<sb-section title="as c-admin-editor renders inputs: density compact, outlined, label ''">
    ${rows(["name", "email", "age", "status", "isActive", "birthDate", "company", "personTags"], `density="compact" variant="outlined" hide-details="auto" label=""`)}
  </sb-section>`,
  setup,
);

export const StandaloneValue = tpl(
  `<sb-row label="v-model + for='Person.name'" stack><c-input v-model="name" for="Person.name" /></sb-row>
  <sb-row label="v-model + for='Person.status'" stack><c-input v-model="status" for="Person.status" /></sb-row>`,
  () => ({ name: "Grace Hopper", status: 1 }),
);
