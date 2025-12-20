// import { Flashcard, Deck, StudyStats } from "@/types/flashcard";

// const STORAGE_KEYS = {
//   DECKS: "flashcards_decks",
//   CARDS: "flashcards_cards",
//   STATS: "flashcards_stats",
// };

// // Deck operations
// export function getAllDecks(): Deck[] {
//   const data = localStorage.getItem(STORAGE_KEYS.DECKS);
//   return data ? JSON.parse(data) : [];
// }

// export function saveDeck(deck: Deck): void {
//   const decks = getAllDecks();
//   const index = decks.findIndex((d) => d.id === deck.id);
//   if (index >= 0) {
//     decks[index] = deck;
//   } else {
//     decks.push(deck);
//   }
//   localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
// }

// export function deleteDeck(deckId: string): void {
//   const decks = getAllDecks().filter((d) => d.id !== deckId);
//   localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));

//   // Also delete all cards in this deck
//   const cards = getAllCards().filter((c) => c.deckId !== deckId);
//   localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
// }

// // Card operations
// export function getAllCards(): Flashcard[] {
//   const data = localStorage.getItem(STORAGE_KEYS.CARDS);
//   if (!data) return [];

//   const cards = JSON.parse(data);
//   return cards.map((card: any) => ({
//     ...card,
//     type: card.type || "regular", // Default to regular for existing cards
//     nextReview: new Date(card.nextReview),
//     createdAt: new Date(card.createdAt),
//     updatedAt: new Date(card.updatedAt),
//   }));
// }

// export function getCardsByDeck(deckId: string): Flashcard[] {
//   return getAllCards().filter((card) => card.deckId === deckId);
// }

// export function saveCard(card: Flashcard): void {
//   const cards = getAllCards();
//   const index = cards.findIndex((c) => c.id === card.id);
//   if (index >= 0) {
//     cards[index] = card;
//   } else {
//     cards.push(card);
//   }
//   localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
// }

// export function deleteCard(cardId: string): void {
//   const cards = getAllCards().filter((c) => c.id !== cardId);
//   localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
// }

// // Stats operations
// export function getStats(deckId: string): StudyStats | null {
//   const data = localStorage.getItem(STORAGE_KEYS.STATS);
//   if (!data) return null;

//   const allStats = JSON.parse(data);
//   return allStats[deckId] || null;
// }

// export function saveStats(stats: StudyStats): void {
//   const data = localStorage.getItem(STORAGE_KEYS.STATS);
//   const allStats = data ? JSON.parse(data) : {};
//   allStats[stats.deckId] = stats;
//   localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(allStats));
// }

import { supabase } from "@/lib/supabase";
import { Deck, Flashcard, StudyStats } from "@/types/flashcard";

// --- Helpers para tratar nomes de campo (camelCase vs snake_case) ---
// O Supabase retorna snake_case, mas seu front usa camelCase.
// Ajuste conforme necessário ou use alias na query.

export async function uploadMedia(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("flashcard-media")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading media:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("flashcard-media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// --- Decks ---

export async function getAllDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Mapeamento snake_case -> camelCase
  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at),
  }));
}

export async function saveDeck(deck: Deck): Promise<void> {
  const { error } = await supabase.from("decks").upsert({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    updated_at: new Date().toISOString(),
    // created_at é gerado automaticamente no insert, ou mantido no update se omitido
  });

  if (error) throw error;
}

export async function deleteDeck(deckId: string): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) throw error;
}

// --- Cards ---

export async function getCardsByDeck(deckId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId);

  if (error) throw error;

  return data.map((c: any) => ({
    id: c.id,
    deckId: c.deck_id,
    type: c.type,
    front: c.front,
    back: c.back,
    imageUrl: c.image_url,
    audioUrl: c.audio_url,
    backImageUrl: c.back_image_url,
    backAudioUrl: c.back_audio_url,
    multipleChoiceOptions: c.multiple_choice_options,
    tags: c.tags || [],
    easeFactor: c.ease_factor,
    interval: c.interval_days,
    repetitions: c.repetitions,
    nextReview: new Date(c.next_review),
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  }));
}

export async function saveCard(card: Flashcard): Promise<void> {
  const payload = {
    id: card.id,
    deck_id: card.deckId,
    type: card.type,
    front: card.front,
    back: card.back,
    image_url: card.imageUrl,
    audio_url: card.audioUrl,
    back_image_url: card.backImageUrl,
    back_audio_url: card.backAudioUrl,
    multiple_choice_options: card.multipleChoiceOptions,
    tags: card.tags,
    ease_factor: card.easeFactor,
    interval_days: card.interval,
    repetitions: card.repetitions,
    next_review: card.nextReview.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("flashcards").upsert(payload);

  if (error) throw error;
}

export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase.from("flashcards").delete().eq("id", cardId);

  if (error) throw error;
}
