"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core";
import "@blocknote/shadcn/style.css";

export default function Blocknote({
  onUpdateNote,
  currentNote,
}: {
  onUpdateNote: (blocks: Block[]) => void;
  currentNote: { content: Block[] };
}) {
  function handleUpdateNote(blocks: Block[]) {
    onUpdateNote(blocks);
  }

  const editor = useCreateBlockNote({ initialContent: currentNote.content });

  return (
    <BlockNoteView
      onChange={() => handleUpdateNote(editor.document)}
      theme={"dark"}
      editor={editor}
      shadCNComponents={{}}
      // Adicione esta prop 'style'
      style={
        {
          "--bn-colors-editor-background": "transparent",
        } as React.CSSProperties // Cast para CSSProperties se o TypeScript reclamar
      }
    />
  );
}
