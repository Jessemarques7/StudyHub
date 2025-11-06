"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useCallback, useMemo, useEffect } from "react";
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  Block,
  BlockNoteSchema,
  defaultInlineContentSpecs,
  filterSuggestionItems,
} from "@blocknote/core";

import { Mention } from "./Mention";
import { Note } from "@/types/notes";

// Schema customizado com menções
const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
  },
});

interface BlocknoteProps {
  onUpdateNote: (blocks: Block[]) => void;
  currentNote: Note;
  notes: Note[];
}

export default function Blocknote({
  onUpdateNote,
  currentNote,
  notes,
}: BlocknoteProps) {
  // Cria os itens do menu de menções
  const getMentionMenuItems = useCallback(
    (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem[] => {
      return notes
        .filter((note) => note.id !== currentNote.id) // Não menciona a si mesmo
        .map((note) => ({
          title: note.title,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "mention",
                props: {
                  note: {
                    id: note.id,
                    title: note.title,
                    content: note.content,
                  },
                },
              },
              " ", // Espaço após a menção
            ]);
          },
        }));
    },
    [notes, currentNote.id]
  );

  // Cria o editor com o schema customizado
  const editor = useCreateBlockNote({
    schema,
    initialContent:
      currentNote.content.length > 0 ? currentNote.content : undefined,
  });

  // Atualiza o conteúdo quando muda
  const handleChange = useCallback(() => {
    onUpdateNote(editor.document);
  }, [editor, onUpdateNote]);

  // Sincroniza o conteúdo quando a nota muda
  useEffect(() => {
    if (currentNote.content.length > 0) {
      editor.replaceBlocks(editor.document, currentNote.content);
    }
  }, [currentNote.id]); // Apenas quando muda de nota

  return (
    <BlockNoteView
      onChange={handleChange}
      theme="dark"
      editor={editor}
      shadCNComponents={{}}
      style={
        {
          "--bn-colors-editor-background": "transparent",
        } as React.CSSProperties
      }
    >
      <SuggestionMenuController
        triggerCharacter="@"
        getItems={async (query) =>
          filterSuggestionItems(getMentionMenuItems(editor), query)
        }
      />
    </BlockNoteView>
  );
}
