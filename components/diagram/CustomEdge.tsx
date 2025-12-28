// components/diagram/CustomEdge.tsx
import { memo, useState } from "react";
import {
  EdgeToolbar,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import {
  IconPalette,
  IconTransform,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import ColorPicker from "./ColorPicker";

function CustomEdge({ id, selected, style, markerEnd, ...props }: EdgeProps) {
  const { deleteElements, setEdges } = useReactFlow();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [edgePath, centerX, centerY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  const onDelete = () => {
    deleteElements({ edges: [{ id }] });
  };

  const onColorSelect = (color: string) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          // Handle markerEnd logic safely for strings and objects
          let newMarkerEnd = edge.markerEnd;

          if (typeof newMarkerEnd === "string") {
            // If it's a string, convert to object
            newMarkerEnd = { type: newMarkerEnd as any, color: color };
          } else if (newMarkerEnd && typeof newMarkerEnd === "object") {
            // If it's an object, we can safely spread it
            newMarkerEnd = { ...newMarkerEnd, color: color };
          }

          return {
            ...edge,
            style: { ...edge.style, stroke: color },
            markerEnd: newMarkerEnd,
          };
        }
        return edge;
      })
    );
    setShowColorPicker(false);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

      <EdgeToolbar edgeId={id} x={centerX} y={centerY} isVisible={selected}>
        <div className="bg-slate-900 px-4 py-2 mb-2 rounded-[8px] flex items-center justify-center gap-4 border border-slate-700 shadow-xl pointer-events-auto">
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
      </EdgeToolbar>
    </>
  );
}

export default memo(CustomEdge);
