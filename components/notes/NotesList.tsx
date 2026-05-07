// components/notes/NotesList.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconEdit,
  IconFileText,
  IconFolder,
  IconFolderPlus,
  IconMoodSmile,
  IconPlus,
  IconSitemap,
  IconTrash,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useNotes } from "@/contexts/NotesContext";
import { useDiagrams } from "@/contexts/DiagramsContext";
import type { Folder, Note } from "@/types/notes";
import type { Diagram } from "@/types/diagrams";

type WorkspaceItem =
  | {
      type: "note";
      id: string;
      title: string;
      folderId: string | null;
      updatedAt: Date;
      note: Note;
    }
  | {
      type: "diagram";
      id: string;
      title: string;
      folderId: string | null;
      updatedAt: Date;
      diagram: Diagram;
    };

type EditingType = WorkspaceItem["type"] | "folder";
type DragPayload = {
  type: EditingType;
  id: string;
};

interface NotesListProps {
  opensidebar: boolean;
  showActions?: boolean;
  searchQuery?: string;
}

const ROOT_FOLDER_ID = "__root__";
const DRAG_MIME = "application/x-studyhub-workspace-item";

export default function NotesList({
  opensidebar: _opensidebar,
  showActions = true,
  searchQuery = "",
}: NotesListProps) {
  void _opensidebar;

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
  const { diagrams, addDiagram, deleteDiagram, updateDiagram } = useDiagrams();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<EditingType | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const currentItem = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1] ?? null;

    if (parts.includes("notes") && id && id !== "notes") {
      return { type: "note" as const, id };
    }

    if (parts.includes("diagram") && id && id !== "diagram") {
      return { type: "diagram" as const, id };
    }

    return null;
  }, [pathname]);

  const folderIds = useMemo(
    () => new Set(folders.map((folder) => folder.id)),
    [folders],
  );

  const childFoldersByParent = useMemo(() => {
    const map = new Map<string, Folder[]>();

    folders.forEach((folder) => {
      const parentKey =
        folder.parentId && folderIds.has(folder.parentId)
          ? folder.parentId
          : ROOT_FOLDER_ID;
      const siblings = map.get(parentKey) ?? [];
      siblings.push(folder);
      map.set(parentKey, siblings);
    });

    map.forEach((siblings) =>
      siblings.sort((a, b) => a.name.localeCompare(b.name)),
    );

    return map;
  }, [folders, folderIds]);

  const workspaceItems = useMemo<WorkspaceItem[]>(
    () =>
      [
        ...notes.map((note) => ({
          type: "note" as const,
          id: note.id,
          title: note.title,
          folderId: note.folderId ?? null,
          updatedAt: note.updatedAt,
          note,
        })),
        ...diagrams.map((diagram) => ({
          type: "diagram" as const,
          id: diagram.id,
          title: diagram.title,
          folderId: diagram.folderId ?? null,
          updatedAt: diagram.updatedAt,
          diagram,
        })),
      ].filter((item) =>
        normalizedSearch
          ? item.title.toLowerCase().includes(normalizedSearch)
          : true,
      ),
    [notes, diagrams, normalizedSearch],
  );

  const itemsByFolder = useMemo(() => {
    const map = new Map<string, WorkspaceItem[]>();

    workspaceItems.forEach((item) => {
      const parentKey =
        item.folderId && folderIds.has(item.folderId)
          ? item.folderId
          : ROOT_FOLDER_ID;
      const siblings = map.get(parentKey) ?? [];
      siblings.push(item);
      map.set(parentKey, siblings);
    });

    map.forEach((siblings) =>
      siblings.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    );

    return map;
  }, [workspaceItems, folderIds]);

  const visibleFolderIds = useMemo(() => {
    if (!normalizedSearch) return new Set(folders.map((folder) => folder.id));

    const visible = new Set<string>();

    const folderHasVisibleContent = (folder: Folder): boolean => {
      const nameMatches = folder.name.toLowerCase().includes(normalizedSearch);
      const hasMatchingItems = (itemsByFolder.get(folder.id) ?? []).length > 0;
      const hasMatchingChildren = (childFoldersByParent.get(folder.id) ?? [])
        .map(folderHasVisibleContent)
        .some(Boolean);

      if (nameMatches || hasMatchingItems || hasMatchingChildren) {
        visible.add(folder.id);
        return true;
      }

      return false;
    };

    folders.forEach(folderHasVisibleContent);
    return visible;
  }, [folders, itemsByFolder, childFoldersByParent, normalizedSearch]);

  const currentFolderId = useMemo(() => {
    if (!currentItem) return null;

    if (currentItem.type === "note") {
      return notes.find((note) => note.id === currentItem.id)?.folderId ?? null;
    }

    return (
      diagrams.find((diagram) => diagram.id === currentItem.id)?.folderId ??
      null
    );
  }, [currentItem, notes, diagrams]);

  useEffect(() => {
    if (!currentFolderId) return;

    const foldersToOpen: Record<string, boolean> = {};
    let cursor = folders.find((folder) => folder.id === currentFolderId);

    while (cursor) {
      foldersToOpen[cursor.id] = true;
      cursor = folders.find((folder) => folder.id === cursor?.parentId);
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setOpenFolders((prev) => ({ ...prev, ...foldersToOpen }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentFolderId, folders]);

  useEffect(() => {
    if (!normalizedSearch) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setOpenFolders((prev) => {
          const next = { ...prev };
          visibleFolderIds.forEach((folderId) => {
            next[folderId] = true;
          });
          return next;
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedSearch, visibleFolderIds]);

  const setFolderOpen = (folderId: string, isOpen: boolean) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: isOpen }));
  };

  const handleCreateNewNote = useCallback(
    async (folderId?: string | null) => {
      try {
        const newNote = await addNote({
          title: "Untitled",
          folderId: folderId ?? null,
        });
        if (folderId) setFolderOpen(folderId, true);
        router.push(`/notes/${newNote.id}`);
      } catch (error) {
        console.error("Failed to create note:", error);
      }
    },
    [addNote, router],
  );

  const handleCreateNewDiagram = useCallback(
    async (folderId?: string | null) => {
      try {
        const newDiagram = await addDiagram({
          title: "Untitled Diagram",
          folderId: folderId ?? null,
        });
        if (folderId) setFolderOpen(folderId, true);
        router.push(`/diagram/${newDiagram.id}`);
      } catch (error) {
        console.error("Failed to create diagram:", error);
      }
    },
    [addDiagram, router],
  );

  const handleCreateFolder = useCallback(
    async (parentId?: string | null) => {
      const newFolder = await addFolder({
        name: "New Folder",
        parentId: parentId ?? null,
      });

      if (parentId) setFolderOpen(parentId, true);
      if (newFolder) setFolderOpen(newFolder.id, true);
    },
    [addFolder],
  );

  const handleStartEditing = useCallback(
    (id: string, title: string, type: EditingType) => {
      setEditingId(id);
      setEditingType(type);
      setTempTitle(title);
    },
    [],
  );

  const handleSaveRename = useCallback(async () => {
    if (!editingId || !editingType) return;
    const trimmed = tempTitle.trim();

    if (trimmed) {
      if (editingType === "note") {
        await updateNote(editingId, { title: trimmed });
      } else if (editingType === "diagram") {
        await updateDiagram(editingId, { title: trimmed });
      } else {
        await updateFolder(editingId, { name: trimmed });
      }
    }

    setEditingId(null);
    setEditingType(null);
    setTempTitle("");
  }, [
    editingId,
    editingType,
    tempTitle,
    updateNote,
    updateDiagram,
    updateFolder,
  ]);

  const handleCancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingType(null);
    setTempTitle("");
  }, []);

  const handleUpdateFolderIcon = useCallback(
    async (folder: Folder) => {
      const response = window.prompt(
        "Folder icon. Leave empty to remove.",
        folder.icon ?? "",
      );

      if (response === null) return;

      await updateFolder(folder.id, { icon: response.trim() || null });
    },
    [updateFolder],
  );

  const handleDeleteItem = useCallback(
    async (
      id: string,
      type: EditingType,
      parentId?: string | null,
    ) => {
      if (type === "note") {
        await deleteNote(id);
        if (currentItem?.type === "note" && currentItem.id === id) {
          router.push("/notes");
        }
        return;
      }

      if (type === "diagram") {
        await deleteDiagram(id);
        if (currentItem?.type === "diagram" && currentItem.id === id) {
          router.push("/notes");
        }
        return;
      }

      if (
        window.confirm(
          "Delete folder? Items inside it will move to the parent folder.",
        )
      ) {
        await deleteFolder(id);
        await Promise.all(
          diagrams
            .filter((diagram) => diagram.folderId === id)
            .map((diagram) =>
              updateDiagram(diagram.id, { folderId: parentId ?? null }),
            ),
        );
        setOpenFolders((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [
      currentItem,
      deleteNote,
      deleteDiagram,
      deleteFolder,
      diagrams,
      updateDiagram,
      router,
    ],
  );

  const getDragPayload = (event: React.DragEvent): DragPayload | null => {
    const rawData = event.dataTransfer.getData(DRAG_MIME);
    if (!rawData) return null;

    try {
      const payload = JSON.parse(rawData) as DragPayload;
      if (!payload.id || !payload.type) return null;
      return payload;
    } catch {
      return null;
    }
  };

  const handleDragStart = (event: React.DragEvent, payload: DragPayload) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    setDraggingKey(`${payload.type}:${payload.id}`);
  };

  const handleDragEnd = () => {
    setDraggingKey(null);
    setDropTargetId(null);
  };

  const handleDrop = async (
    event: React.DragEvent,
    targetFolderId: string | null,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTargetId(null);

    const payload = getDragPayload(event);
    if (!payload) return;

    if (payload.type === "note") {
      await updateNote(payload.id, { folderId: targetFolderId });
    } else if (payload.type === "diagram") {
      await updateDiagram(payload.id, { folderId: targetFolderId });
    } else {
      if (payload.id === targetFolderId) return;
      await updateFolder(payload.id, { parentId: targetFolderId });
    }

    if (targetFolderId) setFolderOpen(targetFolderId, true);
  };

  const handleDragOver = (
    event: React.DragEvent,
    targetFolderId: string | null,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(targetFolderId ?? ROOT_FOLDER_ID);
  };

  const renderFolderIcon = (folder: Folder) => {
    if (!folder.icon) {
      return <IconFolder className="h-4 w-4 text-complement" />;
    }

    if (folder.icon.startsWith("data:") || folder.icon.startsWith("http")) {
      return (
        <img
          src={folder.icon}
          alt=""
          className="h-5 w-5 rounded-sm object-cover"
        />
      );
    }

    return <span className="text-base leading-none">{folder.icon}</span>;
  };

  const renderNoteIcon = (note: Note) => {
    if (!note.icon) {
      return <IconFileText className="h-4 w-4" />;
    }

    if (note.icon.startsWith("data:") || note.icon.startsWith("http")) {
      return (
        <img src={note.icon} alt="" className="h-5 w-5 rounded object-cover" />
      );
    }

    return <span className="text-base leading-none">{note.icon}</span>;
  };

  const renderRenameInput = () => (
    <input
      value={tempTitle}
      onChange={(event) => setTempTitle(event.target.value)}
      onBlur={handleSaveRename}
      onKeyDown={(event) => {
        if (event.key === "Enter") void handleSaveRename();
        if (event.key === "Escape") handleCancelEditing();
      }}
      autoFocus
      className="w-full border-b border-complement bg-transparent px-2 py-2 text-sm text-font focus:outline-none"
      onClick={(event) => event.stopPropagation()}
    />
  );

  const renderWorkspaceItem = (item: WorkspaceItem, depth: number) => {
    const itemKey = `${item.type}:${item.id}`;
    const isActive =
      currentItem?.type === item.type && currentItem.id === item.id;
    const isDragging = draggingKey === itemKey;
    const isEditing = editingId === item.id && editingType === item.type;
    const itemHref =
      item.type === "note" ? `/notes/${item.id}` : `/diagram/${item.id}`;

    const itemNode = (
      <div
        key={itemKey}
        draggable
        onDragStart={(event) =>
          handleDragStart(event, { type: item.type, id: item.id })
        }
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative rounded-2xl   px-4 py-1  transition-all hover:border-complement/30 hover:bg-secondary hover:shadow-xl hover:shadow-complement/10",
          isActive && "border-complement/40 bg-complement/10",
          isDragging && "opacity-50",
        )}
        style={{ marginLeft: `${depth * 18}px` }}
      >
        {isEditing ? (
          renderRenameInput()
        ) : (
          <Link href={itemHref} className="flex h-full gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 p-2 text-font/80">
              {item.type === "note" ? (
                renderNoteIcon(item.note)
              ) : (
                <IconSitemap className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex flex-1 items-center  ">
              <h3 className=" line-clamp-1 font-semibold text-font/90 transition-colors group-hover:text-font">
                {item.title || "Untitled"}
              </h3>
            </div>
          </Link>
        )}
      </div>
    );

    if (isEditing) {
      return itemNode;
    }

    return (
      <ContextMenu key={itemKey}>
        <ContextMenuTrigger asChild>{itemNode}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onSelect={() => handleStartEditing(item.id, item.title, item.type)}
          >
            <IconEdit className="h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onSelect={() => void handleDeleteItem(item.id, item.type)}
          >
            <IconTrash className="h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderFolder = (folder: Folder, depth: number) => {
    const isFolderOpen = openFolders[folder.id] ?? false;
    const folderKey = `folder:${folder.id}`;
    const childFolders = (childFoldersByParent.get(folder.id) ?? []).filter(
      (childFolder) => visibleFolderIds.has(childFolder.id),
    );
    const childItems = itemsByFolder.get(folder.id) ?? [];
    const isEmpty = childFolders.length === 0 && childItems.length === 0;
    const isDragging = draggingKey === folderKey;
    const isDropTarget = dropTargetId === folder.id;
    const isEditing = editingId === folder.id && editingType === "folder";

    return (
      <Collapsible
        key={folder.id}
        open={isFolderOpen}
        onOpenChange={(isOpen) => setFolderOpen(folder.id, isOpen)}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              draggable
              onDragStart={(event) =>
                handleDragStart(event, { type: "folder", id: folder.id })
              }
              onDragEnd={handleDragEnd}
              onDragOver={(event) => handleDragOver(event, folder.id)}
              onDragLeave={() => setDropTargetId(null)}
              onDrop={(event) => void handleDrop(event, folder.id)}
              className={cn(
                "group relative rounded-2xl   px-4 py-1  transition-all hover:border-complement/30 hover:bg-secondary",
                isDropTarget && "border-complement bg-complement/10",
                isDragging && "opacity-50",
              )}
              style={{ marginLeft: `${depth * 18}px` }}
            >
              {isEditing ? (
                renderRenameInput()
              ) : (
                <div className="flex items-center gap-4">
                  <CollapsibleTrigger asChild>
                    <button className="group flex min-w-0 flex-1 items-center gap-4 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 p-2 text-font/80">
                        <div className="block group-hover:hidden">
                          {renderFolderIcon(folder)}
                        </div>

                        <div className="hidden group-hover:block">
                          <IconChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200",
                              !isFolderOpen && "-rotate-90",
                            )}
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-font/90">
                            {folder.name}
                          </h3>
                        </div>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52">
            <ContextMenuItem
              onSelect={() => void handleCreateNewNote(folder.id)}
            >
              <IconPlus className="h-4 w-4" />
              New note
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => void handleCreateNewDiagram(folder.id)}
            >
              <IconSitemap className="h-4 w-4" />
              New diagram
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => void handleCreateFolder(folder.id)}
            >
              <IconFolderPlus className="h-4 w-4" />
              New subfolder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => void handleUpdateFolderIcon(folder)}
            >
              <IconMoodSmile className="h-4 w-4" />
              Folder icon
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() =>
                handleStartEditing(folder.id, folder.name, "folder")
              }
            >
              <IconEdit className="h-4 w-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              onSelect={() =>
                void handleDeleteItem(folder.id, "folder", folder.parentId)
              }
            >
              <IconTrash className="h-4 w-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <CollapsibleContent className="mt-2 space-y-2 overflow-hidden">
          {isEmpty ? (
            <div
              className="rounded-xl border border-dashed border-secondary px-4 py-3 text-xs italic text-neutral-500"
              style={{ marginLeft: `${(depth + 1) * 18}px` }}
            >
              Empty
            </div>
          ) : (
            <>
              {childFolders.map((childFolder) =>
                renderFolder(childFolder, depth + 1),
              )}
              {childItems.map((item) => renderWorkspaceItem(item, depth + 1))}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const rootFolders = (childFoldersByParent.get(ROOT_FOLDER_ID) ?? []).filter(
    (folder) => visibleFolderIds.has(folder.id),
  );
  const rootItems = itemsByFolder.get(ROOT_FOLDER_ID) ?? [];
  const isWorkspaceEmpty = rootFolders.length === 0 && rootItems.length === 0;
  const isRootDropTarget = dropTargetId === ROOT_FOLDER_ID;

  return (
    <div className="flex-1">
      {showActions && (
        <div className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-2 text-neutral-700 transition-colors dark:text-neutral-200">
          <div className="flex gap-3">
            <motion.button
              onClick={() => void handleCreateFolder(null)}
              className="rounded p-1 text-font/60 hover:bg-complement/10 hover:text-font"
              title="New folder"
            >
              <IconFolderPlus className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={() => void handleCreateNewNote(null)}
              className="rounded p-1 text-font/60 hover:bg-complement/10 hover:text-font"
              title="New note"
            >
              <IconPlus className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={() => void handleCreateNewDiagram(null)}
              className="rounded p-1 text-font/60 hover:bg-complement/10 hover:text-font"
              title="New diagram"
            >
              <IconSitemap className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      )}

      <div
        onDragOver={(event) => handleDragOver(event, null)}
        onDragLeave={() => setDropTargetId(null)}
        onDrop={(event) => void handleDrop(event, null)}
        className={cn(
          "space-y-1 rounded-2xl transition-colors",
          isRootDropTarget && "bg-complement/10 ring-1 ring-complement",
        )}
      >
        {rootFolders.map((folder) => renderFolder(folder, 0))}
        {rootItems.map((item) => renderWorkspaceItem(item, 0))}

        {isWorkspaceEmpty && (
          <div className="rounded-2xl border-2 border-dashed border-secondary bg-third/30 px-4 py-16 text-center text-sm text-neutral-500 backdrop-blur-sm">
            No notes, diagrams or folders
          </div>
        )}
      </div>
    </div>
  );
}
