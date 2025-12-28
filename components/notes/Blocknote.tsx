// components/notes/Blocknote.tsx
"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useCallback, useMemo } from "react";
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
import { debounce } from "lodash";
import { uploadMedia } from "@/lib/storage";
import { toast } from "sonner";

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
  // Configuração do Upload para Supabase
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const publicUrl = await uploadMedia(file, "notes-media");
      if (!publicUrl) {
        toast.error("Failed to upload media");
        return ""; // Retorna vazio para cancelar a inserção se falhar
      }
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading file");
      return "";
    }
  };

  const getMentionMenuItems = useCallback(
    (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem[] => {
      return notes
        .filter((note) => note.id !== currentNote.id)
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
                    // content: note.content <--- REMOVED: This caused the type error
                  },
                },
              },
              " ",
            ]);
          },
        }));
    },
    [notes, currentNote.id]
  );

  // Debounce para evitar salvar a cada caractere digitado (500ms)
  const debouncedUpdate = useMemo(
    () => debounce((blocks: Block[]) => onUpdateNote(blocks), 500),
    [onUpdateNote]
  );

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      currentNote.content && currentNote.content.length > 0
        ? currentNote.content
        : undefined, // undefined faz o BlockNote criar um parágrafo vazio padrão
    uploadFile,
  });

  const handleChange = useCallback(() => {
    debouncedUpdate(editor.document);
  }, [editor, debouncedUpdate]);

  return (
    <BlockNoteView
      onChange={handleChange}
      editor={editor}
      theme="dark"
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
