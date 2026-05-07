import { useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { useDiagrams } from "@/contexts/DiagramsContext";
import ForceGraphComponent from "./ForceGraph";
import { GraphData, GraphLink } from "@/types/notes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

  if (contentItem.props.id) {
    return contentItem.props.id;
  }

  if (contentItem.props.note?.id) {
    return contentItem.props.note.id;
  }

  return null;
}

export default function Graph({ classname }: { classname?: string }) {
  const { notes } = useNotes();
  const { diagrams } = useDiagrams();

  const links = useMemo((): GraphLink[] => {
    const extractedLinks: GraphLink[] = [];
    const validNoteIds = new Set(notes.map((note) => note.id));

    notes.forEach((note) => {
      if (!Array.isArray(note.content)) return;

      note.content.forEach((block) => {
        if (block.type === "paragraph" && Array.isArray(block.content)) {
          const contentItems = block.content as unknown as MentionContent[];

          contentItems.forEach((contentItem) => {
            const targetId = extractMentionId(contentItem);

            if (targetId && validNoteIds.has(targetId) && note.id !== targetId) {
              extractedLinks.push({
                source: `note:${note.id}`,
                target: `note:${targetId}`,
              });
            }
          });
        }
      });
    });

    return extractedLinks;
  }, [notes]);

  const graphData: GraphData = useMemo(() => {
    const connectionCount = new Map<string, number>();

    notes.forEach((note) => {
      connectionCount.set(`note:${note.id}`, 0);
    });

    diagrams.forEach((diagram) => {
      connectionCount.set(`diagram:${diagram.id}`, 0);
    });

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
      nodes: [
        ...notes.map((note) => ({
          id: `note:${note.id}`,
          rawId: note.id,
          name: note.title || "Untitled",
          val: Math.min(
            Math.max((connectionCount.get(`note:${note.id}`) || 0) + 1, 1),
            5,
          ),
          kind: "note" as const,
        })),
        ...diagrams.map((diagram) => ({
          id: `diagram:${diagram.id}`,
          rawId: diagram.id,
          name: diagram.title || "Untitled Diagram",
          val: Math.min(
            Math.max(
              (connectionCount.get(`diagram:${diagram.id}`) || 0) + 1,
              1,
            ),
            5,
          ),
          kind: "diagram" as const,
        })),
      ],
      links,
    };
  }, [notes, diagrams, links]);

  if (notes.length === 0 && diagrams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-muted-foreground">
          Create notes or diagrams to see the graph
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${classname || ""}`}>
      <ErrorBoundary>
        <ForceGraphComponent data={graphData} />
      </ErrorBoundary>
    </div>
  );
}
