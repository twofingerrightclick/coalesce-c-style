import { aliases as mdiAliases } from "vuetify/iconsets/mdi";
import { expect, test } from "vitest";
import { csAliases } from "../src/icons/aliases";

// Vuetify's MDI set defines every alias its components use; a Vuetify upgrade
// that adds one fails here until csAliases draws it.
test("csAliases covers every Vuetify icon alias", () => {
  expect(Object.keys(csAliases).sort()).toEqual(Object.keys(mdiAliases).sort());
});
