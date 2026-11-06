import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from "vue";
import {
  emptyParts,
  erase,
  formatTime,
  isPartial,
  joinParts,
  jumpPart,
  largeStepSize,
  limitsOf,
  parsePasted,
  parseTime,
  partsOf,
  splitTime,
  stepPart,
  typeChar,
  type Allowed,
  type Parts,
  type TimeConfig,
  type TimePart,
  type TypingResult,
} from "./model";

const names: Record<TimePart, string> = { hour: "Hours", minute: "Minutes", second: "Seconds", period: "AM/PM" };
const stepNames: Record<"up" | "down", Record<TimePart, string>> = {
  up: { hour: "Later hour", minute: "Later minute", second: "Later second", period: "Switch AM/PM" },
  down: { hour: "Earlier hour", minute: "Earlier minute", second: "Earlier second", period: "Switch AM/PM" },
};

/** Canon's hold-to-repeat timing for the step buttons (Number Input's). */
const repeatDelay = 400;
const repeatEvery = 60;
/** Trackpad wheel deltas add up to one step every 40px. */
const wheelStep = 40;

const now = () => parseTime(new Date())!;

/**
 * One time's row of cells (`.canon-time-segments`): a spinbutton per part
 * with its two step buttons. Emits a complete time as `HH:mm[:ss]` and null
 * as soon as any cell is empty. Internal to CsTimeInput.
 */
