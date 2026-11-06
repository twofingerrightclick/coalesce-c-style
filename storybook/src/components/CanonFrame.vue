<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    html: string;
    scheme?: "light" | "dark";
    /** Extra CSS for the frame's document, e.g. layout for the example. */
    css?: string;
  }>(),
  { scheme: "light", css: "" },
);

const frame = ref<HTMLIFrameElement>();
const height = ref(80);
let observer: ResizeObserver | undefined;

const base = import.meta.env.BASE_URL ?? "/";

const srcdoc = computed(
  () => `<!doctype html>
<html lang="en" style="color-scheme:${props.scheme}">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${new URL(`${base}canon/canon.css`, location.href)}">
<script src="${new URL(`${base}canon/canon.js`, location.href)}" defer><\/script>
<style>html,body{margin:0;background:transparent}body{padding:16px}${props.css}</style>
</head>
<body>${props.html}</body>
</html>`,
);

function onLoad() {
  const doc = frame.value?.contentDocument;
  if (!doc) return;
  observer?.disconnect();
  observer = new ResizeObserver(() => {
    height.value = Math.ceil(doc.documentElement.scrollHeight);
  });
  observer.observe(doc.body);
}

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <iframe
    ref="frame"
    class="canon-frame"
    data-side="canon"
    title="Canon reference"
    :srcdoc="srcdoc"
    :style="{ height: `${height}px` }"
    @load="onLoad"
  />
</template>

<style>
.canon-frame {
  display: block;
  width: 100%;
  border: 0;
}
</style>
