// types/notes.ts
import { Block } from "@blocknote/core";

export interface Note {
  id: string;
  title: string;
  content: Block[];
  icon?: string | null; // Adicionado
  coverImage?: string | null; // Adicionado
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (note?: Partial<Note>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
}

export interface MentionProps {
  note: {
    id: string;
    title: string;
    content?: Block[];
  };
}

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
