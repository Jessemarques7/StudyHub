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
  DiagramsContextValue,
  CreateDiagramInput,
  UpdateDiagramInput,
} from "@/types/diagrams";
import { useNotes } from "@/contexts/NotesContext";
import { DEFAULT_THEME_COLORS } from "@/lib/theme-colors";
import { toast } from "sonner";
import type { DiagramRow } from "@/types/database";
import type { Json } from "@/types/supabase";

const DiagramsContext = createContext<DiagramsContextValue | null>(null);

const createEmptyDiagramContent = (): DiagramContent => ({
  type: "excalidraw",
  version: 2,
  source: "studyhub",
  elements: [],
  appState: {
    currentItemStrokeColor: DEFAULT_THEME_COLORS.font,
    gridModeEnabled: false,
    viewBackgroundColor: DEFAULT_THEME_COLORS.main,
  },
  files: {},
});

const mapDiagramFromSupabase = (data: DiagramRow): Diagram => ({
  id: data.id,
  title: data.title,
  content: (data.content as DiagramContent | null) || createEmptyDiagramContent(),
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export function DiagramsProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { folders, addFolder, deleteFolder, updateFolder } = useNotes();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserId(null);
          setDiagrams([]);
          return;
        }

        setUserId(user.id);

        const { data: diagramsData } = await supabase
          .from("diagrams")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (diagramsData) {
          setDiagrams(
            (diagramsData as DiagramRow[]).map(mapDiagramFromSupabase),
          );
        }
      } catch (error) {
        console.error("Erro ao carregar diagramas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const addDiagram = useCallback(
    async (input: CreateDiagramInput = {}): Promise<Diagram> => {
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      const dbPayload = {
        title: input.title || "Untitled Diagram",
        content: (input.content || createEmptyDiagramContent()) as unknown as Json,
        folder_id: input.folderId || null,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from("diagrams")
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar diagrama:", error);
        toast.error("Erro ao criar diagrama");
        throw error;
      }

      const newDiagram = mapDiagramFromSupabase(data as DiagramRow);
      setDiagrams((prev) => [newDiagram, ...prev]);
      return newDiagram;
    },
    [supabase, userId],
  );

  const updateDiagram = useCallback(
    async (id: string, updates: UpdateDiagramInput) => {
      if (!userId) return;

      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) {
        dbUpdates.content = updates.content as unknown as Json;
      }
      if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;

      const { error } = await supabase
        .from("diagrams")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("Erro ao atualizar diagrama:", error);
        toast.error("Erro ao salvar diagrama");
        return;
      }

      setDiagrams((prev) =>
        prev.map((diagram) =>
          diagram.id === id
            ? { ...diagram, ...updates, updatedAt: new Date() }
            : diagram,
        ),
      );
    },
    [supabase, userId],
  );

  const deleteDiagram = useCallback(
    async (id: string) => {
      if (!userId) return;

      const { error } = await supabase
        .from("diagrams")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (!error) {
        setDiagrams((prev) => prev.filter((diagram) => diagram.id !== id));
      }
    },
    [supabase, userId],
  );

  const getDiagram = useCallback(
    (id: string) => diagrams.find((diagram) => diagram.id === id),
    [diagrams],
  );

  const value = useMemo(
    () => ({
      diagrams,
      folders,
      isLoading,
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
      isLoading,
      addDiagram,
      updateDiagram,
      deleteDiagram,
      getDiagram,
      addFolder,
      deleteFolder,
      updateFolder,
    ],
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
