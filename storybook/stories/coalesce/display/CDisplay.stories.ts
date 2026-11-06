import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { company, person } from "../_support";

export default { title: "Coalesce/Display/c-display", tags: ["coalesce:CDisplay", "coalesce:CAdminDisplay"] } satisfies Meta;

const props = [
  "name", "bio", "email", "phone", "website", "avatarUrl", "favoriteColor", "password", "age", "salary", "rating",
  "isActive", "status", "skills", "birthDate", "startTime", "lastLogin", "createdAt", "resume", "company", "manager",
  "personTags", "nicknames", "luckyNumbers",
];

const table = (component: string) => `
  <v-table density="compact" style="max-width: 900px">
    <tbody>
      <tr v-for="p in props" :key="p"><th style="width: 160px">{{ p }}</th><td><${component} :model="a" :for="p" /></td><td><${component} :model="b" :for="p" /></td></tr>
    </tbody>
  </v-table>`;

/** Every property type, for two people (the second has more nulls). */
export const AllTypes = tpl(table("c-display"), () => ({ props, a: person(1), b: person(9) }));

export const Formats = tpl(
  `<sb-row label="date format"><c-display :model="a" for="lastLogin" format="yyyy-MM-dd HH:mm" /></sb-row>
  <sb-row label="distance"><c-display :model="a" for="lastLogin" :format="{ distance: true }" /></sb-row>
  <sb-row label="element=div"><c-display :model="a" for="bio" element="div" style="max-width: 320px" /></sb-row>
  <sb-row label="value + for type"><c-display :value="3" for="Person.status" /><c-display :value="true" for="Person.isActive" /></sb-row>
  <sb-row label="null"><c-display :value="null" for="Person.name" /> (renders nothing)</sb-row>`,
  () => ({ a: person(1) }),
);

/** Navigations become router links; binaries become download links. */
export const AdminDisplay = tpl(table("c-admin-display"), () => ({ props, a: person(1), b: person(9) }));

export const AdminDisplayCollections = tpl(
  `<sb-row label="Company.employees"><c-admin-display :model="c" for="employees" /></sb-row>`,
  () => ({ c: company(1) }),
);
