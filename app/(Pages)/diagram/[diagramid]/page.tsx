"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useState } from "react";
import NotesList from "@/components/notes/NotesList";
import { Button } from "@/components/ui/button";
import { useDiagrams } from "@/contexts/DiagramsContext";
import { cn } from "@/lib/utils";
import type { DiagramContent } from "@/types/diagrams";

const ExcalidrawEditor = dynamic(
  () => import("@/components/diagram/ExcalidrawEditor"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background" />,
  },
);

export default function DiagramPage() {
  const { diagramid } = useParams<{ diagramid: string }>();
  const { getDiagram, isLoading, updateDiagram } = useDiagrams();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const diagram = diagramid ? getDiagram(diagramid) : undefined;

  const handleSave = useCallback(
    async (content: DiagramContent) => {
      if (!diagramid) return;
      await updateDiagram(diagramid, { content });
    },
    [diagramid, updateDiagram],
  );

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
        Loading diagram...
      </div>
    );
  }

  if (!diagram) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
        Diagram not found.
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] min-h-[520px] overflow-hidden bg-background text-foreground">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isSidebarVisible ? "Close workspace" : "Open workspace"}
        title={isSidebarVisible ? "Close workspace" : "Open workspace"}
        onClick={() => setIsSidebarVisible((visible) => !visible)}
        className="absolute left-4 top-4 z-40 border border-border bg-secondary/90 text-font shadow-sm backdrop-blur hover:bg-third hover:text-font"
      >
        {isSidebarVisible ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </Button>

      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-30 w-80 max-w-[calc(100vw-2rem)] border-r border-border bg-background/95 px-4 pb-6 pt-16 shadow-xl backdrop-blur transition-transform duration-200",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full overflow-y-auto pr-1">
          <NotesList opensidebar={isSidebarVisible} />
        </div>
      </aside>

      <ExcalidrawEditor
        key={diagram.id}
        content={diagram.content}
        name={diagram.title || "Untitled Diagram"}
        onSave={handleSave}
      />
    </div>
  );
}
