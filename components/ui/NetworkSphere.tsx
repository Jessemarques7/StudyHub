"use client";

import { useEffect, useRef } from "react";

type SphereNode = {
  theta: number;
  phi: number;
  baseAlpha: number;
  noiseOffset: number;
  delay: number;
};

type SphereEdge = {
  i: number;
  j: number;
  near: boolean;
};

type ProjectedNode = {
  x: number;
  y: number;
  alpha: number;
  depth: number;
  size: number;
};

type NetworkSphereProps = {
  size?: number | string;
  className?: string;
};

const NODE_COUNT = 350;
const NEIGHBOR_COUNT = 4;
const INTRO_MS = 3000;
const POINTER_RADIUS = 160;
const DEFAULT_COLOR = "66, 153, 225";
const DARK_BACKGROUND = "#08090d";

const GRADIENTS = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const SKEW = 0.5 * (Math.sqrt(3) - 1);
const UNSKEW = (3 - Math.sqrt(3)) / 6;
const PERMUTATION = new Uint8Array(512);
const GRADIENT_INDEX = new Uint8Array(512);

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function initializeNoise() {
  const table = new Uint8Array(256);

  for (let index = 0; index < table.length; index += 1) {
    table[index] = index;
  }

  let seed = 137;
  for (let index = table.length - 1; index > 0; index -= 1) {
    seed = (seed * 16807) % 2147483647;
    const swapIndex = seed % (index + 1);
    const current = table[index];
    table[index] = table[swapIndex];
    table[swapIndex] = current;
  }

  for (let index = 0; index < PERMUTATION.length; index += 1) {
    PERMUTATION[index] = table[index & 255];
    GRADIENT_INDEX[index] = PERMUTATION[index] & 7;
  }
}

initializeNoise();

function simplex2(x: number, y: number) {
  const skew = (x + y) * SKEW;
  const cellX = Math.floor(x + skew);
  const cellY = Math.floor(y + skew);
  const unskew = (cellX + cellY) * UNSKEW;
  const x0 = x - (cellX - unskew);
  const y0 = y - (cellY - unskew);
  const xStep = x0 > y0 ? 1 : 0;
  const yStep = x0 > y0 ? 0 : 1;
  const x1 = x0 - xStep + UNSKEW;
  const y1 = y0 - yStep + UNSKEW;
  const x2 = x0 - 1 + 2 * UNSKEW;
  const y2 = y0 - 1 + 2 * UNSKEW;
  const ii = cellX & 255;
  const jj = cellY & 255;
  let n0 = 0;
  let n1 = 0;
  let n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    const gradient = GRADIENTS[GRADIENT_INDEX[ii + PERMUTATION[jj]]];
    n0 = t0 * t0 * (gradient[0] * x0 + gradient[1] * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    const gradient =
      GRADIENTS[GRADIENT_INDEX[ii + xStep + PERMUTATION[jj + yStep]]];
    n1 = t1 * t1 * (gradient[0] * x1 + gradient[1] * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    const gradient = GRADIENTS[GRADIENT_INDEX[ii + 1 + PERMUTATION[jj + 1]]];
    n2 = t2 * t2 * (gradient[0] * x2 + gradient[1] * y2);
  }

  return 70 * (n0 + n1 + n2);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function createSphere() {
  const random = createSeededRandom(137);
  const nodes: SphereNode[] = [];
  const goldenAngle = Math.PI * (1 + Math.sqrt(5));

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / NODE_COUNT);
    const theta = goldenAngle * index;
    const latitude = phi / Math.PI;
    const equatorBias = Math.min(latitude, 1 - latitude) * 2;

    nodes.push({
      theta,
      phi,
      baseAlpha: 0.25 + random() * 0.35,
      noiseOffset: random() * 1000,
      delay: equatorBias * 0.6 + random() * 0.15,
    });
  }

  const edges: SphereEdge[] = [];
  const seen = new Set<string>();
  const unitNodes = nodes.map((node) => {
    const sinPhi = Math.sin(node.phi);
    return {
      x: sinPhi * Math.cos(node.theta),
      y: sinPhi * Math.sin(node.theta),
      z: Math.cos(node.phi),
    };
  });

  for (let source = 0; source < NODE_COUNT; source += 1) {
    const distances = [];

    for (let target = 0; target < NODE_COUNT; target += 1) {
      if (source === target) continue;

      const dx = unitNodes[source].x - unitNodes[target].x;
      const dy = unitNodes[source].y - unitNodes[target].y;
      const dz = unitNodes[source].z - unitNodes[target].z;

      distances.push({
        target,
        distance: dx * dx + dy * dy + dz * dz,
      });
    }

    distances.sort((a, b) => a.distance - b.distance);

    for (
      let neighbor = 0;
      neighbor < NEIGHBOR_COUNT && neighbor < distances.length;
      neighbor += 1
    ) {
      const target = distances[neighbor].target;
      const key =
        source < target ? `${source}-${target}` : `${target}-${source}`;

      if (seen.has(key)) continue;

      seen.add(key);
      edges.push({ i: source, j: target, near: neighbor < 3 });
    }
  }

  return { nodes, edges };
}

