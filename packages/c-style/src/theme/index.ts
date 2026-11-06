import type { ThemeDefinition, ThemeInstance } from "vuetify";
import { elevationVariables } from "./elevation";
import { resolvePalettes, type CStyleColors, type Palette } from "./palette";
import { roleColors, roleVariables, type Mode } from "./roles";
import { fontVariables, typographyVariables, type CStyleFont } from "./typography";

export type { CStyleColors } from "./palette";
export { applyCStyleFont, type CStyleFont } from "./typography";

function theme(palette: Palette, mode: Mode, font?: CStyleFont): ThemeDefinition {
  return {
    dark: mode === "dark",
    colors: roleColors(palette, mode),
    variables: {
      ...roleVariables(palette, mode),
      ...elevationVariables(mode),
      ...typographyVariables,
      ...fontVariables(font),
    },
  };
}

/** Vuetify `light` and `dark` theme definitions (defaults: Canon's blue on zinc, Public Sans). */
export function cStyleThemes(
  colors?: CStyleColors,
  font?: CStyleFont,
): { light: ThemeDefinition; dark: ThemeDefinition } {
  const palettes = resolvePalettes(colors);
  return { light: theme(palettes.light, "light", font), dark: theme(palettes.dark, "dark", font) };
}

/**
 * Re-colours a running app: `applyCStyleColors(useTheme(), { primary: '#7c3aed' })`.
 * Updates `colors` and `variables` of every registered theme in place (light or
 * dark by its `dark` flag) and leaves other keys, including the font, alone.
 * No reload; ladders regenerate.
 */
export function applyCStyleColors(theme: ThemeInstance, colors?: CStyleColors) {
  const next = cStyleThemes(colors);
  const fontKeys = Object.keys(fontVariables());
  for (const current of Object.values(theme.themes.value)) {
    const source = current.dark ? next.dark : next.light;
    const variables = Object.entries(source.variables ?? {}).filter(([key]) => !fontKeys.includes(key));
    Object.assign(current.colors, source.colors);
    Object.assign(current.variables, Object.fromEntries(variables));
  }
}
