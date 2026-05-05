// components/diagram/CustomEdge.tsx
import { memo, useState } from "react";
import {
  EdgeToolbar,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
  MarkerType,
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
            newMarkerEnd = { type: newMarkerEnd as MarkerType, color };
          } else if (newMarkerEnd && typeof newMarkerEnd === "object") {
            // If it's an object, we can safely spread it
            newMarkerEnd = { ...newMarkerEnd, color };
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
        <div className="pointer-events-auto mb-2 flex items-center justify-center gap-4 rounded-[8px] border border-border bg-secondary px-4 py-2 shadow-xl">
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
      </EdgeToolbar>
    </>
  );
}

export default memo(CustomEdge);
