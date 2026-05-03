import { Database } from "./supabase";

export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type FolderRow = Database["public"]["Tables"]["folders"]["Row"];
export type DeckRow = Database["public"]["Tables"]["decks"]["Row"];
export type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
export type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
export type DiagramRow = Database["public"]["Tables"]["diagrams"]["Row"];
export type DiagramFolderRow =
  Database["public"]["Tables"]["diagram_folders"]["Row"];
