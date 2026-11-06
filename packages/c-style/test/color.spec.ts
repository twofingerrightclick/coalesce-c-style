import { existsSync, readFileSync } from "node:fs";
import { differenceCiede2000, modeLab65, modeLrgb, modeOklch, modeRgb, useMode, wcagContrast } from "culori/fn";
import { ref } from "vue";
import type { ThemeInstance } from "vuetify";
import { describe, expect, test } from "vitest";
import { applyCStyleColors, cStyleThemes, generateLadder, palettes, steps } from "../src";

useMode(modeRgb);
useMode(modeLab65);
useMode(modeLrgb);
const toOklch = useMode(modeOklch);
const deltaE = differenceCiede2000();

const canonBase = new URL("../../../.refs/canon/src/css/theme/base.css", import.meta.url);

describe("palettes", () => {
  test.skipIf(!existsSync(canonBase))("match Canon's primitives wherever Canon defines a step", () => {
    const css = readFileSync(canonBase, "utf8");
    const canon = [...css.matchAll(/--canon-theme-([a-z]+)-(\d+):\s*(#[0-9a-f]{6})/g)];
    expect(canon.length).toBeGreaterThan(100);
    for (const [, hue, step, hex] of canon) {
      const ladder = palettes[hue as keyof typeof palettes];
      if (ladder) expect(ladder[Number(step) as 50], `${hue}-${step}`).toBe(hex);
    }
  });
});

describe("generateLadder", () => {
  test("reproduces Tailwind blue from blue-600 within ΔE2000 3", () => {
    const ladder = generateLadder(palettes.blue[600]);
    for (const step of steps) {
      expect(deltaE(ladder[step], palettes.blue[step]), `blue-${step}`).toBeLessThanOrEqual(3);
    }
  });

  test.each(["#7c3aed", "#059669", "#e11d48", "#ea580c", "#facc15", "#06b6d4", "#111111", "#64748b"])(
    "%s: pinned exactly, lightness strictly decreasing",
    (hex) => {
      const ladder = generateLadder(hex);
      expect(Object.values(ladder)).toContain(hex);
      const lightness = steps.map((step) => toOklch(ladder[step])!.l);
      for (let i = 1; i < lightness.length; i++) expect(lightness[i]).toBeLessThan(lightness[i - 1]);
    },
  );
});

describe("cStyleThemes defaults", () => {
  const { light, dark } = cStyleThemes();
  const { zinc, blue, amber } = palettes;

  test("surfaces follow Canon's layer stepping (canon §3.4)", () => {
    expect(light.colors).toMatchObject({ background: zinc[50], surface: "#ffffff", "surface-bright": "#ffffff" });
    expect(dark.colors).toMatchObject({ background: zinc[950], surface: zinc[900], "surface-bright": zinc[800] });
  });

  test("accent roles flip steps per mode (canon §3.2, §3.5)", () => {
    expect(light.colors!.primary).toBe(blue[600]);
    expect(dark.colors!.primary).toBe(blue[600]);
    expect(light.variables).toMatchObject({ "primary-text": blue[700], focus: blue[600], "primary-halo": blue[100] });
    expect(dark.variables).toMatchObject({ "primary-text": blue[300], focus: blue[400], "primary-halo": blue[900] });
    expect(light.variables!["primary-600"]).toBe(blue[600]);
  });

  test("neutral solids invert per mode; warning is amber-400 on amber-950", () => {
    expect(light.colors).toMatchObject({ neutral: zinc[900], "on-neutral": "#ffffff" });
    expect(dark.colors).toMatchObject({ neutral: "#ffffff", "on-neutral": zinc[900] });
    expect(light.colors).toMatchObject({ warning: amber[400], "on-warning": amber[950] });
  });

  // Canon's success solid (white on green-600) is 3.3:1; it is kept for parity.
  test.each(["primary", "error", "info", "warning", "neutral"])("on-%s contrast ≥ 4.5", (role) => {
    for (const theme of [light, dark]) {
      expect(wcagContrast(theme.colors![role] as string, theme.colors![`on-${role}`] as string)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test("brand colours generate the accent ladder and dark overrides apply to dark only", () => {
  const { light, dark } = cStyleThemes({ primary: "#7c3aed", dark: { neutral: "slate" } });
  expect(light.colors!.primary).toBe("#7c3aed");
  expect(light.variables!["info-600"]).toBe("#7c3aed");
  expect(light.variables!["neutral-500"]).toBe(palettes.zinc[500]);
  expect(dark.variables!["neutral-500"]).toBe(palettes.slate[500]);
});

test("applyCStyleColors rewrites registered themes in place", () => {
  const themes = ref(cStyleThemes());
  applyCStyleColors({ themes } as unknown as ThemeInstance, { primary: "violet" });
  expect(themes.value.light.colors!.primary).toBe(palettes.violet[600]);
  expect(themes.value.dark.variables!["primary-text"]).toBe(palettes.violet[300]);
});
