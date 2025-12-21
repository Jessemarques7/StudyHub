// components/notes/Editor.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { Block } from "@blocknote/core";
import Blocknote from "./Blocknote";
import { NoteHeader } from "./NoteHeader";
import { NoteTitleInput } from "./NoteTitleInput";
import { debounce } from "lodash";

export default function Editor() {
  const params = useParams<{ noteid: string }>();
  const { notes, updateNote, getNote } = useNotes();

  // Otimização: Memoizar a nota atual para evitar recálculos excessivos
  const currentNote = useMemo(
    () => getNote(params.noteid),
    [params.noteid, getNote]
  );

  const [title, setTitle] = useState("");

  // Sincroniza estado local do título apenas quando a nota muda de fato
  useEffect(() => {
    if (currentNote) setTitle(currentNote.title);
  }, [currentNote?.id, currentNote?.title]);

  // Debounce para o conteúdo (evita salvar a cada letra digitada)
  const debouncedUpdateContent = useMemo(
    () =>
      debounce((noteId: string, content: Block[]) => {
        updateNote(noteId, { content });
      }, 1000),
    [updateNote]
  );

  const handleUpdateContent = useCallback(
    (updatedContent: Block[]) => {
      if (!params.noteid) return;
      debouncedUpdateContent(params.noteid, updatedContent);
    },
    [params.noteid, debouncedUpdateContent]
  );

  // Manipulador para salvar o título (passado para o onSave do input)
  const handleTitleSave = useCallback(() => {
    if (params.noteid && title.trim() !== currentNote?.title) {
      updateNote(params.noteid, { title: title.trim() });
    }
  }, [params.noteid, title, currentNote?.title, updateNote]);

  const handleTitleChange = (newTitle: string) => setTitle(newTitle);

  const handleIconUpdate = useCallback(
    (icon: string | null) => {
      if (params.noteid) updateNote(params.noteid, { icon });
    },
    [params.noteid, updateNote]
  );

  const handleCoverUpdate = useCallback(
    (coverImage: string | null) => {
      if (params.noteid) updateNote(params.noteid, { coverImage });
    },
    [params.noteid, updateNote]
  );

  if (!currentNote)
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        No note selected
      </div>
    );

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <NoteHeader
          note={currentNote}
          onIconUpdate={handleIconUpdate}
          onCoverUpdate={handleCoverUpdate}
        />

        <div className="w-full flex justify-center p-2 md:px-10 md:py-6">
          <div className="w-full min-h-[70vh] max-w-[770px]">
            <NoteTitleInput
              value={title}
              onChange={handleTitleChange}
              onSave={handleTitleSave} // <--- CORREÇÃO: Usando onSave, não onBlur
            />

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
