<template>
  <NuxtLayout name="dashboard" :header="header">
    <!--Header-->
    <template #append>
      <v-tooltip text="Create a new Card" location="bottom">
        <template #activator="{ props }">
          <Icon
            class="mt-1"
            name="solar:add-circle-linear"
            size="32"
            v-bind="props"
            @click="goToCreateCardPage"
            style="cursor: pointer"
          />
        </template>
      </v-tooltip>
      <DeleteAction v-if="cardStore.cards.length > 0" />
    </template>
    <!--Content-->
    <v-card color="background" elevation="0" :max-width="maxWidth">
      <CardDemo v-if="!cardStore.cards.length" />
      <v-row no-gutters>
        <v-col
          cols="12"
          sm="7"
          md="5"
          lg="4"
          xl="3"
          v-for="card in cardStore.cards"
          :key="card.id"
        >
          <CardCover :card="card" mode="mini" :can-drag="false">
            <template #actions>
              <CardCoverMenu :card="card" @menu-clicked="selectCard" />
            </template>
          </CardCover>
        </v-col>
      </v-row>
    </v-card>
    <teleport to="body">
      <ConfirmDialog
        subtitle="This card will be permanently deleted and cannot be restored."
        v-model="dialogHandler.show"
        :loading="cardStore.loadTracker.deletingById"
        default-action-title="Delete Card"
        @default-action="deleteCard"
      >
      </ConfirmDialog>
    </teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs";
import { CardDTO } from "~~/api/dtos/card.dto";
import { DashPageHeader } from "~~/layouts/dashboard.vue";
import { useCardStore } from "~~/stores/card.store";
import { useDialogStore } from "~~/stores/dialog-store";

const header: DashPageHeader = {
  title: "Cards",
  icon: "bi:person-workspace",
};

/**
 * Navigate to the create card page.
 */
const goToCreateCardPage = () => {
  navigateTo("/app/cards/create");
};

const { name } = useDisplay();

const maxWidth = computed(() => {
  switch (name.value) {
    case "xl":
      return 1400;
    case "lg":
      return 1100;
    case "md":
      return 900;
    default:
      return 1200;
  }
});

// We need to keep track of the active card manually because it will be passed to the ConfirmDialog.
// The confirm dialog has no idea of which card do we want to delete.
// Another solution would be to move the dialog to the v-for block but that could cause
// performance issues because it would create a new instance per card.
const activeCard = ref<CardDTO | null>(null);
const cardStore = useCardStore();
const dialogHandler = useDialogStore();

const selectCard = (card: CardDTO) => {
  activeCard.value = card;
};

const deleteCard = async () => {
  if (activeCard.value) {
    await cardStore.deleteById(activeCard.value.id);
    dialogHandler.close();
  }
};
</script>
