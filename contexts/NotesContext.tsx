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
import { supabase } from "@/lib/supabase";
import {
  Note,
  Folder,
  NotesContextValue,
  CreateNoteInput,
  UpdateNoteInput,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
} from "@/types/notes";
import { toast } from "sonner";

const NotesContext = createContext<NotesContextValue | null>(null);

// Mappers
const mapNote = (data: any): Note => ({
  id: data.id,
  title: data.title,
  icon: data.icon,
  coverImage: data.cover_image,
  content: data.content || [],
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // Carregamento inicial
  useEffect(() => {
    async function loadData() {
      // --- ADICIONE ISTO AQUI PARA TESTAR ---
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("USUÁRIO LOGADO NO CONTEXTO:", user?.email || "NÃO LOGADO");
      // --------------------------------------

      const [foldersRes, notesRes] = await Promise.all([
        supabase.from("folders").select("*").order("created_at"),
        supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false }),
      ]);

      if (foldersRes.data) {
        setFolders(
          foldersRes.data.map((f) => ({
            id: f.id,
            name: f.name,
            createdAt: new Date(f.created_at),
          }))
        );
      }
      if (notesRes.data) {
        setNotes(notesRes.data.map(mapNote));
      }
    }
    loadData();
  }, []);

  // --- UPDATE NOTE ---
  const updateNote = useCallback(
    async (id: string, updates: UpdateNoteInput) => {
      const previousNotes = [...notes];

      // Optimistic UI
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
        )
      );

      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.coverImage !== undefined)
        dbUpdates.cover_image = updates.coverImage;
      if (updates.folderId !== undefined)
        dbUpdates.folder_id = updates.folderId;

      try {
        const { error } = await supabase
          .from("notes")
          .update(dbUpdates)
          .eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao atualizar nota:", error);
        setNotes(previousNotes);
        toast.error("Falha ao salvar alterações");
      }
    },
    [notes]
  );

  // --- CREATE NOTE ---
  const addNote = useCallback(
    async (input: CreateNoteInput = {}): Promise<Note> => {
      const tempId = crypto.randomUUID();
      const newNoteOptimistic: Note = {
        id: tempId,
        title: input.title || DEFAULT_NOTE_TITLE,
        icon: input.icon || DEFAULT_NOTE_ICON,
        coverImage:
          input.coverImage ||
          "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
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
            content: newNoteOptimistic.content,
            folder_id: newNoteOptimistic.folderId,
          })
          .select()
          .single();

        if (error) throw error;

        const confirmedNote = mapNote(data);
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? confirmedNote : n))
        );
        return confirmedNote;
      } catch (error) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        toast.error("Erro ao criar nota");
        throw error;
      }
    },
    []
  );

  // --- DELETE NOTE ---
  const deleteNote = useCallback(
    async (id: string) => {
      const previousNotes = [...notes];

      // Remove da UI imediatamente
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Nota movida para lixeira"); // Feedback imediato

      try {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao deletar nota:", error);
        setNotes(previousNotes); // Restaura se falhar
        toast.error("Erro ao excluir nota. Verifique permissões.");
      }
    },
    [notes]
  );

  // --- ADD FOLDER ---
  const addFolder = useCallback(async (name: string) => {
    const tempId = crypto.randomUUID();
    const newFolder: Folder = { id: tempId, name, createdAt: new Date() };

    setFolders((prev) => [...prev, newFolder]);

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;

      const createdFolder = {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at),
      };

      setFolders((prev) =>
        prev.map((f) => (f.id === tempId ? createdFolder : f))
      );
    } catch (error) {
      setFolders((prev) => prev.filter((f) => f.id !== tempId));
      toast.error("Erro ao criar pasta");
    }
  }, []);

  // --- DELETE FOLDER ---
  const deleteFolder = useCallback(
    async (id: string) => {
      const prevFolders = [...folders];
      const prevNotes = [...notes];

      // Remove pasta e remove notas dessa pasta visualmente
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setNotes((prev) =>
        prev.map((n) => (n.folderId === id ? { ...n, folderId: null } : n))
      );

      try {
        const { error } = await supabase.from("folders").delete().eq("id", id);
        if (error) throw error;
        toast.success("Pasta excluída");
      } catch (error) {
        setFolders(prevFolders);
        setNotes(prevNotes);
        toast.error("Erro ao excluir pasta");
      }
    },
    [folders, notes]
  );

  // --- UPDATE FOLDER ---
  const updateFolder = useCallback(
    async (id: string, name: string) => {
      const prevFolders = [...folders];
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));

      try {
        const { error } = await supabase
          .from("folders")
          .update({ name })
          .eq("id", id);
        if (error) throw error;
      } catch (error) {
        setFolders(prevFolders);
        toast.error("Erro ao renomear pasta");
      }
    },
    [folders]
  );

  const getNote = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  );

  const value = useMemo(
    () => ({
      notes,
      folders,
      addNote,
      updateNote,
      deleteNote, // Agora está implementado!
      getNote,
      addFolder, // Agora está implementado!
      deleteFolder, // Agora está implementado!
      updateFolder, // Agora está implementado!
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
    ]
  );

  return (
    <NotesContext.Provider value={value as any}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
}
