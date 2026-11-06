import { h, type FunctionalComponent, type VNode } from "vue";

// Canon's checkbox and radio glyphs (decision 12b, canon §4 C Checkbox/Radio),
// drawn in a 20-unit box that `.v-icon` scales to its font-size: the box is
// inset 5% (18 of 20), the line 1px, the checkbox radius a quarter of the
// control. Checked = `currentColor` fill (Vuetify colours the icon with the
// control's `color`, neutral ink by default) with the mark in the surface
// colour, which is Canon's white / zinc-900 mark.

const mark = "rgb(var(--v-theme-surface))";

function glyph(...children: VNode[]): FunctionalComponent {
  return (_, { attrs }) =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 20 20",
        width: "1em",
        height: "1em",
        fill: "none",
        "aria-hidden": "true",
        class: "cs-choice",
        ...attrs,
      },
      children,
    );
}

/** Canon's 24-unit mark paths, scaled into the 20-unit box at their 1.5 stroke. */
const markPath = (d: string) =>
  h("path", {
    d,
    transform: "scale(0.8333)",
    stroke: mark,
    "stroke-width": 1.5,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });

const box = () => h("rect", { x: 1.5, y: 1.5, width: 17, height: 17, rx: 4.5, stroke: "currentColor" });
const filledBox = () => h("rect", { x: 1, y: 1, width: 18, height: 18, rx: 5, fill: "currentColor" });

export const checkboxOff = glyph(box());
export const checkboxOn = glyph(filledBox(), markPath("m9 12 2 2 4-4"));
export const checkboxIndeterminate = glyph(filledBox(), markPath("M9 12h6"));
export const radioOff = glyph(h("circle", { cx: 10, cy: 10, r: 8.5, stroke: "currentColor" }));
export const radioOn = glyph(
  h("circle", { cx: 10, cy: 10, r: 9, fill: "currentColor" }),
  h("circle", { cx: 10, cy: 10, r: 2.5, fill: mark }),
);
