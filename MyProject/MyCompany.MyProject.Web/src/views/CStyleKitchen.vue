<template>
  <!-- c-style fixtures: verify/app specs measure these; also a visual check page. -->
  <v-container class="c-style-kitchen" max-width="1100px">
    <section data-kitchen="buttons">
      <h2 class="text-title-medium mb-4">Buttons</h2>
      <div
        v-for="size in sizes"
        :key="size"
        class="d-flex flex-wrap ga-2 mb-3 align-center"
      >
        <template v-for="intent in intents" :key="intent">
          <v-btn
            v-for="variant in variants"
            :key="variant"
            :size="size"
            :variant="variant"
            :color="intent"
            :data-btn="`${variant}-${intent ?? 'default'}-${size}`"
          >
            Button
          </v-btn>
        </template>
      </div>
      <div class="d-flex flex-wrap ga-2 mb-3 align-center">
        <v-btn
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          disabled
          :data-btn="`${variant}-disabled`"
        >
          Disabled
        </v-btn>
        <v-btn data-btn="default">Default</v-btn>
        <v-btn prepend-icon="$plus" data-btn="prepend">Add item</v-btn>
        <v-btn icon="$search" data-btn="icon" />
        <v-btn icon="$search" color="neutral" variant="text" data-btn="icon-neutral" />
        <v-btn loading data-btn="loading">Loading</v-btn>
      </div>
      <v-btn-group data-btn-group>
        <v-btn>Day</v-btn>
        <v-btn active>Week</v-btn>
        <v-btn>Month</v-btn>
      </v-btn-group>
      <v-btn-toggle class="ml-4" :model-value="'week'" mandatory data-btn-toggle>
        <v-btn value="day">Day</v-btn>
        <v-btn value="week">Week</v-btn>
        <v-btn value="month">Month</v-btn>
      </v-btn-toggle>
      <v-card class="mt-4" data-kitchen="card-actions">
        <v-card-text>Card actions</v-card-text>
        <v-card-actions>
          <v-btn data-btn="card-action">Save</v-btn>
        </v-card-actions>
      </v-card>
    </section>

    <section data-kitchen="fields" class="mt-8">
      <h2 class="text-title-medium mb-4">Fields</h2>
      <v-row>
        <v-col cols="4">
          <v-text-field label="Name" placeholder="Jane" hint="Shown to others" persistent-hint data-field="text" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Search" prepend-inner-icon="$search" clearable model-value="Query" data-field="icon" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Email" model-value="nope" error-messages="Enter a valid email" data-field="error" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Disabled" model-value="Locked" disabled data-field="disabled" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Readonly" model-value="Fixed" readonly data-field="readonly" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="" model-value="No label" density="compact" data-field="no-label" />
        </v-col>
        <v-col cols="4">
          <v-select label="Fruit" :items="['Apple', 'Pear']" model-value="Apple" data-field="select" />
        </v-col>
        <v-col cols="4">
          <v-autocomplete label="City" :items="['Oslo', 'Rome']" data-field="autocomplete" />
        </v-col>
        <v-col cols="4">
          <v-combobox label="Tags" :items="['a', 'b']" data-field="combobox" />
        </v-col>
        <v-col cols="4">
          <v-textarea label="Notes" rows="1" auto-grow data-field="textarea" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="Count" :model-value="3" data-field="number" />
        </v-col>
      </v-row>
      <v-toolbar class="mt-4" data-kitchen="toolbar-field">
        <v-text-field label="Search" prepend-inner-icon="$search" data-field="toolbar" />
      </v-toolbar>
    </section>

    <section data-kitchen="choices" class="mt-8">
      <h2 class="text-title-medium mb-4">Choices</h2>
      <div class="d-flex flex-wrap ga-6">
        <v-checkbox label="Unchecked" data-choice="checkbox-off" />
        <v-checkbox label="Checked" :model-value="true" data-choice="checkbox-on" />
        <v-checkbox label="Mixed" indeterminate data-choice="checkbox-mixed" />
        <v-checkbox label="Disabled" disabled data-choice="checkbox-disabled" />
        <v-radio-group :model-value="'b'" inline data-choice="radios">
          <v-radio label="Radio A" value="a" data-choice="radio-off" />
          <v-radio label="Radio B" value="b" data-choice="radio-on" />
        </v-radio-group>
        <v-switch label="Off" data-choice="switch-off" />
        <v-switch label="On" :model-value="true" data-choice="switch-on" />
      </div>
      <v-row class="mt-4">
        <v-col cols="4">
          <v-form data-choice="stacked-checkboxes">
            <v-text-field label="Name" />
            <v-checkbox label="Email me" />
            <v-checkbox label="Text me" />
            <v-checkbox label="Call me" />
          </v-form>
        </v-col>
        <v-col cols="4">
          <v-radio-group :model-value="'a'" label="Plan" data-choice="stacked-radios">
            <v-radio label="Free" value="a" />
            <v-radio label="Pro" value="b" />
            <v-radio label="Team" value="c" />
          </v-radio-group>
        </v-col>
        <v-col cols="4">
          <v-form data-choice="stacked-switches">
            <v-switch label="Wi-Fi" />
            <v-switch label="Bluetooth" :model-value="true" />
          </v-form>
        </v-col>
      </v-row>
    </section>

    <section data-kitchen="surfaces" class="mt-8">
      <h2 class="text-title-medium mb-4">Surfaces and feedback</h2>
      <v-card data-surface="card" title="Card title" subtitle="A short description">
        <v-card-text>Card body text.</v-card-text>
      </v-card>
      <v-expansion-panels class="mt-4" data-surface="expansion">
        <v-expansion-panel title="Expansion title" text="Panel content" />
      </v-expansion-panels>
      <div class="d-flex flex-column ga-3 mt-4">
        <v-alert type="error" title="Alert title" text="Alert description." data-surface="alert-error" />
        <v-alert type="success" text="Saved." data-surface="alert-success" />
      </div>
      <v-banner class="mt-4" text="Banner text" data-surface="banner" />
      <div class="d-flex ga-4 mt-4 align-center">
        <v-progress-circular indeterminate data-surface="spinner" />
        <v-progress-linear :model-value="40" data-surface="linear" style="max-width: 200px" />
      </div>
      <v-btn class="mt-4" data-btn="snackbar" @click="snackbar = true">Show toast</v-btn>
      <v-snackbar v-model="snackbar" timeout="-1" data-surface="snackbar">
        Toast message
      </v-snackbar>
      <v-snackbar v-model="snackbar" timeout="-1" color="success" location="bottom left" prepend-icon="$success" data-surface="snackbar-success">
        Saved
      </v-snackbar>
    </section>

    <section data-kitchen="overlays" class="mt-8 d-flex ga-4">
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" data-btn="menu">Open menu</v-btn>
        </template>
        <v-list data-overlay="menu">
          <v-list-subheader>Group</v-list-subheader>
          <v-list-item title="First" link data-overlay="item" />
          <v-list-item title="Chosen" link active data-overlay="item-active" />
        </v-list>
      </v-menu>
      <v-tooltip text="Tooltip text">
        <template #activator="{ props }">
          <v-btn v-bind="props" data-btn="tooltip">Hover me</v-btn>
        </template>
      </v-tooltip>
      <v-dialog max-width="640">
        <template #activator="{ props }">
          <v-btn v-bind="props" data-btn="dialog">Open dialog</v-btn>
        </template>
        <v-card data-overlay="dialog">
          <v-card-title>Dialog title</v-card-title>
          <v-card-text>Dialog body.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn>Confirm</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </section>

    <section data-kitchen="data" class="mt-8">
      <h2 class="text-title-medium mb-4">Data display</h2>
      <v-table hover data-data="table">
        <thead>
          <tr><th>Name</th><th>Category</th><th class="text-end">Count</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td>{{ row.name }}</td><td>{{ row.category }}</td><td class="text-end">{{ row.count }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-table density="compact" class="mt-4" data-data="table-compact">
        <tbody>
          <tr><td>Compact row</td></tr>
        </tbody>
      </v-table>
      <v-data-table
        class="mt-4"
        :headers="headers"
        :items="rows"
        item-value="name"
        show-select
        hide-default-footer
        data-data="data-table"
      />
      <v-pagination :length="5" :model-value="2" class="mt-4" data-data="pagination" />
      <div class="d-flex flex-wrap ga-2 mt-4 align-center">
        <v-chip data-data="chip">Tag</v-chip>
        <v-chip color="success" data-data="chip-success">Saved</v-chip>
        <v-chip variant="outlined" data-data="chip-outlined">Outlined</v-chip>
        <v-chip size="small" closable data-data="chip-small">Small</v-chip>
        <v-chip prepend-icon="$info" data-data="chip-icon">With icon</v-chip>
        <v-badge content="3" data-data="badge">
          <v-icon icon="$calendar" />
        </v-badge>
        <v-avatar data-data="avatar">AB</v-avatar>
        <v-kbd data-data="kbd">Ctrl</v-kbd>
        <v-code data-data="code">code</v-code>
        <v-icon :icon="csIcon(House)" data-data="cs-icon" />
      </div>
    </section>

    <section data-kitchen="nav" class="mt-8">
      <h2 class="text-title-medium mb-4">Navigation</h2>
      <v-tabs v-model="tab" data-nav="tabs">
        <v-tab value="one">Overview</v-tab>
        <v-tab value="two">Activity</v-tab>
        <v-tab value="three" disabled>Settings</v-tab>
      </v-tabs>
      <v-breadcrumbs :items="crumbs" data-nav="breadcrumbs" />
    </section>

    <section data-kitchen="pickers" class="mt-8">
      <h2 class="text-title-medium mb-4">Pickers</h2>
      <div class="d-flex flex-wrap ga-6 align-start">
        <v-date-picker v-model="date" data-picker="date" />
        <div style="width: 280px">
          <v-slider :model-value="40" data-picker="slider" />
          <v-range-slider :model-value="[20, 60]" data-picker="range" />
        </div>
        <v-color-picker data-picker="color" />
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { csIcon, House } from "c-style/icons";

const sizes = ["small", "default", "large"] as const;
const intents = [undefined, "neutral", "error"];
const variants = ["flat", "tonal", "outlined", "text"] as const;
const snackbar = ref(false);
const tab = ref("one");
const date = ref(new Date(2026, 10, 12));
const crumbs = [
  { title: "Home", href: "/" },
  { title: "Admin", href: "/admin" },
  { title: "Widget", disabled: true },
];
const rows = [
  { name: "Aardvark", category: "Tools", count: 12 },
  { name: "Bellows", category: "Parts", count: 3 },
  { name: "Coil", category: "Parts", count: 140 },
];
const headers = [
  { title: "Name", key: "name", sortable: true },
  { title: "Category", key: "category" },
  { title: "Count", key: "count", align: "end" as const },
];
</script>
