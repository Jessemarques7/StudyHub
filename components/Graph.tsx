"use client";
import { useNotes } from "@/contexts/NotesContext";
import ForceGraphComponent from "./ForceGraph";

// const sampleData = {
//   nodes: [
//     { id: "id1", name: "Node 1", val: 1 },
//     { id: "id2", name: "Node 2", val: 1 },
//     { id: "id3", name: "Node 3", val: 1 },
//     { id: "id4", name: "Node 4", val: 1 },
//     { id: "id5", name: "Node 5", val: 1 },
//     { id: "id6", name: "Node 6", val: 1 },
//     { id: "id7", name: "Node 7", val: 1 },
//   ],
//   links: [
//     { source: "id1", target: "id3" },
//     { source: "id2", target: "id4" },
//     { source: "id5", target: "id1" },
//     { source: "id6", target: "id2" },
//     { source: "id2", target: "id6" },
//     { source: "id7", target: "id1" },
//     { source: "id7", target: "id2" },
//   ],
// };

export default function Graph() {
  const { notes } = useNotes();

  const data = {
    nodes: notes.map((note) => ({
      id: note.id,
      name: note.title,
      val: 1,
    })),
    links: [],
  };

  return (
    <div className="">
      <ForceGraphComponent data={data} />
    </div>
  );
}
