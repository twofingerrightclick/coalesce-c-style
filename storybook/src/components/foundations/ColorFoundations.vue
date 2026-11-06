<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";

// Reads the live theme, so the page follows the theme and accent globals and
// shows whatever roles and ladders c-style currently emits.
const theme = useTheme();
const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

const modes = computed(() =>
  (["light", "dark"] as const).map((name) => {
    const t = theme.themes.value[name];
    const variables = t.variables as Record<string, string | number>;
    const ladders = new Map<string, Record<string, string>>();
    const roles: [string, string][] = [];
    for (const [key, value] of Object.entries(variables)) {
      const m = /^(.+)-(\d{2,3})$/.exec(key);
      if (m && steps.includes(m[2]) && typeof value == "string") {
        if (!ladders.has(m[1])) ladders.set(m[1], {});
        ladders.get(m[1])![m[2]] = value;
      } else if (typeof value == "string" && /^#|^rgb/.test(value)) {
        roles.push([key, value]);
      }
    }
    return { name, colors: Object.entries(t.colors), ladders: [...ladders], roles, scalars: Object.entries(variables).filter(([, v]) => typeof v == "number" || !/^#|^rgb/.test(String(v))) };
  }),
);
</script>

<template>
  <div v-for="mode in modes" :key="mode.name" class="sb-colors">
    <h2 class="text-title-large mb-4">{{ mode.name }}</h2>
    <v-theme-provider :theme="mode.name" with-background class="pa-4 rounded-lg border">
      <sb-section title="Theme colors (roles)">
        <div class="sb-colors__grid">
          <div v-for="[key, value] in mode.colors" :key="key" class="sb-colors__swatch">
            <div class="sb-colors__chip" :style="{ background: String(value) }" />
            <code>{{ key }}</code><span>{{ value }}</span>
          </div>
        </div>
      </sb-section>
      <sb-section title="Ladders (theme variables)" :note="mode.ladders.length ? '' : 'No ladders in theme variables yet.'">
        <div v-for="[name, ladder] in mode.ladders" :key="name" class="sb-colors__ladder">
          <code class="sb-colors__ladder-name">{{ name }}</code>
          <div v-for="s in steps" :key="s" class="sb-colors__step" :style="{ background: ladder[s] }" :title="`${name}-${s} ${ladder[s] ?? ''}`">
            <span>{{ s }}</span>
          </div>
        </div>
      </sb-section>
      <sb-section v-if="mode.roles.length" title="Role tokens (theme variables)">
        <div class="sb-colors__grid">
          <div v-for="[key, value] in mode.roles" :key="key" class="sb-colors__swatch">
            <div class="sb-colors__chip" :style="{ background: value }" />
            <code>--v-{{ key }}</code><span>{{ value }}</span>
          </div>
        </div>
      </sb-section>
      <sb-section title="Other variables">
        <div class="sb-colors__vars">
          <template v-for="[key, value] in mode.scalars" :key="key"><code>--v-{{ key }}</code><span>{{ value }}</span></template>
        </div>
      </sb-section>
    </v-theme-provider>
  </div>
</template>

<style>
.sb-colors {
  margin-block-end: 32px;
}
.sb-colors__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px 16px;
}
.sb-colors__swatch {
  display: grid;
  grid-template-columns: 32px 1fr;
  column-gap: 8px;
  align-items: center;
  font-size: 12px;
}
.sb-colors__swatch span {
  grid-column: 2;
  opacity: 0.6;
}
.sb-colors__chip {
  grid-row: span 2;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
}
.sb-colors__ladder {
  display: grid;
  grid-template-columns: 120px repeat(11, 1fr);
  gap: 2px;
  margin-block-end: 4px;
  font-size: 11px;
}
.sb-colors__ladder-name {
  align-self: center;
}
.sb-colors__step {
  height: 36px;
  display: flex;
  align-items: flex-end;
  padding: 2px 4px;
  border-radius: 4px;
}
.sb-colors__step span {
  mix-blend-mode: difference;
  color: white;
}
.sb-colors__vars {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 16px;
  font-size: 12px;
}
</style>
