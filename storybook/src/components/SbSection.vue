<script setup lang="ts">
defineProps<{ title?: string; note?: string }>();
</script>

<template>
  <section class="sb-section">
    <h3 v-if="title" class="sb-section__title">{{ title }}</h3>
    <p v-if="note" class="sb-section__note">{{ note }}</p>
    <slot />
  </section>
</template>

<style>
.sb-section {
  margin-block-end: 32px;
}
.sb-section__title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.6;
  margin: 0 0 12px;
}
.sb-section__note {
  font-size: 13px;
  opacity: 0.7;
  margin: -6px 0 12px;
  max-width: 72ch;
}
</style>
