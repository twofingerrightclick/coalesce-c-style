import type { Blueprint } from "vuetify";
import { defaults } from "./defaults";
import { csIconOptions } from "./icons";
import { cStyleThemes, type CStyleColors, type CStyleFont } from "./theme";

export interface CStyleBlueprintOptions {
  /** Brand colours; see `CStyleColors`. Omitted intents use Canon's palette. */
  colors?: CStyleColors;
  /** Body and heading font; see `CStyleFont`. Defaults to `cStyle({ font })` from Vite, otherwise Public Sans. */
  font?: CStyleFont;
}

/**
 * Vuetify blueprint for c-style: `createVuetify({ blueprint: cStyleBlueprint() })`.
 * Options passed to `createVuetify` beside it are deep-merged over it and win.
 */
export function cStyleBlueprint({ colors, font }: CStyleBlueprintOptions = {}): Blueprint {
  return {
    defaults,
    icons: csIconOptions,
    theme: {
      defaultTheme: "system",
      themes: cStyleThemes(colors, font),
    },
  };
}
