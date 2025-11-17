import { Block } from "@blocknote/core";

// Tipos base mais específicos
export interface Note {
  id: string;
  title: string;
  content: Block[];
  icon: string | null;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Input types separados dos tipos de dados
export interface CreateNoteInput {
  title?: string;
  content?: Block[];
  icon?: string;
  coverImage?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: Block[];
  icon?: string | null;
  coverImage?: string | null;
}

// Context types
export interface NotesContextValue {
  notes: Note[];
  addNote: (input?: CreateNoteInput) => Note;
  updateNote: (id: string, updates: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
}

// Graph types
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

// Mention types
export interface MentionNote {
  id: string;
  title: string;
}

export interface MentionProps {
  note: MentionNote;
}

// Constants
export const DEFAULT_NOTE_ICON = "🗒️";
export const DEFAULT_NOTE_TITLE = "Untitled";
export const MAX_ICON_FILE_SIZE = 1024 * 1024; // 1MB
export const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024; // 5MB
