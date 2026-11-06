<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import * as vuetifyComponents from "vuetify/components";
import * as coalesce from "coalesce-vue-vuetify3";

interface Entry {
  id: string;
  title: string;
  name: string;
  type: string;
  tags?: string[];
}

const entries = ref<Entry[]>([]);
const failed = ref("");

onMounted(async () => {
  try {
    const res = await fetch(new URL("index.json", location.href));
    entries.value = Object.values((await res.json()).entries as Record<string, Entry>).filter((e) => e.type == "story");
  } catch (e) {
    failed.value = String(e);
  }
});

const sections = computed(() => {
  const by = new Map<string, Map<string, Entry[]>>();
  for (const e of entries.value) {
    const [top, ...rest] = e.title.split("/");
    const group = rest.length > 1 ? rest.slice(0, -1).join(" / ") : "";
    if (!by.has(top)) by.set(top, new Map());
    const groups = by.get(top)!;
    const key = group ? `${group} / ${rest.at(-1)}` : rest.join(" / ") || top;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return [...by].map(([name, groups]) => ({
    name,
    count: [...groups.values()].reduce((n, g) => n + g.length, 0),
    groups: [...groups].map(([title, stories]) => ({ title, stories })),
  }));
});

// Components a story claims through a `vuetify:<Name>` or `coalesce:<Name>` tag.
function coverage(prefix: string, names: string[]) {
  const claimed = new Map<string, Entry>();
  for (const e of entries.value) {
    for (const t of e.tags ?? []) {
      if (t.startsWith(prefix) && !claimed.has(t.slice(prefix.length))) claimed.set(t.slice(prefix.length), e);
    }
  }
  return names.map((name) => {
    const story = claimed.get(name);
    // Sub-parts (VCardTitle) count as covered by their parent's story (VCard).
    const parent = story ? undefined : names.find((p) => p != name && name.startsWith(p) && claimed.has(p));
    return { name, story: story ?? (parent ? claimed.get(parent) : undefined), via: parent };
  });
}

// Transitions only animate; c-style doesn't style them, so they get no story.
const vuetifyNames = Object.keys(vuetifyComponents)
  .filter((n) => /^V[A-Z]/.test(n) && !n.endsWith("Transition"))
  .sort();
// Internal components rendered only inside others; listed so coverage shows them.
const coalesceNames = [...Object.keys(coalesce).filter((n) => /^C[A-Z]/.test(n)), "CAdminCreateBtn", "CTimePicker", "CListFilterInput"].sort();

const vuetify = computed(() => coverage("vuetify:", vuetifyNames));
const coalesceCoverage = computed(() => coverage("coalesce:", coalesceNames));

const link = (id: string) => `/?path=/story/${id}`;
</script>

<template>
  <div class="sb-all">
    <h1 class="text-headline-medium mb-1">c-style Storybook</h1>
    <p class="text-medium-emphasis mb-6" style="max-width: 72ch">
      Vuetify 4 and Coalesce restyled by c-style. Use the toolbar for theme, accent and font (any Google Fonts family through the URL: <code>&amp;globals=font:Space+Grotesk</code>; Fontshare: <code>font:fontshare+satoshi</code>; see Foundations/Typography). Live counts come from this
      Storybook's index; coverage comes from each story's <code>vuetify:</code>/<code>coalesce:</code> tags.
    </p>
    <v-alert v-if="failed" type="error" :text="failed" class="mb-4" />

    <div class="sb-all__stats mb-8">
      <v-card v-for="s in sections" :key="s.name" variant="outlined" class="pa-4">
        <div class="text-label-large text-medium-emphasis">{{ s.name }}</div>
        <div class="text-headline-small">{{ s.count }}</div>
        <div class="text-body-small text-medium-emphasis">{{ s.groups.length }} pages</div>
      </v-card>
    </div>

    <h2 class="text-title-large mb-2">Vuetify components</h2>
    <p class="text-body-small text-medium-emphasis mb-3">
      {{ vuetify.filter((c) => c.story).length }} of {{ vuetify.length }} exports have a story (sub-parts count through their parent; transitions are left out).
    </p>
    <div class="sb-all__grid mb-8">
      <a v-for="c in vuetify" :key="c.name" :href="c.story ? link(c.story.id) : undefined" target="_top" :class="['sb-all__item', { 'sb-all__item--missing': !c.story }]">
        <code>{{ c.name }}</code><span v-if="c.via" class="text-medium-emphasis"> via {{ c.via }}</span><span v-else-if="!c.story" class="text-error"> no story</span>
      </a>
    </div>

    <h2 class="text-title-large mb-2">Coalesce components</h2>
    <p class="text-body-small text-medium-emphasis mb-3">{{ coalesceCoverage.filter((c) => c.story).length }} of {{ coalesceCoverage.length }} have a story.</p>
    <div class="sb-all__grid mb-8">
      <a v-for="c in coalesceCoverage" :key="c.name" :href="c.story ? link(c.story.id) : undefined" target="_top" :class="['sb-all__item', { 'sb-all__item--missing': !c.story }]">
        <code>{{ c.name }}</code><span v-if="c.via" class="text-medium-emphasis"> via {{ c.via }}</span><span v-else-if="!c.story" class="text-error"> no story</span>
      </a>
    </div>

    <h2 class="text-title-large mb-4">All stories</h2>
    <section v-for="s in sections" :key="s.name" class="mb-8">
      <h3 class="text-title-medium mb-2">{{ s.name }} <span class="text-medium-emphasis">({{ s.count }})</span></h3>
      <div class="sb-all__groups">
        <div v-for="g in s.groups" :key="g.title">
          <div class="text-label-large">{{ g.title }}</div>
          <a v-for="st in g.stories" :key="st.id" :href="link(st.id)" target="_top" class="sb-all__story">{{ st.name }}</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.sb-all__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.sb-all__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px 16px;
  font-size: 13px;
}
.sb-all__item {
  color: inherit;
  text-decoration: none;
}
.sb-all__item:hover code {
  text-decoration: underline;
}
.sb-all__item--missing {
  opacity: 0.7;
}
.sb-all__groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.sb-all__story {
  display: block;
  font-size: 13px;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
</style>
