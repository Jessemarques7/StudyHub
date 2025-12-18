// contexts/NotesContext.tsx
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
  Folder,
  NotesContextValue,
  CreateNoteInput,
  UpdateNoteInput,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
} from "@/types/notes";

const NOTES_STORAGE_KEY = "notes-v1";
const FOLDERS_STORAGE_KEY = "folders-v1";

const NotesContext = createContext<NotesContextValue | null>(null);

// Função helper para criar nova nota (usada apenas em interações do utilizador)
function createNote(input: CreateNoteInput = {}): Note {
  return {
    id: crypto.randomUUID(),
    title: input.title || DEFAULT_NOTE_TITLE,
    icon: input.icon || DEFAULT_NOTE_ICON,
    coverImage:
      input.coverImage ||
      "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
    content: input.content || [],
    folderId: input.folderId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// FIX: Nota inicial com ID e DATA estáticos para evitar Hydration Mismatch
const INITIAL_NOTES: Note[] = [
  {
    id: "welcome-note-static-id", // ID fixo
    title: "Welcome to Notes",
    icon: "👋",
    coverImage: "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
    content: [],
    folderId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"), // Data fixa
    updatedAt: new Date("2024-01-01T00:00:00.000Z"), // Data fixa
  },
];

export function NotesProvider({ children }: { children: ReactNode }) {
  // Inicializa com INITIAL_NOTES (estático) e depois hidrata com localStorage
  const [notes, setNotes] = useLocalStorage<Note[]>(
    NOTES_STORAGE_KEY,
    INITIAL_NOTES
  );
  const [folders, setFolders] = useLocalStorage<Folder[]>(
    FOLDERS_STORAGE_KEY,
    []
  );

  // --- Funções de Pasta ---
  const addFolder = useCallback(
    (name: string) => {
      const newFolder: Folder = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date(),
      };
      setFolders((prev) => [...prev, newFolder]);
    },
    [setFolders]
  );

  const deleteFolder = useCallback(
    (id: string) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.folderId === id ? { ...note, folderId: null } : note
        )
      );
      setFolders((prev) => prev.filter((f) => f.id !== id));
    },
    [setFolders, setNotes]
  );

  const updateFolder = useCallback(
    (id: string, name: string) => {
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    },
    [setFolders]
  );

  // --- Funções de Notas ---
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

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      folders,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      addFolder,
      deleteFolder,
      updateFolder,
    }),
    [
      notes,
      folders,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      addFolder,
      deleteFolder,
      updateFolder,
    ]
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
