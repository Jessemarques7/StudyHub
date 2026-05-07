// contexts/NotesContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Note,
  Folder,
  NotesContextValue,
  CreateNoteInput,
  CreateFolderInput,
  UpdateNoteInput,
  UpdateFolderInput,
  DEFAULT_NOTE_TITLE,
} from "@/types/notes";
import { toast } from "sonner";
import type { FolderRow, NoteRow } from "@/types/database";
import type { Json } from "@/types/supabase";

const NotesContext = createContext<NotesContextValue | null>(null);

const mapNote = (data: NoteRow): Note => ({
  id: data.id,
  title: data.title,
  icon: data.icon,
  coverImage: data.cover_image,
  content: Array.isArray(data.content) ? (data.content as Note["content"]) : [],
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapFolder = (data: FolderRow): Folder => ({
  id: data.id,
  name: data.name,
  icon: data.icon ?? null,
  parentId: data.parent_id ?? null,
  createdAt: new Date(data.created_at),
});

const normalizeFolderInput = (
  input: string | CreateFolderInput = {},
): Required<CreateFolderInput> => {
  if (typeof input === "string") {
    return { name: input, icon: null, parentId: null };
  }

  return {
    name: input.name?.trim() || "New Folder",
    icon: input.icon ?? null,
    parentId: input.parentId ?? null,
  };
};

const normalizeFolderUpdates = (
  updates: string | UpdateFolderInput,
): UpdateFolderInput => {
  if (typeof updates === "string") {
    return { name: updates };
  }

  return updates;
};

export function NotesProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNotes([]);
        setFolders([]);
        return;
      }

      const [foldersRes, notesRes] = await Promise.all([
        supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at"),
        supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      if (foldersRes.data) {
        setFolders((foldersRes.data as FolderRow[]).map(mapFolder));
      }
      if (notesRes.data) {
        setNotes((notesRes.data as NoteRow[]).map(mapNote));
      }
    }

    loadData();
  }, [supabase]);

  const updateNote = useCallback(
    async (id: string, updates: UpdateNoteInput) => {
      const previousNotes = [...notes];

      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note,
        ),
      );

      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.content !== undefined) {
        dbUpdates.content = updates.content as unknown as Json;
      }
      if (updates.coverImage !== undefined) {
        dbUpdates.cover_image = updates.coverImage;
      }
      if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;

      try {
        const { error } = await supabase
          .from("notes")
          .update(dbUpdates)
          .eq("id", id);

        if (error) throw error;
      } catch (error) {
        console.error("Erro ao atualizar nota:", error);
        setNotes(previousNotes);
        toast.error("Falha ao salvar alteracoes");
      }
    },
    [notes, supabase],
  );

  const addNote = useCallback(
    async (input: CreateNoteInput = {}): Promise<Note> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Voce precisa estar logado para criar notas");
        throw new Error("Usuario nao autenticado");
      }

      const tempId = crypto.randomUUID();
      const newNoteOptimistic: Note = {
        id: tempId,
        title: input.title || DEFAULT_NOTE_TITLE,
        icon: input.icon ?? null,
        coverImage: input.coverImage ?? null,
        content: input.content || [],
        folderId: input.folderId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setNotes((prev) => [newNoteOptimistic, ...prev]);

      try {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            title: newNoteOptimistic.title,
            icon: newNoteOptimistic.icon,
            cover_image: newNoteOptimistic.coverImage,
            content: newNoteOptimistic.content as unknown as Json,
            folder_id: newNoteOptimistic.folderId,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        const confirmedNote = mapNote(data as NoteRow);
        setNotes((prev) =>
          prev.map((note) => (note.id === tempId ? confirmedNote : note)),
        );
        return confirmedNote;
      } catch (error) {
        setNotes((prev) => prev.filter((note) => note.id !== tempId));
        toast.error("Erro ao criar nota");
        throw error;
      }
    },
    [supabase],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const previousNotes = [...notes];

      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast.success("Nota excluida");

      try {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao deletar nota:", error);
        setNotes(previousNotes);
        toast.error("Erro ao excluir nota");
      }
    },
    [notes, supabase],
  );

  const addFolder = useCallback(
    async (input: string | CreateFolderInput = {}) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Login necessario");
        return null;
      }

      const folderInput = normalizeFolderInput(input);
      const tempId = crypto.randomUUID();
      const newFolder: Folder = {
        id: tempId,
        name: folderInput.name,
        icon: folderInput.icon,
        parentId: folderInput.parentId,
        createdAt: new Date(),
      };

      setFolders((prev) => [...prev, newFolder]);

      try {
        const folderPayload: {
          name: string;
          user_id: string;
          icon?: string;
          parent_id?: string;
        } = {
          name: folderInput.name,
          user_id: user.id,
        };

        if (folderInput.icon) folderPayload.icon = folderInput.icon;
        if (folderInput.parentId) folderPayload.parent_id = folderInput.parentId;

        const { data, error } = await supabase
          .from("folders")
          .insert(folderPayload)
          .select()
          .single();

        if (error) throw error;

        const createdFolder = mapFolder(data as FolderRow);
        setFolders((prev) =>
          prev.map((folder) => (folder.id === tempId ? createdFolder : folder)),
        );
        return createdFolder;
      } catch (error) {
        console.error("Erro ao criar pasta:", error);
        setFolders((prev) => prev.filter((folder) => folder.id !== tempId));
        toast.error("Erro ao criar pasta");
        return null;
      }
    },
    [supabase],
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      const previousFolders = [...folders];
      const previousNotes = [...notes];
      const folder = folders.find((item) => item.id === id);
      const replacementParentId = folder?.parentId ?? null;

      setFolders((prev) =>
        prev
          .filter((item) => item.id !== id)
          .map((item) =>
            item.parentId === id
              ? { ...item, parentId: replacementParentId }
              : item,
          ),
      );
      setNotes((prev) =>
        prev.map((note) =>
          note.folderId === id ? { ...note, folderId: replacementParentId } : note,
        ),
      );

      try {
        const [foldersUpdate, notesUpdate, diagramsUpdate] = await Promise.all([
          supabase
            .from("folders")
            .update({ parent_id: replacementParentId })
            .eq("parent_id", id),
          supabase
            .from("notes")
            .update({ folder_id: replacementParentId })
            .eq("folder_id", id),
          supabase
            .from("diagrams")
            .update({ folder_id: replacementParentId })
            .eq("folder_id", id),
        ]);

        if (foldersUpdate.error) throw foldersUpdate.error;
        if (notesUpdate.error) throw notesUpdate.error;
        if (diagramsUpdate.error) throw diagramsUpdate.error;

        const { error } = await supabase.from("folders").delete().eq("id", id);
        if (error) throw error;
        toast.success("Pasta excluida");
      } catch (error) {
        console.error("Erro ao excluir pasta:", error);
        setFolders(previousFolders);
        setNotes(previousNotes);
        toast.error("Erro ao excluir pasta");
      }
    },
    [folders, notes, supabase],
  );

  const updateFolder = useCallback(
    async (id: string, input: string | UpdateFolderInput) => {
      const updates = normalizeFolderUpdates(input);
      const previousFolders = [...folders];

      if (updates.parentId === id) {
        toast.error("Uma pasta nao pode ficar dentro dela mesma");
        return;
      }

      if (updates.parentId) {
        let cursor = folders.find((folder) => folder.id === updates.parentId);
        while (cursor) {
          if (cursor.parentId === id) {
            toast.error("Esse movimento criaria uma pasta circular");
            return;
          }
          cursor = folders.find((folder) => folder.id === cursor?.parentId);
        }
      }

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === id
            ? {
                ...folder,
                ...(updates.name !== undefined
                  ? { name: updates.name.trim() || folder.name }
                  : {}),
                ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
                ...(updates.parentId !== undefined
                  ? { parentId: updates.parentId }
                  : {}),
              }
            : folder,
        ),
      );

      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) {
        const trimmedName = updates.name.trim();
        if (trimmedName) dbUpdates.name = trimmedName;
      }
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;

      if (Object.keys(dbUpdates).length === 0) return;

      try {
        const { error } = await supabase
          .from("folders")
          .update(dbUpdates)
          .eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao atualizar pasta:", error);
        setFolders(previousFolders);
        toast.error("Erro ao atualizar pasta");
      }
    },
    [folders, supabase],
  );

  const getNote = useCallback(
    (id: string) => notes.find((note) => note.id === id),
    [notes],
  );

  const value = useMemo(
    () => ({
      notes,
      folders,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      addFolder,
      deleteFolder,
      updateFolder,
    }),
    [
      notes,
      folders,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      addFolder,
      deleteFolder,
      updateFolder,
    ],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
}
