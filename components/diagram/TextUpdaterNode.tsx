// components/diagram/TextUpdaterNode.tsx
"use client";
import { useCallback, useState } from "react";
import {
  Position,
  Handle,
  NodeResizer,
  NodeToolbar,
  useReactFlow,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  IconPalette,
  IconTransform,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import ColorPicker from "./ColorPicker";

// Define the shape of the node data
type TextUpdaterNodeData = {
  text?: string;
  color?: string;
  toolbarVisible?: boolean;
  toolbarPosition?: Position;
};

export default function TextUpdaterNode({
  id,
  data,
  selected,
}: NodeProps<Node<TextUpdaterNodeData>>) {
  const { deleteElements, updateNodeData } = useReactFlow();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 1. Verifica se existe uma cor salva especificamente neste node
  const isCustomColor = !!data.color;

  // Define a cor ativa (se não houver cor salva, usa roxo apenas para seleção)
  const currentColor = data.color || "var(--color-complement)";

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: evt.target.value });
    },
    [id, updateNodeData]
  );

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const onColorSelect = (color: string) => {
    updateNodeData(id, { color });
    setShowColorPicker(false);
  };

  return (
    <div
      className={cn(
        // O fundo usa tokens para acompanhar o tema customizado.
        "flex w-full h-full flex-col border rounded-[8px] transition-all duration-300",
        selected ? "border-2" : "border"
      )}
      style={{
        // 2. Lógica de Estilo Atualizada:

        // Borda: Aparece se estiver selecionado OU se já tiver uma cor definida
        borderColor:
          selected || isCustomColor ? currentColor : "var(--color-secondary)",

        // Fundo: Se tiver cor, aplica um gradiente suave (10% de opacidade) sobre o fundo escuro.
        // Se não, usa apenas o fundo escuro definido pelo tema.
        background: isCustomColor
          ? `linear-gradient(to bottom right, color-mix(in srgb, ${currentColor} 10%, transparent), color-mix(in srgb, ${currentColor} 3%, transparent)), var(--color-third)`
          : "var(--color-third)",

        // Sombra: Apenas quando selecionado para dar destaque extra
        boxShadow: selected
          ? `0 0 15px color-mix(in srgb, ${currentColor} 30%, transparent)`
          : "none",
      }}
    >
      <textarea
        id="text"
        name="text"
        rows={1}
        defaultValue={data.text}
        onChange={onChange}
        className="flex h-full w-full resize-none bg-transparent px-4 py-2 text-font focus:outline-none focus:ring-0"
      />

      <NodeResizer
        color={currentColor}
        isVisible={selected}
        minWidth={100}
        minHeight={30}
        handleStyle={{ opacity: 0 }}
        lineStyle={{ opacity: 0 }}
      />

      <NodeToolbar
        isVisible={data.toolbarVisible || selected}
        position={data.toolbarPosition || Position.Top}
        align="center"
      >
        <div className="mb-2 flex items-center justify-center gap-4 rounded-[8px] border border-border bg-secondary px-4 py-2 shadow-xl">
          {showColorPicker ? (
            <>
              <ColorPicker onColorSelect={onColorSelect} />
              <button
                onClick={() => setShowColorPicker(false)}
                className="ml-2 text-font/60 hover:text-font"
              >
                <IconX className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                className="cursor-pointer text-font/90 transition-colors hover:text-red-500"
                onClick={onDelete}
              >
                <IconTrash className="h-5 w-5" />
              </button>
              <button
                className="cursor-pointer text-font/90 transition-colors hover:text-complement"
                onClick={() => setShowColorPicker(true)}
              >
                <IconPalette className="h-5 w-5" />
              </button>
              <button className="cursor-pointer text-font/90 transition-colors hover:text-complement">
                <IconTransform className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </NodeToolbar>

      <Handle id="top" type="source" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="right" type="source" position={Position.Right} />
      <Handle id="left" type="source" position={Position.Left} />
    </div>
  );
}
