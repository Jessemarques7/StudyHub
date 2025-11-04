"use client";

import { useLocalStorageState } from "@/hooks/useLocalStorageState";

import { createContext, useContext, ReactNode } from "react";

const initialNotes = [
  {
    id: crypto.randomUUID(),
    title: "My First Note",
    content: [
      {},
      // {
      //   id: crypto.randomUUID(),
      //   type: "paragraph",
      //   props: {
      //     backgroundColor: "default",
      //     textColor: "default",
      //     textAlignment: "left",
      //   },
      //   content: [
      //     {
      //       type: "text",
      //       text: "",
      //       styles: {},
      //     },
      //   ],
      //   children: [],
      // },
    ],
  },
];

export const NotesContext = createContext();

function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorageState(initialNotes, "Notes");

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }

  return context;
}

export { NotesProvider, useNotes };
