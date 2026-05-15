// components/notes/ForceGraph.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Settings2, SlidersHorizontal, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DEFAULT_THEME_COLORS } from "@/lib/theme-colors";
import type { GraphLink, GraphNode } from "@/types/notes";

type GraphRenderNode = GraphNode & {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};

type GraphRenderLink = Omit<GraphLink, "source" | "target"> & {
  source?: string | number | GraphRenderNode;
  target?: string | number | GraphRenderNode;
};

interface GraphRenderData {
  nodes: GraphRenderNode[];
  links: GraphRenderLink[];
}

interface ForceGraphProps {
  data: GraphRenderData;
}

interface D3Force {
  (alpha: number): void;
  initialize?: (nodes: GraphRenderNode[], ...args: unknown[]) => void;
}

interface ChargeForce extends D3Force {
  strength(): number | ((node: GraphRenderNode) => number);
  strength(value: number): ChargeForce;
}

interface DistanceForce extends D3Force {
  distance(): number | ((link: GraphRenderLink) => number);
  distance(value: number): DistanceForce;
}

interface LinkForce extends DistanceForce {
  strength(): number | ((link: GraphRenderLink) => number);
  strength(value: number): LinkForce;
}

interface CenterForce extends D3Force {
  strength(): number;
  strength(value: number): CenterForce;
  x(): number;
  x(value: number): CenterForce;
  y(): number;
  y(value: number): CenterForce;
  z(): number;
  z(value: number): CenterForce;
}

interface ForceGraphInstance {
  d3Force(forceName: string): D3Force | undefined;
  d3Force(forceName: string, forceFn: D3Force | null): unknown;
  d3ReheatSimulation(): unknown;
  zoomToFit(
    durationMs?: number,
    padding?: number,
    nodeFilter?: (node: GraphRenderNode) => boolean,
  ): unknown;
}

interface ForceGraph2DProps {
  ref?: React.MutableRefObject<ForceGraphInstance | undefined>;
  graphData: GraphRenderData;
  nodeLabel: () => string;
  nodeCanvasObject: (
    node: GraphRenderNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => void;
  nodePointerAreaPaint: (
    node: GraphRenderNode,
    color: string,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => void;
  onNodeClick: (node: GraphRenderNode) => void;
  onNodeHover: (node: GraphRenderNode | null) => void;
  linkWidth: (link: GraphRenderLink) => number;
  linkColor: (link: GraphRenderLink) => string;
  linkDirectionalArrowLength: (link: GraphRenderLink) => number;
  linkDirectionalArrowColor: (link: GraphRenderLink) => string;
  linkDirectionalArrowRelPos: number;
  linkDirectionalParticles: (link: GraphRenderLink) => number;
  linkDirectionalParticleSpeed: number;
  linkDirectionalParticleWidth: (link: GraphRenderLink) => number;
  linkDirectionalParticleColor: (link: GraphRenderLink) => string;
  width: number;
  height: number;
  backgroundColor: string;
  autoPauseRedraw: boolean;
  minZoom: number;
  maxZoom: number;
  d3AlphaDecay: number;
  d3VelocityDecay: number;
}

const ForceGraph2D = dynamic<ForceGraph2DProps>(
  () =>
    import("react-force-graph-2d").then(
      (module) => module.default as ComponentType<ForceGraph2DProps>,
    ),
  { ssr: false },
);

const d3 = {
  forceCenter: createCenterForce,
};

const getThemeColor = (cssVariable: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;

  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(cssVariable)
      .trim() || fallback
  );
};

const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha));

const withAlpha = (color: string, alpha: number) => {
  const normalizedColor = color.trim();
  const normalizedAlpha = clampAlpha(alpha);

  if (/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    const red = parseInt(normalizedColor.slice(1, 3), 16);
    const green = parseInt(normalizedColor.slice(3, 5), 16);
    const blue = parseInt(normalizedColor.slice(5, 7), 16);

    return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
  }

  return normalizedColor;
};

const getNodeId = (
  node: string | number | GraphRenderNode | undefined | null,
): string | null => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node?.id !== undefined) return String(node.id);
  return null;
};

