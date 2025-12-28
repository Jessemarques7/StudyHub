// components/diagram/ImageNode.tsx
"use client";
import { useCallback, useState, useRef } from "react";
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
  IconTrash,
  IconX,
  IconUpload,
  IconPhoto,
} from "@tabler/icons-react";
import ColorPicker from "./ColorPicker";

// Define the shape of your node's data
type ImageNodeData = {
  image?: string;
  color?: string;
  toolbarVisible?: boolean;
  toolbarPosition?: Position;
};

// Apply the type to the component props
export default function ImageNode({
  id,
  data,
  selected,
}: NodeProps<Node<ImageNodeData>>) {
  const { deleteElements, updateNodeData, setNodes } = useReactFlow();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCustomColor = !!data.color;
  const currentColor = data.color || "#9e86ed";

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const file = evt.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;

          // 1. Cria uma imagem temporária para ler as dimensões originais
          const img = new Image();
          img.src = result;
          img.onload = () => {
            // 2. Define uma largura padrão razoável (ex: 200px)
            const targetWidth = 200;
            // 3. Calcula a altura proporcional
            const aspectRatio = img.height / img.width;
            const targetHeight = targetWidth * aspectRatio;

            // 4. Atualiza as dimensões do nó no React Flow
            setNodes((nodes) =>
              nodes.map((node) => {
                if (node.id === id) {
                  return {
                    ...node,
                    style: {
                      ...node.style,
                      width: targetWidth,
                      height: targetHeight,
                    },
                  };
                }
                return node;
              })
            );

            // 5. Salva a imagem nos dados
            updateNodeData(id, { image: result });
          };
        };
        reader.readAsDataURL(file);
      }
    },
    [id, updateNodeData, setNodes]
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
        "flex w-full h-full flex-col border rounded-[12px] transition-all duration-300 overflow-hidden relative group bg-slate-900",
        selected ? "border-2" : "border"
      )}
      style={{
        borderColor: selected || isCustomColor ? currentColor : "#334155",
        background: isCustomColor
          ? `linear-gradient(to bottom right, ${currentColor}1A, ${currentColor}05), #0f172a`
          : "#0f172a",
        boxShadow: selected ? `0 0 20px ${currentColor}20` : "none",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full h-full flex items-center justify-center">
        {data.image ? (
          <img
            src={data.image}
            alt="Node content"
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer p-4 transition-colors w-full h-full"
            onClick={handleUploadClick}
          >
            <IconPhoto className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
              Add Image
            </span>
          </div>
        )}
      </div>

      <NodeResizer
        color={currentColor}
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
        lineStyle={{ opacity: 0 }}
      />

      <NodeToolbar
        isVisible={data.toolbarVisible || selected}
        position={data.toolbarPosition || Position.Top}
        align="center"
        offset={10}
      >
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center justify-center gap-3 border border-slate-700 shadow-2xl">
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
                className="hover:text-red-400 transition-colors text-slate-300"
                onClick={onDelete}
              >
                <IconTrash className="h-4 w-4" />
              </button>
              <button
                className="hover:text-purple-400 transition-colors text-slate-300"
                onClick={() => setShowColorPicker(true)}
              >
                <IconPalette className="h-4 w-4" />
              </button>
              <button
                className="hover:text-blue-400 transition-colors text-slate-300"
                onClick={handleUploadClick}
              >
                <IconUpload className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </NodeToolbar>

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="w-3 h-3 border-2 border-slate-900"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-slate-900"
      />
      <Handle
        id="right"
        type="source" // Fixed: Added type
        position={Position.Right}
        className="w-3 h-3 border-2 border-slate-900"
      />
      <Handle
        id="left"
        type="source" // Fixed: Added type
        position={Position.Left}
        className="w-3 h-3 border-2 border-slate-900"
      />
    </div>
  );
}
