<script setup lang="ts">
// `stack`: items fill a grid of ≥240px cells (fields, sliders).
// `wrap`: items keep their own width, top-aligned, and wrap (fixed-width
// panels such as pickers, which would overrun a 240px cell).
defineProps<{ label?: string; stack?: boolean; wrap?: boolean }>();
</script>

<template>
  <div class="sb-row">
    <div v-if="label !== undefined" class="sb-row__label">{{ label }}</div>
    <div :class="['sb-row__items', { 'sb-row__items--stack': stack, 'sb-row__items--wrap': wrap }]"><slot /></div>
  </div>
</template>

<style>
.sb-row {
  display: grid;
  grid-template-columns: 128px 1fr;
  align-items: center;
  gap: 16px;
  margin-block-end: 12px;
}
.sb-row__label {
  font-size: 12px;
  opacity: 0.6;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow-wrap: anywhere;
}
.sb-row__items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.sb-row__items--stack {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  align-items: start;
}
.sb-row__items--wrap {
  align-items: start;
}
</style>
