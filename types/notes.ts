// types/notes.ts

import { Block } from "@blocknote/core";

// Adicionar interface para Pasta
export interface Folder {
  id: string;
  name: string;
  icon: string | null;
  parentId: string | null;
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
  icon?: string | null;
  coverImage?: string | null;
  folderId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: Block[];
  icon?: string | null;
  coverImage?: string | null;
  folderId?: string | null;
}

export interface NotesContextValue {
  notes: Note[];
  folders: Folder[]; // Novo estado exposto
  // addNote: (input?: CreateNoteInput) => Note;
  addNote: (input?: CreateNoteInput) => Promise<Note>; // Mudar para Promise
  updateNote: (id: string, updates: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  // Novas funções para pastas
  addFolder: (input?: string | CreateFolderInput) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, updates: string | UpdateFolderInput) => Promise<void>;
}

export interface CreateFolderInput {
  name?: string;
  icon?: string | null;
  parentId?: string | null;
}

export interface UpdateFolderInput {
  name?: string;
  icon?: string | null;
  parentId?: string | null;
}

// ... resto do arquivo (Graph types, etc) mantenha igual
export interface GraphNode {
  id: string;
  rawId: string;
  name: string;
  val: number;
  kind: "note" | "diagram";
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
  id: string;
  title: string;
  // note?: MentionNote; // Optional: Keep this if you need backward compatibility for old notes
}

export const DEFAULT_NOTE_ICON = "📘";
export const DEFAULT_NOTE_TITLE = "Untitled";
export const MAX_ICON_FILE_SIZE = 1024 * 1024;
export const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024;
