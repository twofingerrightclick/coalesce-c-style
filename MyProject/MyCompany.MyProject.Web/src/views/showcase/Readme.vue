<template>
  <v-theme-provider :theme="previewTheme" with-background>
    <div class="readme-preview">
      <header class="preview-toolbar">
        <router-link to="/gallery">Back to components</router-link>
        <span>README preview</span>
        <v-btn
          variant="outlined"
          size="small"
          @click="previewTheme = previewTheme === 'dark' ? 'light' : 'dark'"
        >
          {{ previewTheme === "dark" ? "Light mode" : "Dark mode" }}
        </v-btn>
      </header>

      <!-- Capture only this element after the composition is approved. -->
      <main
        class="component-grid"
        aria-label="coalesce-c-style component showcase"
      >
        <section class="grid-cell" aria-label="Segmented tabs">
          <v-tabs v-model="period" color="neutral" class="period-tabs">
            <v-tab value="week">Week</v-tab>
            <v-tab value="month">Month</v-tab>
          </v-tabs>
        </section>

        <section class="grid-cell" aria-label="Search field">
          <v-text-field
            v-model="search"
            class="search-input"
            type="search"
            placeholder="Search…"
            aria-label="Search"
            :prepend-inner-icon="csIcon(Search)"
            hide-details
          />
        </section>

        <section class="grid-cell" aria-label="Notification switch">
          <v-switch
            v-model="alerts"
            label="Alerts"
            color="neutral"
            hide-details
          />
        </section>

        <section class="grid-cell" aria-label="Primary button">
          <v-btn
            color="primary"
            :prepend-icon="csIcon(Plus)"
            @click="quantity++"
            >Add</v-btn
          >
        </section>

        <section class="grid-cell" aria-label="Number input">
          <v-number-input
            v-model="quantity"
            class="quantity-input"
            control-variant="split"
            :min="0"
            :max="99"
            aria-label="Quantity"
            hide-details
          />
        </section>

        <section
          class="grid-cell brand-cell"
          aria-label="Coalesce, c-style, Canon"
        >
          <div class="brand-lockup">
            <a
              class="brand-mark"
              href="https://coalesce.intellitect.com/"
              aria-label="IntelliTect Coalesce"
            >
              <img
                class="coalesce-logo"
                src="/readme/coalesce-icon-color.svg"
                alt=""
                width="72"
                height="72"
              />
            </a>
            <span class="brand-divider" aria-hidden="true"></span>
            <h1>c-style</h1>
            <span class="brand-divider" aria-hidden="true"></span>
            <a
              class="brand-mark"
              href="https://recepkutuk.github.io/canon/"
              aria-label="Canon"
            >
              <!-- Original Canon mark from canon/reference/assets/favicon.svg. -->
              <svg
                class="canon-logo"
                viewBox="4 4 40 40"
                fill="none"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M24 4C35.0457 4 43.9999 12.9544 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4.00007 12.9544 12.9543 4 24 4ZM18.9395 14.8076C17.1292 16.568 16.4686 19.2 17.2334 21.6064L23.999 42.8945L25.083 40.8018L23.8838 37.0293L27.6094 33.4062C29.4195 31.6461 30.0799 29.0147 29.3154 26.6084L26.7773 18.6211L22.0117 20.1357L26.0195 16.2383L24 9.88574L18.9395 14.8076Z"
                />
              </svg>
            </a>
          </div>
        </section>

        <section class="grid-cell" aria-label="Navigation list">
          <nav class="nav-preview" aria-label="Workspace">
            <v-list nav bg-color="transparent" class="pa-0">
              <v-list-item
                :active="navItem === 'inbox'"
                :prepend-icon="csIcon(Mail)"
                title="Inbox"
                color="neutral"
                @click="navItem = 'inbox'"
              >
                <template #append>
                  <span class="nav-count">12</span>
                </template>
              </v-list-item>
              <v-list-item
                :active="navItem === 'calendar'"
                :prepend-icon="csIcon(Calendar)"
                title="Calendar"
                color="neutral"
                @click="navItem = 'calendar'"
              />
            </v-list>
          </nav>
        </section>

        <section class="grid-cell" aria-label="Time input">
          <cs-time-input v-model="time" format="24hr" aria-label="Time" />
        </section>

        <section class="grid-cell" aria-label="Slider">
          <v-slider
            v-model="volume"
            class="volume-slider"
            color="neutral"
            aria-label="Volume"
            hide-details
          />
        </section>

        <section class="grid-cell" aria-label="Status chip">
          <v-chip
            color="success"
            variant="tonal"
            :prepend-icon="csIcon(CircleCheck)"
            >Ready</v-chip
          >
        </section>

        <section class="grid-cell" aria-label="Color selector">
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                class="color-button"
                aria-label="Choose accent color"
              >
                <span
                  class="color-swatch"
                  :style="{ backgroundColor: accent }"
                ></span>
                <v-icon :icon="csIcon(ChevronRight)" size="18" />
              </v-btn>
            </template>
            <v-color-picker v-model="accent" hide-inputs elevation="0" />
          </v-menu>
        </section>
      </main>
    </div>
  </v-theme-provider>
