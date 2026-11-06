import { defineComponent, h, ref, useId, type Component, type ExtractPropTypes, type PropType, type SetupContext } from "vue";
import { useDefaults } from "vuetify";
import { VInput } from "vuetify/components/VInput";
import { CsTimeInput, rangeProps, timeProblem, timeProps, type CsTimeRange } from "./CsTimeInput";

type Rule = string | boolean | ((value: any) => string | boolean | PromiseLike<string | boolean>);

/** The VInput props a time field forwards: label, messages and validation. */
const fieldProps = {
  id: String,
  name: String,
  label: String,
  hint: String,
  persistentHint: Boolean,
  messages: { type: [Array, String] as PropType<string | readonly string[]>, default: () => [] },
  rules: { type: Array as PropType<readonly Rule[]>, default: () => [] },
  errorMessages: { type: [Array, String] as PropType<string | readonly string[] | null>, default: () => [] },
  error: Boolean,
  maxErrors: { type: [Number, String], default: 1 },
  hideDetails: { type: [Boolean, String] as PropType<boolean | "auto">, default: "auto" },
  validateOn: String as PropType<"input" | "blur" | "submit" | "invalid-input" | `${string} lazy` | `${string} eager` | "lazy" | "eager">,
};

type FieldProps = ExtractPropTypes<typeof timeProps & typeof fieldProps> &
  Partial<ExtractPropTypes<typeof rangeProps>> & { modelValue: string | null | CsTimeRange };

const emits = {
  "update:modelValue": (_value: any) => true,
  "update:focused": (_focused: boolean) => true,
};

function fieldSetup(range: boolean, name: string) {
  return (rawProps: object, { attrs, emit, expose, slots }: SetupContext<typeof emits>) => {
    const props = useDefaults(rawProps, name) as unknown as FieldProps;
    const uid = useId();
    const input = ref<{ focus(): void }>();
    const vInput = ref<{ validate(): Promise<string[]>; reset(): Promise<void>; resetValidation(): Promise<void> }>();
    const focused = ref(false);
    // Canon's own validity (incomplete, min / max / step, reversed range),
    // run as the field's first rule so VForm counts it. Computed here from
    // the field's own props: VInput validates before the child re-renders.
    const incomplete = ref<boolean[]>([]);
    const canonRule = () => timeProblem({ ...props, range }, incomplete.value) ?? true;

    const focus = () => input.value?.focus();
    expose({
      focus,
      validate: () => vInput.value?.validate(),
      reset: () => vInput.value?.reset(),
      resetValidation: () => vInput.value?.resetValidation(),
    });

    return () => {
      const id = props.id ?? `cs-time-${uid}`;
      const labelId = `${id}-label`;
      const hasLabel = !!(props.label || slots.label);
      return h(
        VInput as Component,
        {
          ...attrs,
          ref: vInput,
          class: ["cs-time-field", attrs.class],
          id,
          name: props.name,
          label: props.label,
          hint: props.hint,
          persistentHint: props.persistentHint,
          messages: props.messages,
          rules: [canonRule, ...props.rules],
          errorMessages: props.errorMessages,
          error: props.error,
          maxErrors: props.maxErrors,
          hideDetails: props.hideDetails,
          validateOn: props.validateOn,
          disabled: props.disabled,
          readonly: props.readonly,
          focused: focused.value,
          modelValue: props.modelValue,
          "onUpdate:modelValue": (value: unknown) => emit("update:modelValue", value),
        },
        {
          default: (slot: {
            isDisabled: { value: boolean };
            isReadonly: { value: boolean };
            isValid: { value: boolean | null };
            messagesId: { value?: string };
          }) => [
            hasLabel &&
              h(
                "label",
                {
                  id: labelId,
                  class: "cs-time-field__label",
                  onClick: (event: MouseEvent) => {
                    event.preventDefault();
                    if (!slot.isDisabled.value) focus();
                  },
                },
                slots.label?.() ?? props.label,
              ),
            h(CsTimeInput, {
              ref: input,
              modelValue: props.modelValue,
              range,
              format: props.format,
              step: props.step,
              useSeconds: props.useSeconds,
              min: props.min,
              max: props.max,
              allowedHours: props.allowedHours,
              allowedMinutes: props.allowedMinutes,
              allowedSeconds: props.allowedSeconds,
              size: props.size,
              overnight: props.overnight,
              startLabel: props.startLabel,
              endLabel: props.endLabel,
              disabled: slot.isDisabled.value,
              readonly: slot.isReadonly.value,
              required: props.required,
              error: slot.isValid.value === false,
              ariaLabelledby: hasLabel ? labelId : undefined,
              ariaLabel: hasLabel ? undefined : (attrs["aria-label"] as string | undefined),
              ariaDescribedby: slot.messagesId.value,
              "onUpdate:modelValue": (value: unknown) => emit("update:modelValue", value),
              "onUpdate:incomplete": (value: boolean[]) => (incomplete.value = value),
              "onUpdate:focused": (value: boolean) => {
                focused.value = value;
                emit("update:focused", value);
              },
            }),
          ],
        },
      );
    };
  };
}

/**
 * Canon Time in a Vuetify input: label above, hint and messages below,
 * `rules` / `error-messages` and VForm validation, disabled and readonly
 * (also from a VForm). v-model: `HH:mm`, or `HH:mm:ss` with seconds; null
 * while empty or incomplete.
 */
export const CsTimeField = defineComponent({
  name: "CsTimeField",
  inheritAttrs: false,
  props: {
    modelValue: { type: String as PropType<string | null>, default: null },
    ...timeProps,
    ...fieldProps,
  },
  emits,
  setup: fieldSetup(false, "CsTimeField"),
});

/**
 * Canon's time range in a Vuetify input. v-model: `[start, end]`, each
 * `HH:mm[:ss]` or null. An end before the start is invalid unless `overnight`.
 */
export const CsTimeRangeField = defineComponent({
  name: "CsTimeRangeField",
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as unknown as PropType<CsTimeRange>, default: () => [null, null] },
    ...timeProps,
    ...rangeProps,
    ...fieldProps,
  },
  emits,
  setup: fieldSetup(true, "CsTimeRangeField"),
});
