// // contexts/NotesContext.tsx
// "use client";

// import {
//   createContext,
//   useContext,
//   ReactNode,
//   useCallback,
//   useMemo,
// } from "react";
// import { useLocalStorage } from "@/hooks/useLocalStorageState";
// import {
//   Note,
//   Folder,
//   NotesContextValue,
//   CreateNoteInput,
//   UpdateNoteInput,
//   DEFAULT_NOTE_ICON,
//   DEFAULT_NOTE_TITLE,
// } from "@/types/notes";

// const NOTES_STORAGE_KEY = "notes-v1";
// const FOLDERS_STORAGE_KEY = "folders-v1";

// const NotesContext = createContext<NotesContextValue | null>(null);

// // Função helper para criar nova nota (usada apenas em interações do utilizador)
// function createNote(input: CreateNoteInput = {}): Note {
//   return {
//     id: crypto.randomUUID(),
//     title: input.title || DEFAULT_NOTE_TITLE,
//     icon: input.icon || DEFAULT_NOTE_ICON,
//     coverImage:
//       input.coverImage ||
//       "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
//     content: input.content || [],
//     folderId: input.folderId || null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };
// }

// // FIX: Nota inicial com ID e DATA estáticos para evitar Hydration Mismatch
// const INITIAL_NOTES: Note[] = [
//   {
//     id: "welcome-note-static-id", // ID fixo
//     title: "Welcome to Notes",
//     icon: "👋",
//     coverImage: "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
//     content: [],
//     folderId: null,
//     createdAt: new Date("2024-01-01T00:00:00.000Z"), // Data fixa
//     updatedAt: new Date("2024-01-01T00:00:00.000Z"), // Data fixa
//   },
// ];

// export function NotesProvider({ children }: { children: ReactNode }) {
//   // Inicializa com INITIAL_NOTES (estático) e depois hidrata com localStorage
//   const [notes, setNotes] = useLocalStorage<Note[]>(
//     NOTES_STORAGE_KEY,
//     INITIAL_NOTES
//   );
//   const [folders, setFolders] = useLocalStorage<Folder[]>(
//     FOLDERS_STORAGE_KEY,
//     []
//   );

//   // --- Funções de Pasta ---
//   const addFolder = useCallback(
//     (name: string) => {
//       const newFolder: Folder = {
//         id: crypto.randomUUID(),
//         name,
//         createdAt: new Date(),
//       };
//       setFolders((prev) => [...prev, newFolder]);
//     },
//     [setFolders]
//   );

//   const deleteFolder = useCallback(
//     (id: string) => {
//       setNotes((prevNotes) =>
//         prevNotes.map((note) =>
//           note.folderId === id ? { ...note, folderId: null } : note
//         )
//       );
//       setFolders((prev) => prev.filter((f) => f.id !== id));
//     },
//     [setFolders, setNotes]
//   );

//   const updateFolder = useCallback(
//     (id: string, name: string) => {
//       setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
//     },
//     [setFolders]
//   );

//   // --- Funções de Notas ---
//   const addNote = useCallback(
//     (input?: CreateNoteInput): Note => {
//       const newNote = createNote(input);
//       setNotes((prev) => [...prev, newNote]);
//       return newNote;
//     },
//     [setNotes]
//   );

//   const updateNote = useCallback(
//     (id: string, updates: UpdateNoteInput) => {
//       setNotes((prev) =>
//         prev.map((note) =>
//           note.id === id
//             ? {
//                 ...note,
//                 ...updates,
//                 updatedAt: new Date(),
//               }
//             : note
//         )
//       );
//     },
//     [setNotes]
//   );

//   const deleteNote = useCallback(
//     (id: string) => {
//       setNotes((prev) => prev.filter((note) => note.id !== id));
//     },
//     [setNotes]
//   );

//   const getNote = useCallback(
//     (id: string): Note | undefined => {
//       return notes.find((note) => note.id === id);
//     },
//     [notes]
//   );

//   const value = useMemo<NotesContextValue>(
//     () => ({
//       notes,
//       folders,
//       addNote,
//       updateNote,
//       deleteNote,
//       getNote,
//       addFolder,
//       deleteFolder,
//       updateFolder,
//     }),
//     [
//       notes,
//       folders,
//       addNote,
//       updateNote,
//       deleteNote,
//       getNote,
//       addFolder,
//       deleteFolder,
//       updateFolder,
//     ]
//   );

//   return (
//     <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
//   );
// }

