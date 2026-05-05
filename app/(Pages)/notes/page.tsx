"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Contextos e Tipos
import { useNotes } from "@/contexts/NotesContext";
import { useDiagrams } from "@/contexts/DiagramsContext";
import { Note } from "@/types/notes";

// Ícones
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Folder as FolderIcon,
  MoreVertical,
  Trash2,
  Smile,
  LayoutDashboard,
  Network,
} from "lucide-react";
import { IconSitemap } from "@tabler/icons-react";

// Componentes UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

const Graph = dynamic(() => import("@/components/notes/Graph"), {
  ssr: false,
});

// Enum para gerir a aba ativa
type ViewMode = "notes" | "diagrams" | "graph";

export default function WorkspacePage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewMode>("notes");
  const [searchQuery, setSearchQuery] = useState("");

  // Dados dos contextos
  const { notes, folders: notesFolders, addNote, deleteNote } = useNotes();
  const {
    diagrams,
    folders: diagramFolders,
    addDiagram,
    deleteDiagram,
  } = useDiagrams();

  // Filtros de busca
  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [notes, searchQuery]);

  const filteredDiagrams = useMemo(() => {
    return diagrams.filter((diagram) =>
      diagram.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [diagrams, searchQuery]);

  // Ações de Criação
  const handleCreateNote = async () => {
    try {
      await addNote();
    } catch (error) {
      console.error("Erro ao criar nota", error);
    }
  };

  const handleCreateDiagram = async () => {
    try {
      const newDiagram = await addDiagram({ title: "Novo Diagrama" });
      router.push(`/diagram/${newDiagram.id}`);
    } catch (error) {
      console.error("Erro ao criar diagrama:", error);
    }
  };

  // Renderização de Ícones de Notas
  const renderNoteIcon = (note: Note) => {
    if (!note.icon) return <Smile className="w-16 h-16 p-2 text-font/40" />;
    if (note.icon.startsWith("data:"))
      return <img src={note.icon} alt="Note icon" className="h-8" />;
    return <span className="text-md">{note.icon}</span>;
  };

  return (
    <div className="relative min-h-screen mt-14 text-foreground bg-background">
      {/* --- Efeitos de Fundo Globais --- */}
      {/* <div className="stars"></div>
      <div className="nebula"></div> */}

      {/* --- Conteúdo Principal (z-10 para ficar acima do fundo) --- */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full gap-6">
          {/* Cabeçalho e Ações Principais */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Meu Espaço
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as suas anotações, diagramas e visualize conexões.
              </p>
            </div>

            {/* Botões de Ação Dinâmicos Baseados na Aba */}
            <div className="flex items-center gap-3">
              {activeView === "notes" && (
                <Button
                  onClick={handleCreateNote}
                  className="gap-2 shadow-lg shadow-primary/20"
                >
                  <Plus className="h-4 w-4" /> Nova Nota
                </Button>
              )}
              {activeView === "diagrams" && (
                <Button
                  onClick={handleCreateDiagram}
                  className="gap-2 bg-complement text-font shadow-lg shadow-complement/20 hover:bg-complement/90"
                >
                  <Plus className="h-4 w-4" /> Novo Diagrama
                </Button>
              )}
            </div>
          </div>

          {/* Navegação de Abas (Tabs) elegantes */}
          <div className="flex w-fit items-center gap-2 rounded-xl border border-secondary bg-third/50 p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveView("notes")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === "notes"
                  ? "bg-secondary text-font shadow-sm"
                  : "text-font/60 hover:bg-secondary/50 hover:text-font"
              }`}
            >
              <FileText className="h-4 w-4" />
              Notas
            </button>
            <button
              onClick={() => setActiveView("diagrams")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === "diagrams"
                  ? "bg-secondary text-font shadow-sm"
                  : "text-font/60 hover:bg-secondary/50 hover:text-font"
              }`}
            >
              <IconSitemap className="h-4 w-4" />
              Diagramas
            </button>
            <button
              onClick={() => setActiveView("graph")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === "graph"
                  ? "bg-secondary text-font shadow-sm"
                  : "text-font/60 hover:bg-secondary/50 hover:text-font"
              }`}
            >
              <Network className="h-4 w-4" />
              Grafo
            </button>
          </div>

          {/* Barra de Busca (Oculta na aba de Grafo) */}
          {activeView !== "graph" && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${activeView === "notes" ? "notas" : "diagramas"} pelo título...`}
                className="h-12 rounded-xl border-secondary bg-third/50 pl-11 text-md focus-visible:ring-complement/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* --- CONTEÚDO: NOTAS --- */}
          {activeView === "notes" && (
            <div className="flex-1">
              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group relative rounded-2xl border border-secondary bg-third/50 p-5 backdrop-blur-sm transition-all hover:border-complement/30 hover:bg-secondary hover:shadow-xl"
                    >
                      <Link
                        href={`/notes/${note.id}`}
                        className="block h-full flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center justify-center rounded-xl bg-secondary/50 p-3">
                            <span className="text-2xl leading-none">
                              {renderNoteIcon(note) || "📄"}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.preventDefault()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-font/60 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border-secondary bg-secondary"
                            >
                              <DropdownMenuItem
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteNote(note.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h3 className="mb-3 line-clamp-1 text-lg font-semibold text-font/90 transition-colors group-hover:text-font">
                          {note.title || "Sem título"}
                        </h3>
                        <div className="mt-auto space-y-2 text-sm text-font/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {format(note.updatedAt, "dd 'de' MMM", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          {note.folderId && (
                            <div className="flex items-center gap-2">
                              <FolderIcon className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {notesFolders.find(
                                  (f) => f.id === note.folderId,
                                )?.name || "Pasta"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-secondary bg-third/30 px-4 py-24 backdrop-blur-sm">
                  <div className="mb-4 rounded-full bg-secondary p-4">
                    <FileText className="h-8 w-8 text-font/60" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhuma nota encontrada
                  </h3>
                  <p className="max-w-sm text-center text-font/50">
                    {searchQuery
                      ? "Tente ajustar os termos da sua busca."
                      : "O seu espaço está vazio. Comece a capturar as suas ideias criando uma nota!"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateNote} className="mt-6">
                      Criar Primeira Nota
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- CONTEÚDO: DIAGRAMAS --- */}
          {activeView === "diagrams" && (
            <div className="flex-1">
              {filteredDiagrams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDiagrams.map((diagram) => (
                    <div
                      key={diagram.id}
                      className="group relative rounded-2xl border border-secondary bg-third/50 p-5 backdrop-blur-sm transition-all hover:border-complement/30 hover:bg-secondary hover:shadow-xl hover:shadow-complement/10"
                    >
                      <Link
                        href={`/diagram/${diagram.id}`}
                        className="block h-full flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="rounded-xl border border-complement/20 bg-complement/10 p-3 text-complement">
                            <IconSitemap className="h-6 w-6" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.preventDefault()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-font/60 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border-secondary bg-secondary"
                            >
                              <DropdownMenuItem
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteDiagram(diagram.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h3 className="mb-3 line-clamp-1 text-lg font-semibold text-font/90 transition-colors group-hover:text-complement">
                          {diagram.title || "Sem título"}
                        </h3>
                        <div className="mt-auto space-y-2 text-sm text-font/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {format(diagram.updatedAt, "dd 'de' MMM", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          {diagram.folderId && (
                            <div className="flex items-center gap-2">
                              <FolderIcon className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {diagramFolders.find(
                                  (f) => f.id === diagram.folderId,
                                )?.name || "Pasta"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-secondary bg-third/30 px-4 py-24 backdrop-blur-sm">
                  <div className="mb-4 rounded-full border border-complement/20 bg-complement/10 p-4">
                    <LayoutDashboard className="h-8 w-8 text-complement" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhum diagrama
                  </h3>
                  <p className="max-w-sm text-center text-font/50">
                    {searchQuery
                      ? "Nenhum diagrama corresponde à sua busca."
                      : "Mapeie os seus pensamentos visualmente criando o seu primeiro diagrama."}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      onClick={handleCreateDiagram}
                      className="mt-6 border-secondary hover:bg-secondary"
                    >
                      Criar Diagrama
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- CONTEÚDO: GRAFO --- */}
          {activeView === "graph" && (
            <div className="relative h-[70vh] min-h-[500px] w-full flex-1 overflow-hidden rounded-3xl border border-secondary bg-third shadow-2xl">
              {/* Efeitos Especiais de Fundo (Atrás do Grafo) */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <StarsBackground />
                <ShootingStars />
              </div>

              {/* O componente Graph precisa ter um z-index maior */}
              <div className="absolute  inset-0 z-10">
                <Graph classname="h-full w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
