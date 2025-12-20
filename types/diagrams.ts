// types/diagrams.ts
import { Edge, Node } from "@xyflow/react";

export interface DiagramFolder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface DiagramContent {
  nodes: Node[];
  edges: Edge[];
}

export interface Diagram {
  id: string;
  title: string;
  content: DiagramContent; // Armazena nodes e edges
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
  addDiagram: (input?: CreateDiagramInput) => Promise<Diagram>;
  updateDiagram: (id: string, updates: UpdateDiagramInput) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  getDiagram: (id: string) => Diagram | undefined;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
}
