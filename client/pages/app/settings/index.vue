<template>
  <NuxtLayout name="dashboard" :header="header">
    <template #header> Settings </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { DashPageHeader } from "~~/layouts/dashboard.vue";

const header: DashPageHeader = {
  title: "Settings",
  icon: "solar:settings-bold-duotone",
};
</script>

<style scoped></style>
