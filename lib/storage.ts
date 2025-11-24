import { Flashcard, Deck, StudyStats } from "@/types/flashcard";

const STORAGE_KEYS = {
  DECKS: "flashcards_decks",
  CARDS: "flashcards_cards",
  STATS: "flashcards_stats",
};

// Deck operations
export function getAllDecks(): Deck[] {
  const data = localStorage.getItem(STORAGE_KEYS.DECKS);
  return data ? JSON.parse(data) : [];
}

export function saveDeck(deck: Deck): void {
  const decks = getAllDecks();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
}

export function deleteDeck(deckId: string): void {
  const decks = getAllDecks().filter((d) => d.id !== deckId);
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  
  // Also delete all cards in this deck
  const cards = getAllCards().filter((c) => c.deckId !== deckId);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

// Card operations
export function getAllCards(): Flashcard[] {
  const data = localStorage.getItem(STORAGE_KEYS.CARDS);
  if (!data) return [];
  
  const cards = JSON.parse(data);
  return cards.map((card: any) => ({
    ...card,
    type: card.type || "regular", // Default to regular for existing cards
    nextReview: new Date(card.nextReview),
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
  }));
}

export function getCardsByDeck(deckId: string): Flashcard[] {
  return getAllCards().filter((card) => card.deckId === deckId);
}

export function saveCard(card: Flashcard): void {
  const cards = getAllCards();
  const index = cards.findIndex((c) => c.id === card.id);
  if (index >= 0) {
    cards[index] = card;
  } else {
    cards.push(card);
  }
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

export function deleteCard(cardId: string): void {
  const cards = getAllCards().filter((c) => c.id !== cardId);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

// Stats operations
export function getStats(deckId: string): StudyStats | null {
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  if (!data) return null;
  
  const allStats = JSON.parse(data);
  return allStats[deckId] || null;
}

export function saveStats(stats: StudyStats): void {
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  const allStats = data ? JSON.parse(data) : {};
  allStats[stats.deckId] = stats;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(allStats));
}
