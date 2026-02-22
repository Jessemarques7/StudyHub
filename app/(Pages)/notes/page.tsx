// "use client";

// import { useState, useMemo } from "react";
// import { useNotes } from "@/contexts/NotesContext";
// import { Note } from "@/types/notes";
// import Link from "next/link";
// import {
//   Search,
//   Plus,
//   FileText,
//   Calendar,
//   Folder as FolderIcon,
//   MoreVertical,
//   Trash2,
//   Smile,
// } from "lucide-react";
// import { Input } from "@/components/notes/ui/input";
// import { Button } from "@/components/notes/ui/button";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/flashcards/ui/dropdown-menu";

// export default function NotesPage() {
//   const { notes, folders, addNote, deleteNote } = useNotes();
//   const [searchQuery, setSearchQuery] = useState("");

//   // Filtro de busca (por título)
//   const filteredNotes = useMemo(() => {
//     return notes.filter((note) =>
//       note.title.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//   }, [notes, searchQuery]);

//   const handleCreateNote = async () => {
//     try {
//       const newNote = await addNote(); // Utiliza a função do context
//       // Opcional: redirecionar para a nova nota
//       // router.push(`/notes/${newNote.id}`);
//     } catch (error) {
//       console.error("Erro ao criar nota", error);
//     }
//   };

//   // --- Renderização de Itens ---
//   const renderIcon = (note: Note) => {
//     if (!note.icon) {
//       return <Smile className="w-16 h-16 text-slate-600 p-2" />;
//     }

//     if (note.icon.startsWith("data:")) {
//       return <img src={note.icon} alt="Note icon" className="h-8" />;
//     }

//     return <span className="text-md">{note.icon}</span>;
//   };

//   return (
//     <div className="p-8 max-w-6xl mx-auto rounded-xl bg-slate-900 text-foreground overflow-hidden selection:bg-primary/20 flex flex-col bg-[radial-gradient(at_7%_13%,hsl(206,74%,17%)_0,transparent_29%),radial-gradient(at_82%_65%,hsl(217,59%,21%)_0,transparent_45%)] ">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-3xl font-bold">Minhas Notas</h1>
//           <p className="text-muted-foreground">
//             Gerencie seus estudos e anotações.
//           </p>
//         </div>
//         <Button onClick={handleCreateNote} className="gap-2">
//           <Plus className="h-4 w-4" /> Nova Nota
//         </Button>
//       </div>

//       {/* Barra de Busca */}
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Buscar notas pelo título..."
//           className="pl-10"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {filteredNotes.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
//           {filteredNotes.map((note) => (
//             <div
//               key={note.id}
//               className="group relative border rounded-xl p-4 hover:shadow-md transition-all dark:bg-slate-950"
//             >
//               <Link href={`/notes/${note.id}`} className="block">
//                 <div className="flex items-start justify-between mb-2">
//                   <span className="text-2xl">{renderIcon(note) || "📄"}</span>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger
//                       asChild
//                       onClick={(e) => e.preventDefault()}
//                     >
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 opacity-0 group-hover:opacity-100"
//                       >
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem
//                         className="text-destructive gap-2"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           deleteNote(note.id);
//                         }}
//                       >
//                         <Trash2 className="h-4 w-4" /> Excluir
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>

//                 <h3 className="font-semibold text-lg line-clamp-1 mb-2">
//                   {note.title || "Sem título"}
//                 </h3>

