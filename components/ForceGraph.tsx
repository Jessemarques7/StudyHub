// components/ForceGraph.tsx
"use client"; // This component will only run on the client

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the ForceGraph2D component with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Define types for our data structure
interface NodeObject {
  id: string;
  name: string;
  val?: number;
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

  function handleNodeClick(node) {}

  function handleNodeHover(node) {
    setHoveredNodeId(node ? node.id : null);
  }

  return (
    <ForceGraph2D
      graphData={data}
      nodeLabel="name" // The property to display on hover
      nodeColor={(node) =>
        node.id === hoveredNodeId ? "#d88ef8be" : "#c5c2ccbe"
      }
      nodeRelSize={2}
      nodeVal={(node) =>
        node.id === hoveredNodeId ? node.val * 1.75 : node.val
      }
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
      width={420} // Adjust width as needed
      height={window.innerHeight} // Adjust height as needed
      backgroundColor="transparent" // A dark background color
      linkColor={(link) =>
        link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
          ? "#d88ef8bd"
          : "#ffffff33"
      }
    />
  );
}

export default ForceGraphComponent;
