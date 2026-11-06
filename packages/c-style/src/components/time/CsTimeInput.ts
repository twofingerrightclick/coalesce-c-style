import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useDefaults, useLocale, useTheme } from "vuetify";
import { CsTimeSegments } from "./CsTimeSegments";
import { clockOf, isRangeReversed, parseTime, timeError, type Allow, type Allowed } from "./model";

export type CsTimeFormat = "ampm" | "24hr";
export type CsTimeSize = "small" | "default" | "large";
/** A range's value: start and end, each `HH:mm[:ss]` or null. */
export type CsTimeRange = [string | null, string | null];

/** Props shared by every Canon time component. */
export const timeProps = {
  /** 12-hour cells with an AM/PM cell (`ampm`) or 24-hour cells; unset follows Vuetify's locale. The value is 24-hour either way. */
  format: String as PropType<CsTimeFormat>,
  /** Seconds per step (`<input type="time" step>`): 900 steps minutes by 15; under 60 adds a seconds cell. */
  step: Number,
  /** A seconds cell, and `HH:mm:ss` values. */
  useSeconds: Boolean,
  /** Earliest valid time, `HH:mm[:ss]`; earlier times are invalid (not prevented, as Canon). */
  min: String,
  /** Latest valid time. */
  max: String,
  allowedHours: [Array, Function] as PropType<Allow>,
  allowedMinutes: [Array, Function] as PropType<Allow>,
  allowedSeconds: [Array, Function] as PropType<Allow>,
  /** Canon's sizes: cells 32 / 40 / 48. */
  size: { type: String as PropType<CsTimeSize>, default: "default" },
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
};

export const rangeProps = {
  /** The end may be earlier than the start: it is the next day (a night shift). */
  overnight: Boolean,
  /** Accessible names of a range's two times. */
  startLabel: { type: String, default: "Start" },
  endLabel: { type: String, default: "End" },
};

type TimeOptions = {
  step?: number;
  useSeconds?: boolean;
  min?: string;
  max?: string;
  allowedHours?: Allow;
  allowedMinutes?: Allow;
  allowedSeconds?: Allow;
  range?: boolean;
  overnight?: boolean;
  modelValue?: unknown;
};

/** Seconds per step: `step`, else a second with `useSeconds`, else a minute. */
const stepOf = (o: TimeOptions) => o.step ?? (o.useSeconds ? 1 : 60);

const allowedOf = (o: TimeOptions): Allowed => ({ hours: o.allowedHours, minutes: o.allowedMinutes, seconds: o.allowedSeconds });

/** The model as one value per time. */
function valuesOf(model: unknown, range = false): (string | null)[] {
  const pick = (v: unknown) => (typeof v === "string" && v ? v : null);
  if (range) return Array.isArray(model) ? [pick(model[0]), pick(model[1])] : [null, null];
  return [Array.isArray(model) ? null : pick(model)];
}

/**
 * Canon's validity message for a time component's model, or null: a time
 * left incomplete, `min` / `max` / `step`, the allowed values, a reversed
 * range.
 */
export function timeProblem(o: TimeOptions, incomplete: boolean[] = []): string | null {
  const times = valuesOf(o.modelValue, o.range).map(parseTime);
  for (const [i, time] of times.entries()) {
    if (incomplete[i]) return "Enter a complete time.";
    const error = time && timeError(time, { min: o.min, max: o.max, step: stepOf(o), ...allowedOf(o) });
    if (error) return error;
  }
  if (o.range && isRangeReversed(times[0], times[1], !!o.overnight)) return "The end time is before the start time.";
  return null;
}

/**
 * Canon's Time box (`.canon-time`): a row of framed cells, typed into or
 * stepped from the keyboard. With `range`, two times and an arrow, and the
 * model is `[start, end]`. Validity follows Canon: an incomplete time (once
 * left), `min` / `max` / `step`, the allowed values and a reversed range mark
 * every cell red (`timeProblem` gives the message).
 */
