import { ref } from "vue";
import type { ThemeInstance } from "vuetify";
import { expect, test } from "vitest";
import { cStyleBlueprint } from "../src/blueprint";
import { applyCStyleColors, applyCStyleFont, cStyleThemes } from "../src/theme";

const interFeatures = '"ss01", "cv11", "cv04", "cv03", "cv02"';

test("Public Sans is the default, without Inter's alternates and at half Canon's tracking", () => {
  const { variables } = cStyleThemes().light;
  expect(variables!["font-body"]).toBe('"Public Sans Variable", "Public Sans", ui-sans-serif, system-ui, sans-serif');
  expect(variables!["font-heading"]).toBe(variables!["font-body"]);
  expect(variables!["font-features"]).toBe("normal");
  expect(variables!["font-tracking"]).toBe(0.5);
});

test("Inter gets Canon's alternates and full tracking", () => {
  const { variables } = cStyleThemes(undefined, "Inter").dark;
  expect(variables!["font-body"]).toMatch(/^InterVariable, Inter,/);
  expect(variables!["font-features"]).toBe(interFeatures);
  expect(variables!["font-tracking"]).toBe(1);
});

test("other fonts get neither, and are quoted when they need to be", () => {
  const { variables } = cStyleThemes(undefined, "Source Sans 3").light;
  expect(variables!["font-body"]).toBe('"Source Sans 3", ui-sans-serif, system-ui, sans-serif');
  expect(variables!["font-features"]).toBe("normal");
  expect(variables!["font-tracking"]).toBe(0);
  expect(cStyleThemes(undefined, "system-ui").light.variables!["font-body"]).toMatch(/^system-ui, /);
});

test("explicit features and tracking win", () => {
  const theme = cStyleBlueprint({ font: { family: "Geist", features: '"ss01"', tracking: 0.75 } }).theme;
  const variables = theme && theme.themes!.light!.variables!;
  expect(variables).toMatchObject({ "font-features": '"ss01"', "font-tracking": 0.75 });
});

test("applyCStyleFont switches every theme in place, and applyCStyleColors leaves it alone", () => {
  const themes = ref(cStyleThemes());
  const theme = { themes } as unknown as ThemeInstance;
  applyCStyleFont(theme, "Inter");
  applyCStyleColors(theme, { primary: "violet" });
  for (const t of [themes.value.light, themes.value.dark]) {
    expect(t.variables!["font-body"]).toMatch(/^InterVariable, /);
    expect(t.variables!["font-features"]).toBe(interFeatures);
  }
  applyCStyleFont(theme);
  expect(themes.value.light.variables!["font-body"]).toMatch(/^"Public Sans Variable", /);
});