export const CsTimeSegments = defineComponent({
  name: "CsTimeSegments",
  props: {
    modelValue: { type: String as PropType<string | null>, default: null },
    twelve: Boolean,
    seconds: Boolean,
    step: { type: Number, default: 60 },
    periods: { type: Array as unknown as PropType<[string, string]>, default: () => ["AM", "PM"] },
    allowed: { type: Object as PropType<Allowed>, default: () => ({}) },
    disabled: Boolean,
    readonly: Boolean,
    invalid: Boolean,
    required: Boolean,
    part: String as PropType<"start" | "end">,
    ariaLabel: String,
    ariaLabelledby: String,
    ariaDescribedby: String,
  },
  emits: {
    "update:modelValue": (_value: string | null) => true,
    /** On leaving the cells (true when some, not all, are filled), and false once a time is complete or empty again. */
    "update:incomplete": (_value: boolean) => true,
    focus: (_event: FocusEvent) => true,
    blur: (_event: FocusEvent) => true,
  },
  setup(props, { emit, expose }) {
    const config = computed<TimeConfig>(() => ({ twelve: props.twelve, seconds: props.seconds, step: props.step }));
    const types = computed(() => partsOf(config.value));
    const parts = ref<Parts>(emptyParts());
    const buffer = ref("");
    const active = ref<TimePart | null>(null);
    const root = ref<HTMLElement>();
    const values: Partial<Record<TimePart, HTMLElement>> = {};
    const editable = computed(() => !props.disabled && !props.readonly);
    // The value this component last emitted: the model coming back as that
    // value must not reload the cells, or clearing one cell would clear all.
    let emitted: string | null | undefined;

    function load() {
      parts.value = splitTime(parseTime(props.modelValue), config.value);
      buffer.value = "";
    }
    load();
    watch(
      () => props.modelValue,
      (value) => value !== emitted && load(),
    );
    watch(config, load);

    function commit(next: Parts) {
      parts.value = next;
      const time = joinParts(next, config.value);
      const value = time ? formatTime(time, props.seconds) : null;
      if (value !== props.modelValue) {
        emitted = value;
        emit("update:modelValue", value);
      }
      if (!isPartial(next, config.value)) emit("update:incomplete", false);
    }

    function focusPart(part: TimePart | undefined) {
      const el = part && values[part];
      if (!el) return false;
      // Editable before focus moves, so a phone's keyboard opens (Canon).
      el.contentEditable = String(editable.value);
      el.focus();
      return true;
    }

    function move(from: TimePart, by: number) {
      const order = types.value;
      return focusPart(order[order.indexOf(from) + by]);
    }

    /** The first empty cell, else the hour (a press on the box or the label). */
    function focusFirst() {
      focusPart(types.value.find((part) => parts.value[part] == null) ?? types.value[0]);
    }

    function step(part: TimePart, direction: 1 | -1, size = 1) {
      if (!editable.value) return;
      buffer.value = "";
      commit(stepPart(parts.value, part, direction, config.value, now(), props.allowed, size));
    }

    function apply(part: TimePart, result: TypingResult) {
      buffer.value = result.buffer;
      commit(result.parts);
      if (result.move) move(part, result.move);
    }

    function type(part: TimePart, text: string) {
      let current = part;
      for (const char of text) {
        const result = typeChar({ parts: parts.value, buffer: buffer.value }, current, char, config.value);
        apply(current, { ...result, move: 0 });
        if (result.move) {
          const next = types.value[types.value.indexOf(current) + result.move];
          if (next && focusPart(next)) current = next;
        }
      }
    }

    function onKeydown(part: TimePart, event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const rtl = root.value && getComputedStyle(root.value).direction === "rtl";
      const handled = () => event.preventDefault();
      switch (event.key) {
        case "Enter":
          handled();
          (event.target as HTMLElement).closest("form")?.requestSubmit();
          return;
        case "ArrowLeft":
        case "ArrowRight":
          handled();
          move(part, (event.key === "ArrowRight") !== rtl ? 1 : -1);
          return;
        case "ArrowUp":
        case "ArrowDown":
          handled();
          step(part, event.key === "ArrowUp" ? 1 : -1);
          return;
        case "PageUp":
        case "PageDown":
          handled();
          step(part, event.key === "PageUp" ? 1 : -1, largeStepSize(part, config.value));
          return;
        case "Home":
        case "End":
          handled();
          if (editable.value) {
            buffer.value = "";
            commit(jumpPart(parts.value, part, event.key === "Home" ? "start" : "end", config.value, props.allowed));
          }
          return;
        case "Backspace":
        case "Delete":
          handled();
          if (editable.value)
            apply(part, erase({ parts: parts.value, buffer: buffer.value }, part, event.key === "Backspace", config.value));
          return;
      }
      if (event.key.length === 1) {
        handled();
        if (editable.value) type(part, event.key);
      }
    }

    // Keys that reach here had no keydown we could read (a phone's virtual
    // keyboard reports "Unidentified"); every edit is ours, never the DOM's.
    function onBeforeinput(part: TimePart, event: InputEvent) {
      event.preventDefault();
      if (!editable.value) return;
      if (event.inputType === "insertText" || event.inputType === "insertReplacementText") type(part, event.data ?? "");
      else if (event.inputType.startsWith("delete")) {
        apply(part, erase({ parts: parts.value, buffer: buffer.value }, part, event.inputType === "deleteContentBackward", config.value));
      }
    }

    function onPaste(event: ClipboardEvent) {
      event.preventDefault();
      const time = editable.value && parsePasted(event.clipboardData?.getData("text") ?? "");
      if (!time) return;
      buffer.value = "";
      commit(splitTime(time, config.value));
    }

    function onFocus(part: TimePart, event: FocusEvent) {
      const entering = !active.value;
      active.value = part;
      buffer.value = "";
      if (entering && !root.value?.contains(event.relatedTarget as Node)) emit("focus", event);
    }

    function onBlur(part: TimePart, event: FocusEvent) {
      values[part]!.contentEditable = "false";
      buffer.value = "";
      if (root.value?.contains(event.relatedTarget as Node)) return;
      active.value = null;
      if (isPartial(parts.value, config.value)) emit("update:incomplete", true);
      emit("blur", event);
    }

    let wheeled = 0;
    function onWheel(part: TimePart, event: WheelEvent) {
      if (active.value !== part || !editable.value || event.ctrlKey || !event.deltaY) return;
      event.preventDefault();
      if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL || Math.abs(event.deltaY) >= 50) {
        wheeled = 0;
        step(part, event.deltaY < 0 ? 1 : -1);
        return;
      }
      if (Math.sign(wheeled) !== Math.sign(event.deltaY)) wheeled = 0;
      wheeled += event.deltaY;
      while (Math.abs(wheeled) >= wheelStep) {
        step(part, wheeled < 0 ? 1 : -1);
        wheeled -= Math.sign(wheeled) * wheelStep;
      }
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      clearTimeout(timer);
      clearInterval(timer);
      timer = undefined;
    };
    onBeforeUnmount(stop);

    function onStepDown(part: TimePart, direction: 1 | -1, event: PointerEvent) {
      if (event.button !== 0 || !editable.value || active.value !== part) return;
      step(part, direction);
      stop();
      timer = setTimeout(() => {
        timer = setInterval(() => step(part, direction), repeatEvery);
      }, repeatDelay);
    }

    function text(part: TimePart) {
      if (active.value === part && buffer.value) return buffer.value;
      const value = parts.value[part];
      if (value == null) return "--";
      return part === "period" ? props.periods[value] : String(value).padStart(2, "0");
    }

    expose({ focus: focusFirst, focusPart });

    return () => {
      const children = [];
      for (const [i, part] of types.value.entries()) {
        if (i && part !== "period") children.push(h("span", { class: "cs-time-literal", "aria-hidden": "true" }, ":"));
        const value = parts.value[part];
        const [low, high] = limitsOf(part, config.value);
        const empty = value == null && !(active.value === part && buffer.value);
        children.push(
          h(
            "span",
            {
              class: "cs-time-cell",
              "data-type": part,
              "data-empty": empty ? "" : undefined,
              "data-active": active.value === part ? "" : undefined,
              onMousedown: (event: MouseEvent) => {
                if (event.button !== 0 || props.disabled) return;
                event.preventDefault();
                focusPart(part);
              },
              onWheel: (event: WheelEvent) => onWheel(part, event),
            },
            [
              h(
                "span",
                {
                  ref: (el: unknown) => {
                    if (el) values[part] = el as HTMLElement;
                    else delete values[part];
                  },
                  class: "cs-time-value",
                  role: "spinbutton",
                  tabindex: props.disabled ? -1 : 0,
                  contenteditable: active.value === part && editable.value ? "true" : "false",
                  inputmode: part === "period" ? "text" : "numeric",
                  spellcheck: "false",
                  autocorrect: "off",
                  "aria-label": names[part],
                  "aria-valuemin": low,
                  "aria-valuemax": high,
                  "aria-valuenow": value ?? undefined,
                  "aria-valuetext": value == null ? "Empty" : part === "period" ? props.periods[value] : String(value),
                  "aria-disabled": props.disabled ? "true" : undefined,
                  "aria-readonly": props.readonly ? "true" : undefined,
                  onKeydown: (event: KeyboardEvent) => onKeydown(part, event),
                  onBeforeinput: (event: InputEvent) => onBeforeinput(part, event),
                  onPaste,
                  onDrop: (event: DragEvent) => event.preventDefault(),
                  onFocus: (event: FocusEvent) => onFocus(part, event),
                  onBlur: (event: FocusEvent) => onBlur(part, event),
                },
                text(part),
              ),
              ...(["up", "down"] as const).map((direction) =>
                h("button", {
                  type: "button",
                  class: "cs-time-step",
                  "data-direction": direction,
                  tabindex: -1,
                  "aria-label": stepNames[direction][part],
                  onPointerdown: (event: PointerEvent) => onStepDown(part, direction === "up" ? 1 : -1, event),
                  onPointerup: stop,
                  onPointerleave: stop,
                  onPointercancel: stop,
                  // A click without a pointer (assistive technology) steps once.
                  onClick: (event: MouseEvent) => event.detail === 0 && step(part, direction === "up" ? 1 : -1),
                }),
              ),
            ],
          ),
        );
      }
      const allEmpty = types.value.every((part) => parts.value[part] == null);
      return h(
        "div",
        {
          ref: root,
          class: "cs-time-segments",
          role: "group",
          "data-part": props.part,
          "data-empty": allEmpty ? "" : undefined,
          "aria-label": props.ariaLabel,
          "aria-labelledby": props.ariaLabelledby,
          "aria-describedby": props.ariaDescribedby,
          "aria-invalid": props.invalid ? "true" : undefined,
          "aria-required": props.required ? "true" : undefined,
        },
        children,
      );
    };
  },
});
