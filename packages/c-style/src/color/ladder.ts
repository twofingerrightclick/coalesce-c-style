import { clampChroma, formatHex, modeOklch, modeRgb, useMode, type Oklch } from "culori/fn";
import { neutralPalettes, palettes, steps, type Ladder, type PaletteName } from "./palettes";

useMode(modeRgb);
const toOklch = useMode(modeOklch);

/** Below this OKLCH chroma an input is treated as a grey and modelled on the neutral palettes. */
const greyChroma = 0.04;

const references = Object.entries(palettes).map(([name, ladder]) => ({
  grey: (neutralPalettes as readonly string[]).includes(name),
  oklch: steps.map((step) => toOklch(ladder[step])!),
}));

const hueDistance = (a = 0, b = 0) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * Builds a Tailwind-like 50–950 ladder around `hex`. The Tailwind palette
 * nearest in hue is the model: the input is pinned (exactly) to the step whose
 * lightness is closest, and every other step takes the model's lightness, its
 * chroma scaled by the input's, and its hue drift offset by the input's hue.
 * Out-of-gamut steps are chroma-clamped to sRGB.
 */
export function generateLadder(hex: string): Ladder {
  const input = toOklch(hex);
  if (!input) throw new Error(`c-style: not a colour: ${hex}`);
  const grey = (input.c ?? 0) < greyChroma;

  const nearestStep = (oklch: Oklch[]) =>
    oklch.reduce((best, c, i) => (Math.abs(c.l - input.l) < Math.abs(oklch[best].l - input.l) ? i : best), 0);

  const model = references
    .filter((r) => r.grey === grey)
    .map((r) => ({ ...r, pin: nearestStep(r.oklch) }))
    .reduce((best, r) =>
      hueDistance(r.oklch[r.pin].h, input.h) < hueDistance(best.oklch[best.pin].h, input.h) ? r : best,
    );

  const pinned = model.oklch[model.pin];
  const chromaScale = pinned.c > 0 ? (input.c ?? 0) / pinned.c : 0;
  const hueShift = (input.h ?? 0) - (pinned.h ?? 0);

  return Object.fromEntries(
    steps.map((step, i) => {
      if (i === model.pin) return [step, formatHex(hex)];
      const ref = model.oklch[i];
      const color: Oklch = {
        mode: "oklch",
        l: ref.l,
        c: ref.c * chromaScale,
        h: ((ref.h ?? 0) + hueShift + 360) % 360,
      };
      return [step, formatHex(clampChroma(color, "oklch"))];
    }),
  ) as Ladder;
}

/** A colour option: a hex to generate from, a Tailwind palette name, or a full ladder. */
export type ColorInput = string | PaletteName | Ladder;

export function resolveLadder(input: ColorInput): Ladder {
  if (typeof input !== "string") return input;
  if (input in palettes) return palettes[input as PaletteName];
  return generateLadder(input);
}