// export function useNotes(): NotesContextValue {
//   const context = useContext(NotesContext);
//   if (!context) {
//     throw new Error("useNotes must be used within a NotesProvider");
//   }
//   return context;
// }

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

const NotesContext = createContext<NotesContextValue | null>(null);

// --- Funções Auxiliares de Mapeamento ---
// Converte os dados vindos do Supabase (snake_case) para o tipo da aplicação (camelCase)
const mapNoteFromSupabase = (data: any): Note => ({
  id: data.id,
  title: data.title,
  icon: data.icon,
  coverImage: data.cover_image,
  content: data.content || [],
  folderId: data.folder_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapFolderFromSupabase = (data: any): Folder => ({
  id: data.id,
  name: data.name,
  createdAt: new Date(data.created_at),
});

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Carregar dados iniciais do Supabase ---
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Buscar Pastas
        const { data: foldersData, error: foldersError } = await supabase
          .from("folders")
          .select("*")
          .order("created_at", { ascending: true });

        if (foldersError) throw foldersError;

        // Buscar Notas
        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false });

        if (notesError) throw notesError;

        if (foldersData) setFolders(foldersData.map(mapFolderFromSupabase));
        if (notesData) setNotes(notesData.map(mapNoteFromSupabase));
      } catch (error: any) {
        console.error("Erro detalhado:", JSON.stringify(error, null, 2));
        console.error("Mensagem de erro:", error.message || error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // --- Funções de Pasta ---
  const addFolder = useCallback(async (name: string) => {
    try {
      // 1. Inserir no Supabase
      const { data, error } = await supabase
        .from("folders")
        .insert({ name })
        .select()
        .single();

      if (error) throw error;

      // 2. Atualizar estado local
      const newFolder = mapFolderFromSupabase(data);
      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      // 1. Deletar do Supabase
      const { error } = await supabase.from("folders").delete().eq("id", id);
      if (error) throw error;

      // 2. Atualizar estado local
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.folderId === id ? { ...note, folderId: null } : note
        )
      );
      setFolders((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erro ao deletar pasta:", error);
    }
  }, []);

  const updateFolder = useCallback(async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name })
        .eq("id", id);

      if (error) throw error;

      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    } catch (error) {
      console.error("Erro ao atualizar pasta:", error);
    }
  }, []);

  // --- Funções de Notas ---
  const addNote = useCallback(
    async (input: CreateNoteInput = {}): Promise<Note> => {
      // Preparar objeto para inserção
      const dbPayload = {
        title: input.title || DEFAULT_NOTE_TITLE,
        icon: input.icon || DEFAULT_NOTE_ICON,
        cover_image:
          input.coverImage ||
          "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
        content: input.content || [],
        folder_id: input.folderId || null,
        // created_at e updated_at são gerados automaticamente pelo banco,
        // mas se quiser forçar a data atual do cliente, pode enviar.
      };

      try {
        const { data, error } = await supabase
          .from("notes")
          .insert(dbPayload)
          .select()
          .single();

        if (error) throw error;

        const newNote = mapNoteFromSupabase(data);
        setNotes((prev) => [newNote, ...prev]); // Adiciona no início
        return newNote;
      } catch (error) {
        console.error("Erro ao criar nota:", error);
        // Retornar um fallback ou lançar erro, dependendo da sua estratégia de UI
        throw error;
      }
    },
    []
  );

  const updateNote = useCallback(
    async (id: string, updates: UpdateNoteInput) => {
      try {
        // Mapear campos camelCase para snake_case
        const dbUpdates: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.coverImage !== undefined)
          dbUpdates.cover_image = updates.coverImage;
        if (updates.folderId !== undefined)
          dbUpdates.folder_id = updates.folderId;

        // Otimisticamente atualizar a UI antes (opcional, aqui estamos fazendo depois)
        // Se quiser UI otimista, atualize o setNotes antes do await

        const { error } = await supabase
          .from("notes")
          .update(dbUpdates)
          .eq("id", id);

        if (error) throw error;

        setNotes((prev) =>
          prev.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date(),
                }
              : note
          )
        );
      } catch (error) {
        console.error("Erro ao atualizar nota:", error);
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  }, []);

  const getNote = useCallback(
    (id: string): Note | undefined => {
      return notes.find((note) => note.id === id);
    },
    [notes]
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      folders,
      addNote: addNote as any, // Cast necessário pois mudamos para async
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
    ]
  );

  return (
    <NotesContext.Provider value={value}>
      {/* Opcional: Mostrar loading se necessário, ou apenas renderizar children */}
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
