"use client";

import CustomEdge from "@/components/diagram/CustomEdge";
import TextUpdaterNode from "@/components/diagram/TextUpdaterNode";
// 1. Importe o ImageNode
import ImageNode from "@/components/diagram/ImageNode";
import { IconNote, IconNotes, IconPhoto } from "@tabler/icons-react";
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useCallback, useState, useRef } from "react";

const initialNodes = [
  {
    id: "n1",
    type: "textUpdater",
    position: { x: 0, y: 0 },
    data: { label: "Node 1" },
  },
];

const initialEdges = [{}];

const defaultEdgeOptions = {
  style: {
    strokeWidth: 1,
    stroke: "#b1b1b7",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "#b1b1b7",
  },
  type: "default",
};

// 2. Registre o imageNode em nodeTypes
const nodeTypes = {
  textUpdater: TextUpdaterNode,
  imageNode: ImageNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

let id = 4;
const getId = () => `n${id++}`;

function Flow() {
  const reactFlowWrapper = useRef(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((edgesSnapshot) =>
        addEdge({ ...params, type: "customEdge" }, edgesSnapshot)
      ),
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
    if (!edgeReconnectSuccessful.current) {
      // Lógica de falha na reconexão (opcional)
    }
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
          data: { label: `New Node ${id}` },
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

  // 3. Função auxiliar para adicionar Image Node
  const addImageNode = () => {
    const newNode = {
      id: getId(),
      type: "imageNode",
      position: { x: 100, y: 100 }, // Posição inicial arbitrária ou centralizada
      data: { label: `Image ${id}` }, // Sem imagem inicial, mostrará o upload
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
          style={{
            width: "fit-content",
            height: "fit-content",
            borderRadius: "12px",
            backgroundColor: "var(--color-slate-900)",
            padding: "4px",
            border: "1px solid var(--color-neutral-700)",
          }}
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
                    data: { label: `New Node ${id}` },
                  })
                );
              }}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              <IconNote className="h-12 w-12" />
            </button>
            {/* <button className="cursor-pointer hover:text-slate-300 transition-colors">
              <IconNotes className="h-12 w-12" />
            </button> */}
            <div className="w-px h-8 bg-slate-700" /> {/* Separador */}
            {/* 4. Botão de Adicionar Imagem Configurado */}
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

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
