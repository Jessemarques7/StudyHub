// contexts/DiagramsContext.tsx
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
  Diagram,
  DiagramContent,
  DiagramFolder,
  DiagramsContextValue,
  CreateDiagramInput,
  UpdateDiagramInput,
} from "@/types/diagrams";
import type { DiagramFolderRow, DiagramRow } from "@/types/database";
import type { Json } from "@/types/supabase";

const DiagramsContext = createContext<DiagramsContextValue | null>(null);

const mapDiagramFromSupabase = (data: DiagramRow): Diagram => ({
  id: data.id,
  title: data.title,
  content: (data.content as DiagramContent | null) || { nodes: [], edges: [] },
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapFolderFromSupabase = (data: DiagramFolderRow): DiagramFolder => ({
  id: data.id,
  name: data.name,
  createdAt: new Date(data.created_at),
});

export function DiagramsProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [folders, setFolders] = useState<DiagramFolder[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserId(null);
          setFolders([]);
          setDiagrams([]);
          return;
        }

        setUserId(user.id);

        const { data: foldersData } = await supabase
          .from("diagram_folders") // Certifique-se de criar esta tabela ou usar 'folders' com um tipo
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        const { data: diagramsData } = await supabase
          .from("diagrams") // Certifique-se de criar esta tabela
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (foldersData) setFolders(foldersData.map(mapFolderFromSupabase));
        if (diagramsData) setDiagrams(diagramsData.map(mapDiagramFromSupabase));
      } catch (error) {
        console.error("Erro ao carregar diagramas:", error);
      }
    }
    fetchData();
  }, [supabase]);

  const addFolder = useCallback(async (name: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("diagram_folders")
      .insert({ name, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      setFolders((prev) => [...prev, mapFolderFromSupabase(data)]);
    }
  }, [supabase, userId]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("diagram_folders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (!error) {
      setDiagrams((prev) =>
        prev.map((d) => (d.folderId === id ? { ...d, folderId: null } : d))
      );
      setFolders((prev) => prev.filter((f) => f.id !== id));
    }
  }, [supabase, userId]);

  const updateFolder = useCallback(async (id: string, name: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("diagram_folders")
      .update({ name })
      .eq("id", id)
      .eq("user_id", userId);
    if (!error) {
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    }
  }, [supabase, userId]);

  const addDiagram = useCallback(
    async (input: CreateDiagramInput = {}): Promise<Diagram> => {
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      const dbPayload = {
        title: input.title || "Untitled Diagram",
        content: (input.content || { nodes: [], edges: [] }) as unknown as Json,
        folder_id: input.folderId || null,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from("diagrams")
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const newDiagram = mapDiagramFromSupabase(data);
      setDiagrams((prev) => [newDiagram, ...prev]);
      return newDiagram;
    },
    [supabase, userId]
  );

  const updateDiagram = useCallback(
    async (id: string, updates: UpdateDiagramInput) => {
      if (!userId) return;

      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined)
        dbUpdates.content = updates.content as unknown as Json;
      if (updates.folderId !== undefined)
        dbUpdates.folder_id = updates.folderId;

      const { error } = await supabase
        .from("diagrams")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", userId);

      if (!error) {
        setDiagrams((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
          )
        );
      }
    },
    [supabase, userId]
  );

  const deleteDiagram = useCallback(async (id: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("diagrams")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (!error) {
      setDiagrams((prev) => prev.filter((d) => d.id !== id));
    }
  }, [supabase, userId]);

  const getDiagram = useCallback(
    (id: string) => diagrams.find((d) => d.id === id),
    [diagrams]
  );

  const value = useMemo(
    () => ({
      diagrams,
      folders,
      addDiagram,
      updateDiagram,
      deleteDiagram,
      getDiagram,
      addFolder,
      deleteFolder,
      updateFolder,
    }),
    [
      diagrams,
      folders,
      addDiagram,
      updateDiagram,
      deleteDiagram,
      getDiagram,
      addFolder,
      deleteFolder,
      updateFolder,
    ]
  );

  return (
    <DiagramsContext.Provider value={value}>
      {children}
    </DiagramsContext.Provider>
  );
}

export function useDiagrams() {
  const context = useContext(DiagramsContext);
  if (!context) {
    throw new Error("useDiagrams must be used within a DiagramsProvider");
  }
  return context;
}
