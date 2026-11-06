import { defineComponent, h, type PropType } from "vue";
import type { IconProps, IconSet, JSXComponent } from "vuetify";
import { faIcons } from "./fa-names";

/** `fa`, `fas`, `fa-solid`, `fa-fw` and the like: style and modifier classes, not names. */
const isFaClass = (token: string) => /^fa[a-z]?$/.test(token) || token.startsWith("fa-");

/**
 * Splits `"fa fa-clock cursor-pointer"` into the mapped icon and the classes
 * to keep. Returns undefined when no token names a mapped FontAwesome icon.
 */
export function parseFaString(icon: string) {
  const tokens = icon.trim().split(/\s+/);
  const match = tokens.find((t) => t.startsWith("fa-") && faIcons.has(t.slice(3)));
  if (!match) return undefined;
  return {
    icon: faIcons.get(match.slice(3))!,
    classes: tokens.filter((t) => !isFaClass(t)),
  };
}

/**
 * Vuetify reaches this set for icon strings that aren't aliases. Mapped
 * FontAwesome strings render Lucide; anything else renders as class names,
 * like Vuetify's own `fa`/`mdi` sets, so app FontAwesome icons still work.
 */
const CsIcon = defineComponent({
  name: "CsIcon",
  props: {
    icon: [String, Function, Object, Array] as PropType<IconProps["icon"]>,
    tag: { type: [String, Object, Function] as PropType<string | JSXComponent>, required: true },
  },
  setup(props) {
    return () => {
      const icon = typeof props.icon === "string" ? props.icon : "";
      const mapped = parseFaString(icon);
      if (!mapped) return h(props.tag, { class: icon });
      return h(props.tag, { class: mapped.classes }, [h(mapped.icon)]);
    };
  },
});

export const cs: IconSet = { component: CsIcon };
