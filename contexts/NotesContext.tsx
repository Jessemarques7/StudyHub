// "use client";

// import { useLocalStorageState } from "@/hooks/useLocalStorageState";

// import { createContext, useContext, ReactNode } from "react";

// const initialNotes = [
//   {
//     id: crypto.randomUUID(),
//     title: "My First Note",
//     content: [
//       {},
//       // {
//       //   id: crypto.randomUUID(),
//       //   type: "paragraph",
//       //   props: {
//       //     backgroundColor: "default",
//       //     textColor: "default",
//       //     textAlignment: "left",
//       //   },
//       //   content: [
//       //     {
//       //       type: "text",
//       //       text: "",
//       //       styles: {},
//       //     },
//       //   ],
//       //   children: [],
//       // },
//     ],
//   },
// ];

// export const NotesContext = createContext();

// function NotesProvider({ children }: { children: ReactNode }) {
//   const [notes, setNotes] = useLocalStorageState(initialNotes, "Notes");

//   return (
//     <NotesContext.Provider value={{ notes, setNotes }}>
//       {children}
//     </NotesContext.Provider>
//   );
// }

// function useNotes() {
//   const context = useContext(NotesContext);

//   if (!context) {
//     throw new Error("useNotes must be used within a NotesProvider");
//   }

//   return context;
// }

// export { NotesProvider, useNotes };

"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { Note, NotesContextType } from "@/types/notes";

const STORAGE_KEY = "notes";

const initialNotes: Note[] = [
  {
    id: crypto.randomUUID(),
    title: "My First Note",
    content: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorageState<Note[]>(
    initialNotes,
    STORAGE_KEY
  );

  const addNote = useCallback(
    (noteData?: Partial<Note>): Note => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: noteData?.title || "Untitled",
        content: noteData?.content || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setNotes((prev) => [...prev, newNote]);
      return newNote;
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
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

  const value: NotesContextType = {
    notes,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    getNote,
  };

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes(): NotesContextType {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }

  return context;
}
