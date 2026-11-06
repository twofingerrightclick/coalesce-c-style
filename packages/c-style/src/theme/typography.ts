import type { ThemeInstance } from "vuetify";

/**
 * A body/heading font for `cStyleBlueprint({ font })` or `applyCStyleFont`.
 * A string is a CSS family name (`"IBM Plex Sans"`). The app loads the font;
 * `c-style/styles` bundles Public Sans and `c-style/fonts/inter` Inter.
 */
export type CStyleFont =
  | string
  | {
      family: string;
      /** `font-feature-settings` for the font. Default: Inter's alternates for Inter, else `normal`. */
      features?: string;
      /**
       * Multiplier on Canon's negative letter-spacing (−0.006em at 14px, down
       * to −0.02em on display roles), which is tuned for Inter. Default: 1 for
       * Inter, `publicSansTracking` for Public Sans, else 0.
       */
      tracking?: number;
    };

const fallbacks = "ui-sans-serif, system-ui, sans-serif";

// Canon turns on Inter's single-storey a, open digits and alternates (canon
// §2.9). Other fonts reuse these tags for unrelated glyphs, so they get none.
const interFeatures = '"ss01", "cv11", "cv04", "cv03", "cv02"';

// Public Sans is set wider than Inter; half of Canon's tightening keeps display
// and title roles compact without crowding body text.
const publicSansTracking = 0.5;

const publicSans = /^"?Public Sans( Variable)?"?$/i;
const inter = /^"?Inter(Variable)?"?$/i;

function quote(family: string) {
  const name = family.trim();
  return /^["']|^[\w-]+$/.test(name) ? name : `"${name}"`;
}

function stack(family: string) {
  if (inter.test(family)) return `InterVariable, Inter, ${fallbacks}`;
  if (publicSans.test(family)) return `"Public Sans Variable", "Public Sans", ${fallbacks}`;
  return `${quote(family)}, ${fallbacks}`;
}

/** Theme variables (`--v-font-*`) for `font`; omitted, Public Sans. */
export function fontVariables(font: CStyleFont = "Public Sans") {
  const { family, features, tracking } = typeof font == "string" ? { family: font } : font;
  const isInter = inter.test(family.trim());
  return {
    "font-body": stack(family.trim()),
    "font-heading": stack(family.trim()),
    "font-features": features ?? (isInter ? interFeatures : "normal"),
    "font-tracking": tracking ?? (isInter ? 1 : publicSans.test(family.trim()) ? publicSansTracking : 0),
  };
}

export const typographyVariables = {
  ...fontVariables(),
  "font-mono": '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

/**
 * Switches a running app's body and heading font: `applyCStyleFont(useTheme(), "IBM Plex Sans")`.
 * Updates every registered theme in place; `undefined` restores Public Sans.
 */
export function applyCStyleFont(theme: ThemeInstance, font?: CStyleFont) {
  const next = fontVariables(font);
  for (const current of Object.values(theme.themes.value)) Object.assign(current.variables, next);
}
