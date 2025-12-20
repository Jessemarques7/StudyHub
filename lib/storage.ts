import { supabase } from "@/lib/supabase";
import { Deck, Flashcard, StudyStats } from "@/types/flashcard";

// Agora aceita um bucket opcional, padrão 'flashcard-media' para não quebrar o código anterior
export async function uploadMedia(
  file: File,
  bucket: string = "flashcard-media"
): Promise<string | null> {
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

// ... (mantenha o restante das funções de Decks e Cards como estão)
export async function getAllDecks(): Promise<Deck[]> {
  // ... código existente ...
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

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
