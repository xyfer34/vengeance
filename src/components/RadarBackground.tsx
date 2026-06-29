/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

interface RadarNode {
  x: number; // percentage of radius from center (0 to 1)
  y: number; // percentage of radius from center (0 to 1)
  angle: number;
  size: number;
  id: number;
  intensity: number;
}

export default function RadarBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Keep a small list of target nodes that flicker on radar pass
  const nodesRef = useRef<RadarNode[]>([
    { id: 1, angle: 45, x: 0.4, y: 0.4, size: 3.5, intensity: 1 },
    { id: 2, angle: 140, x: -0.6, y: 0.2, size: 4, intensity: 0.8 },
    { id: 3, angle: 220, x: -0.3, y: -0.5, size: 3, intensity: 0.6 },
    { id: 4, angle: 310, x: 0.5, y: -0.6, size: 5, intensity: 0.9 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let angleSweep = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = entryWidth;
        height = entryHeight;
        canvas.width = entryWidth * window.devicePixelRatio;
        canvas.height = entryHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;

      // Clear with very low opacity to leave trails, but wait, drawing a solid translucent clear
      ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Center of radar
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.45;

      // Draw outer circle & grids (very faint)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
      ctx.lineWidth = 1;

      // Concentric circles
      for (let r = 1; r <= 4; r++) {
        const radius = (maxRadius * r) / 4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // Diagonal crosshairs (even fainter)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.01)';
      ctx.beginPath();
      const angleDiag = Math.PI / 4;
      ctx.moveTo(cx - maxRadius * Math.cos(angleDiag), cy - maxRadius * Math.sin(angleDiag));
      ctx.lineTo(cx + maxRadius * Math.cos(angleDiag), cy + maxRadius * Math.sin(angleDiag));
      ctx.moveTo(cx - maxRadius * Math.cos(angleDiag), cy + maxRadius * Math.sin(angleDiag));
      ctx.lineTo(cx + maxRadius * Math.cos(angleDiag), cy - maxRadius * Math.sin(angleDiag));
      ctx.stroke();

      // Draw the sweep lines
      ctx.save();
      const sweepGradient = ctx.createConicGradient(angleSweep, cx, cy);
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
      sweepGradient.addColorStop(0.1, 'rgba(0, 240, 255, 0.03)');
      sweepGradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.005)');
      sweepGradient.addColorStop(0.7, 'rgba(0, 240, 255, 0.0)');
      sweepGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw radar sweep line edge
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + maxRadius * Math.cos(angleSweep),
        cy + maxRadius * Math.sin(angleSweep)
      );
      ctx.stroke();

      // Draw radar signals/target nodes
      const sweepDeg = (angleSweep * 180) / Math.PI;
      nodesRef.current.forEach((node) => {
        const nx = cx + node.x * maxRadius;
        const ny = cy + node.y * maxRadius;

        // Calculate proximity of radar sweep angle to target angle
        let nodeAngleDeg = node.angle;
        let diff = Math.abs(sweepDeg - nodeAngleDeg) % 360;
        if (diff > 180) diff = 360 - diff;

        // If sweep is passing over node, light it up
        if (diff < 15) {
          node.intensity = 1.0;
        } else {
          node.intensity = Math.max(0.08, node.intensity - 0.008); // fade slowly
        }

        // Draw glowing dot
        if (node.intensity > 0.08) {
          ctx.beginPath();
          ctx.arc(nx, ny, node.size + (node.intensity * 4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${node.intensity * 0.15})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${node.intensity * 0.8})`;
          ctx.fill();

          // draw subtle concentric text tag
          if (node.intensity > 0.4) {
            ctx.fillStyle = `rgba(0, 240, 255, ${node.intensity - 0.2})`;
            ctx.font = '8px monospace';
            ctx.fillText(`SIG_${node.id}: [R-${Math.floor(node.x * 100)}m]`, nx + 8, ny - 4);
          }
        }
      });

      // Update sweep angle
      angleSweep = (angleSweep + 0.005) % (Math.PI * 2);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#030303]">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
      <div className="absolute inset-0 radar-grid pointer-events-none" />
    </div>
  );
}
