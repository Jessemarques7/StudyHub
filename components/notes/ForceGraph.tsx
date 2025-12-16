// components/ForceGraph.tsx
"use client"; // This component will only run on the client

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import the ForceGraph2D component with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Define types for our data structure
interface NodeObject {
  id: string;
  name: string;
  val?: number;
  x?: number;
  y?: number;
}

interface LinkObject {
  source: string;
  target: string;
}

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

interface ForceGraphProps {
  data: GraphData;
}

function ForceGraphComponent({ data }: ForceGraphProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // This effect runs only on the client, ensuring window is available
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder or nothing on the server
    return null;
  }

  function handleNodeClick(node) {
    router.push(`/notes/${node.id}`);
  }

  function handleNodeHover(node) {
    setHoveredNodeId(node ? node.id : null);
  }

  function drawNode(node, ctx, globalScale) {
    const isHovered = node.id === hoveredNodeId;
    const nodeRadius = Math.sqrt(node.val || 1) * (isHovered ? 1.5 : 1);

    // Draw the node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isHovered ? "#d88ef8be" : "#c5c2ccbe";
    ctx.fill();

    // Draw the label below the node
    const label = node.name;
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, node.x, node.y + nodeRadius + 2);
  }

  return (
    <ForceGraph2D
      graphData={data}
      nodeCanvasObject={drawNode}
      nodePointerAreaPaint={(node, color, ctx) => {
        const nodeRadius = Math.sqrt(node.val || 1) * 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
      }}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
      linkWidth={(link) =>
        link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
          ? 1.5
          : 1
      }
      linkDirectionalArrowLength={0}
      linkDirectionalArrowRelPos={1}
      linkDirectionalParticles={1}
      linkDirectionalParticleSpeed={0.01}
      linkDirectionalParticleWidth={1}
      width={420}
      height={window.innerHeight}
      backgroundColor="transparent"
      linkColor={(link) =>
        link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
          ? "#d88ef8bd"
          : "#ffffff33"
      }
    />
  );
}

export default ForceGraphComponent;
