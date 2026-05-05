// app/(Pages)/diagram/[diagramid]/page.tsx
"use client";

import CustomEdge from "@/components/diagram/CustomEdge";
import TextUpdaterNode from "@/components/diagram/TextUpdaterNode";
import ImageNode from "@/components/diagram/ImageNode";
import { IconLayoutSidebar, IconNote, IconPhoto } from "@tabler/icons-react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  Panel,
  Node,
  Edge,
  ConnectionMode,
  BackgroundVariant, // Added Import
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnReconnect,
  type OnConnectEnd,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";

import "@xyflow/react/dist/style.css";
import { useCallback, useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDiagrams } from "@/contexts/DiagramsContext";
import DiagramsList from "@/components/diagram/DiagramsList";

// Configurações e Tipos
const nodeTypes = {
  textUpdater: TextUpdaterNode,
  imageNode: ImageNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 1, stroke: "var(--color-font)" },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "var(--color-font)",
  },
  type: "default",
};

const getId = () => `n${Date.now()}`;

function Flow() {
  const { diagramid } = useParams<{ diagramid: string }>();
  const { getDiagram, updateDiagram } = useDiagrams();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const reactFlowWrapper = useRef(null);
  const edgeReconnectSuccessful = useRef(true);
  const { screenToFlowPosition } = useReactFlow();

  // Carregar dados iniciais
  useEffect(() => {
    if (diagramid) {
      const diagram = getDiagram(diagramid);
      if (diagram && diagram.content) {
        let cancelled = false;
        queueMicrotask(() => {
          if (cancelled) return;
          setNodes(diagram.content.nodes || []);
          setEdges(diagram.content.edges || []);
        });
        return () => {
          cancelled = true;
        };
      }
    }
  }, [diagramid, getDiagram]);

  // Auto-save (Debounced)
  useEffect(() => {
    if (!diagramid) return;
    const timeoutId = setTimeout(() => {
      updateDiagram(diagramid, {
        content: { nodes, edges },
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, diagramid, updateDiagram]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: "customEdge" }, eds)),
    [],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [],
  );

  const onReconnectEnd = useCallback(() => {
    edgeReconnectSuccessful.current = true;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        if (!connectionState.fromNode || !connectionState.fromHandle) return;

        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });

        const newNode: Node = {
          id,
          type: "textUpdater",
          position,
          data: { label: `New Node` },
          origin: [0.5, 0.0] as [number, number],
        };

        setNodes((nds) => nds.concat(newNode));

        const newEdge = {
          id,
          ...defaultEdgeOptions,
          type: "customEdge",
          source: connectionState.fromNode.id,
          sourceHandle: connectionState.fromHandle.id,
          target: id,
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    },
    [screenToFlowPosition],
  );

  const addImageNode = () => {
    const newNode = {
      id: getId(),
      type: "imageNode",
      position: { x: 100, y: 100 },
      data: { label: `Image` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="w-full h-[92vh]" ref={reactFlowWrapper}>
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        connectionMode={ConnectionMode.Loose}
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
      >
        {/* Botão de toggle */}
        <Button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-2 z-50 text-font hover:bg-complement/20 hover:text-font"
        >
          <IconLayoutSidebar className="h-8 w-8" />
        </Button>
        {/* Container do Grafo com renderização condicional */}
        {isSidebarVisible && (
          <div className="absolute z-10 h-full w-fit flex-shrink-0 border border-border bg-secondary px-4 py-10">
            <DiagramsList opensidebar={isSidebarVisible} />
          </div>
        )}
        <Controls
          position={"center-right"}
          className="rounded-xl border border-border bg-secondary p-1"
        />
        <Panel position="bottom-center">
          <div className="mb-2 flex items-center justify-center gap-6 rounded-[16px] border border-border bg-secondary px-8 py-3">
            <button
              onClick={() => {
                setNodes((nds) =>
                  nds.concat({
                    id: getId(),
                    type: "textUpdater",
                    position: { x: 0, y: 0 },
                    data: { label: `New Node` },
                  }),
                );
              }}
              className="cursor-pointer transition-colors hover:text-complement"
            >
              <IconNote className="h-12 w-12" />
            </button>
            <div className="h-8 w-px bg-border" />
            <button
              onClick={addImageNode}
              className="cursor-pointer transition-colors hover:text-complement"
            >
              <IconPhoto className="h-12 w-12" />
            </button>
          </div>
        </Panel>
        {/* Fixed: Use BackgroundVariant.Dots */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function DiagramPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
