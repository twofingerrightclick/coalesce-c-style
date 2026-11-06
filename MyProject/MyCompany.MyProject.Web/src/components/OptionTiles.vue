<template>
  <div class="option-tiles">
    <div class="option-tiles__header">
      <span :id="`${id}-label`" class="option-tiles__title">{{ label }}</span>
      <span v-if="hint" :id="`${id}-hint`" class="option-tiles__hint">{{
        hint
      }}</span>
      <button
        type="button"
        class="option-tiles__clear"
        :disabled="disabled || modelValue == null"
        @click="emit('update:modelValue', null)"
      >
        Clear
      </button>
    </div>
    <div
      class="option-tiles__grid"
      role="radiogroup"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="hint ? `${id}-hint` : undefined"
      @keydown="onKeydown"
    >
      <button
        v-for="item in items"
        :key="String(item.value)"
        type="button"
        role="radio"
        class="option-tile"
        :class="`option-tile--${intent}`"
        :aria-checked="item.value === modelValue"
        :tabindex="item.value === tabStop ? 0 : -1"
        :disabled="disabled || item.disabled"
        :data-option="item.value"
        @click="emit('update:modelValue', item.value)"
      >
        <span class="option-tile__title">{{ item.title }}</span>
        <span v-if="item.amount" class="option-tile__amount">{{
          item.amount
        }}</span>
        <span v-if="item.description" class="option-tile__description">{{
          item.description
        }}</span>
        <svg
          class="option-tile__check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// An app component styled with c-style's public API only (`c-style/tokens`
// and the `--cs-*` tokens): a radio group of tiles on a raised surface.
// It is the worked example the Storybook (c-style/Option tiles) and
// verify/app/tokens.spec.ts measure.
import { computed, useId } from "vue";

export interface OptionTileItem {
  value: string | number;
  title: string;
  amount?: string;
  description?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null;
    items: OptionTileItem[];
    label: string;
    hint?: string;
    /** The tone of a tile's hover, pressed and selected tints. */
    intent?: "primary" | "neutral" | "success" | "warning" | "error" | "info";
    disabled?: boolean;
  }>(),
  { hint: undefined, intent: "primary", disabled: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
}>();

const id = useId();
const enabled = computed(() =>
  props.disabled ? [] : props.items.filter((item) => !item.disabled),
);

// The radio pattern's single tab stop: the checked tile, else the first
// enabled one.
const tabStop = computed(
  () =>
    enabled.value.find((item) => item.value === props.modelValue)?.value ??
    enabled.value[0]?.value,
);

// Arrow keys move focus and the selection together, wrapping and skipping
// disabled tiles.
function onKeydown(event: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
    event.key
  ];
  const list = enabled.value;
  if (
    !list.length ||
    (step == null && event.key !== "Home" && event.key !== "End")
  )
    return;
  event.preventDefault();
  const current = list.findIndex((item) => item.value === tabStop.value);
  const index =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? list.length - 1
        : (current + step! + list.length) % list.length;
  const next = list[index];
  emit("update:modelValue", next.value);
  const group = event.currentTarget as HTMLElement;
  group
    .querySelectorAll<HTMLElement>(".option-tile")
    [props.items.indexOf(next)]?.focus();
}
</script>

<style scoped lang="scss">
@use "c-style/tokens" as cs;

.option-tiles {
  @include cs.surface(raised);
}

.option-tiles__header {
  display: flex;
  align-items: center;
  gap: var(--cs-gap-sm);
  padding: 12px var(--cs-gap-md);
  @include cs.hairline(bottom);
}

.option-tiles__title {
  @include cs.type(title-small);
}

.option-tiles__hint {
  @include cs.type(body-small);
  color: cs.token(muted);
}

.option-tiles__clear {
  @include cs.control-box(sm);
  @include cs.interactive(neutral, minimal);
  margin-inline-start: auto;
  font-weight: 500;
}

.option-tiles__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--cs-gap-sm);
  padding: var(--cs-gap-md);
}

.option-tile {
  @include cs.interactive(primary, low);
  position: relative;
  display: grid;
  gap: 4px;
  padding: 12px;
  padding-inline-end: calc(12px + var(--cs-icon) + var(--cs-gap-sm));
  border-radius: var(--cs-radius);
  text-align: start;
  font: inherit;

  &--neutral {
    @include cs.tone(neutral, low);
  }
  &--success {
    @include cs.tone(success, low);
  }
  &--warning {
    @include cs.tone(warning, low);
  }
  &--error {
    @include cs.tone(error, low);
  }
  &--info {
    @include cs.tone(info, low);
  }
}

.option-tile__title {
  @include cs.type(label-large);
}

.option-tile__amount {
  @include cs.type(headline-small);
  font-variant-numeric: tabular-nums;
}

.option-tile__description {
  @include cs.type(body-small);
  color: cs.token(muted);

  .option-tile:disabled & {
    color: inherit;
  }
}

// The tick fades in with the selection; it takes the tile's own ink.
.option-tile__check {
  position: absolute;
  inset-block-start: 12px;
  inset-inline-end: 12px;
  inline-size: var(--cs-icon);
  block-size: var(--cs-icon);
  opacity: 0;
  transition: opacity var(--cs-duration-state) ease;

  .option-tile[aria-checked="true"] & {
    opacity: 1;
  }
}
</style>
