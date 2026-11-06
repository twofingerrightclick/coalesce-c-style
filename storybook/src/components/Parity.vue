<script setup lang="ts">
import { inject } from "vue";
import CanonFrame from "./CanonFrame.vue";
import { globalsKey } from "../globals";

// Vuetify (default slot) beside Canon (`canon` markup). Elements that should
// match carry the same `data-parity` id on both sides; verify/lib/measure.ts
// compares them.
defineProps<{ canon: string; title?: string; canonCss?: string }>();

const globals = inject(globalsKey)!;
</script>

<template>
  <div class="sb-parity">
    <h3 v-if="title" class="sb-parity__title">{{ title }}</h3>
    <div class="sb-parity__cols">
      <div class="sb-parity__col">
        <div class="sb-parity__label">Vuetify + c-style</div>
        <div data-side="vuetify" class="sb-parity__vuetify"><slot /></div>
      </div>
      <div class="sb-parity__col">
        <div class="sb-parity__label">Canon</div>
        <CanonFrame :html="canon" :css="canonCss" :scheme="globals.theme" />
      </div>
    </div>
  </div>
</template>

<style>
.sb-parity {
  margin-block-end: 32px;
}
.sb-parity__title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  opacity: 0.6;
  margin: 0 0 8px;
}
.sb-parity__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.sb-parity__col {
  min-width: 0;
}
.sb-parity__label {
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.sb-parity__vuetify {
  padding: 16px;
}
</style>
