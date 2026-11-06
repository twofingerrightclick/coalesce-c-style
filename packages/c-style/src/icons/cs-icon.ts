import { h, type FunctionalComponent } from "vue";
import type { LucideIcon, LucideProps } from "@lucide/vue";

/** Canon draws every icon with a 1.5px stroke, in screen pixels, at any size. */
const canonStroke: LucideProps = {
  strokeWidth: 1.5,
  nonScalingStroke: true,
  // `.v-icon` is a 1em box whose font-size is the icon size.
  width: "1em",
  height: "1em",
};

const wrapped = new WeakMap<LucideIcon, FunctionalComponent>();

/**
 * Wraps a Lucide icon so `<v-icon :icon>` draws it at Canon's stroke and fills
 * the icon box: `<v-icon :icon="csIcon(House)" />`. Without `props` the wrapper
 * is cached per icon, so calling it in a template doesn't remount the icon.
 * `props` override the defaults, for example `{ fill: 'currentColor' }`.
 */
export function csIcon(icon: LucideIcon, props?: LucideProps): FunctionalComponent {
  const cached = !props && wrapped.get(icon);
  if (cached) return cached;
  const component: FunctionalComponent = (_, { attrs }) =>
    h(icon, { ...canonStroke, ...props, ...attrs });
  if (!props) wrapped.set(icon, component);
  return component;
}
