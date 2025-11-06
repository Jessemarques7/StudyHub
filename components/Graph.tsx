// "use client";
// import { useNotes } from "@/contexts/NotesContext";
// import ForceGraphComponent from "./ForceGraph";
// import { json } from "stream/consumers";

// // const sampleData = {
// //   nodes: [
// //     { id: "id1", name: "Node 1", val: 1 },
// //     { id: "id2", name: "Node 2", val: 1 },
// //     { id: "id3", name: "Node 3", val: 1 },
// //     { id: "id4", name: "Node 4", val: 1 },
// //     { id: "id5", name: "Node 5", val: 1 },
// //     { id: "id6", name: "Node 6", val: 1 },
// //     { id: "id7", name: "Node 7", val: 1 },
// //   ],
// //   links: [
// //     { source: "id1", target: "id3" },
// //     { source: "id2", target: "id4" },
// //     { source: "id5", target: "id1" },
// //     { source: "id6", target: "id2" },
// //     { source: "id2", target: "id6" },
// //     { source: "id7", target: "id1" },
// //     { source: "id7", target: "id2" },
// //   ],
// // };

// // const noteData = [
// //   {
// //     id: "0c2ffc44-f314-4ca2-8cab-60e2f58d4d98",
// //     title: "My First Note",
// //     content: [
// //       {
// //         id: "13188736-f34f-466f-a985-f330e2f5414a",
// //         type: "heading",
// //         props: {
// //           backgroundColor: "default",
// //           textColor: "default",
// //           textAlignment: "left",
// //           level: 1,
// //           isToggleable: false,
// //         },
// //         content: [
// //           {
// //             type: "text",
// //             text: "My First Note",
// //             styles: {},
// //           },
// //         ],
// //         children: [],
// //       },
// //       {
// //         id: "93af5aab-df8b-488d-a28a-149e1c584bdc",
// //         type: "paragraph",
// //         props: {
// //           backgroundColor: "default",
// //           textColor: "default",
// //           textAlignment: "left",
// //         },
// //         content: [
// //           {
// //             type: "mention",
// //             props: {
// //               note: {
// //                 id: "b2580ad4-82ca-4a3a-b053-d91e4d6849fc",
// //                 title: "Untitled",
// //                 content: [
// //                   {
// //                     type: "heading",
// //                     content: "untitled",
// //                   },
// //                 ],
// //               },
// //             },
// //           },
// //           {
// //             type: "text",
// //             text: " adsdadasdad",
// //             styles: {},
// //           },
// //         ],
// //         children: [],
// //       },
// //       {
// //         id: "d75b6aba-9b55-4e1e-bc24-14f9cb7dd743",
// //         type: "paragraph",
// //         props: {
// //           backgroundColor: "default",
// //           textColor: "default",
// //           textAlignment: "left",
// //         },
// //         content: [],
// //         children: [],
// //       },
// //     ],
// //   },
// //   {
// //     id: "b2580ad4-82ca-4a3a-b053-d91e4d6849fc",
// //     title: "Untitled",
// //     content: [
// //       {
// //         type: "heading",
// //         content: "untitled",
// //       },
// //     ],
// //   },
// // ];

// export default function Graph() {
//   const { notes } = useNotes();
//   function getLinks(): { source: string; target: string }[] {
//     const links: { source: string; target: string }[] = [];
//     notes.forEach((note) => {
//       note.content.forEach((block) => {
//         if (block.type === "paragraph") {
//           block.content.forEach((contentItem) => {
//             if (contentItem.type === "mention") {
//               links.push({
//                 source: note.id,
//                 target: contentItem.props.note.id,
//               });
//             }
//           });
//         }
//       });
//     });
//     return links;
//   }

//   const data = {
//     nodes: notes.map((note) => ({
//       id: note.id,
//       name: note.title,
//       val: 1,
//     })),
//     links: getLinks(),
//   };

//   return (
//     <div className="">
//       <ForceGraphComponent data={data} />
//     </div>
//   );
// }

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
    <div className="relative bg-neutral-900 ">
      <ForceGraphComponent data={graphData} />
    </div>
  );
}
