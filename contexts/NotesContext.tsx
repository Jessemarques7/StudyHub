"use client";

// import { createContext, useContext, ReactNode, useCallback } from "react";
// import { useLocalStorageState } from "@/hooks/useLocalStorageState";
// import { Note, NotesContextType } from "@/types/notes";

// const STORAGE_KEY = "notes";

// const initialNotes: Note[] = [
//   {
//     id: crypto.randomUUID(),
//     title: "My First Note",
//     content: [],
//     icon: "🗒️",
//     coverImage: "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
// ];

// const NotesContext = createContext<NotesContextType | null>(null);

// export function NotesProvider({ children }: { children: ReactNode }) {
//   const [notes, setNotes] = useLocalStorageState<Note[]>(
//     initialNotes,
//     STORAGE_KEY
//   );

//   const addNote = useCallback(
//     (noteData?: Partial<Note>): Note => {
//       const newNote: Note = {
//         id: crypto.randomUUID(),
//         title: noteData?.title || "Untitled",
//         icon: noteData?.icon || "🗒️",
//         coverImage: noteData?.coverImage || null,
//         content: noteData?.content || [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       setNotes((prev) => [...prev, newNote]);
//       return newNote;
//     },
//     [setNotes]
//   );

//   const updateNote = useCallback(
//     (id: string, updates: Partial<Note>) => {
//       setNotes((prev) =>
//         prev.map((note) =>
//           note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
//         )
//       );
//     },
//     [setNotes]
//   );

//   const deleteNote = useCallback(
//     (id: string) => {
//       setNotes((prev) => prev.filter((note) => note.id !== id));
//     },
//     [setNotes]
//   );

//   const getNote = useCallback(
//     (id: string): Note | undefined => {
//       return notes.find((note) => note.id === id);
//     },
//     [notes]
//   );

//   const value: NotesContextType = {
//     notes,
//     setNotes,
//     addNote,
//     updateNote,
//     deleteNote,
//     getNote,
//   };

//   return (
//     <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
//   );
// }

// export function useNotes(): NotesContextType {
//   const context = useContext(NotesContext);

//   if (!context) {
//     throw new Error("useNotes must be used within a NotesProvider");
//   }

//   return context;
// }

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
    coverImage: input.coverImage || null,
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
    coverImage: "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
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
