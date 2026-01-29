"use client";

import { useState, useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { Note } from "@/types/notes";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Folder as FolderIcon,
  MoreVertical,
  Trash2,
  Smile,
} from "lucide-react";
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

export default function NotesPage() {
  const { notes, folders, addNote, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtro de busca (por título)
  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [notes, searchQuery]);

  const handleCreateNote = async () => {
    try {
      const newNote = await addNote(); // Utiliza a função do context
      // Opcional: redirecionar para a nova nota
      // router.push(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Erro ao criar nota", error);
    }
  };

  // --- Renderização de Itens ---
  const renderIcon = (note: Note) => {
    if (!note.icon) {
      return <Smile className="w-16 h-16 text-slate-600 p-2" />;
    }

    if (note.icon.startsWith("data:")) {
      return <img src={note.icon} alt="Note icon" className="h-8" />;
    }

    return <span className="text-md">{note.icon}</span>;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Minhas Notas</h1>
          <p className="text-muted-foreground">
            Gerencie seus estudos e anotações.
          </p>
        </div>
        <Button onClick={handleCreateNote} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Nota
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar notas pelo título..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group relative border rounded-xl p-4 hover:shadow-md transition-all dark:bg-slate-950"
            >
              <Link href={`/notes/${note.id}`} className="block">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{renderIcon(note) || "📄"}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.preventDefault()}
                    >
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

                <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                  {note.title || "Sem título"}
                </h3>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {/* Alterado de newNote para note */}
                      {format(note.updatedAt, "dd 'de' MMM", { locale: ptBR })}
                    </span>
                  </div>
                  {note.folderId && (
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-3 w-3" />
                      <span>
                        {folders.find((f) => f.id === note.folderId)?.name ||
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
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma nota encontrada</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Tente ajustar sua busca."
              : "Comece criando sua primeira anotação!"}
          </p>
        </div>
      )}
    </div>
  );
}
