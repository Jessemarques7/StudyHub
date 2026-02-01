// // components/notes/ForceGraph.tsx
// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";

// // Dynamically import the ForceGraph2D component with SSR disabled
// const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
//   ssr: false,
// });

// // Define types for our data structure
// interface NodeObject {
//   id: string;
//   name: string;
//   val?: number;
//   x?: number;
//   y?: number;
// }

// interface LinkObject {
//   source: string;
//   target: string;
// }

// interface GraphData {
//   nodes: NodeObject[];
//   links: LinkObject[];
// }

// interface ForceGraphProps {
//   data: GraphData;
// }

// function ForceGraphComponent({ data }: ForceGraphProps) {
//   const router = useRouter();
//   const [isClient, setIsClient] = useState(false);
//   const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

//   // This effect runs only on the client, ensuring window is available
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) {
//     // Render a placeholder or nothing on the server
//     return null;
//   }

//   // Use 'any' to satisfy the library's strict type checking against its own internal types
//   function handleNodeClick(node: any) {
//     if (node && node.id) {
//       router.push(`/notes/${node.id}`);
//     }
//   }

//   function handleNodeHover(node: any) {
//     setHoveredNodeId(node ? node.id : null);
//   }

//   function drawNode(
//     node: any,
//     ctx: CanvasRenderingContext2D,
//     globalScale: number,
//   ) {
//     // Add safety check for coordinates (ForceGraph assigns these)
//     const x = node.x ?? 0;
//     const y = node.y ?? 0;

//     const isHovered = node.id === hoveredNodeId;
//     const nodeRadius = Math.sqrt(node.val || 1) * (isHovered ? 1.5 : 1);

//     // Draw the node circle
//     ctx.beginPath();
//     ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
//     ctx.fillStyle = isHovered ? "#d88ef8be" : "#c5c2ccbe";
//     ctx.fill();

//     // Draw the label below the node
//     const label = node.name;
//     const fontSize = 10 / globalScale;
//     ctx.font = `${fontSize}px Sans-Serif`;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "top";
//     ctx.fillStyle = "#ffffff";
//     ctx.fillText(label, x, y + nodeRadius + 2);
//   }

//   return (
//     <ForceGraph2D
//       graphData={data}
//       nodeCanvasObject={drawNode}
//       nodePointerAreaPaint={(
//         node: any,
//         color: string,
//         ctx: CanvasRenderingContext2D,
//       ) => {
//         const x = node.x ?? 0;
//         const y = node.y ?? 0;
//         const nodeRadius = Math.sqrt(node.val || 1) * 2;
//         ctx.fillStyle = color;
//         ctx.beginPath();
//         ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
//         ctx.fill();
//       }}
//       onNodeClick={handleNodeClick}
//       onNodeHover={handleNodeHover}
//       linkWidth={(link: any) =>
//         link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
//           ? 1.5
//           : 1
//       }
//       linkDirectionalArrowLength={0}
//       linkDirectionalArrowRelPos={1}
//       linkDirectionalParticles={1}
//       linkDirectionalParticleSpeed={0.01}
//       linkDirectionalParticleWidth={1}
//       width={window.innerWidth}
//       height={window.innerHeight}
//       backgroundColor="transparent"
//       linkColor={(link: any) =>
//         link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
//           ? "#d88ef8bd"
//           : "#ffffff33"
//       }
//     />
//   );
// }

// export default ForceGraphComponent;

// components/notes/ForceGraph.tsx
// "use client";

// import { useEffect, useState, useRef } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";

// // Dynamically import the ForceGraph2D component with SSR disabled
// const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
//   ssr: false,
// });

// // Define types for our data structure
// interface NodeObject {
//   id: string;
//   name: string;
//   val?: number;
//   x?: number;
//   y?: number;
// }

// interface LinkObject {
//   source: string;
//   target: string;
// }

// interface GraphData {
//   nodes: NodeObject[];
//   links: LinkObject[];
// }

// interface ForceGraphProps {
//   data: GraphData;
// }

// function ForceGraphComponent({ data }: ForceGraphProps) {
//   const router = useRouter();
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isClient, setIsClient] = useState(false);
//   const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   // This effect runs only on the client, ensuring window is available
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // Resize observer to track container dimensions
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const updateDimensions = () => {
//       if (containerRef.current) {
//         setDimensions({
//           width: containerRef.current.offsetWidth,
//           height: containerRef.current.offsetHeight,
//         });
//       }
//     };

//     // Initial size
//     updateDimensions();

//     // Create ResizeObserver
//     const resizeObserver = new ResizeObserver(updateDimensions);
//     resizeObserver.observe(containerRef.current);

//     // Cleanup
//     return () => {
//       resizeObserver.disconnect();
//     };
//   }, [isClient]);

//   if (!isClient) {
//     // Render a placeholder or nothing on the server
//     return <div ref={containerRef} className="w-full h-full" />;
//   }

//   // Use 'any' to satisfy the library's strict type checking against its own internal types
//   function handleNodeClick(node: any) {
//     if (node && node.id) {
//       router.push(`/notes/${node.id}`);
//     }
//   }

//   function handleNodeHover(node: any) {
//     setHoveredNodeId(node ? node.id : null);
//   }

//   function drawNode(
//     node: any,
//     ctx: CanvasRenderingContext2D,
//     globalScale: number,
//   ) {
//     // Add safety check for coordinates (ForceGraph assigns these)
//     const x = node.x ?? 0;
//     const y = node.y ?? 0;

//     const isHovered = node.id === hoveredNodeId;
//     const nodeRadius = Math.sqrt(node.val || 1) * (isHovered ? 1.5 : 1);

//     // Draw the node circle
//     ctx.beginPath();
//     ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
//     ctx.fillStyle = isHovered ? "#d88ef8be" : "#c5c2ccbe";
//     ctx.fill();

//     // Draw the label below the node
//     const label = node.name;
//     const fontSize = 10 / globalScale;
//     ctx.font = `${fontSize}px Sans-Serif`;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "top";
//     ctx.fillStyle = "#ffffff";
//     ctx.fillText(label, x, y + nodeRadius + 2);
//   }

//   return (
//     <div ref={containerRef} className="w-full h-full">
//       {dimensions.width > 0 && dimensions.height > 0 && (
//         <ForceGraph2D
//           graphData={data}
//           nodeCanvasObject={drawNode}
//           nodePointerAreaPaint={(
//             node: any,
//             color: string,
//             ctx: CanvasRenderingContext2D,
//           ) => {
//             const x = node.x ?? 0;
//             const y = node.y ?? 0;
//             const nodeRadius = Math.sqrt(node.val || 1) * 2;
//             ctx.fillStyle = color;
//             ctx.beginPath();
//             ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
//             ctx.fill();
//           }}
//           onNodeClick={handleNodeClick}
//           onNodeHover={handleNodeHover}
//           linkWidth={(link: any) =>
//             link.source?.id === hoveredNodeId ||
//             link.target?.id === hoveredNodeId
//               ? 1.5
//               : 1
//           }
//           linkDirectionalArrowLength={0}
//           linkDirectionalArrowRelPos={1}
//           linkDirectionalParticles={1}
//           linkDirectionalParticleSpeed={0.01}
//           linkDirectionalParticleWidth={1}
//           width={dimensions.width}
//           height={dimensions.height}
//           backgroundColor="transparent"
//           linkColor={(link: any) =>
//             link.source?.id === hoveredNodeId ||
//             link.target?.id === hoveredNodeId
//               ? "#d88ef8bd"
//               : "#ffffff33"
//           }
//         />
//       )}
//     </div>
//   );
// }

// export default ForceGraphComponent;

// components/notes/ForceGraph.tsx
"use client";

import { useEffect, useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // This effect runs only on the client, ensuring window is available
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Resize observer to track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    // Initial size
    updateDimensions();

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [isClient]);

  if (!isClient) {
    // Render a placeholder or nothing on the server
    return <div ref={containerRef} className="w-full h-full" />;
  }

  // Use 'any' to satisfy the library's strict type checking against its own internal types
  function handleNodeClick(node: any) {
    if (node && node.id) {
      router.push(`/notes/${node.id}`);
    }
  }

  function handleNodeHover(node: any) {
    setHoveredNodeId(node ? node.id : null);
  }

  function drawNode(
    node: any,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    // Add safety check for coordinates (ForceGraph assigns these)
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    const isHovered = node.id === hoveredNodeId;
    const nodeRadius = Math.sqrt(node.val || 1) * (isHovered ? 1.5 : 1);

    // Draw the node circle
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isHovered ? "#d88ef8be" : "#c5c2ccbe";
    ctx.fill();

    // Draw the label below the node
    const label = node.name;
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + nodeRadius + 2);
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          graphData={data}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(
            node: any,
            color: string,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const nodeRadius = Math.sqrt(node.val || 1);

            // Measure text width for accurate hit detection
            const label = node.name;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const textHeight = fontSize;

            // Draw circular node hit area
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius * 2, 0, 2 * Math.PI);
            ctx.fill();

            // Draw rectangular hit area for the label
            const labelY = y + nodeRadius + 2;
            ctx.fillRect(
              x - textWidth / 2 - 2, // Add small padding
              labelY,
              textWidth + 4, // Add padding on both sides
              textHeight + 2, // Add padding top/bottom
            );
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          linkWidth={(link: any) =>
            link.source?.id === hoveredNodeId ||
            link.target?.id === hoveredNodeId
              ? 1.5
              : 1
          }
          linkDirectionalArrowLength={0}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.01}
          linkDirectionalParticleWidth={1}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          linkColor={(link: any) =>
            link.source?.id === hoveredNodeId ||
            link.target?.id === hoveredNodeId
              ? "#d88ef8bd"
              : "#ffffff33"
          }
        />
      )}
    </div>
  );
}

export default ForceGraphComponent;
