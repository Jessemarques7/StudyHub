"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { Block } from "@blocknote/core";
import Blocknote from "./Blocknote";
import { NoteHeader } from "./NoteHeader";
import { NoteTitleInput } from "./NoteTitleInput";

export default function Editor() {
  const params = useParams<{ noteid: string }>();
  const { notes, updateNote, getNote } = useNotes();

  const currentNote = useMemo(
    () => getNote(params.noteid),
    [params.noteid, getNote]
  );

  const [title, setTitle] = useState("");

  // Sincroniza o título quando a nota muda
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
    }
  }, [currentNote?.id]);

  const handleUpdateContent = useCallback(
    (updatedContent: Block[]) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { content: updatedContent });
    },
    [params.noteid, updateNote]
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleTitleSave = useCallback(() => {
    if (!params.noteid || !title.trim()) return;
    updateNote(params.noteid, { title: title.trim() });
  }, [params.noteid, title, updateNote]);

  const handleIconUpdate = useCallback(
    (icon: string | null) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { icon });
    },
    [params.noteid, updateNote]
  );

  const handleCoverUpdate = useCallback(
    (coverImage: string | null) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { coverImage });
    },
    [params.noteid, updateNote]
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
    <div className="flex flex-1 flex-col h-full bg-slate-950">
      {/* Container de Scroll Único para Header e Conteúdo */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* Header agora faz parte do fluxo, garantindo largura total correta */}
        <NoteHeader
          note={currentNote}
          onIconUpdate={handleIconUpdate}
          onCoverUpdate={handleCoverUpdate}
        />

        {/* Wrapper do Conteúdo: Aqui aplicamos o padding e centralização */}
        <div className="w-full flex justify-center p-2 md:px-10 md:py-6">
          <div className="w-full min-h-[70vh] max-w-[770px]">
            <NoteTitleInput
              value={title}
              onChange={handleTitleChange}
              onSave={handleTitleSave}
            />

            {/* CORREÇÃO CRÍTICA: key={currentNote.id} força o editor a reiniciar ao trocar de nota */}
            <Blocknote
              key={currentNote.id}
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
