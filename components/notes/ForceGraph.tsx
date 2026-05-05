// components/notes/ForceGraph.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DEFAULT_THEME_COLORS } from "@/lib/theme-colors";

// Dynamically import the ForceGraph2D component with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Define types for our data structure
interface NodeObject {
  id?: string | number;
  name?: string;
  val?: number;
  x?: number;
  y?: number;
}

interface LinkObject {
  source?: string | number | NodeObject;
  target?: string | number | NodeObject;
}

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

interface ForceGraphProps {
  data: GraphData;
}

const getThemeColor = (cssVariable: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;

  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(cssVariable)
      .trim() || fallback
  );
};

const withAlpha = (color: string, alpha: number) => {
  const normalizedColor = color.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    const red = parseInt(normalizedColor.slice(1, 3), 16);
    const green = parseInt(normalizedColor.slice(3, 5), 16);
    const blue = parseInt(normalizedColor.slice(5, 7), 16);

    return `rgb(${red} ${green} ${blue} / ${alpha})`;
  }

  return normalizedColor;
};

const getNodeId = (
  node: string | number | NodeObject | undefined,
): string | null => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node?.id !== undefined) return String(node.id);
  return null;
};

function ForceGraphComponent({ data }: ForceGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
  }, []);

  function handleNodeClick(node: NodeObject | null) {
    if (node?.id !== undefined) {
      router.push(`/notes/${node.id}`);
    }
  }

  function handleNodeHover(node: NodeObject | null) {
    setHoveredNodeId(getNodeId(node ?? undefined));
  }

  function drawNode(
    node: NodeObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    // Add safety check for coordinates (ForceGraph assigns these)
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    const isHovered = getNodeId(node) === hoveredNodeId;
    const nodeRadius = Math.sqrt(node.val || 1) * (isHovered ? 1.5 : 1);
    const complementColor = getThemeColor(
      "--color-complement",
      DEFAULT_THEME_COLORS.complement,
    );
    const fontColor = getThemeColor("--color-font", DEFAULT_THEME_COLORS.font);

    // Draw the node circle
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isHovered ? complementColor : withAlpha(fontColor, 0.74);
    ctx.fill();

    // Draw the label below the node
    const label = node.name ?? "";
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = fontColor;
    ctx.fillText(label, x, y + nodeRadius + 2);
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          graphData={data}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(
            node: NodeObject,
            color: string,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const nodeRadius = Math.sqrt(node.val || 1);

            // Measure text width for accurate hit detection
            const label = node.name ?? "";
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
          linkWidth={(link: LinkObject) =>
            getNodeId(link.source) === hoveredNodeId ||
            getNodeId(link.target) === hoveredNodeId
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
          linkColor={(link: LinkObject) =>
            getNodeId(link.source) === hoveredNodeId ||
            getNodeId(link.target) === hoveredNodeId
              ? getThemeColor(
                  "--color-complement",
                  DEFAULT_THEME_COLORS.complement,
                )
              : withAlpha(
                  getThemeColor("--color-font", DEFAULT_THEME_COLORS.font),
                  0.2,
                )
          }
        />
      )}
    </div>
  );
}

export default ForceGraphComponent;
