import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { layerOrderCss } from "../src/layer-order.mjs";

test("styles/_layers.scss holds layerOrderCss", () => {
  const scss = readFileSync(new URL("../src/styles/_layers.scss", import.meta.url), "utf8");
  const statement = scss.split("\n").find((line) => line.startsWith("@layer"));
  expect(statement).toBe(layerOrderCss);
});

// A Vuetify upgrade that adds a utility sublayer fails here instead of
// silently ranking it above `c-style` (or below it, by bundle order).
test("layerOrderCss is Vuetify's own layer order plus the c-style sublayer", () => {
  const vuetifyLayers = readFileSync(
    fileURLToPath(import.meta.resolve("vuetify/styles/layers")),
    "utf8",
  );
  // Layer names and nesting braces in order; separators and whitespace differ.
  const structure = (css: string) =>
    css.match(/[\w-]+|[{}]/g)!.filter((token) => token !== "layer");
  const ours = structure(layerOrderCss);
  const utilities = ours.indexOf("vuetify-utilities");
  const close = ours.indexOf("}", utilities);
  expect(ours[close - 1]).toBe("c-style");
  ours.splice(close - 1, 1);
  expect(ours).toEqual(structure(vuetifyLayers));
});
