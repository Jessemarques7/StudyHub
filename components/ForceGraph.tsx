// // components/ForceGraph.tsx
// "use client"; // This component will only run on the client

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// // Dynamically import the ForceGraph2D component with SSR disabled
// const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
//   ssr: false,
// });

// // Define types for our data structure
// interface NodeObject {
//   id: string;
//   name: string;
//   val?: number;
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

//   function handleNodeClick(node) {}

//   function handleNodeHover(node) {
//     setHoveredNodeId(node ? node.id : null);
//   }

//   return (
//     <ForceGraph2D
//       graphData={data}
//       nodeLabel="name" // The property to display on hover
//       nodeColor={(node) =>
//         node.id === hoveredNodeId ? "#d88ef8be" : "#c5c2ccbe"
//       }
//       nodeRelSize={2}
//       nodeVal={(node) =>
//         node.id === hoveredNodeId ? node.val * 1.75 : node.val
//       }
//       onNodeClick={handleNodeClick}
//       onNodeHover={handleNodeHover}
//       linkWidth={(link) =>
//         link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
//           ? 1.5
//           : 1
//       }
//       linkDirectionalArrowLength={0}
//       linkDirectionalArrowRelPos={1}
//       linkDirectionalParticles={1}
//       linkDirectionalParticleSpeed={0.01}
//       linkDirectionalParticleWidth={1}
//       width={420} // Adjust width as needed
//       height={window.innerHeight} // Adjust height as needed
//       backgroundColor="transparent" // A dark background color
//       linkColor={(link) =>
//         link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
//           ? "#d88ef8bd"
//           : "#ffffff33"
//       }
//     />
//   );
// }

// export default ForceGraphComponent;

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { GraphData } from "@/types/notes";

// Importa dinamicamente com SSR desabilitado
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface ForceGraphProps {
  data: GraphData;
}

function ForceGraphComponent({ data }: ForceGraphProps) {
  const [isClient, setIsClient] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 420, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Garante que renderiza apenas no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Atualiza dimensões responsivamente
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [isClient]);

  // Manipula clique no nó
  const handleNodeClick = useCallback((node: any) => {
    // Pode adicionar navegação aqui
    console.log("Clicked node:", node);
  }, []);

  // Manipula hover no nó
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNodeId(node ? node.id : null);
  }, []);

  // Retorna null no servidor
  if (!isClient) {
    return (
      <div
        ref={containerRef}
        className="w-full h-screen flex items-center justify-center"
      >
        <div className="text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  // Retorna mensagem se não houver dados
  if (data.nodes.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-screen flex items-center justify-center"
      >
        <div className="text-muted-foreground">No data to display</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-screen">
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeColor={(node: any) =>
          node.id === hoveredNodeId ? "#d88ef8be" : "#c5c2ccbe"
        }
        nodeRelSize={3}
        nodeVal={(node: any) =>
          node.id === hoveredNodeId ? node.val * 1.75 : node.val
        }
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkWidth={(link: any) =>
          link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
            ? 2
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
          link.source?.id === hoveredNodeId || link.target?.id === hoveredNodeId
            ? "#d88ef8bd"
            : "#ffffff33"
        }
        // Performance otimizations
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}

export default ForceGraphComponent;
