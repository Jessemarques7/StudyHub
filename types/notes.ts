// types/notes.ts

import { Block } from "@blocknote/core";

// Adicionar interface para Pasta
export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: Block[];
  icon: string | null;
  coverImage: string | null;
  folderId?: string | null; // Novo campo opcional
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  title?: string;
  content?: Block[];
  icon?: string;
  coverImage?: string;
  folderId?: string | null; // Adicionar ao input
}

export interface UpdateNoteInput {
  title?: string;
  content?: Block[];
  icon?: string | null;
  coverImage?: string | null;
  folderId?: string | null; // Adicionar ao input
}

export interface NotesContextValue {
  notes: Note[];
  folders: Folder[]; // Novo estado exposto
  addNote: (input?: CreateNoteInput) => Note;
  updateNote: (id: string, updates: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  // Novas funções para pastas
  addFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  updateFolder: (id: string, name: string) => void;
}

// ... resto do arquivo (Graph types, etc) mantenha igual
export interface GraphNode {
  id: string;
  name: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface MentionNote {
  id: string;
  title: string;
}

export interface MentionProps {
  note: MentionNote;
}

export const DEFAULT_NOTE_ICON = "📘";
export const DEFAULT_NOTE_TITLE = "Untitled";
export const MAX_ICON_FILE_SIZE = 1024 * 1024;
export const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024;
