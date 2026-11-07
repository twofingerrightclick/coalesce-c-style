import type { Mode } from "./roles";

const black = (alpha: number) => `rgba(0, 0, 0, ${alpha})`;

/** Canon shadows (canon §2.7); dark mode raises the alphas. */
function shadows(mode: Mode) {
  const light = mode === "light";
  return {
    edge: `0 0 0 var(--cs-hairline, 1px) ${light ? black(0.12) : "rgba(255, 255, 255, 0.12)"}`,
    control: `0 1px 2px ${black(light ? 0.05 : 0.3)}`,
    raised: `0 1px 2px ${black(light ? 0.06 : 0.3)}, 0 1px 3px ${black(light ? 0.04 : 0.2)}`,
    floating: `0 8px 24px ${black(light ? 0.08 : 0.5)}, 0 2px 6px ${black(light ? 0.06 : 0.3)}`,
    overlay: `0 24px 48px -12px ${black(light ? 0.18 : 0.6)}, 0 4px 12px ${black(light ? 0.06 : 0.3)}`,
  };
}

/**
 * `--v-elevation-0…5`, which coalesce-c-style/settings plugs into `$shadow-key`
 * (decision 10). Every floating level carries Canon's edge hairline.
 */
export function elevationVariables(mode: Mode): Record<string, string> {
  const s = shadows(mode);
  return {
    "shadow-edge": s.edge,
    "shadow-control": s.control,
    "shadow-raised": s.raised,
    "shadow-floating": s.floating,
    "shadow-overlay": s.overlay,
    "elevation-0": "0 0 0 0 transparent",
    "elevation-1": s.control,
    "elevation-2": `${s.edge}, ${s.raised}`,
    "elevation-3": `${s.edge}, ${s.floating}`,
    "elevation-4": `${s.edge}, ${s.floating}`,
    "elevation-5": `${s.edge}, ${s.overlay}`,
  };
}
