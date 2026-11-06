import type { IconOptions } from "vuetify";
import { fa } from "vuetify/iconsets/fa";
import { csAliases } from "./aliases";
import { cs } from "./cs-set";

export { csAliases } from "./aliases";
export { cs } from "./cs-set";
export { csIcon } from "./cs-icon";

/** Vuetify `icons` options: Lucide by default, `fa:`-prefixed strings through Vuetify's FontAwesome set. */
export const csIconOptions: IconOptions = {
  defaultSet: "cs",
  aliases: csAliases,
  sets: { cs, fa },
};
