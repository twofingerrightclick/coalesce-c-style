<script setup lang="ts">
import { computed } from "vue";
import CanonReferenceView from "./CanonReferenceView.vue";
import type { CanonReference } from "../canon/types";

const props = defineProps<{ reference: CanonReference; scheme: "light" | "dark"; implementation: string }>();
const label = computed(() => props.reference.match === "none" ? "No Canon equivalent" : props.reference.match === "pattern" ? "Related Canon pattern" : "Canon original");
// Keep overlays within the implementation column where possible. Menus must
// teleport normally: attaching them breaks nested date-picker interactions.
const overlayDefaults = Object.fromEntries(
  ["VOverlay", "VDialog", "VBottomSheet", "VTooltip", "VSnackbar"].map((name) => [name, { attach: true }]),
);
</script>

<template>
  <div class="story-comparison" data-canon-comparison :data-reference-match="reference.match ?? 'direct'">
    <section class="story-comparison__side" aria-label="c-style implementation">
      <h2 class="story-comparison__heading">{{ implementation }} · c-style</h2>
      <div class="story-comparison__preview" data-side="implementation">
        <v-defaults-provider :defaults="overlayDefaults"><slot /></v-defaults-provider>
      </div>
    </section>
    <section class="story-comparison__side story-comparison__reference" aria-label="Original Canon reference">
      <h2 class="story-comparison__heading">{{ label }}</h2>
      <CanonReferenceView :reference="reference" :scheme="scheme" />
    </section>
  </div>
</template>

<style>
.story-comparison {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;
  gap: 24px;
}
.story-comparison__side { min-width: 0; }
.story-comparison__heading { margin: 0; font: inherit; font-size: 14px; font-weight: 600; }
.story-comparison__preview {
  position: relative;
  transform: translateZ(0);
  min-height: 360px;
  margin-top: 20px;
  overflow: auto;
}
.story-comparison__reference { border-inline-start: 1px solid rgb(var(--v-frame)); padding-inline-start: 24px; }
.story-comparison__note { margin: 12px 0; font-size: 13px; line-height: 1.5; color: rgb(var(--v-muted)); }
@media (max-width: 960px) {
  .story-comparison { grid-template-columns: minmax(0, 1fr); }
  .story-comparison__reference { border-inline-start: 0; border-block-start: 1px solid rgb(var(--v-frame)); padding-inline-start: 0; padding-block-start: 20px; }
}
</style>
