// lib/storage.ts
import { createClient } from "@/utils/supabase/client";
import { Deck, Flashcard } from "@/types/flashcard";
import type { DeckRow, FlashcardRow } from "@/types/database";
import type { Json } from "@/types/supabase";

// Agora aceita um bucket opcional
export async function uploadMedia(
  file: File,
  bucket: string = "flashcard-media"
): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    console.error(`Error uploading media to ${bucket}:`, error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

// --- Decks ---

function mapDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapFlashcard(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    deckId: row.deck_id,
    type: row.type as Flashcard["type"],
    front: row.front,
    back: row.back,
    imageUrl: row.image_url ?? undefined,
    audioUrl: row.audio_url ?? undefined,
    backImageUrl: row.back_image_url ?? undefined,
    backAudioUrl: row.back_audio_url ?? undefined,
    multipleChoiceOptions:
      (row.multiple_choice_options as unknown as Flashcard["multipleChoiceOptions"]) ??
      undefined,
    tags: row.tags || [],
    easeFactor: row.ease_factor,
    interval: row.interval_days,
    repetitions: row.repetitions,
    nextReview: new Date(row.next_review),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function getAllDecks(): Promise<Deck[]> {
  const supabase = createClient();
  // 1. Obter usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. Filtrar decks do usuário
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", user.id) // FILTRO
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as DeckRow[]).map(mapDeck);
}

export async function saveDeck(deck: Deck): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase.from("decks").upsert({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    user_id: user.id, // VINCULA AO USUÁRIO
    updated_at: new Date().toISOString(),
    // created_at é gerado automaticamente ou mantido
  });

  if (error) throw error;
}

export async function deleteDeck(deckId: string): Promise<void> {
  const supabase = createClient();
  // Opcional: Adicionar .eq('user_id', user.id) para segurança extra
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) throw error;
}

// --- Cards ---

export async function getCardsByDeck(deckId: string): Promise<Flashcard[]> {
  const supabase = createClient();
  // Como os decks já são filtrados por usuário, quem tem o deckId tem acesso aos cards.
  // Se quiser segurança extra, verifique se o deck pertence ao usuário antes.
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId);

  if (error) throw error;

  return (data as FlashcardRow[]).map(mapFlashcard);
}

export async function getCardCountsByDeck(
  deckIds: string[],
): Promise<
  Record<
    string,
    { total: number; new: number; learning: number; review: number; due: number }
  >
> {
  if (deckIds.length === 0) {
    return {};
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("flashcards")
    .select("deck_id, next_review, repetitions, interval_days")
    .in("deck_id", deckIds);

  if (error) throw error;

  const now = new Date();
  return (data ?? []).reduce(
    (acc, card) => {
      if (!acc[card.deck_id]) {
        acc[card.deck_id] = {
          total: 0,
          new: 0,
          learning: 0,
          review: 0,
          due: 0,
        };
      }
      acc[card.deck_id].total++;
      if (card.repetitions === 0) {
        acc[card.deck_id].new++;
      } else if (card.interval_days < 21) {
        acc[card.deck_id].learning++;
      } else {
        acc[card.deck_id].review++;
      }
      if (new Date(card.next_review) <= now) acc[card.deck_id].due++;
      return acc;
    },
    {} as Record<
      string,
      {
        total: number;
        new: number;
        learning: number;
        review: number;
        due: number;
      }
    >,
  );
}

export async function saveCard(card: Flashcard): Promise<void> {
  const supabase = createClient();
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
    multiple_choice_options: card.multipleChoiceOptions as unknown as Json,
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
  const supabase = createClient();
  const { error } = await supabase.from("flashcards").delete().eq("id", cardId);

  if (error) throw error;
}
