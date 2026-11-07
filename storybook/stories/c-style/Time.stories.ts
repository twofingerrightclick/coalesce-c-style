import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, waitFor } from "storybook/test";
import { ref } from "vue";
import { CsTimeField, CsTimeInput, CsTimeRangeField } from "coalesce-c-style";

// c-style's own Canon Time components (docs/research/canon-time.md). Every
// variant of Canon's one `.canon-time` box, light and dark through the
// theme global; Parity/Time compares them with Canon's markup.

export default {
  title: "c-style/Time",
  tags: ["c-style:CsTimeField", "c-style:CsTimeRangeField", "c-style:CsTimeInput"],
} satisfies Meta;

const components = { CsTimeField, CsTimeInput, CsTimeRangeField };

function story(template: string, setup: () => Record<string, unknown> = () => ({}), extra: Omit<StoryObj, "render"> = {}): StoryObj {
  return { render: () => ({ components, template, setup }), ...extra };
}

const field = 'style="flex: none"';

export const Basics = story(
  `<sb-row label="value / empty" wrap>
    <cs-time-field v-model="starts" label="Starts at" format="24hr" ${field} />
    <cs-time-field v-model="reminder" label="Daily reminder" format="24hr" ${field} />
  </sb-row>
  <sb-row label="v-model" wrap><code data-value>{{ starts ?? "null" }} · {{ reminder ?? "null" }}</code></sb-row>`,
  () => ({ starts: ref("08:00"), reminder: ref(null) }),
);

export const Step = story(
  `<sb-row label="step 900 (15 min)" wrap><cs-time-field v-model="slot" label="Slot" format="24hr" :step="900" ${field} /></sb-row>
  <sb-row label="step 1 (seconds)" wrap><cs-time-field v-model="lap" label="Lap time" format="24hr" :step="1" ${field} /></sb-row>
  <sb-row label="use-seconds" wrap><cs-time-field v-model="lap" label="Lap time" format="24hr" use-seconds ${field} /></sb-row>`,
  () => ({ slot: ref("09:30"), lap: ref("00:04:37") }),
);

export const Clock = story(
  `<sb-row label="ampm" wrap><cs-time-field v-model="t" label="Pickup" format="ampm" ${field} /></sb-row>
  <sb-row label="24hr" wrap><cs-time-field v-model="t" label="Pickup" format="24hr" ${field} /></sb-row>
  <sb-row label="ampm + seconds" wrap><cs-time-field v-model="s" label="Pickup" format="ampm" use-seconds ${field} /></sb-row>
  <sb-row label="locale (unset)" wrap><cs-time-field v-model="t" label="Follows Vuetify's locale" ${field} /></sb-row>`,
  () => ({ t: ref("14:30"), s: ref("14:30:05") }),
);

export const Range = story(
  `<sb-row label="range" wrap><cs-time-range-field v-model="shift" label="Shift" format="24hr" ${field} /></sb-row>
  <sb-row label="reversed" wrap><cs-time-range-field v-model="reversed" label="Shift" format="24hr" ${field} /></sb-row>
  <sb-row label="overnight" wrap><cs-time-range-field v-model="night" label="Night shift" format="24hr" overnight ${field} /></sb-row>
  <sb-row label="ampm" wrap><cs-time-range-field v-model="shift" label="Shift" format="ampm" ${field} /></sb-row>`,
  () => ({ shift: ref(["08:00", "16:30"]), reversed: ref(["22:00", "06:00"]), night: ref(["22:00", "06:00"]) }),
);

export const Sizes = story(
  `<sb-row v-for="s in ['small', 'default', 'large']" :key="s" :label="s" wrap>
    <cs-time-field v-model="t" :label="s" :size="s" format="24hr" ${field} />
    <cs-time-field v-model="t" :label="s" :size="s" format="ampm" ${field} />
    <cs-time-range-field v-model="r" :label="s" :size="s" format="24hr" ${field} />
  </sb-row>`,
  () => ({ t: ref("08:00"), r: ref(["08:00", "16:30"]) }),
);

export const States = story(
  `<sb-row label="hint" wrap><cs-time-field v-model="t" label="Opens" format="24hr" hint="Local time." persistent-hint ${field} /></sb-row>
  <sb-row label="error" wrap><cs-time-field model-value="03:15" label="Departure" format="24hr" :error-messages="['Departures run from 05:00.']" ${field} /></sb-row>
  <sb-row label="min (own check)" wrap><cs-time-field model-value="03:15" label="Departure" format="24hr" min="05:00" ${field} /></sb-row>
  <sb-row label="disabled" wrap><cs-time-field model-value="08:00" label="Disabled" format="24hr" disabled ${field} /><cs-time-field label="Disabled" format="24hr" disabled ${field} /></sb-row>
  <sb-row label="readonly" wrap><cs-time-field model-value="08:00" label="Read-only" format="24hr" readonly ${field} /></sb-row>
  <sb-row label="allowed hours" wrap><cs-time-field v-model="t" label="Office hours" format="24hr" :allowed-hours="[9, 10, 11, 12, 13, 14, 15, 16, 17]" :allowed-minutes="[0, 30]" hint="Up and Down skip the rest." persistent-hint ${field} /></sb-row>`,
  () => ({ t: ref("09:00") }),
);

export const Active = story(
  `<sb-row label="focused minute" wrap><cs-time-field v-model="t" label="Starts at" format="24hr" ${field} /></sb-row>`,
  () => ({ t: ref("08:00") }),
  {
    play: async ({ canvasElement }) => {
      const minute = canvasElement.querySelector<HTMLElement>('.cs-time-cell[data-type="minute"] .cs-time-value')!;
      minute.focus();
      await waitFor(() => expect(minute.closest(".cs-time-cell")!.hasAttribute("data-active")).toBe(true));
    },
  },
);

export const Form = story(
  `<v-form v-model="valid" :disabled="disabled" style="max-width: 360px" @submit.prevent="submitted++">
    <cs-time-field v-model="opens" label="Opens" format="24hr" :rules="[required]" />
    <cs-time-range-field v-model="hours" label="Lunch break" format="24hr" :step="900" />
    <div class="d-flex ga-2 mt-4"><v-btn type="submit">Save</v-btn><v-btn variant="text" @click="disabled = !disabled">Toggle disabled</v-btn></div>
    <p class="mt-2 text-body-small">valid: {{ valid }} · submitted: {{ submitted }}</p>
  </v-form>
  <v-form disabled class="mt-6" style="max-width: 360px"><cs-time-field model-value="08:00" label="In a disabled VForm" format="24hr" /></v-form>`,
  () => ({
    valid: ref(null),
    opens: ref(null),
    hours: ref(["12:00", "13:00"]),
    submitted: ref(0),
    disabled: ref(false),
    required: (v: string | null) => !!v || "Required",
  }),
);

export const Bare = story(
  `<sb-row label="cs-time-input" wrap><cs-time-input v-model="t" aria-label="Alarm" format="24hr" /></sb-row>
  <sb-row label="range" wrap><cs-time-input v-model="r" range aria-label="Window" format="24hr" /></sb-row>
  <sb-row label="rtl" wrap><div dir="rtl"><cs-time-input v-model="t" aria-label="Alarm" format="24hr" /></div></sb-row>`,
  () => ({ t: ref("06:45"), r: ref(["06:45", "07:15"]) }),
);
