<template>
  <NuxtLayout name="dashboard" :header="header">
    <template #append>
      <DoneAction @done="createCard" />
    </template>
    <CardEditor
      :loading="cardManager.loadTracker.creating"
      mode="create"
      :card="dto"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { DashPageHeader } from "~~/layouts/dashboard.vue";
import { Card, useCardEditorStore } from "~~/stores/card-editor.store";
import { useCardStore } from "~~/stores/card.store";

const header: DashPageHeader = {
  title: "Create a New Card",
  icon: "mdi-card-account-details-outline",
  canGoBack: true,
};

const dto = reactive<Card>({
  label: "Work",
  firstName: "Daniel",
  lastName: "dlc",
  jobTitle: "",
  company: "",
  color: Colors.greyLight,
  avatarImage: "",
  coverImage: "",
  links: [],
  useNativeIcons: false,
});
const cardManager = useCardStore();
const editorStore = useCardEditorStore();

const createCard = async () => {
  const form = editorStore.createForm();
  await cardManager.create(form);
};
</script>
