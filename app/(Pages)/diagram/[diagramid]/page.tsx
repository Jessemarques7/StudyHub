// app/(Pages)/diagram/[diagramid]/page.tsx
"use client";

import CustomEdge from "@/components/diagram/CustomEdge";
import TextUpdaterNode from "@/components/diagram/TextUpdaterNode";
import ImageNode from "@/components/diagram/ImageNode";
import { IconNote, IconPhoto } from "@tabler/icons-react";
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
  type OnNodesChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useCallback, useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDiagrams } from "@/contexts/DiagramsContext";

// Note: If you are using the newer package, import from '@xyflow/react' instead.

// Configurações e Tipos
const nodeTypes = {
  textUpdater: TextUpdaterNode,
  imageNode: ImageNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 1, stroke: "#b1b1b7" },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "#b1b1b7",
  },
  type: "default",
};

const id = 4;
const getId = () => `n${Date.now()}`; // Melhor usar timestamp para evitar colisão

function Flow() {
  const { diagramid } = useParams<{ diagramid: string }>();
  const { getDiagram, updateDiagram } = useDiagrams();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowWrapper = useRef(null);
  const edgeReconnectSuccessful = useRef(true);
  const { screenToFlowPosition } = useReactFlow();

  // Carregar dados iniciais
  useEffect(() => {
    if (diagramid) {
      const diagram = getDiagram(diagramid);
      if (diagram && diagram.content) {
        setNodes(diagram.content.nodes || []);
        setEdges(diagram.content.edges || []);
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
    }, 1000); // Salva 1s após a última alteração

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, diagramid, updateDiagram]);

  const onNodesChange = useCallback(
    (changes: OnNodesChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, type: "customEdge" }, eds)),
    []
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    edgeReconnectSuccessful.current = true;
  }, []);

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });
        const newNode = {
          id,
          type: "textUpdater",
          position,
          data: { label: `New Node` },
          origin: [0.5, 0.0],
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
    [screenToFlowPosition]
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
    <div className="w-full h-full" ref={reactFlowWrapper}>
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
        connectionMode="loose"
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Controls
          position={"center-right"}
          className="bg-slate-900 border border-neutral-700 rounded-xl p-1"
        />
        <Panel position="bottom-center">
          <div className="bg-slate-900 px-8 py-3 mb-2 border border-neutral-700 rounded-[16px] flex items-center justify-center gap-6">
            <button
              onClick={() => {
                setNodes((nds) =>
                  nds.concat({
                    id: getId(),
                    type: "textUpdater",
                    position: { x: 0, y: 0 },
                    data: { label: `New Node` },
                  })
                );
              }}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              <IconNote className="h-12 w-12" />
            </button>
            <div className="w-px h-8 bg-slate-700" />
            <button
              onClick={addImageNode}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              <IconPhoto className="h-12 w-12" />
            </button>
          </div>
        </Panel>
        <Background variant="dots" gap={12} size={1} />
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