//                 <div className="space-y-1 text-sm text-muted-foreground">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-3 w-3" />
//                     <span>
//                       {/* Alterado de newNote para note */}
//                       {format(note.updatedAt, "dd 'de' MMM", { locale: ptBR })}
//                     </span>
//                   </div>
//                   {note.folderId && (
//                     <div className="flex items-center gap-2">
//                       <FolderIcon className="h-3 w-3" />
//                       <span>
//                         {folders.find((f) => f.id === note.folderId)?.name ||
//                           "Pasta"}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </Link>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-20 border-2 border-dashed rounded-xl">
//           <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//           <h3 className="text-lg font-medium">Nenhuma nota encontrada</h3>
//           <p className="text-muted-foreground">
//             {searchQuery
//               ? "Tente ajustar sua busca."
//               : "Comece criando sua primeira anotação!"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/notes/ui/input";
import { Button } from "@/components/notes/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/flashcards/ui/dropdown-menu";
import Graph from "@/components/notes/Graph";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

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
    if (!note.icon) return <Smile className="w-16 h-16 text-slate-600 p-2" />;
    if (note.icon.startsWith("data:"))
      return <img src={note.icon} alt="Note icon" className="h-8" />;
    return <span className="text-md">{note.icon}</span>;
  };

  return (
    <div className="min-h-screen  p-4 md:p-8  text-foreground selection:bg-primary/20 flex flex-col bg-[radial-gradient(at_7%_13%,hsl(206,74%,17%)_0,transparent_29%),radial-gradient(at_82%_65%,hsl(217,59%,21%)_0,transparent_45%)]">
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
                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 text-white"
              >
                <Plus className="h-4 w-4" /> Novo Diagrama
              </Button>
            )}
          </div>
        </div>

        {/* Navegação de Abas (Tabs) elegantes */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/50 border border-slate-800 rounded-xl w-fit backdrop-blur-sm">
          <button
            onClick={() => setActiveView("notes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === "notes"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="h-4 w-4" />
            Notas
          </button>
          <button
            onClick={() => setActiveView("diagrams")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === "diagrams"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <IconSitemap className="h-4 w-4" />
            Diagramas
          </button>
          <button
            onClick={() => setActiveView("graph")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === "graph"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
              className="pl-11 h-12 bg-slate-950/50 border-slate-800 focus-visible:ring-slate-700 text-md rounded-xl"
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
                    className="group relative border border-slate-800 bg-slate-950/50 backdrop-blur-sm rounded-2xl p-5 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-xl"
                  >
                    <Link
                      href={`/notes/${note.id}`}
                      className="block h-full flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-center">
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
                              className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800"
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
                      <h3 className="font-semibold text-lg line-clamp-1 mb-3 text-slate-200 group-hover:text-white transition-colors">
                        {note.title || "Sem título"}
                      </h3>
                      <div className="mt-auto space-y-2 text-sm text-slate-500">
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
                              {notesFolders.find((f) => f.id === note.folderId)
                                ?.name || "Pasta"}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950/30">
                <div className="bg-slate-900 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma nota encontrada
                </h3>
                <p className="text-slate-500 text-center max-w-sm">
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
                    className="group relative border border-slate-800 bg-slate-950/50 backdrop-blur-sm rounded-2xl p-5 hover:bg-slate-900 transition-all hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10"
                  >
                    <Link
                      href={`/diagram/${diagram.id}`}
                      className="block h-full flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
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
                              className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800"
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
                      <h3 className="font-semibold text-lg line-clamp-1 mb-3 text-slate-200 group-hover:text-blue-400 transition-colors">
                        {diagram.title || "Sem título"}
                      </h3>
                      <div className="mt-auto space-y-2 text-sm text-slate-500">
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
              <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950/30">
                <div className="bg-blue-500/10 p-4 rounded-full mb-4 border border-blue-500/20">
                  <LayoutDashboard className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum diagrama</h3>
                <p className="text-slate-500 text-center max-w-sm">
                  {searchQuery
                    ? "Nenhum diagrama corresponde à sua busca."
                    : "Mapeie os seus pensamentos visualmente criando o seu primeiro diagrama."}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={handleCreateDiagram}
                    className="mt-6 border-slate-700 hover:bg-slate-800"
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
          <div className="flex-1 h-[70vh] min-h-[500px] w-full rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative">
            {/* Efeitos Especiais de Fundo (Atrás do Grafo) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <StarsBackground />
              <ShootingStars />
            </div>

            {/* O componente Graph precisa ter um z-index maior */}
            <div className="absolute inset-0 z-10">
              <Graph classname="h-full w-full" />
            </div>

            {/* Restante código da legenda... */}
          </div>
        )}
      </div>
    </div>
  );
}
