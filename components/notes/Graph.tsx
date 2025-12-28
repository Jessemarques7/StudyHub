import { useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import ForceGraphComponent from "./ForceGraph";
import { GraphData, GraphLink } from "@/types/notes";
import { Block } from "@blocknote/core";

// Updated interface to handle both old and new mention structures
interface MentionContent {
  type: string;
  props?: {
    // New structure (flat)
    id?: string;
    // Old structure (nested)
    note?: {
      id: string;
    };
  };
}

interface ParagraphBlock extends Block {
  type: "paragraph";
  content?: MentionContent[];
}

function isParagraphBlock(block: Block): block is ParagraphBlock {
  return (
    block.type === "paragraph" &&
    Array.isArray((block as ParagraphBlock).content)
  );
}

// Updated extractor to check both locations
function extractMentionId(contentItem: MentionContent): string | null {
  if (contentItem.type !== "mention" || !contentItem.props) {
    return null;
  }

  // 1. Check new flat structure (from recent fix)
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
      if (!Array.isArray(note.content)) return;

      note.content.forEach((block) => {
        if (!isParagraphBlock(block)) return;

        block.content?.forEach((contentItem) => {
          const targetId = extractMentionId(contentItem);

          if (targetId && validNoteIds.has(targetId)) {
            // Avoid self-loops if desired, though some graphs allow them
            if (note.id !== targetId) {
              extractedLinks.push({
                source: note.id,
                target: targetId,
              });
            }
          }
        });
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
        (connectionCount.get(link.source) || 0) + 1
      );
      connectionCount.set(
        link.target,
        (connectionCount.get(link.target) || 0) + 1
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
    <div className="relative bg-slate-950 h-full">
      <ForceGraphComponent data={graphData} />
    </div>
  );
}
