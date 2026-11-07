<template>
  <div class="collage">
    <!-- Nav: primary colour as the bar background -->
    <v-toolbar class="nav" density="comfortable" flat>
      <v-app-bar-nav-icon />
      <v-toolbar-title>MyCompany.MyProject</v-toolbar-title>
      <v-btn variant="text">Settings</v-btn>
      <v-spacer />
      <v-btn :icon="csIcon(Bell)" />
      <v-btn :icon="csIcon(User)" />
    </v-toolbar>

    <!-- Sidebar nav -->
    <v-sheet class="side" elevation="8" color="surface">
      <v-list nav>
        <v-list-item :prepend-icon="csIcon(House)" title="Home" active color="primary" />
        <v-list-item :prepend-icon="csIcon(ChartLine)" title="Dashboard" />
        <v-list-item :prepend-icon="csIcon(Columns3)" title="Widgets" />
        <v-list-item :prepend-icon="csIcon(Settings)" title="Settings" />
        <v-list-item :prepend-icon="csIcon(Palette)" title="Components" />
        <v-list-subheader>Admin</v-list-subheader>
        <v-list-item :prepend-icon="csIcon(Users)" title="Users" />
        <v-list-item :prepend-icon="csIcon(Folder)" title="Files" />
        <v-list-item :prepend-icon="csIcon(Mail)" title="Messages" />
        <v-list-item :prepend-icon="csIcon(Calendar)" title="Calendar" />
        <v-list-item :prepend-icon="csIcon(Star)" title="Favorites" />
        <v-list-item :prepend-icon="csIcon(Bell)" title="Alerts" />
        <v-list-item :prepend-icon="csIcon(Trash2)" title="Trash" />
      </v-list>
    </v-sheet>

    <!-- Tabs -->
    <div class="tabs">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="a">Overview</v-tab>
        <v-tab value="b">Activity</v-tab>
        <v-tab value="c">Members</v-tab>
        <v-tab value="d">Billing</v-tab>
      </v-tabs>
    </div>

    <!-- Heavy FA solid icons -->
    <div class="icons">
      <v-icon v-for="i in icons" :key="i" :icon="csIcon(i)" size="40" />
    </div>

    <!-- Buttons: elevation, ripple -->
    <div class="buttons">
      <v-btn color="primary" size="large" elevation="8">Save changes</v-btn>
      <v-btn color="secondary" size="large" elevation="8">Cancel</v-btn>
      <v-btn color="error" size="large" elevation="8" :prepend-icon="csIcon(Trash2)">
        Delete
      </v-btn>
      <v-btn color="success" size="large" elevation="8" :prepend-icon="csIcon(Check)">
        Approve
      </v-btn>
    </div>

    <!-- Alerts: level fills the whole component -->
    <div class="alerts">
      <v-alert type="success" title="Deployment finished" text="All 12 widgets published." />
      <v-alert type="warning" title="Quota almost reached" text="You have used 92% of your plan." />
      <v-alert type="error" title="Sync failed" text="Could not reach the server." />
      <v-alert type="info" title="New version available" text="Reload to update." />
    </div>

    <!-- Cards with harsh shadows -->
    <v-card class="card c1" elevation="24" title="Revenue" subtitle="This month">
      <v-card-text class="text-h4">$48,200</v-card-text>
    </v-card>
    <v-card class="card c2" elevation="24" title="Active users" subtitle="Last 7 days">
      <v-card-text class="text-h4">1,284</v-card-text>
      <v-card-actions><v-btn color="primary">View</v-btn></v-card-actions>
    </v-card>

    <!-- Bottom row, cropped by the canvas -->
    <v-card class="card c3" elevation="24" title="Team" subtitle="8 members">
      <v-card-text>
        <v-chip color="primary" class="mr-2">Design</v-chip>
        <v-chip color="success">Shipped</v-chip>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="elevated" elevation="8">Invite</v-btn>
        <v-btn color="secondary" variant="elevated" elevation="8">Manage</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="card c4" elevation="24" title="Notifications" subtitle="Email and push">
      <v-card-text>
        <v-switch label="Weekly digest" model-value color="primary" hide-details />
        <v-checkbox label="Mentions" model-value hide-details />
      </v-card-text>
    </v-card>
    <div class="tabs2">
      <v-tabs v-model="tab2">
        <v-tab value="a">Inbox</v-tab>
        <v-tab value="b">Sent</v-tab>
        <v-tab value="c">Drafts</v-tab>
      </v-tabs>
    </div>

    <!-- Selects: chunky caret -->
    <div class="selects">
      <v-select label="Status" :items="['Active', 'Paused']" model-value="Active" />
      <v-select label="Owner" :items="['Ada', 'Grace']" model-value="Grace" />
      <v-autocomplete label="Region" :items="['us-east', 'eu-west']" model-value="eu-west" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bell,
  Calendar,
  Check,
  ChartLine,
  Columns3,
  Folder,
  House,
  Mail,
  Palette,
  Settings,
  Star,
  Trash2,
  User,
  Users,
  csIcon,
} from "coalesce-c-style/icons";

const tab = ref("a");
const tab2 = ref("b");
const icons = [House, Settings, User, Bell, Mail, Calendar, Folder];
</script>

<style lang="scss" scoped>
// Fixed 1:1 canvas; anything past the edge is cropped on purpose.
.collage {
  position: fixed;
  inset: 0 auto auto 0;
  width: 1080px;
  height: 1080px;
  z-index: 3000;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));

  > * {
    position: absolute;
  }
}
.nav {
  top: 0;
  left: 0;
  width: 1080px;
}
.side {
  top: 56px;
  left: 0;
  width: 240px;
  height: 1030px;
}
.tabs {
  top: 90px;
  left: 270px;
  width: 400px;
}
.icons {
  top: 170px;
  left: 270px;
  width: 400px;
  display: flex;
  gap: 18px;
  flex-wrap: nowrap;
}
.buttons {
  top: 270px;
  left: 270px;
  width: 360px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.selects {
  top: 110px;
  left: 700px;
  width: 330px;
  display: grid;
  gap: 4px;
}
.alerts {
  top: 340px;
  left: 700px;
  width: 520px;
  display: grid;
  gap: 16px;
}
.c1 {
  top: 440px;
  left: 270px;
  width: 300px;
}
.c2 {
  top: 520px;
  left: 390px;
  width: 280px;
  z-index: 1;
}
.tabs2 {
  top: 770px;
  left: 240px;
  width: 440px;
}
.c3 {
  top: 850px;
  left: 270px;
  width: 340px;
}
.c4 {
  top: 780px;
  left: 700px;
  width: 400px;
}
</style>