export function NetworkSphere({
  size = 420,
  className = "",
}: NetworkSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const sphereRef = useRef(createSphere());
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const easedPointerRef = useRef({ x: -9999, y: -9999 });
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };

    const clearPointer = () => {
      pointerRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", clearPointer);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", clearPointer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));

      const context = canvas.getContext("2d", { alpha: true });
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    startTimeRef.current = Date.now();

    const render = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.width / ratio;
      const height = canvas.height / ratio;
      const centerX = width / 2;
      const centerY = height / 2;
      const now = Date.now();
      const time = now * 0.001;
      const introProgress = easeOutCubic(
        Math.min((now - startTimeRef.current) / INTRO_MS, 1),
      );
      const baseRadius = Math.min(width, height) * 0.285 * 1.7;
      const breathing = 1 + Math.sin(time * 0.4) * 0.03;
      const radius = baseRadius * breathing;
      const rotation = time * 0.06;
      const rotateCos = Math.cos(rotation);
      const rotateSin = Math.sin(rotation);
      const nodes = sphereRef.current.nodes;
      const edges = sphereRef.current.edges;
      const projected: ProjectedNode[] = [];
      const pointer = pointerRef.current;
      const easedPointer = easedPointerRef.current;

      easedPointer.x += (pointer.x - easedPointer.x) * 0.08;
      easedPointer.y += (pointer.y - easedPointer.y) * 0.08;

      context.clearRect(0, 0, width, height);

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        const nodeProgress =
          introProgress < 1
            ? easeOutCubic(
                Math.max(
                  0,
                  Math.min(1, (introProgress - node.delay * 0.7) / 0.4),
                ),
              )
            : 1;

        if (nodeProgress <= 0) {
          projected.push({
            x: centerX,
            y: centerY,
            alpha: 0,
            depth: 0.5,
            size: 0,
          });
          continue;
        }

        const theta = node.theta + time * 0.012;
        const phi = node.phi;
        const noise = simplex2(
          node.noiseOffset + theta * 0.5 + time * 0.12,
          phi * 0.5 + time * 0.08,
        );
        const warpedRadius = (radius + noise * radius * 0.07) * nodeProgress;
        const sinPhi = Math.sin(phi);
        const localX = warpedRadius * sinPhi * Math.cos(theta);
        const localY = warpedRadius * sinPhi * Math.sin(theta);
        const localZ = warpedRadius * Math.cos(phi);
        const rotatedX = localX * rotateCos + localZ * rotateSin;
        const rotatedZ = -localX * rotateSin + localZ * rotateCos;
        let x = centerX + rotatedX;
        let y = centerY + localY;
        const dx = x - easedPointer.x;
        const dy = y - easedPointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < POINTER_RADIUS && distance > 0) {
          const push = (1 - distance / POINTER_RADIUS) ** 2 * 30;
          x += (dx / distance) * push;
          y += (dy / distance) * push;
        }

        const depth = (rotatedZ + radius * 1.5) / (radius * 3);
        const depthAlpha = 0.08 + depth * 0.92;
        const alpha = node.baseAlpha * depthAlpha * 1.18 * nodeProgress;
        const pointSize = (0.82 + depth * 1.05) * 0.78 * nodeProgress;

        projected.push({
          x,
          y,
          alpha,
          depth,
          size: pointSize,
        });
      }

      context.beginPath();
      context.lineWidth = 0.78;
      context.strokeStyle = `rgba(${DEFAULT_COLOR}, ${0.16 * introProgress})`;

      for (const edge of edges) {
        const from = projected[edge.i];
        const to = projected[edge.j];
        if (!edge.near || from.alpha < 0.005 || to.alpha < 0.005) continue;
        if (from.depth < 0.2 && to.depth < 0.2) continue;

        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
      }
      context.stroke();

      context.beginPath();
      context.lineWidth = 0.46;
      context.strokeStyle = `rgba(${DEFAULT_COLOR}, ${0.085 * introProgress})`;

      for (const edge of edges) {
        const from = projected[edge.i];
        const to = projected[edge.j];
        if (edge.near || from.alpha < 0.005 || to.alpha < 0.005) continue;
        if (from.depth < 0.2 && to.depth < 0.2) continue;

        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
      }
      context.stroke();

      context.fillStyle = `rgb(${DEFAULT_COLOR})`;
      for (const point of projected) {
        if (point.alpha <= 0.005) continue;

        context.globalAlpha = point.alpha;
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      context.globalCompositeOperation = "screen";
      const glowAlpha = (0.045 + Math.sin(time * 0.4) * 0.015) * introProgress;
      const glowRadius = radius * 0.58;
      const glow = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowRadius,
      );

      glow.addColorStop(0, `rgba(${DEFAULT_COLOR}, ${glowAlpha * 0.35})`);
      glow.addColorStop(0.3, `rgba(${DEFAULT_COLOR}, ${glowAlpha * 0.3})`);
      glow.addColorStop(1, `rgba(${DEFAULT_COLOR}, 0)`);
      context.beginPath();
      context.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      context.fillStyle = glow;
      context.fill();
      context.globalCompositeOperation = "source-over";

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: DARK_BACKGROUND }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Nectar network sphere"
        className="h-full w-full"
      />
    </div>
  );
}
