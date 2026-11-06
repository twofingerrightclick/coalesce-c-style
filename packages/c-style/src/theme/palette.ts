import { resolveLadder, type ColorInput } from "../color/ladder";
import type { Ladder } from "../color/palettes";

export const intents = ["primary", "neutral", "success", "warning", "error", "info"] as const;
export type Intent = (typeof intents)[number];

type IntentColors = Partial<Record<Intent, ColorInput>>;

/**
 * Brand colours. Each is a hex (a ladder is generated around it), a Tailwind
 * palette name, or a full 50–950 ladder. `info` defaults to `primary`.
 * `dark` overrides any of them in the dark theme only.
 */
export interface CStyleColors extends IntentColors {
  dark?: IntentColors;
}

export type Palette = Record<Intent, Ladder>;

const defaults = {
  primary: "blue",
  neutral: "zinc",
  success: "green",
  warning: "amber",
  error: "red",
} as const satisfies Omit<Record<Intent, ColorInput>, "info">;

function resolvePalette(colors: IntentColors): Palette {
  const primary = resolveLadder(colors.primary ?? defaults.primary);
  return {
    primary,
    neutral: resolveLadder(colors.neutral ?? defaults.neutral),
    success: resolveLadder(colors.success ?? defaults.success),
    warning: resolveLadder(colors.warning ?? defaults.warning),
    error: resolveLadder(colors.error ?? defaults.error),
    info: colors.info ? resolveLadder(colors.info) : primary,
  };
}

/** Ladders per mode; `dark` entries fall back to the shared ones. */
export function resolvePalettes({ dark, ...shared }: CStyleColors = {}) {
  return {
    light: resolvePalette(shared),
    dark: resolvePalette({ ...shared, ...dark }),
  };
}