function createCenterForce(
  initialX = 0,
  initialY = 0,
  initialZ = 0,
): CenterForce {
  let nodes: GraphRenderNode[] = [];
  let x = initialX;
  let y = initialY;
  let z = initialZ;
  let strength = 1;

  const force = (() => {
    if (nodes.length === 0) return;

    let sx = 0;
    let sy = 0;
    let sz = 0;

    nodes.forEach((node) => {
      sx += node.x ?? 0;
      sy += node.y ?? 0;
      sz += node.z ?? 0;
    });

    sx = (sx / nodes.length - x) * strength;
    sy = (sy / nodes.length - y) * strength;
    sz = (sz / nodes.length - z) * strength;

    nodes.forEach((node) => {
      if (sx) node.x = (node.x ?? 0) - sx;
      if (sy) node.y = (node.y ?? 0) - sy;
      if (sz) node.z = (node.z ?? 0) - sz;
    });
  }) as unknown as CenterForce;

  force.initialize = (nextNodes) => {
    nodes = nextNodes;
  };

  force.strength = ((nextStrength?: number) => {
    if (nextStrength === undefined) return strength;
    strength = nextStrength;
    return force;
  }) as CenterForce["strength"];

  force.x = ((nextX?: number) => {
    if (nextX === undefined) return x;
    x = nextX;
    return force;
  }) as CenterForce["x"];

  force.y = ((nextY?: number) => {
    if (nextY === undefined) return y;
    y = nextY;
    return force;
  }) as CenterForce["y"];

  force.z = ((nextZ?: number) => {
    if (nextZ === undefined) return z;
    z = nextZ;
    return force;
  }) as CenterForce["z"];

  return force;
}

function hasChargeForce(force: D3Force | undefined): force is ChargeForce {
  const maybeForce = force as Partial<ChargeForce> | undefined;
  return typeof maybeForce?.strength === "function";
}

function hasLinkForce(force: D3Force | undefined): force is LinkForce {
  const maybeForce = force as Partial<LinkForce> | undefined;
  return (
    typeof maybeForce?.distance === "function" &&
    typeof maybeForce.strength === "function"
  );
}

interface GraphControlSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function GraphControlSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: GraphControlSliderProps) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-[13px] font-medium text-font">
        {label}
      </label>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values: number[]) => {
          const [nextValue] = values;
          if (typeof nextValue === "number") onChange(nextValue);
        }}
        className="py-1 [&_[data-slot=slider-range]]:bg-complement/70 [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:border-font/70 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-font/15"
      />
    </div>
  );
}

function GraphSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/70 px-3 py-4 last:border-b-0">
      <div className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-font">
        <h3>{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ForceGraphComponent({ data }: ForceGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphInstance | undefined>(undefined);
  const fitTimeoutRef = useRef<number | null>(null);
  const lastFittedLayoutKeyRef = useRef<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [nodeSizeMultiplier, setNodeSizeMultiplier] = useState(1);
  const [linkThicknessMultiplier, setLinkThicknessMultiplier] = useState(1);
  const [textFadeThreshold, setTextFadeThreshold] = useState(0.75);
  const [centerForce, setCenterForce] = useState(0.3);
  const [repelForce, setRepelForce] = useState(180);
  const [linkForceStrength, setLinkForceStrength] = useState(0.7);
  const [linkDistance, setLinkDistance] = useState(85);
  const directionalArrows = false;

  const layoutKey = `${data.nodes.length}:${data.links.length}:${dimensions.width}:${dimensions.height}`;

  const highlightedNodeIds = useMemo(() => {
    const nodeIds = new Set<string>();

    if (!hoveredNodeId) return nodeIds;

    nodeIds.add(hoveredNodeId);

    data.links.forEach((link) => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);

      if (sourceId === hoveredNodeId && targetId) {
        nodeIds.add(targetId);
      }

      if (targetId === hoveredNodeId && sourceId) {
        nodeIds.add(sourceId);
      }
    });

    return nodeIds;
  }, [data.links, hoveredNodeId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;

      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const applyGraphForces = useCallback(
    (graph: ForceGraphInstance) => {
      const chargeForce = graph.d3Force("charge");
      const linkD3Force = graph.d3Force("link");

      if (!hasChargeForce(chargeForce) || !hasLinkForce(linkD3Force)) {
        return false;
      }

      chargeForce.strength(-repelForce);
      linkD3Force.strength(linkForceStrength);
      linkD3Force.distance(linkDistance);

      graph.d3Force("center", d3.forceCenter().strength(centerForce));
      graph.d3ReheatSimulation();

      return true;
    },
    [centerForce, repelForce, linkForceStrength, linkDistance],
  );

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    let cancelled = false;
    let retryTimeoutId: number | null = null;

    const scheduleInitialFit = () => {
      if (lastFittedLayoutKeyRef.current === layoutKey) return;

      lastFittedLayoutKeyRef.current = layoutKey;

      if (fitTimeoutRef.current !== null) {
        window.clearTimeout(fitTimeoutRef.current);
      }

      fitTimeoutRef.current = window.setTimeout(() => {
        fgRef.current?.zoomToFit(350, 48);
        fitTimeoutRef.current = null;
      }, 650);
    };

    const applyWhenReady = (attempt = 0) => {
      if (cancelled) return;

      const graph = fgRef.current;

      if (graph && applyGraphForces(graph)) {
        scheduleInitialFit();
        return;
      }

      if (attempt < 40) {
        retryTimeoutId = window.setTimeout(() => {
          applyWhenReady(attempt + 1);
        }, 50);
      }
    };

    applyWhenReady();

    return () => {
      cancelled = true;
      if (retryTimeoutId !== null) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, [applyGraphForces, dimensions.height, dimensions.width, layoutKey]);

  useEffect(() => {
    return () => {
      if (fitTimeoutRef.current !== null) {
        window.clearTimeout(fitTimeoutRef.current);
      }
    };
  }, []);

  function isLinkHighlighted(link: GraphRenderLink) {
    if (!hoveredNodeId) return false;

    return (
      getNodeId(link.source) === hoveredNodeId ||
      getNodeId(link.target) === hoveredNodeId
    );
  }

  function getNodeRadius(node: GraphRenderNode, isHovered: boolean) {
    const organicSize = 2.6 + Math.sqrt(Math.max(node.val || 1, 1)) * 1.45;
    return organicSize * nodeSizeMultiplier * (isHovered ? 1.35 : 1);
  }

  function getLinkOpacity(link: GraphRenderLink) {
    if (!hoveredNodeId) return 0.28;
    return isLinkHighlighted(link) ? 0.95 : 0.045;
  }

  function getLinkColor(link: GraphRenderLink) {
    const complementColor = getThemeColor(
      "--color-complement",
      DEFAULT_THEME_COLORS.complement,
    );
    const fontColor = getThemeColor("--color-font", DEFAULT_THEME_COLORS.font);

    return withAlpha(
      isLinkHighlighted(link) ? complementColor : fontColor,
      getLinkOpacity(link),
    );
  }

  function handleNodeClick(node: GraphRenderNode) {
    if (node.rawId) {
      router.push(
        node.kind === "diagram"
          ? `/diagram/${node.rawId}`
          : `/notes/${node.rawId}`,
      );
      return;
    }

    if (node.id !== undefined) {
      const id = String(node.id);
      router.push(
        id.startsWith("diagram:")
          ? `/diagram/${id.slice(8)}`
          : `/notes/${id.replace(/^note:/, "")}`,
      );
    }
  }

  function handleNodeHover(node: GraphRenderNode | null) {
    setHoveredNodeId(getNodeId(node));
  }

  function drawNode(
    node: GraphRenderNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const nodeId = getNodeId(node);
    const isHovered = nodeId === hoveredNodeId;
    const isHighlighted =
      !hoveredNodeId || (nodeId !== null && highlightedNodeIds.has(nodeId));
    const isNeighbor = Boolean(hoveredNodeId && isHighlighted && !isHovered);
    const nodeRadius = getNodeRadius(node, isHovered);
    const complementColor = getThemeColor(
      "--color-complement",
      DEFAULT_THEME_COLORS.complement,
    );
    const fontColor = getThemeColor("--color-font", DEFAULT_THEME_COLORS.font);
    const backgroundColor = getThemeColor(
      "--color-main",
      DEFAULT_THEME_COLORS.main,
    );
    const nodeColor = node.kind === "diagram" ? complementColor : fontColor;
    const nodeOpacity = isHighlighted ? 1 : 0.16;

    ctx.save();
    ctx.globalAlpha = nodeOpacity;

    if (isHovered || isNeighbor) {
      ctx.shadowBlur = (isHovered ? 18 : 10) / globalScale;
      ctx.shadowColor = withAlpha(complementColor, isHovered ? 0.9 : 0.55);
    }

    ctx.fillStyle = isHovered || isNeighbor ? complementColor : nodeColor;
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    if (globalScale < textFadeThreshold) return;

    const label = node.name ?? "";
    if (!label) return;

    const fontSize = 11 / globalScale;
    const labelY = y + nodeRadius + 3 / globalScale;

    ctx.save();
    ctx.globalAlpha = isHighlighted ? (isHovered ? 1 : 0.82) : 0.12;
    ctx.font = `${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3 / globalScale;
    ctx.strokeStyle = withAlpha(backgroundColor, 0.82);
    ctx.strokeText(label, x, labelY);
    ctx.fillStyle = isHovered ? complementColor : fontColor;
    ctx.fillText(label, x, labelY);
    ctx.restore();
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <button
        type="button"
        aria-label={
          isConfigOpen ? "Close graph settings" : "Open graph settings"
        }
        onClick={() => setIsConfigOpen((open) => !open)}
        onPointerDown={(event) => event.stopPropagation()}
        className={cn(
          "absolute right-4 top-22 z-30 flex h-9 w-9 items-center justify-center rounded-md bg-background-secondary/90 text-font  backdrop-blur-xl transition-colors hover:bg-third",
          isConfigOpen && "border-complement/60 text-complement",
        )}
      >
        {isConfigOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Settings2 className="h-4 w-4" />
        )}
      </button>

      {isConfigOpen && (
        <div
          className="pointer-events-auto absolute right-3 top-20.5 z-20 max-h-[calc(100%-4.25rem)] w-[calc(100%-1.5rem)] max-w-72 overflow-y-auto rounded-md border border-border bg-background-secondary/95 text-font shadow-2xl backdrop-blur-xl"
          onPointerDown={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-2 border-b border-border/70 px-3 py-3">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-complement" />
            <h2 className="min-w-0 truncate text-sm font-semibold">
              Graph settings
            </h2>
          </div>

          <GraphSection title="Display">
            <GraphControlSlider
              id="graph-text-fade-threshold"
              label="Text fade threshold"
              value={textFadeThreshold}
              min={0.15}
              max={2.5}
              step={0.05}
              onChange={setTextFadeThreshold}
            />
            <GraphControlSlider
              id="graph-node-size"
              label="Node size"
              value={nodeSizeMultiplier}
              min={0.45}
              max={3}
              step={0.05}
              onChange={setNodeSizeMultiplier}
            />
            <GraphControlSlider
              id="graph-link-thickness"
              label="Link thickness"
              value={linkThicknessMultiplier}
              min={0.25}
              max={4}
              step={0.05}
              onChange={setLinkThicknessMultiplier}
            />
          </GraphSection>

          <GraphSection title="Forces">
            <GraphControlSlider
              id="graph-center-force"
              label="Center force"
              value={centerForce}
              min={0}
              max={1}
              step={0.01}
              onChange={setCenterForce}
            />
            <GraphControlSlider
              id="graph-repel-force"
              label="Repel force"
              value={repelForce}
              min={20}
              max={900}
              step={10}
              onChange={setRepelForce}
            />
            <GraphControlSlider
              id="graph-link-force"
              label="Link force"
              value={linkForceStrength}
              min={0}
              max={2}
              step={0.05}
              onChange={setLinkForceStrength}
            />
            <GraphControlSlider
              id="graph-link-distance"
              label="Link distance"
              value={linkDistance}
              min={20}
              max={260}
              step={5}
              onChange={setLinkDistance}
            />
          </GraphSection>
        </div>
      )}

      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          nodeLabel={() => ""}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(
            node: GraphRenderNode,
            color: string,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const nodeRadius = getNodeRadius(node, false);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius + 6 / globalScale, 0, 2 * Math.PI);
            ctx.fill();

            if (globalScale < textFadeThreshold) return;

            const label = node.name ?? "";
            const fontSize = 11 / globalScale;
            ctx.font = `${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
            const textWidth = ctx.measureText(label).width;
            const textHeight = fontSize;
            const labelY = y + nodeRadius + 3 / globalScale;

            ctx.fillRect(
              x - textWidth / 2 - 3 / globalScale,
              labelY,
              textWidth + 6 / globalScale,
              textHeight + 3 / globalScale,
            );
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          linkWidth={(link: GraphRenderLink) => {
            const baseWidth =
              hoveredNodeId && !isLinkHighlighted(link) ? 0.35 : 0.85;
            const highlightBoost = isLinkHighlighted(link) ? 1.35 : 1;

            return baseWidth * highlightBoost * linkThicknessMultiplier;
          }}
          linkColor={getLinkColor}
          linkDirectionalArrowLength={(link: GraphRenderLink) => {
            if (!directionalArrows) return 0;
            return (
              (isLinkHighlighted(link) ? 5 : 3.5) * linkThicknessMultiplier
            );
          }}
          linkDirectionalArrowColor={getLinkColor}
          linkDirectionalArrowRelPos={0.88}
          linkDirectionalParticles={(link: GraphRenderLink) => {
            if (hoveredNodeId && !isLinkHighlighted(link)) return 0;
            return isLinkHighlighted(link) ? 3 : 1;
          }}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleWidth={(link: GraphRenderLink) =>
            (isLinkHighlighted(link) ? 1.8 : 1.1) * linkThicknessMultiplier
          }
          linkDirectionalParticleColor={getLinkColor}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          autoPauseRedraw={false}
          minZoom={0.08}
          maxZoom={12}
          d3AlphaDecay={0.026}
          d3VelocityDecay={0.34}
        />
      )}
    </div>
  );
}

export default ForceGraphComponent;
