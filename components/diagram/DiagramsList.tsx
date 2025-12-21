// components/diagram/DiagramsList.tsx
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
  IconSitemap,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/aceternity-sidebar";
import { useDiagrams } from "@/contexts/DiagramsContext";
import { Diagram } from "@/types/diagrams";

export default function DiagramsList({
  opensidebar,
}: {
  opensidebar: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    diagrams,
    folders,
    addDiagram,
    deleteDiagram,
    updateDiagram,
    addFolder,
    deleteFolder,
    updateFolder,
  } = useDiagrams();
  const { open } = useSidebar();

  const [listOpen, setListOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [editingType, setEditingType] = useState<"diagram" | "folder" | null>(
    null
  );
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const currentDiagramId = useMemo(() => {
    const parts = pathname.split("/");
    // Verifica se estamos na rota de diagrama para destacar
    if (parts.includes("diagram")) {
      return parts[parts.length - 1];
    }
    return null;
  }, [pathname]);

  const handleCreateNewDiagram = useCallback(
    async (folderId?: string) => {
      try {
        const newDiagram = await addDiagram({ title: "New Diagram", folderId });
        if (folderId) {
          setOpenFolders((prev) => ({ ...prev, [folderId]: true }));
        }
        router.push(`/diagram/${newDiagram.id}`);
      } catch (e) {
        console.error("Failed to create diagram", e);
      }
    },
    [addDiagram, router]
  );

  const handleCreateFolder = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addFolder("New Folder");
    },
    [addFolder]
  );

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleStartEditing = useCallback(
    (
      e: React.MouseEvent,
      id: string,
      title: string,
      type: "diagram" | "folder"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingId(id);
      setEditingType(type);
      setTempTitle(title);
    },
    []
  );

  const handleSaveRename = useCallback(async () => {
    if (!editingId || !editingType) return;
    const trimmed = tempTitle.trim();
    if (trimmed !== "") {
      if (editingType === "diagram") {
        await updateDiagram(editingId, { title: trimmed });
      } else {
        await updateFolder(editingId, trimmed);
      }
    }
    setEditingId(null);
    setEditingType(null);
  }, [editingId, editingType, tempTitle, updateDiagram, updateFolder]);

  const handleDeleteItem = useCallback(
    async (e: React.MouseEvent, id: string, type: "diagram" | "folder") => {
      e.preventDefault();
      e.stopPropagation();
      if (type === "diagram") {
        await deleteDiagram(id);
        if (id === currentDiagramId) router.push("/diagram");
      } else {
        if (confirm("Delete folder?")) await deleteFolder(id);
      }
    },
    [deleteDiagram, deleteFolder, currentDiagramId, router]
  );

  const renderDiagramItem = (diagram: Diagram) => (
    <div
      key={diagram.id}
      className="relative group pl-2"
      onMouseEnter={() => setHoveredItemId(diagram.id)}
      onMouseLeave={() => setHoveredItemId(null)}
    >
      {editingId === diagram.id && editingType === "diagram" ? (
        <input
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleSaveRename}
          onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
          autoFocus
          className="w-full bg-transparent border-b border-blue-500 focus:outline-none text-sm px-2 py-1.5 text-neutral-200"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Link
          href={`/diagram/${diagram.id}`}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all",
            currentDiagramId === diagram.id
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "hover:bg-neutral-200 dark:hover:bg-blue-900/30 text-neutral-700 dark:text-neutral-200"
          )}
        >
          <IconSitemap className="h-4 w-4 shrink-0" />
          <motion.span
            animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
            className="text-sm truncate flex-1 whitespace-nowrap overflow-hidden"
          >
            {diagram.title}
          </motion.span>
          <motion.div
            animate={{ opacity: open && hoveredItemId === diagram.id ? 1 : 0 }}
            className="flex items-center gap-1"
          >
            <button
              onClick={(e) =>
                handleStartEditing(e, diagram.id, diagram.title, "diagram")
              }
              className="p-1 hover:bg-neutral-600 rounded"
            >
              <IconEdit className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => handleDeleteItem(e, diagram.id, "diagram")}
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
    if (!open) setListOpen(false);
  }, [open]);

  return (
    <div className="flex-1 ">
      <div className="">
        <div className="flex items-center justify-between w-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-blue-900/30 rounded-md px-2 py-2 transition-colors group">
          <button
            onClick={() => setListOpen(!listOpen)}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <motion.div
              animate={{ rotate: listOpen ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronDown className="h-4 w-4" />
            </motion.div>
            <motion.span
              animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              Diagrams
            </motion.span>
          </button>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-neutral-600 rounded"
            >
              <IconFolderPlus className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => handleCreateNewDiagram()}
              className="p-1 hover:bg-neutral-600 rounded"
            >
              <IconPlus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: listOpen ? "auto" : 0, opacity: listOpen ? 1 : 0 }}
        className="overflow-hidden space-y-1"
      >
        {folders.map((folder) => {
          const isFolderOpen = openFolders[folder.id];
          const folderDiagrams = diagrams.filter(
            (d) => d.folderId === folder.id
          );

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
                        className={cn("h-3 w-3", !isFolderOpen && "-rotate-90")}
                      />
                      <IconFolder className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-sm truncate">{folder.name}</span>
                    </div>
                    <div
                      className={cn(
                        "flex gap-1",
                        open && hoveredItemId === folder.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateNewDiagram(folder.id);
                        }}
                        className="p-1 hover:bg-neutral-600 rounded"
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
              <AnimatePresence>
                {isFolderOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-2 border-l border-neutral-800"
                  >
                    {folderDiagrams.length === 0 ? (
                      <div className="px-4 py-1 text-xs text-neutral-500 italic">
                        Empty
                      </div>
                    ) : (
                      folderDiagrams.map(renderDiagramItem)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <div className="mt-1">
          {diagrams.filter((d) => !d.folderId).map(renderDiagramItem)}
        </div>
      </motion.div>
    </div>
  );
}
