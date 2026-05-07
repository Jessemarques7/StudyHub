"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Search, Plus, FolderPlus, FilePlus } from "lucide-react";
import { IconSitemap } from "@tabler/icons-react";

import { useNotes } from "@/contexts/NotesContext";
import { useDiagrams } from "@/contexts/DiagramsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import NotesList from "@/components/notes/NotesList";

const Graph = dynamic(() => import("@/components/notes/Graph"), {
  ssr: false,
});

export default function WorkspacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { addNote, addFolder } = useNotes();
  const { addDiagram } = useDiagrams();

  const handleCreateFolder = async () => {
    await addFolder({ name: "New Folder" });
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await addNote();
      router.push(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Erro ao criar nota", error);
    }
  };

  const handleCreateDiagram = async () => {
    try {
      const newDiagram = await addDiagram({ title: "Untitled Diagram" });
      router.push(`/diagram/${newDiagram.id}`);
    } catch (error) {
      console.error("Erro ao criar diagrama:", error);
    }
  };

  return (
    <div className="flex h-full bg-background text-foreground">
      <div className="relative flex min-h-full flex-1 overflow-hidden rounded-full bg-main">
        <div className="pointer-events-none absolute inset-0 z-0">
          <StarsBackground />
          <ShootingStars />
        </div>
        <div className="absolute inset-0 z-10">
          <Graph classname="h-full w-full" />
        </div>
      </div>

      <div className="relative z-10 mt-10 flex flex-1 flex-col p-4 md:p-8">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
          <div className="flex w-full max-w-4xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar notas, diagramas e pastas..."
                className="h-12 w-full rounded-xl border-secondary bg-third/50 pl-11 text-md focus-visible:ring-complement/40"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleCreateFolder}
                className="gap-2 bg-complement text-font shadow-lg shadow-complement/20 hover:bg-complement/90"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCreateNote}
                className="gap-2 bg-complement text-font shadow-lg shadow-complement/20 hover:bg-complement/90"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCreateDiagram}
                className="gap-2 bg-complement text-font shadow-lg shadow-complement/20 hover:bg-complement/90"
              >
                <IconSitemap className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <NotesList
              opensidebar
              showActions={false}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
