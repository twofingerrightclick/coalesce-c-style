<template>
  <v-app>
    <v-main>
      <div class="pa-6 d-grid" style="display: grid; grid-template-columns: repeat(3, 320px); gap: 24px 32px; align-items: start">
        <v-text-field data-t="text" label="Name" placeholder="Ada Lovelace" />
        <v-text-field data-t="text-filled" label="Name" model-value="Grace Hopper" />
        <v-text-field data-t="text-nolabel" label="" placeholder="No label (Coalesce)" />
        <v-text-field data-t="icon" label="Search" prepend-inner-icon="$search" clearable model-value="abc" />
        <v-text-field data-t="hint" label="Email" hint="We never share it." persistent-hint />
        <v-text-field data-t="error" label="Code" model-value="x" :rules="[() => 'Too short']" />
        <v-select data-t="select" label="Category" :items="items" placeholder="Pick one" />
        <v-select data-t="select-filled" label="Category" :items="items" model-value="Whizbangs" />
        <v-autocomplete data-t="auto" label="Tags" :items="items" multiple chips closable-chips :model-value="['Whizbangs']" />
        <v-combobox data-t="combo" label="Combobox" :items="items" />
        <v-textarea data-t="textarea" label="Notes" rows="1" auto-grow placeholder="One row" />
        <v-text-field data-t="disabled" label="Disabled" disabled model-value="Locked" />
        <v-text-field data-t="readonly" label="Readonly" readonly model-value="Read only" />
        <v-text-field data-t="compact" label="Compact" density="compact" placeholder="density=compact" />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const items = ["Discombobulators", "Whizbangs", "Sprecklesprockets"];
</script>
