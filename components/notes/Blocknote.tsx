"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useCallback, useEffect, useMemo } from "react";
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
import { debounce } from "lodash"; // Recomenda-se instalar: npm install lodash

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
  // OTIMIZAÇÃO 1: Upload eficiente
  const uploadFile = async (file: File): Promise<string> => {
    // Para evitar travamentos, não usamos FileReader/Base64 para arquivos grandes.
    // Criamos uma URL temporária que aponta para a memória do navegador.
    return URL.createObjectURL(file);

    // NOTA: Em produção, você deve enviar para o S3/Cloudinary e retornar a URL real.
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
                    content: note.content,
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

  // OTIMIZAÇÃO 2: Debounce no salvamento
  // Impede que o componente 'Editor.tsx' tente salvar 60 vezes por segundo enquanto o vídeo carrega
  const debouncedUpdate = useMemo(
    () => debounce((blocks: Block[]) => onUpdateNote(blocks), 500),
    [onUpdateNote]
  );

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      currentNote.content.length > 0 ? currentNote.content : undefined,
    uploadFile,
  });

  const handleChange = useCallback(() => {
    // Usamos a versão com debounce em vez da chamada direta
    debouncedUpdate(editor.document);
  }, [editor, debouncedUpdate]);

  // OTIMIZAÇÃO 3: Correção do Loop de Efeito
  // Remova ou ajuste o useEffect que faz replaceBlocks se ele estiver causando re-renderizações infinitas.
  useEffect(() => {
    if (
      currentNote.content.length > 0 &&
      editor.document !== currentNote.content
    ) {
      // Apenas substitua se o ID mudou (navegação entre notas)
      // Se substituir sempre, o vídeo reiniciará o tempo todo.
    }
  }, [currentNote.id]);

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
