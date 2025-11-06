"use client";

import { useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import ForceGraphComponent from "./ForceGraph";
import { GraphData, GraphLink } from "@/types/notes";
import { Block } from "@blocknote/core";

interface ContentItem {
  type: string;
  props?: {
    note?: {
      id: string;
      title: string;
    };
  };
}

interface ParagraphBlock extends Block {
  type: "paragraph";
  content: ContentItem[];
}

export default function Graph() {
  const { notes } = useNotes();

  // Extrai os links entre as notas
  const links = useMemo((): GraphLink[] => {
    const extractedLinks: GraphLink[] = [];

    notes.forEach((note) => {
      if (!note.content || !Array.isArray(note.content)) return;

      note.content.forEach((block) => {
        // Verifica se é um parágrafo com conteúdo
        if (block.type === "paragraph" && Array.isArray(block.content)) {
          const paragraphBlock = block as ParagraphBlock;

          paragraphBlock.content.forEach((contentItem) => {
            // Verifica se é uma menção válida
            if (contentItem.type === "mention" && contentItem.props?.note?.id) {
              const targetId = contentItem.props.note.id;

              // Verifica se a nota alvo existe
              const targetExists = notes.some((n) => n.id === targetId);

              if (targetExists) {
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

  // Prepara os dados do grafo
  const graphData: GraphData = useMemo(() => {
    // Calcula quantas conexões cada nota tem
    const connectionCount = new Map<string, number>();

    notes.forEach((note) => {
      connectionCount.set(note.id, 0);
    });

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
        // Tamanho do nó baseado no número de conexões (mínimo 1, máximo 5)
        val: Math.min(Math.max((connectionCount.get(note.id) || 0) + 1, 1), 5),
      })),
      links,
    };
  }, [notes, links]);

  // Não renderiza se não houver notas
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
    <div className="relative bg-slate-950 ">
      <ForceGraphComponent data={graphData} />
    </div>
  );
}
