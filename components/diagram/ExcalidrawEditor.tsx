"use client";

import {
  Excalidraw,
  convertToExcalidrawElements,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { DiagramContent } from "@/types/diagrams";

type LegacyFlowNode = {
  id?: string;
  type?: string;
  position?: {
    x?: number;
    y?: number; // <--- Adicione esta linha para corrigir o erro de compilação
  };
  data?: {
    label?: unknown;
    text?: unknown;
    image?: unknown;
  };
  width?: number;
  height?: number;
  measured?: {
    width?: number;
    height?: number;
  };
  style?: Record<string, unknown>;
};

type LegacyFlowEdge = {
  id?: string;
  source?: string;
  target?: string;
  label?: unknown;
  style?: Record<string, unknown>;
};

type LegacyFlowContent = {
  nodes?: LegacyFlowNode[];
  edges?: LegacyFlowEdge[];
};

type ExcalidrawEditorProps = {
  content?: DiagramContent | null;
  name: string;
  onSave: (content: DiagramContent) => Promise<void> | void;
};

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 96;
const DEFAULT_NODE_STROKE = "#1e1e1e";
const DEFAULT_IMAGE_NODE_BACKGROUND = "#a5d8ff";
const DEFAULT_CANVAS_BACKGROUND = "#08090d";
const EXCALIDRAW_BACKGROUND_CSS_VAR = "--color-main";
const SAVE_DEBOUNCE_MS = 900;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getExcalidrawBackgroundColor() {
  if (typeof window === "undefined") return DEFAULT_CANVAS_BACKGROUND;

  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(EXCALIDRAW_BACKGROUND_CSS_VAR)
    .trim();

  return color && color !== "#ffffff" && color !== "white"
    ? color
    : DEFAULT_CANVAS_BACKGROUND;
}

function isLegacyFlowContent(
  content: DiagramContent | null | undefined,
): content is DiagramContent & LegacyFlowContent {
  return isRecord(content) && Array.isArray(content.nodes);
}

function getLegacyNodeLabel(node: LegacyFlowNode) {
  return (
    readString(node.data?.label) ||
    readString(node.data?.text) ||
    (readString(node.data?.image) ? "Image" : "New Node")
  );
}

function getLegacyNodeSize(node: LegacyFlowNode) {
  return {
    width: readNumber(
      node.width ?? node.measured?.width ?? node.style?.width,
      DEFAULT_NODE_WIDTH,
    ),
    height: readNumber(
      node.height ?? node.measured?.height ?? node.style?.height,
      DEFAULT_NODE_HEIGHT,
    ),
  };
}

function convertLegacyFlowContent(
  content: LegacyFlowContent,
  canvasBackgroundColor: string,
): ExcalidrawInitialDataState {
  const nodeBounds = new Map<
    string,
    { x: number; y: number; width: number; height: number }
  >();
  const skeletons: ExcalidrawElementSkeleton[] = [];

  for (const [index, node] of (content.nodes ?? []).entries()) {
    const id = node.id || `legacy-node-${index}`;
    const { width, height } = getLegacyNodeSize(node);
    const x = readNumber(node.position?.x, index * 260);
    const y = readNumber(node.position?.y, index * 120);

    nodeBounds.set(id, { x, y, width, height });
    skeletons.push({
      id,
      type: "rectangle",
      x,
      y,
      width,
      height,
      strokeColor: readString(node.style?.borderColor) || DEFAULT_NODE_STROKE,
      backgroundColor:
        readString(node.style?.backgroundColor) ||
        (node.type === "imageNode"
          ? DEFAULT_IMAGE_NODE_BACKGROUND
          : "transparent"),
      label: {
        text: getLegacyNodeLabel(node),
        fontSize: 20,
      },
    } as ExcalidrawElementSkeleton);
  }

  for (const [index, edge] of (content.edges ?? []).entries()) {
    if (!edge.source || !edge.target) continue;

    const source = nodeBounds.get(edge.source);
    const target = nodeBounds.get(edge.target);
    if (!source || !target) continue;

    skeletons.push({
      id: edge.id || `legacy-edge-${index}`,
      type: "arrow",
      x: source.x + source.width / 2,
      y: source.y + source.height / 2,
      strokeColor: readString(edge.style?.stroke) || DEFAULT_NODE_STROKE,
      start: { id: edge.source },
      end: { id: edge.target },
      label: readString(edge.label)
        ? {
            text: readString(edge.label) || "",
            fontSize: 16,
          }
        : undefined,
    } as ExcalidrawElementSkeleton);
  }

  return {
    type: "excalidraw",
    version: 2,
    source: "studyhub:react-flow-migration",
    elements: convertToExcalidrawElements(skeletons, {
      regenerateIds: false,
    }),
    appState: {
      viewBackgroundColor: canvasBackgroundColor,
    },
    files: {},
    scrollToContent: true,
  };
}

function toInitialData(
  content: DiagramContent | null | undefined,
  canvasBackgroundColor: string,
): ExcalidrawInitialDataState {
  if (isLegacyFlowContent(content)) {
    return convertLegacyFlowContent(content, canvasBackgroundColor);
  }

  return {
    type: content?.type ?? "excalidraw",
    version: content?.version ?? 2,
    source: content?.source ?? "studyhub",
    elements: content?.elements ?? [],
    appState: {
      ...(content?.appState ?? {}),
      viewBackgroundColor: canvasBackgroundColor,
    },
    files: content?.files ?? {},
    scrollToContent: content?.scrollToContent ?? true,
  };
}

function serializeContent(
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
) {
  return JSON.parse(
    serializeAsJSON(elements, appState, files, "database"),
  ) as DiagramContent;
}

export default function ExcalidrawEditor({
  content,
  name,
  onSave,
}: ExcalidrawEditorProps) {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<DiagramContent | null>(null);
  const onSaveRef = useRef(onSave);

  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState(() =>
    getExcalidrawBackgroundColor(),
  );

  const initialData = useMemo(
    () => toInitialData(content, canvasBackgroundColor),
    [canvasBackgroundColor, content],
  );

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    const syncCanvasBackground = () => {
      const nextBackgroundColor = getExcalidrawBackgroundColor();
      setCanvasBackgroundColor(nextBackgroundColor);

      if (excalidrawApiRef.current) {
        excalidrawApiRef.current.updateScene({
          appState: {
            viewBackgroundColor: nextBackgroundColor,
          },
          captureUpdate: "NEVER",
        });
        excalidrawApiRef.current.refresh();
      }
    };

    const timeoutId = setTimeout(syncCanvasBackground, 50);
    window.addEventListener("studyhub-theme-change", syncCanvasBackground);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("studyhub-theme-change", syncCanvasBackground);
    };
  }, []);

  const flushPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const pendingContent = pendingContentRef.current;
    pendingContentRef.current = null;

    if (pendingContent) {
      void onSaveRef.current(pendingContent);
    }
  }, []);

  useEffect(() => flushPendingSave, [flushPendingSave]);

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      pendingContentRef.current = serializeContent(elements, appState, files);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(flushPendingSave, SAVE_DEBOUNCE_MS);
    },
    [flushPendingSave],
  );

  return (
    <div
      className="h-full w-full custom-excalidraw-container"
      style={{ backgroundColor: canvasBackgroundColor }}
    >
      {/* Injeção de CSS para forçar a visibilidade das linhas do Grid e das bordas no tema escuro */}
      <style>{`
        .custom-excalidraw-container .excalidraw.theme--dark canvas {
          filter: none !important;
        }
        /* Força a cor cinza visível para as linhas do grid do canvas */
        .custom-excalidraw-container .excalidraw.theme--dark {
          --grid-color: rgba(255, 255, 255, 0.08) !important;
          --stroke-color: #ffffff !important;
          --theme-filter: none !important;
        }
      `}</style>

      <Excalidraw
        autoFocus
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api;
        }}
        initialData={initialData}
        name={name}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
}
