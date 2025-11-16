"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconNotes,
  IconChevronDown,
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useNotes } from "@/contexts/NotesContext";
import {
  Sidebar,
  SidebarBody,
  useSidebar,
} from "@/components/ui/aceternity-sidebar";

export function AppSidebarAceternity() {
  const router = useRouter();
  const pathname = usePathname();
  const { notes, addNote, deleteNote, updateNote } = useNotes();
  const { open } = useSidebar();

  const [notesOpen, setNotesOpen] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  // Pega o ID da nota atual da URL
  const currentNoteId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  // Cria uma nova nota
  const handleCreateNewNote = useCallback(() => {
    const newNote = addNote({ title: "New Note" });
    router.push(`/notes/${newNote.id}`);
  }, [addNote, router]);

  // Deleta uma nota
  const handleDeleteNote = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const updatedNotes = notes.filter((note) => note.id !== noteId);
      deleteNote(noteId);

      if (noteId === currentNoteId) {
        if (updatedNotes.length > 0) {
          router.push(`/notes/${updatedNotes[0].id}`);
        } else {
          router.push("/notes");
        }
      }
    },
    [notes, deleteNote, currentNoteId, router]
  );

  // Inicia edição do título
  const handleStartEditing = useCallback(
    (e: React.MouseEvent, noteId: string, currentTitle: string) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingNoteId(noteId);
      setTempTitle(currentTitle);
    },
    []
  );

  // Salva o novo título
  const handleSaveRename = useCallback(
    (noteId: string) => {
      const trimmedTitle = tempTitle.trim();
      if (trimmedTitle === "") {
        setEditingNoteId(null);
        return;
      }

      updateNote(noteId, { title: trimmedTitle });
      setEditingNoteId(null);
    },
    [tempTitle, updateNote]
  );

  // Cancela edição
  const handleCancelEditing = useCallback(() => {
    setEditingNoteId(null);
    setTempTitle("");
  }, []);

  // Manipula teclas no input de edição
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, noteId: string) => {
      if (e.key === "Enter") {
        handleSaveRename(noteId);
      } else if (e.key === "Escape") {
        handleCancelEditing();
      }
    },
    [handleSaveRename, handleCancelEditing]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo/Header */}
      {/* <div className="flex items-center justify-center px-3 py-4">
        <div className="flex items-center gap-2">
          <IconNotes className="h-6 w-6 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
          <motion.span
            animate={{
              opacity: open ? 1 : 0,
              width: open ? "auto" : 0,
            }}
            className="font-bold text-neutral-700 dark:text-neutral-200 whitespace-nowrap overflow-hidden"
          >
            My Notes
          </motion.span>
        </div>
      </div> */}

      {/* Notes Section */}
      <div className="flex-1 overflow-y-auto px-4.5 py-4">
        {/* Notes Header with Collapsible */}
        <div className="mb-2">
          <div className="flex items-center justify-between w-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md px-2 py-2 transition-colors">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <motion.div
                animate={{ rotate: notesOpen ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <IconChevronDown className=" h-4 w-4" />
              </motion.div>
              <motion.span
                animate={{
                  opacity: open ? 1 : 0,
                  width: open ? "auto" : 0,
                }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Notes
              </motion.span>
            </button>
            <motion.button
              animate={{
                opacity: open ? 1 : 0,
                width: open ? "auto" : 0,
                scale: open ? 1 : 0,
              }}
              onClick={handleCreateNewNote}
              className="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded transition-colors flex-shrink-0"
              aria-label="Create New Note"
              style={{ overflow: "hidden" }}
            >
              <IconPlus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Notes List */}
        <motion.div
          initial={false}
          animate={{
            height: notesOpen ? "auto" : 0,
            opacity: notesOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {notes.length === 0 ? (
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "block" : "none",
              }}
              className="px-2 py-4 text-sm text-neutral-500 dark:text-neutral-400 text-center"
            >
              No notes yet
            </motion.div>
          ) : (
            <div className="space-y-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredNoteId(note.id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                >
                  {editingNoteId === note.id ? (
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={() => handleSaveRename(note.id)}
                      onKeyDown={(e) => handleKeyDown(e, note.id)}
                      autoFocus
                      className="w-full bg-transparent border-b border-neutral-400 dark:border-neutral-500 focus:outline-none focus:border-blue-500 text-sm px-2 py-1.5 text-neutral-700 dark:text-neutral-200"
                      aria-label="Edit note title"
                    />
                  ) : (
                    <Link
                      href={`/notes/${note.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group/note",
                        currentNoteId === note.id
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "hover:bg-neutral-200 dark:hover:bg-blue-900/30 text-neutral-700 dark:text-neutral-200"
                      )}
                    >
                      <span className="h-4 w-4 text-neutral-700 dark:text-neutral-200 flex-shrink-0">
                        {note.icon}
                      </span>
                      <motion.span
                        animate={{
                          opacity: open ? 1 : 0,
                          width: open ? "auto" : 0,
                        }}
                        className="text-sm truncate flex-1 whitespace-nowrap overflow-hidden"
                      >
                        {note.title}
                      </motion.span>

                      {/* Actions Menu */}
                      <motion.div
                        animate={{
                          opacity: open && hoveredNoteId === note.id ? 1 : 0,
                          width: open && hoveredNoteId === note.id ? "auto" : 0,
                        }}
                        className="flex items-center gap-1 overflow-hidden"
                      >
                        <button
                          onClick={(e) =>
                            handleStartEditing(e, note.id, note.title)
                          }
                          className="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded transition-opacity flex-shrink-0"
                          aria-label="Edit note"
                        >
                          <IconEdit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(e, note.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-all flex-shrink-0"
                          aria-label="Delete note"
                        >
                          <IconTrash className="h-3 w-3" />
                        </button>
                      </motion.div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden ">
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10">
          <AppSidebarAceternity />
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
