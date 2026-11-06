import { steps, type Ladder, type Step } from "../color/palettes";
import { intents, type Palette } from "./palette";

export type Mode = "light" | "dark";
type Variables = Record<string, string | number>;

const white = "#ffffff";

/** `#rrggbb` at `alpha` (0–1) as `#rrggbbaa`; Vuetify emits it as an `r,g,b,a` channel list. */
const withAlpha = (hex: string, alpha: number) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, "0");

/** Picks the light or dark step of a ladder (canon §3.2 step-flip rule). */
const stepper = (mode: Mode) => (ladder: Ladder, light: Step, dark: Step) =>
  ladder[mode === "light" ? light : dark];

/** Vuetify theme `colors`: roles only (decision 5), with every `on-*` explicit (decision 6c). */
export function roleColors(p: Palette, mode: Mode): Record<string, string> {
  const at = stepper(mode);
  const n = p.neutral;
  const ink = at(n, 900, 50);
  const inverse = mode === "light" ? { bg: n[900], on: white } : { bg: white, on: n[900] };
  return {
    background: at(n, 50, 950),
    "on-background": at(n, 950, 50),
    surface: mode === "light" ? white : n[900],
    "on-surface": mode === "light" ? n[900] : white,
    "surface-bright": mode === "light" ? white : n[800],
    "on-surface-bright": ink,
    "surface-light": at(n, 100, 800),
    "on-surface-light": ink,
    "surface-variant": at(n, 100, 800),
    "on-surface-variant": at(n, 700, 200),
    // Solid fills are step 600 in both modes (decision 6b).
    primary: p.primary[600],
    "on-primary": white,
    "primary-darken-1": p.primary[700],
    success: p.success[600],
    "on-success": white,
    error: p.error[600],
    "on-error": white,
    info: p.info[600],
    "on-info": white,
    warning: p.warning[400],
    "on-warning": p.warning[950],
    neutral: inverse.bg,
    "on-neutral": inverse.on,
    secondary: inverse.bg,
    "on-secondary": inverse.on,
    "secondary-darken-1": at(n, 800, 200),
  };
}

/** `--v-<intent>-<step>` for every ladder. */
function ladderVariables(p: Palette): Variables {
  const vars: Variables = {};
  for (const intent of intents) {
    for (const step of steps) vars[`${intent}-${step}`] = p[intent][step];
  }
  return vars;
}

/** Per-intent role tokens resolved by step (canon §3.5); see the plan §1.2 for the list. */
function intentVariables(p: Palette, mode: Mode): Variables {
  const at = stepper(mode);
  const vars: Variables = {};
  for (const intent of intents) {
    const l = p[intent];
    const neutral = intent === "neutral";
    Object.assign(vars, {
      [`${intent}-text`]: neutral ? at(l, 900, 100) : at(l, 700, 300),
      [`${intent}-tint`]: at(l, 400, 500),
      // Solid hover/active: accents lighten then darken; neutral moves toward the page.
      [`${intent}-hover`]: neutral ? at(l, 800, 200) : l[500],
      [`${intent}-active`]: neutral ? at(l, 700, 300) : l[700],
      [`${intent}-border-low`]: neutral
        ? at(l, 200, 700)
        : mode === "light" ? l[200] : withAlpha(l[300], 0.35),
      [`${intent}-line`]: neutral ? at(l, 200, 700) : at(l, 400, 500),
      [`${intent}-line-hover`]: neutral ? at(l, 400, 500) : at(l, 600, 400),
      [`${intent}-halo`]: neutral ? at(l, 100, 800) : at(l, 100, 900),
      [`${intent}-bar`]: at(l, 500, 400),
    });
  }
  return vars;
}

/** Neutral roles, lines and state opacities. */
function neutralVariables(p: Palette, mode: Mode): Variables {
  const at = stepper(mode);
  const n = p.neutral;
  const light = mode === "light";
  return {
    muted: at(n, 500, 400),
    quiet: at(n, 400, 500),
    frame: at(n, 200, 700),
    "frame-hover": at(n, 400, 500),
    "choice-line": at(n, 400, 500),
    // Switch track at rest (canon §4 C Switch).
    track: at(n, 300, 700),
    "fill-hover": at(n, 50, 800),
    fill: at(n, 100, 800),
    "fill-strong": at(n, 200, 700),
    "disabled-bg": at(n, 50, 800),
    "disabled-fg": at(n, 400, 500),
    // Canon banner without an intent (canon §4 E Banner).
    banner: at(n, 100, 900),
    // Canon link at rest; hover and focus use the primary text step (canon §4 Link).
    link: at(p.primary, 600, 400),
    focus: at(p.primary, 600, 400),
    "focus-choice": at(p.primary, 600, 300),
    "ring-offset": light ? white : n[900],
    scrim: light ? withAlpha(white, 0.85) : withAlpha(n[950], 0.75),

    "border-color": light ? "#000000" : white,
    "border-opacity": 0.12,
    "rule-opacity": 0.1,
    "rule-faint-opacity": light ? 0.07 : 0.08,

    "tint-1": light ? 0.08 : 0.1,
    "tint-2": light ? 0.15 : 0.2,
    "tint-3": light ? 0.2 : 0.25,
    "tint-4": light ? 0.25 : 0.3,

    "hover-opacity": light ? 0.04 : 0.06,
    "focus-opacity": 0.08,
    "selected-opacity": 0.08,
    "activated-opacity": 0.12,
    "pressed-opacity": 0.12,
    "high-emphasis-opacity": 1,
    "medium-emphasis-opacity": 0.6,
    "disabled-opacity": 0.38,

    "theme-code": at(n, 50, 800),
    "theme-on-code": at(n, 800, 100),
    "theme-kbd": at(n, 100, 800),
    "theme-on-kbd": at(n, 700, 200),
  };
}

export function roleVariables(p: Palette, mode: Mode): Variables {
  return { ...ladderVariables(p), ...intentVariables(p, mode), ...neutralVariables(p, mode) };
}
