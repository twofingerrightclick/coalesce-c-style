import type { ThemeDefinition, ThemeInstance } from "vuetify";
import { elevationVariables } from "./elevation";
import { resolvePalettes, type CStyleColors, type Palette } from "./palette";
import { roleColors, roleVariables, type Mode } from "./roles";
import { typographyVariables } from "./typography";

export type { CStyleColors } from "./palette";

function theme(palette: Palette, mode: Mode): ThemeDefinition {
  return {
    dark: mode === "dark",
    colors: roleColors(palette, mode),
    variables: {
      ...roleVariables(palette, mode),
      ...elevationVariables(mode),
      ...typographyVariables,
    },
  };
}

/** Vuetify `light` and `dark` theme definitions for `colors` (defaults: Canon's blue on zinc). */
export function cStyleThemes(colors?: CStyleColors): { light: ThemeDefinition; dark: ThemeDefinition } {
  const palettes = resolvePalettes(colors);
  return { light: theme(palettes.light, "light"), dark: theme(palettes.dark, "dark") };
}

/**
 * Re-colours a running app: `applyCStyleColors(useTheme(), { primary: '#7c3aed' })`.
 * Updates `colors` and `variables` of every registered theme in place (light or
 * dark by its `dark` flag) and leaves other keys alone. No reload; ladders regenerate.
 */
export function applyCStyleColors(theme: ThemeInstance, colors?: CStyleColors) {
  const next = cStyleThemes(colors);
  for (const current of Object.values(theme.themes.value)) {
    const source = current.dark ? next.dark : next.light;
    Object.assign(current.colors, source.colors);
    Object.assign(current.variables, source.variables);
  }
}
