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
  const currentColor = data.color || "#9e86ed";

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
        // Removemos o bg-slate-900 fixo e controlaremos via style para transição suave
        "flex w-full h-full flex-col border rounded-[8px] transition-all duration-300",
        selected ? "border-2" : "border"
      )}
      style={{
        // 2. Lógica de Estilo Atualizada:

        // Borda: Aparece se estiver selecionado OU se já tiver uma cor definida
        borderColor: selected || isCustomColor ? currentColor : "#334155",

        // Fundo: Se tiver cor, aplica um gradiente suave (10% de opacidade) sobre o fundo escuro.
        // Se não, usa apenas o fundo escuro padrão (#0f172a = slate-900).
        background: isCustomColor
          ? `linear-gradient(to bottom right, ${currentColor}1A, ${currentColor}05), #0f172a`
          : "#0f172a",

        // Sombra: Apenas quando selecionado para dar destaque extra
        boxShadow: selected ? `0 0 15px ${currentColor}30` : "none",
      }}
    >
      <textarea
        id="text"
        name="text"
        rows={1}
        defaultValue={data.text}
        onChange={onChange}
        className="resize-none flex w-full h-full px-4 py-2 focus:outline-none focus:ring-0 bg-transparent text-white"
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
        <div className="bg-slate-900 px-4 py-2 mb-2 rounded-[8px] flex items-center justify-center gap-4 border border-slate-700 shadow-xl">
          {showColorPicker ? (
            <>
              <ColorPicker onColorSelect={onColorSelect} />
              <button
                onClick={() => setShowColorPicker(false)}
                className="ml-2 hover:text-white text-slate-400"
              >
                <IconX className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                className="cursor-pointer hover:text-red-500 transition-colors text-slate-200"
                onClick={onDelete}
              >
                <IconTrash className="h-5 w-5" />
              </button>
              <button
                className="cursor-pointer hover:text-purple-400 transition-colors text-slate-200"
                onClick={() => setShowColorPicker(true)}
              >
                <IconPalette className="h-5 w-5" />
              </button>
              <button className="cursor-pointer hover:text-blue-400 transition-colors text-slate-200">
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
