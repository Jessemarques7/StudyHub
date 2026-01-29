"use client";

import { useState, useMemo } from "react";
import { useDiagrams } from "@/contexts/DiagramsContext"; //
import { Diagram } from "@/types/diagrams";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Calendar,
  Folder as FolderIcon,
  MoreVertical,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { IconSitemap } from "@tabler/icons-react"; // Importe do Tabler aqui
import { Input } from "@/components/notes/ui/input";
import { Button } from "@/components/notes/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/flashcards/ui/dropdown-menu";

export default function DiagramsPage() {
  const router = useRouter();
  const { diagrams, folders, addDiagram, deleteDiagram } = useDiagrams(); //
  const [searchQuery, setSearchQuery] = useState("");

  // Filtro de busca por título
  const filteredDiagrams = useMemo(() => {
    return diagrams.filter((diagram) =>
      diagram.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [diagrams, searchQuery]);

  const handleCreateDiagram = async () => {
    try {
      const newDiagram = await addDiagram({ title: "Novo Diagrama" }); //
      router.push(`/diagram/${newDiagram.id}`);
    } catch (error) {
      console.error("Erro ao criar diagrama:", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Diagramas</h1>
          <p className="text-muted-foreground">
            Visualize suas ideias e conexões.
          </p>
        </div>
        <Button
          onClick={handleCreateDiagram}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Novo Diagrama
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar diagramas..."
          className="pl-10 focus-visible:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredDiagrams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {filteredDiagrams.map((diagram) => (
            <div
              key={diagram.id}
              className="group relative border rounded-xl p-4 hover:shadow-md transition-all dark:bg-slate-950 hover:border-blue-500/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <IconSitemap className="h-6 w-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive gap-2"
                      onClick={() => deleteDiagram(diagram.id)} //
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/diagram/${diagram.id}`} className="block">
                <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-blue-500 transition-colors">
                  {diagram.title || "Sem título"}
                </h3>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(diagram.updatedAt, "dd 'de' MMM", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  {diagram.folderId && (
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-3 w-3" />
                      <span className="truncate">
                        {folders.find((f) => f.id === diagram.folderId)?.name ||
                          "Pasta"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl ">
          <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum diagrama encontrado</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Tente buscar com outro termo."
              : "Crie um novo diagrama para começar a organizar seus estudos."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              onClick={handleCreateDiagram}
              className="mt-4"
            >
              Criar primeiro diagrama
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
