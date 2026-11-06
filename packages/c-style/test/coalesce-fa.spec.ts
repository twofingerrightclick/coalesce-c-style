import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { faIcons } from "../src/icons/fa-names";

/** `fa-*` names in Coalesce's components that reach `v-icon` as strings. */
function coalesceFaNames() {
  const dist = dirname(fileURLToPath(import.meta.resolve("coalesce-vue-vuetify3")));
  const names = new Set<string>();
  for (const file of readdirSync(dist, { recursive: true, encoding: "utf8" })) {
    if (!file.endsWith(".js")) continue;
    const source = readFileSync(join(dist, file), "utf8");
    for (const [, name] of source.matchAll(/\bfa-([a-z0-9-]+)/g)) names.add(name);
  }
  names.delete("fw");
  return [...names].sort();
}

// A Coalesce upgrade that adds an icon fails here until fa-names maps it.
test("every FontAwesome name in coalesce-vue-vuetify3 maps to Lucide", () => {
  const missing = coalesceFaNames().filter((name) => !faIcons.has(name));
  expect(missing).toEqual([]);
});
