<script setup lang="ts">
import { onMounted, onUpdated, ref } from "vue";

// Wraps one element and prints the named computed properties of it.
const props = defineProps<{ props: string[] }>();
const el = ref<HTMLElement>();
const values = ref<string[]>([]);

function read() {
  const target = el.value?.firstElementChild as HTMLElement | null;
  if (!target) return;
  const style = getComputedStyle(target);
  const next = props.props.map((p) => `${p}: ${style.getPropertyValue(p) || "—"}`);
  // onUpdated fires after this assignment too; skip equal reads to end the loop.
  if (next.join() != values.value.join()) values.value = next;
}
onMounted(() => requestAnimationFrame(read));
onUpdated(read);
</script>

<template>
  <div class="sb-measure">
    <div ref="el"><slot /></div>
    <div class="sb-measure__values"><div v-for="v in values" :key="v">{{ v }}</div></div>
  </div>
</template>

<style>
.sb-measure__values {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  opacity: 0.6;
  margin-top: 4px;
}
</style>