</template>

<script setup lang="ts">
import { CsTimeInput } from "coalesce-c-style";
import {
  ChevronRight,
  Calendar,
  CircleCheck,
  Mail,
  Plus,
  Search,
  csIcon,
} from "coalesce-c-style/icons";

useTitle("README preview · c-style");

const previewTheme = ref("dark");
const period = ref("week");
const search = ref("");
const alerts = ref(true);
const quantity = ref(8);
const navItem = ref("inbox");
const time = ref("10:45");
const volume = ref(82);
const accent = ref("#ed7026");
</script>

<style scoped lang="scss">
.readme-preview {
  min-height: 100dvh;
  padding: 24px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
}

.preview-toolbar {
  max-width: 1664px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;

  a,
  > span {
    color: rgb(var(--v-theme-on-surface-variant));
  }
}

.component-grid {
  --grid-line: rgba(var(--v-border-color), var(--v-border-opacity));
  width: 100%;
  max-width: 1664px;
  aspect-ratio: 1664 / 968;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--grid-line);
  background: var(--grid-line);
}

.grid-cell {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(var(--v-theme-background));

  > .v-input {
    flex: 0 1 auto;
  }
}

.search-input {
  width: 200px;
}

.quantity-input {
  width: 144px;
}

.nav-preview {
  flex: 0 1 200px;
  min-width: 0;
  max-width: 100%;
}

.nav-count {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.volume-slider {
  width: 168px;
}

.brand-cell {
  grid-column: span 2;
}

.brand-lockup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 3.2vw, 48px);

  h1 {
    font-size: clamp(32px, 4.4vw, 72px);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
    white-space: nowrap;
  }
}

.brand-mark {
  display: flex;
  color: inherit;
  border-radius: 4px;

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 8px;
  }
}

.canon-logo,
.coalesce-logo {
  display: block;
  width: clamp(40px, 5.2vw, 80px);
  height: clamp(40px, 5.2vw, 80px);
}

.brand-divider {
  width: 1px;
  height: clamp(40px, 5vw, 72px);
  background: var(--grid-line);
}

.color-button :deep(.v-btn__content) {
  gap: 14px;
}

.color-swatch {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

@media (min-width: 1000px) {
  .grid-cell:not(.brand-cell) > * {
    zoom: 1.5;
  }
}

@media (max-width: 700px) {
  .readme-preview {
    padding: 12px;
  }

  .preview-toolbar > span {
    display: none;
  }

  .component-grid {
    aspect-ratio: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    grid-auto-rows: 160px;
  }

  .grid-cell {
    padding: 12px;
  }

  .brand-cell {
    grid-row: 3;
  }

  .brand-lockup {
    gap: 24px;
  }
}
</style>
