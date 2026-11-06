import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Pickers/Date and time",
  tags: ["vuetify:VDatePicker", "vuetify:VTimePicker", "vuetify:VCalendar", "vuetify:VPicker"],
} satisfies Meta;

export const DatePicker = tpl(
  `<sb-row label="single / range / multiple" wrap>
    <v-date-picker v-model="date" />
    <v-date-picker v-model="range" multiple="range" />
    <v-date-picker v-model="dates" multiple color="primary" show-adjacent-months />
  </sb-row>
  <sb-row label="month / year view, min/max, disabled" wrap>
    <v-date-picker view-mode="months" />
    <v-date-picker view-mode="year" />
    <v-date-picker v-model="date" :min="new Date(2026, 10, 3)" :max="new Date(2026, 10, 20)" hide-header />
    <v-date-picker v-model="date" disabled />
  </sb-row>`,
  () => ({
    date: ref(new Date(2026, 10, 5)),
    range: ref([new Date(2026, 10, 3), new Date(2026, 10, 4), new Date(2026, 10, 5), new Date(2026, 10, 6)]),
    dates: ref([new Date(2026, 10, 2), new Date(2026, 10, 9)]),
  }),
);

export const TimePicker = tpl(
  `<sb-row label="ampm / 24hr / seconds" wrap>
    <v-time-picker v-model="ampm" />
    <v-time-picker v-model="h24" format="24hr" color="primary" />
    <v-time-picker v-model="seconds" use-seconds variant="input" />
  </sb-row>`,
  () => ({ ampm: ref("09:30"), h24: ref("17:45"), seconds: ref("09:30:15") }),
);

export const Calendar = tpl(
  `<sb-row label="month" stack><v-calendar :model-value="[day]" :events="events" /></sb-row>
  <sb-row label="week" stack><v-calendar view-mode="week" :model-value="[day]" :events="events" /></sb-row>`,
  () => {
    const day = new Date(2026, 10, 5);
    const at = (d: number, h: number) => new Date(2026, 10, d, h);
    return {
      day,
      events: [
        { title: "Review", start: at(5, 9), end: at(5, 10), color: "primary" },
        { title: "Standup", start: at(4, 10), end: at(4, 11), color: "success" },
        { title: "Offsite", start: at(12, 0), end: at(13, 0), color: "warning", allDay: true },
      ],
    };
  },
);

export const Picker = tpl(
  `<v-picker title="Custom picker" width="320"><template #header><div class="pa-4 text-h6">Header slot</div></template><div class="pa-4">Any content can sit in a picker frame.</div><template #actions><v-btn>OK</v-btn></template></v-picker>`,
);
