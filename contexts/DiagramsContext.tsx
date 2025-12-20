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
import { supabase } from "@/lib/supabase";
import {
  Diagram,
  DiagramFolder,
  DiagramsContextValue,
  CreateDiagramInput,
  UpdateDiagramInput,
} from "@/types/diagrams";

const DiagramsContext = createContext<DiagramsContextValue | null>(null);

const mapDiagramFromSupabase = (data: any): Diagram => ({
  id: data.id,
  title: data.title,
  content: data.content || { nodes: [], edges: [] },
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapFolderFromSupabase = (data: any): DiagramFolder => ({
  id: data.id,
  name: data.name,
  createdAt: new Date(data.created_at),
});

export function DiagramsProvider({ children }: { children: ReactNode }) {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [folders, setFolders] = useState<DiagramFolder[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: foldersData } = await supabase
          .from("diagram_folders") // Certifique-se de criar esta tabela ou usar 'folders' com um tipo
          .select("*")
          .order("created_at", { ascending: true });

        const { data: diagramsData } = await supabase
          .from("diagrams") // Certifique-se de criar esta tabela
          .select("*")
          .order("updated_at", { ascending: false });

        if (foldersData) setFolders(foldersData.map(mapFolderFromSupabase));
        if (diagramsData) setDiagrams(diagramsData.map(mapDiagramFromSupabase));
      } catch (error) {
        console.error("Erro ao carregar diagramas:", error);
      }
    }
    fetchData();
  }, []);

  const addFolder = useCallback(async (name: string) => {
    const { data, error } = await supabase
      .from("diagram_folders")
      .insert({ name })
      .select()
      .single();
    if (!error && data) {
      setFolders((prev) => [...prev, mapFolderFromSupabase(data)]);
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("diagram_folders")
      .delete()
      .eq("id", id);
    if (!error) {
      setDiagrams((prev) =>
        prev.map((d) => (d.folderId === id ? { ...d, folderId: null } : d))
      );
      setFolders((prev) => prev.filter((f) => f.id !== id));
    }
  }, []);

  const updateFolder = useCallback(async (id: string, name: string) => {
    const { error } = await supabase
      .from("diagram_folders")
      .update({ name })
      .eq("id", id);
    if (!error) {
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    }
  }, []);

  const addDiagram = useCallback(
    async (input: CreateDiagramInput = {}): Promise<Diagram> => {
      const dbPayload = {
        title: input.title || "Untitled Diagram",
        content: input.content || { nodes: [], edges: [] },
        folder_id: input.folderId || null,
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
    []
  );

  const updateDiagram = useCallback(
    async (id: string, updates: UpdateDiagramInput) => {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.folderId !== undefined)
        dbUpdates.folder_id = updates.folderId;

      const { error } = await supabase
        .from("diagrams")
        .update(dbUpdates)
        .eq("id", id);

      if (!error) {
        setDiagrams((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
          )
        );
      }
    },
    []
  );

  const deleteDiagram = useCallback(async (id: string) => {
    const { error } = await supabase.from("diagrams").delete().eq("id", id);
    if (!error) {
      setDiagrams((prev) => prev.filter((d) => d.id !== id));
    }
  }, []);

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
