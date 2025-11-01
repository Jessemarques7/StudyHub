"use client";

import { useNotes } from "@/contexts/NotesContext";
import Blocknote from "./Blocknote";

import { useParams } from "next/navigation";

export default function Editor() {
  const params = useParams();

  const { notes, setNotes } = useNotes();
  const currentNote = notes.find((note) => note.id === params.noteid);

  function updateNote(updatedContent: any) {
    setNotes(
      notes.map((note) =>
        note.id === params.noteid
          ? {
              ...note,
              content: updatedContent,
            }
          : note
      )
    );
  }

  return (
    <div className="flex  ">
      <div className="flex h-full w-full flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden ">
        <div className=" h-[25vh] bg-gradient-to-r from-green-300 via-blue-500 to-purple-600" />
        <div className="p-2 md:px-10 md:py-6 flex items-center dark:bg-neutral-900 w-full justify-center">
          <div className=" w-[770px] ">
            <Blocknote onUpdateNote={updateNote} currentNote={currentNote} />
          </div>
        </div>
      </div>
    </div>
  );
}
