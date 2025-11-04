"use client";

import { useNotes } from "@/contexts/NotesContext";
import Blocknote from "./Blocknote";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Editor() {
  const params = useParams();
  const { notes, setNotes } = useNotes();
  const currentNote = notes.find((note) => note.id === params.noteid);

  const [title, setTitle] = useState(currentNote?.title || "");

  // Mantém o título sincronizado se trocar de nota
  useEffect(() => {
    setTitle(currentNote?.title || "");
  }, [currentNote]);

  function updateNote(updatedContent: any) {
    setNotes(
      notes.map((note) =>
        note.id === params.noteid ? { ...note, content: updatedContent } : note
      )
    );
  }

  // Atualiza o título da nota em tempo real
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);

    setNotes(
      notes.map((note) =>
        note.id === params.noteid ? { ...note, title: newTitle } : note
      )
    );
  }

  return (
    <div className="flex">
      <div className="flex h-full w-full flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden">
        <div className="h-[25vh] bg-gradient-to-r from-green-300 via-blue-500 to-purple-600" />
        <div className="p-2 md:px-10 md:py-6 flex items-center dark:bg-neutral-900 w-full justify-center">
          <div className="w-[770px]">
            {currentNote ? (
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled"
                className="w-full px-[54px] mb-4 text-gray-50 text-5xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300"
              />
            ) : (
              <h1 className="px-[54px] text-gray-50 text-5xl font-bold mb-4">
                New Note
              </h1>
            )}

            <Blocknote
              onUpdateNote={updateNote}
              currentNote={currentNote}
              notes={notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
