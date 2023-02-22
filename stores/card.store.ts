import { createCard, findAllByUser, deleteCard } from "~~/api";
import { CardDTO } from "~~/api/dtos/card.dto";
import { ViewState } from "~~/utils/view-state";

export const useCardStore = defineStore("user", () => {
  const cards: CardDTO[] = reactive([]);

  const create = async (card: CardDTO, screen: ViewState) => {
    const newCard = await screen.updateWith<CardDTO>(() => createCard(card));
    if (newCard.isJust) {
      cards.push(newCard.value);
      useRouter().replace("/app/cards");
    }
  };
  const fetchAll = async (screen: ViewState) => {
    const result = await screen.updateWith<CardDTO[]>(() => findAllByUser());
    if (result.isJust) {
      cards.splice(0, cards.length, ...result.value);
    }
  };
  const deleteById = async (id: string, screen: ViewState) => {
    const result = await screen.updateWith(() => deleteCard(id), false);
    if (result.isJust) {
      const newArray = cards.filter((entry) => entry.id !== id);
      cards.splice(0, cards.length, ...newArray);
    }
  };

  return {
    fetchAll,
    create,
    cards: readonly(cards),
    deleteById,
  };
});
