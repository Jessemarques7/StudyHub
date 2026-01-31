import { useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import ForceGraphComponent from "./ForceGraph";
import { GraphData, GraphLink } from "@/types/notes";

interface MentionContent {
  type: string;
  props?: {
    id?: string;
    note?: {
      id: string;
    };
  };
}

function extractMentionId(contentItem: MentionContent): string | null {
  if (contentItem.type !== "mention" || !contentItem.props) {
    return null;
  }

  // 1. Check new flat structure
  if (contentItem.props.id) {
    return contentItem.props.id;
  }

  // 2. Check old nested structure (backward compatibility)
  if (contentItem.props.note?.id) {
    return contentItem.props.note.id;
  }

  return null;
}

export default function Graph() {
  const { notes } = useNotes();

  // Extrai os links das menções nas notas
  const links = useMemo((): GraphLink[] => {
    const extractedLinks: GraphLink[] = [];
    const validNoteIds = new Set(notes.map((n) => n.id));

    notes.forEach((note) => {
      // Safety check for note content
      if (!Array.isArray(note.content)) return;

      note.content.forEach((block) => {
        // Explicitly check if content is an array before iterating
        // This avoids TypeScript errors with TableContent (which is an object)
        if (block.type === "paragraph" && Array.isArray(block.content)) {
          // Cast to unknown first, then to our expected array type to safely iterate
          const contentItems = block.content as unknown as MentionContent[];

          contentItems.forEach((contentItem) => {
            const targetId = extractMentionId(contentItem);

            if (targetId && validNoteIds.has(targetId)) {
              if (note.id !== targetId) {
                extractedLinks.push({
                  source: note.id,
                  target: targetId,
                });
              }
            }
          });
        }
      });
    });

    return extractedLinks;
  }, [notes]);

  // Calcula o tamanho dos nós baseado nas conexões
  const graphData: GraphData = useMemo(() => {
    const connectionCount = new Map<string, number>();

    // Inicializa contador
    notes.forEach((note) => {
      connectionCount.set(note.id, 0);
    });

    // Conta conexões
    links.forEach((link) => {
      connectionCount.set(
        link.source,
        (connectionCount.get(link.source) || 0) + 1,
      );
      connectionCount.set(
        link.target,
        (connectionCount.get(link.target) || 0) + 1,
      );
    });

    return {
      nodes: notes.map((note) => ({
        id: note.id,
        name: note.title || "Untitled",
        // Tamanho baseado em conexões (1-5 range)
        val: Math.min(Math.max((connectionCount.get(note.id) || 0) + 1, 1), 5),
      })),
      links,
    };
  }, [notes, links]);

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground text-center">
          Create some notes to see the graph
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-red-950 h-full">
      <ForceGraphComponent data={graphData} />
    </div>
  );
}
