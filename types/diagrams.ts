// types/diagrams.ts
import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";
import type {
  CreateFolderInput,
  Folder,
  UpdateFolderInput,
} from "@/types/notes";

export type DiagramFolder = Folder;
export type DiagramContent = ImportedDataState;

export interface Diagram {
  id: string;
  title: string;
  content: DiagramContent;
  folderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiagramInput {
  title?: string;
  content?: DiagramContent;
  folderId?: string | null;
}

export interface UpdateDiagramInput {
  title?: string;
  content?: DiagramContent;
  folderId?: string | null;
}

export interface DiagramsContextValue {
  diagrams: Diagram[];
  folders: DiagramFolder[];
  isLoading: boolean;
  addDiagram: (input?: CreateDiagramInput) => Promise<Diagram>;
  updateDiagram: (id: string, updates: UpdateDiagramInput) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  getDiagram: (id: string) => Diagram | undefined;
  addFolder: (input?: string | CreateFolderInput) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, updates: string | UpdateFolderInput) => Promise<void>;
}
