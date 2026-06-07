"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Search, FolderPlus, FilePlus } from "lucide-react";
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
  const [activeGraphNodeId, setActiveGraphNodeId] = useState<string | null>(
    null,
  );

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
    <div className="relative h-full min-h-0 overflow-hidden bg-main text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <StarsBackground />
        <ShootingStars />
      </div>

      <div className="absolute inset-0 z-10">
        <Graph classname="h-full w-full" activeNodeId={activeGraphNodeId} />
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 md:inset-x-6 md:top-12">
        <div className="pointer-events-auto flex w-full flex-col gap-2 rounded-lg  shadow-2xl shadow-black/25 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/35 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2  h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar notas, diagramas e pastas..."
              className="h-11 w-full rounded-full border-white/10 bg-third/45 pl-11 text-sm shadow-sm shadow-black/10 backdrop-blur-xl placeholder:text-font/40 focus-visible:ring-complement/40"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <aside className="absolute bottom-3 right-3 top-[8.5rem] z-20 w-[min(calc(100%-1.5rem),22rem)] overflow-hidden rounded-lg border border-white/10 bg-background/45 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/35 sm:top-[5.75rem] md:bottom-6 md:right-6 md:top-24 md:w-[22rem]">
        <div className="h-full min-h-0 overflow-y-auto pr-1">
          <NotesList
            opensidebar
            searchQuery={searchQuery}
            onGraphNodeActiveChange={setActiveGraphNodeId}
          />
        </div>
      </aside>
    </div>
  );
}
