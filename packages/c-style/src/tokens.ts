// The public `--cs-*` token names, for inline styles and tests. The same list
// is `$tokens` in src/tokens.scss (the SCSS module) and is declared by
// src/styles/_tokens.scss; test/tokens.spec.ts keeps the three in step.

export const cStyleIntents = ["primary", "neutral", "success", "warning", "error", "info"] as const;
export type CStyleIntent = (typeof cStyleIntents)[number];

const intentRoles = [
  "solid",
  "on-solid",
  "solid-hover",
  "solid-active",
  "text",
  "tint-1",
  "tint-2",
  "tint-3",
  "tint-4",
  "line",
  "line-hover",
  "halo",
  "border-low",
] as const;

const sharedTokens = [
  // Canon md sizes (canon §2.3, §2.4, §2.6)
  "control-height",
  "control-pad",
  "control-font",
  "control-lh",
  "control-gap",
  "control-tracking",
  "icon",
  "radius",
  "surface-radius",
  "gap-sm",
  "gap-md",
  "gap-lg",
  "gap-xl",
  "hairline",
  // surfaces and neutral roles (canon §3.3, §3.4), complete colours
  "canvas",
  "surface",
  "surface-bright",
  "on-surface",
  "muted",
  "quiet",
  "fill-hover",
  "fill",
  "fill-strong",
  "frame",
  "frame-hover",
  "rule",
  "rule-faint",
  "link",
  "disabled-bg",
  "disabled-fg",
  "scrim",
  // focus (canon §2.8)
  "focus",
  "focus-ring",
  // elevation (canon §2.7)
  "shadow-edge",
  "shadow-control",
  "shadow-raised",
  "shadow-floating",
  "shadow-overlay",
  // typography (canon §2.9)
  "font-body",
  "font-heading",
  "font-mono",
  "font-tracking",
  // motion (canon §2.10)
  "duration-state",
  "duration-press",
  "duration-open",
  "duration-close",
  "press-scale",
] as const;

type IntentToken = `${CStyleIntent}-${(typeof intentRoles)[number]}`;

/** Every public token name, without the `--cs-` prefix. */
export const cStyleTokens: readonly ((typeof sharedTokens)[number] | IntentToken)[] = [
  ...sharedTokens,
  ...cStyleIntents.flatMap((intent) => intentRoles.map((role) => `${intent}-${role}` as IntentToken)),
];

export type CStyleToken = (typeof cStyleTokens)[number];

/** `var(--cs-<name>)` for an inline style: `:style="{ color: csVar('muted') }"`. */
export function csVar(name: CStyleToken, fallback?: string): string {
  return fallback == null ? `var(--cs-${name})` : `var(--cs-${name}, ${fallback})`;
}
