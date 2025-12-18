// components/notes/NotesList.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconPlus,
  IconEdit,
  IconTrash,
  IconFolder,
  IconFolderPlus,
  IconFilePlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useNotes } from "@/contexts/NotesContext";
import { useSidebar } from "@/components/ui/aceternity-sidebar";
import { Note, Folder } from "@/types/notes";

export default function NotesList({ opensidebar }: { opensidebar: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    notes,
    folders,
    addNote,
    deleteNote,
    updateNote,
    addFolder,
    deleteFolder,
    updateFolder,
  } = useNotes();
  const { open } = useSidebar();

  const [notesOpen, setNotesOpen] = useState(true); // Default open

  // Estados de edição de nomes (notas e pastas)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [editingType, setEditingType] = useState<"note" | "folder" | null>(
    null
  );

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Estado para pastas abertas/fechadas
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const currentNoteId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  // --- Handlers de Criação ---

  const handleCreateNewNote = useCallback(
    (folderId?: string) => {
      const newNote = addNote({ title: "New Note", folderId });
      // Abrir a pasta se a nota foi criada dentro dela
      if (folderId) {
        setOpenFolders((prev) => ({ ...prev, [folderId]: true }));
      }
      router.push(`/notes/${newNote.id}`);
    },
    [addNote, router]
  );

  const handleCreateFolder = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addFolder("New Folder");
    },
    [addFolder]
  );

  // --- Handlers de Toggle ---

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // --- Handlers de Edição/Deleção Genéricos ---

  const handleStartEditing = useCallback(
    (
      e: React.MouseEvent,
      id: string,
      title: string,
      type: "note" | "folder"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingId(id);
      setEditingType(type);
      setTempTitle(title);
    },
    []
  );

  const handleSaveRename = useCallback(() => {
    if (!editingId || !editingType) return;
    const trimmed = tempTitle.trim();

    if (trimmed !== "") {
      if (editingType === "note") {
        updateNote(editingId, { title: trimmed });
      } else {
        updateFolder(editingId, trimmed);
      }
    }

    setEditingId(null);
    setEditingType(null);
  }, [editingId, editingType, tempTitle, updateNote, updateFolder]);

  const handleCancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingType(null);
    setTempTitle("");
  }, []);

  const handleDeleteItem = useCallback(
    (e: React.MouseEvent, id: string, type: "note" | "folder") => {
      e.preventDefault();
      e.stopPropagation();

      if (type === "note") {
        const updatedNotes = notes.filter((note) => note.id !== id);
        deleteNote(id);
        if (id === currentNoteId) {
          router.push(
            updatedNotes.length > 0 ? `/notes/${updatedNotes[0].id}` : "/notes"
          );
        }
      } else {
        if (confirm("Delete folder? Notes inside will be moved to root.")) {
          deleteFolder(id);
        }
      }
    },
    [notes, deleteNote, deleteFolder, currentNoteId, router]
  );

  // --- Renderização de Itens ---

  const renderNoteItem = (note: Note) => (
    <div
      key={note.id}
      className="relative group pl-2"
      onMouseEnter={() => setHoveredItemId(note.id)}
      onMouseLeave={() => setHoveredItemId(null)}
    >
      {editingId === note.id && editingType === "note" ? (
        <input
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleSaveRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveRename();
            if (e.key === "Escape") handleCancelEditing();
          }}
          autoFocus
          className="w-full bg-transparent border-b border-blue-500 focus:outline-none text-sm px-2 py-1.5 text-neutral-200"
          onClick={(e) => e.stopPropagation()}
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
          <span className="h-4 w-4 text-xs flex items-center justify-center flex-shrink-0">
            {note.icon || "📄"}
          </span>
          <motion.span
            animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
            className="text-sm truncate flex-1 whitespace-nowrap overflow-hidden"
          >
            {note.title}
          </motion.span>

          {/* Menu de Ações da Nota */}
          <motion.div
            animate={{
              opacity: open && hoveredItemId === note.id ? 1 : 0,
              width: "auto",
            }}
            className="flex items-center gap-1"
          >
            <button
              onClick={(e) =>
                handleStartEditing(e, note.id, note.title, "note")
              }
              className="p-1 hover:bg-neutral-600 rounded"
            >
              <IconEdit className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => handleDeleteItem(e, note.id, "note")}
              className="p-1 hover:bg-red-900/30 text-red-400 rounded"
            >
              <IconTrash className="h-3 w-3" />
            </button>
          </motion.div>
        </Link>
      )}
    </div>
  );

  useEffect(() => {
    if (!open) setNotesOpen(false);
  }, [open]);

  return (
    <div className="flex-1">
      {/* Header Principal */}
      <div className="mb-2">
        <div className="flex items-center justify-between w-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-blue-900/30 rounded-md px-2 py-2 transition-colors group">
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <motion.div
              animate={{ rotate: notesOpen ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronDown className="h-4 w-4" />
            </motion.div>
            <motion.span
              animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              Notes
            </motion.span>
          </button>

          {/* Botões de Ação Global (Nova Nota / Nova Pasta) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white"
              title="New Folder"
            >
              <IconFolderPlus className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => handleCreateNewNote()}
              className="p-1 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white"
              title="New Note"
            >
              <IconPlus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Lista de Pastas e Notas */}
      <motion.div
        initial={false}
        animate={{ height: notesOpen ? "auto" : 0, opacity: notesOpen ? 1 : 0 }}
        className="overflow-hidden space-y-1"
      >
        {/* Renderizar Pastas */}
        {folders.map((folder) => {
          const isFolderOpen = openFolders[folder.id];
          const folderNotes = notes.filter((n) => n.folderId === folder.id);

          return (
            <div key={folder.id} className="relative">
              <div
                className="group flex items-center justify-between px-2 py-1.5 hover:bg-neutral-200 dark:hover:bg-blue-900/20 rounded-md cursor-pointer text-neutral-600 dark:text-neutral-300"
                onMouseEnter={() => setHoveredItemId(folder.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => toggleFolder(folder.id)}
              >
                {editingId === folder.id && editingType === "folder" ? (
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSaveRename}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent border-b border-blue-500 text-sm focus:outline-none"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <IconChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          !isFolderOpen && "-rotate-90"
                        )}
                      />
                      <IconFolder className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-sm truncate">{folder.name}</span>
                    </div>

                    {/* Ações da Pasta */}
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        open && hoveredItemId === folder.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateNewNote(folder.id);
                        }}
                        className="p-1 hover:bg-neutral-600 rounded"
                        title="Add Note to Folder"
                      >
                        <IconPlus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) =>
                          handleStartEditing(
                            e,
                            folder.id,
                            folder.name,
                            "folder"
                          )
                        }
                        className="p-1 hover:bg-neutral-600 rounded"
                      >
                        <IconEdit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteItem(e, folder.id, "folder")
                        }
                        className="p-1 hover:bg-red-900/30 text-red-400 rounded"
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Conteúdo da Pasta */}
              <AnimatePresence>
                {isFolderOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-2 border-l border-neutral-800"
                  >
                    {folderNotes.length === 0 ? (
                      <div className="px-4 py-1 text-xs text-neutral-500 italic">
                        Empty
                      </div>
                    ) : (
                      folderNotes.map(renderNoteItem)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Renderizar Notas "Órfãs" (Sem pasta) */}
        <div className="mt-1">
          {notes.filter((n) => !n.folderId).map(renderNoteItem)}
        </div>

        {notes.length === 0 && folders.length === 0 && (
          <div className="px-2 py-4 text-sm text-neutral-500 text-center">
            No notes or folders
          </div>
        )}
      </motion.div>
    </div>
  );
}
