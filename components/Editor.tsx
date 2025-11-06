"use client";

import { useNotes } from "@/contexts/NotesContext";
import Blocknote from "./Blocknote";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Block } from "@blocknote/core";

export default function Editor() {
  const params = useParams<{ noteid: string }>();
  const { notes, updateNote, getNote } = useNotes();

  const currentNote = useMemo(
    () => getNote(params.noteid),
    [params.noteid, getNote]
  );

  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Sincroniza o título quando a nota muda
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
    }
  }, [currentNote]);

  // Atualiza o conteúdo da nota
  const handleUpdateContent = useCallback(
    (updatedContent: Block[]) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { content: updatedContent });
    },
    [params.noteid, updateNote]
  );

  // Atualiza o título da nota
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
    },
    []
  );

  // Salva o título quando perde o foco
  const handleTitleBlur = useCallback(() => {
    if (!params.noteid || !title.trim()) return;
    updateNote(params.noteid, { title: title.trim() });
    setIsEditing(false);
  }, [params.noteid, title, updateNote]);

  // Salva o título ao pressionar Enter
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        setTitle(currentNote?.title || "");
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [currentNote]
  );

  if (!currentNote) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            No note selected
          </h2>
          <p className="text-gray-500">
            Select a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-col rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden">
        {/* Header com gradiente */}
        <div className="h-[25vh] bg-gradient-to-r from-green-300 via-blue-500 to-purple-600" />

        {/* Conteúdo do editor */}
        <div className="flex-1 overflow-auto p-2 md:px-10 md:py-6 flex items-start justify-center dark:bg-neutral-900">
          <div className="w-full max-w-[770px]">
            {/* Input do título */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              onFocus={() => setIsEditing(true)}
              placeholder="Untitled"
              aria-label="Note title"
              className="w-full px-[54px] mb-4 text-gray-50 text-5xl font-bold bg-transparent border-none outline-none placeholder:text-gray-400 focus:placeholder:text-gray-500 transition-colors"
            />

            {/* Editor de conteúdo */}
            <Blocknote
              onUpdateNote={handleUpdateContent}
              currentNote={currentNote}
              notes={notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