export const CsTimeInput = defineComponent({
  name: "CsTimeInput",
  props: {
    modelValue: { type: [String, Array] as PropType<string | null | CsTimeRange>, default: null },
    range: Boolean,
    ...timeProps,
    ...rangeProps,
    /** Draws the error state whatever the value (a field's failed rules). */
    error: Boolean,
    ariaLabel: String,
    ariaLabelledby: String,
    ariaDescribedby: String,
  },
  emits: {
    "update:modelValue": (_value: string | null | CsTimeRange) => true,
    /** Per time, whether it was left incomplete (Canon: invalid until completed or emptied). */
    "update:incomplete": (_value: boolean[]) => true,
    "update:focused": (_focused: boolean) => true,
  },
  setup(rawProps, { emit, expose }) {
    const props = useDefaults(rawProps, "CsTimeInput") as typeof rawProps;
    const { current: locale } = useLocale();
    const theme = useTheme();
    const segments: { focus(): void }[] = [];
    const incomplete = ref([false, false]);
    const focused = ref(false);

    const clock = computed(() => clockOf(locale.value));
    const twelve = computed(() => (props.format ? props.format === "ampm" : clock.value.twelve));
    const step = computed(() => stepOf(props));
    const seconds = computed(() => props.useSeconds || step.value < 60);
    const allowed = computed(() => allowedOf(props));
    const values = computed(() => valuesOf(props.modelValue, props.range));

    const problem = computed(() => timeProblem(props, incomplete.value));

    function update(index: number, value: string | null) {
      if (!props.range) return emit("update:modelValue", value);
      const next = [...values.value] as CsTimeRange;
      next[index] = value;
      emit("update:modelValue", next);
    }

    function setIncomplete(index: number, value: boolean) {
      const next = [...incomplete.value];
      next[index] = value;
      incomplete.value = next;
      emit("update:incomplete", next);
    }

    function setFocused(value: boolean) {
      if (focused.value === value) return;
      focused.value = value;
      emit("update:focused", value);
    }

    /** Focuses the first empty cell, else the start's hour. */
    function focus() {
      const empty = values.value.findIndex((v) => !v);
      segments[Math.max(0, empty)]?.focus();
    }
    expose({ focus });

    return () => {
      const invalid = props.error || !!problem.value;
      const segment = (index: number) =>
        h(CsTimeSegments, {
          ref: (el: unknown) => {
            if (el) segments[index] = el as { focus(): void };
          },
          modelValue: values.value[index],
          twelve: twelve.value,
          seconds: seconds.value,
          step: step.value,
          periods: clock.value.periods,
          allowed: allowed.value,
          disabled: props.disabled,
          readonly: props.readonly,
          invalid,
          required: props.required,
          part: props.range ? (index ? "end" : "start") : undefined,
          ariaLabel: props.range ? (index ? props.endLabel : props.startLabel) : props.ariaLabel,
          ariaLabelledby: props.range ? undefined : props.ariaLabelledby,
          ariaDescribedby: props.ariaDescribedby,
          "onUpdate:modelValue": (value: string | null) => update(index, value),
          "onUpdate:incomplete": (value: boolean) => setIncomplete(index, value),
          onFocus: () => setFocused(true),
          onBlur: (event: FocusEvent) => {
            const box = (event.target as HTMLElement).closest(".cs-time");
            if (!box?.contains(event.relatedTarget as Node)) setFocused(false);
          },
        });
      return h(
        "div",
        {
          class: [
            "cs-time",
            `cs-time--size-${props.size}`,
            {
              "cs-time--dark": theme.current.value.dark,
              "cs-time--error": invalid,
              "cs-time--disabled": props.disabled,
              "cs-time--readonly": props.readonly,
            },
          ],
          role: props.range ? "group" : undefined,
          "aria-label": props.range ? props.ariaLabel : undefined,
          "aria-labelledby": props.range ? props.ariaLabelledby : undefined,
          // A press on the box, between cells, goes to the first empty cell.
          onMousedown: (event: MouseEvent) => {
            if (event.button !== 0 || props.disabled || (event.target as HTMLElement).closest(".cs-time-cell")) return;
            event.preventDefault();
            focus();
          },
        },
        props.range ? [segment(0), h("span", { class: "cs-time-arrow", "aria-hidden": "true" }), segment(1)] : [segment(0)],
      );
    };
  },
});
