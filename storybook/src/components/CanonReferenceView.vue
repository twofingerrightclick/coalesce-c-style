<script setup lang="ts">
import { ref, watch } from "vue";
import CanonFrame from "./CanonFrame.vue";
import { loadCanonReference } from "../canon/load";
import type { CanonReference } from "../canon/types";

const props = defineProps<{ reference: CanonReference; scheme: "light" | "dark" }>();
const content = ref<{ html: string; css: string }>();
const error = ref("");
watch(() => props.reference, async (reference, _, onCleanup) => {
  let active = true;
  onCleanup(() => { active = false; });
  content.value = undefined;
  error.value = "";
  try {
    const loaded = await loadCanonReference(reference);
    if (active) content.value = loaded;
  } catch (cause) {
    if (active) error.value = String(cause);
  }
}, { immediate: true });
</script>

<template>
  <div class="canon-reference-view" :data-canon-page="reference.page" :data-canon-section="reference.section">
    <p v-if="reference.note" class="story-comparison__note">{{ reference.note }}</p>
    <a v-if="reference.page" class="canon-reference-view__source" :href="`https://recepkutuk.github.io/canon/reference/${reference.page}.html${reference.section && reference.section !== '*' ? '#' + reference.section : ''}`" target="_blank" rel="noreferrer">Full {{ reference.page }} reference ↗</a>
    <p v-if="error" role="alert" data-canon-error>{{ error }}</p>
    <p v-else-if="!content" role="status" data-canon-loading>Loading Canon reference…</p>
    <CanonFrame v-else-if="reference.page" :html="content.html" :css="content.css" :scheme="scheme" />
    <CanonReferenceView v-for="(extra, index) in reference.additional" :key="index" :reference="extra" :scheme="scheme" />
  </div>
</template>

<style>
.canon-reference-view__source { display: inline-block; margin-block: 8px; font-size: 12px; color: rgb(var(--v-theme-on-surface)); text-underline-offset: 3px; }
.canon-reference-view .canon-reference-view { margin-top: 24px; }
</style>
