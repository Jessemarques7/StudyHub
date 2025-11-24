"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorageState";
import {
  Note,
  NotesContextValue,
  CreateNoteInput,
  UpdateNoteInput,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
} from "@/types/notes";

const STORAGE_KEY = "notes-v1"; // Versionado para facilitar migrações

const NotesContext = createContext<NotesContextValue | null>(null);

// Função helper para criar nova nota
function createNote(input: CreateNoteInput = {}): Note {
  return {
    id: crypto.randomUUID(),
    title: input.title || DEFAULT_NOTE_TITLE,
    icon: input.icon || DEFAULT_NOTE_ICON,
    coverImage:
      input.coverImage ||
      "bg-gradient-to-r from-gray-700 via-gray-900 to-black",
    content: input.content || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Nota inicial para novos usuários
const INITIAL_NOTES: Note[] = [
  createNote({
    title: "Welcome to Notes",
    icon: "👋",
    coverImage: "bg-gradient-to-r from-gray-700 via-gray-900 to-black",
  }),
];

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, INITIAL_NOTES);

  const addNote = useCallback(
    (input?: CreateNoteInput): Note => {
      const newNote = createNote(input);
      setNotes((prev) => [...prev, newNote]);
      return newNote;
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id: string, updates: UpdateNoteInput) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                ...updates,
                updatedAt: new Date(),
              }
            : note
        )
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    },
    [setNotes]
  );

  const getNote = useCallback(
    (id: string): Note | undefined => {
      return notes.find((note) => note.id === id);
    },
    [notes]
  );

  // Memoiza o valor do contexto para evitar re-renders desnecessários
  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      addNote,
      updateNote,
      deleteNote,
      getNote,
    }),
    [notes, addNote, updateNote, deleteNote, getNote]
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }

  return context;
}
