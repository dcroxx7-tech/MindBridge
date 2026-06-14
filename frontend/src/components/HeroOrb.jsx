import React, { useRef, useEffect, useCallback } from "react";

/**
 * HeroNexus — A premium 3D-inspired neural nexus animation.
 * Visualizes MindBridge's tri-agent architecture with:
 *   - Three orbital rings (Sentinel, Companion, Bridge) rotating at unique angles
 *   - A breathing, pulsing central core with layered glow
 *   - Particle trails that flow along orbital paths
 *   - Neural synaptic connections that fire between nodes
 *   - Mouse-reactive parallax and glow intensification
 *   - Depth-of-field simulation for 3D illusion
 *
 * @param {object} props
 * @param {number} props.size — Canvas dimension in px (width & height)
 */
export default function HeroOrb({ size = 420 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.38;

    // ── Agent orbital definitions ──
    // Each ring represents one agent with unique color, tilt, speed, and radius
    const orbits = [
      {
        name: "Sentinel",
        color: { r: 129, g: 140, b: 248 },   // indigo-400
        radius: maxR * 0.92,
        speed: 0.0008,
        tiltX: 0.85,
        tiltY: 0.15,
        phase: 0,
        nodeCount: 5,
        trailLength: 50,
      },
      {
        name: "Companion",
        color: { r: 167, g: 139, b: 250 },   // violet-400
        radius: maxR * 0.72,
        speed: 0.0012,
        tiltX: 0.2,
        tiltY: 0.9,
        phase: Math.PI * 0.66,
        nodeCount: 4,
        trailLength: 40,
      },
      {
        name: "Bridge",
        color: { r: 96, g: 165, b: 250 },    // blue-400
        radius: maxR * 0.54,
        speed: 0.0018,
        tiltX: 0.55,
        tiltY: 0.55,
        phase: Math.PI * 1.33,
        nodeCount: 3,
        trailLength: 30,
      },
    ];

    // ── Floating ambient particles ──
    const ambientParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * size,
      y: Math.random() * size,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));

    // ── Synaptic fire events ──
    const synapses = [];
    let lastSynapseTime = 0;

    let t = 0;

    // ── Helper: project 3D point with perspective ──
    function project(x3d, y3d, z3d) {
      const fov = 600;
      const scale = fov / (fov - z3d);
      return {
        x: cx + x3d * scale,
        y: cy + y3d * scale,
        scale,
        z: z3d,
      };
    }

    // ── Helper: get 3D position on an orbit ring ──
    function getOrbitPoint(orbit, angle) {
      const r = orbit.radius;
      const rawX = r * Math.cos(angle);
      const rawY = r * Math.sin(angle);

      // Apply tilt rotation to create a 3D-looking ellipse
      const x3d = rawX;
      const y3d = rawY * orbit.tiltX;
      const z3d = rawY * orbit.tiltY;

      return project(x3d, y3d, z3d);
    }

    // ── Main render loop ──
    function render() {
      t += 1;
      ctx.clearRect(0, 0, size, size);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Parallax offsets based on mouse position
      const parallaxX = (mx - 0.5) * 12;
      const parallaxY = (my - 0.5) * 12;

      ctx.save();
      ctx.translate(parallaxX, parallaxY);

      // ── 1. Draw ambient glow core ──
      const breathe = Math.sin(t * 0.02) * 0.3 + 0.7;
      const coreR = maxR * 0.18 * breathe;

      // Outer halo
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.7);
      haloGrad.addColorStop(0, `rgba(99, 102, 241, ${0.06 * breathe})`);
      haloGrad.addColorStop(0.4, `rgba(139, 92, 246, ${0.03 * breathe})`);
      haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = haloGrad;
      ctx.fill();

      // Mid glow
      const midGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.3);
      midGrad.addColorStop(0, `rgba(129, 140, 248, ${0.15 * breathe})`);
      midGrad.addColorStop(0.6, `rgba(139, 92, 246, ${0.06 * breathe})`);
      midGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = midGrad;
      ctx.fill();

      // Bright center point
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, `rgba(224, 231, 255, ${0.9 * breathe})`);
      coreGrad.addColorStop(0.3, `rgba(165, 180, 252, ${0.5 * breathe})`);
      coreGrad.addColorStop(0.7, `rgba(99, 102, 241, ${0.2 * breathe})`);
      coreGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── 2. Draw orbital rings and nodes ──
      const allNodes = []; // collect for synapse connections

      orbits.forEach((orbit) => {
        const { color, speed, trailLength, nodeCount, phase } = orbit;
        const baseAngle = t * speed + phase;

        // Draw the orbital ring path (dashed ellipse)
        ctx.save();
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        const ringSegments = 120;
        for (let i = 0; i <= ringSegments; i++) {
          const a = (i / ringSegments) * Math.PI * 2;
          const pt = getOrbitPoint(orbit, a);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.08)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Draw nodes orbiting on the ring
        for (let n = 0; n < nodeCount; n++) {
          const nodeAngle = baseAngle + (n / nodeCount) * Math.PI * 2;
          const pt = getOrbitPoint(orbit, nodeAngle);
          const depthFactor = (pt.z + maxR) / (maxR * 2);
          const nodeSize = 2 + depthFactor * 3.5;
          const nodeOpacity = 0.3 + depthFactor * 0.7;

          allNodes.push({ ...pt, color, nodeSize, nodeOpacity, orbit: orbit.name });

          // Node glow halo
          const nGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nodeSize * 4);
          nGrad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeOpacity * 0.35})`);
          nGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = nGrad;
          ctx.fill();

          // Solid node
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeOpacity})`;
          ctx.fill();

          // Bright center of node
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeSize * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity * 0.8})`;
          ctx.fill();

          // ── Draw trailing particle stream ──
          for (let tr = 1; tr <= trailLength; tr++) {
            const trailAngle = nodeAngle - (tr * 0.04);
            const trPt = getOrbitPoint(orbit, trailAngle);
            const trailFade = 1 - tr / trailLength;
            const trailSize = nodeSize * 0.5 * trailFade;
            
            if (trailSize > 0.2) {
              ctx.beginPath();
              ctx.arc(trPt.x, trPt.y, trailSize, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${trailFade * 0.2 * nodeOpacity})`;
              ctx.fill();
            }
          }
        }
      });

      // ── 3. Draw synaptic connections between nodes of different orbits ──
      // Fire new synapses periodically
      if (t - lastSynapseTime > 60 + Math.random() * 80) {
        lastSynapseTime = t;
        // Pick two nodes from different orbits
        const orbitA = allNodes.filter(n => n.orbit === "Sentinel");
        const orbitB = allNodes.filter(n => n.orbit === "Companion");
        const orbitC = allNodes.filter(n => n.orbit === "Bridge");

        const sources = [orbitA, orbitB, orbitC];
        const fromOrbit = sources[Math.floor(Math.random() * 3)];
        let toOrbit;
        do {
          toOrbit = sources[Math.floor(Math.random() * 3)];
        } while (toOrbit === fromOrbit);

        if (fromOrbit.length > 0 && toOrbit.length > 0) {
          const fromNode = fromOrbit[Math.floor(Math.random() * fromOrbit.length)];
          const toNode = toOrbit[Math.floor(Math.random() * toOrbit.length)];
          synapses.push({
            x1: fromNode.x, y1: fromNode.y,
            x2: toNode.x, y2: toNode.y,
            color: fromNode.color,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.01,
          });
        }
      }

      // Render active synapses
      for (let i = synapses.length - 1; i >= 0; i--) {
        const s = synapses[i];
        s.life -= s.decay;
        if (s.life <= 0) {
          synapses.splice(i, 1);
          continue;
        }

        // Curved synapse line
        const midX = (s.x1 + s.x2) / 2 + Math.sin(t * 0.05) * 15;
        const midY = (s.y1 + s.y2) / 2 + Math.cos(t * 0.05) * 15;

        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.quadraticCurveTo(midX, midY, s.x2, s.y2);
        ctx.strokeStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.life * 0.4})`;
        ctx.lineWidth = s.life * 1.8;
        ctx.stroke();

        // Traveling pulse dot along the synapse
        const pulseT = 1 - s.life;
        const px = (1 - pulseT) * (1 - pulseT) * s.x1 + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * s.x2;
        const py = (1 - pulseT) * (1 - pulseT) * s.y1 + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * s.y2;

        ctx.beginPath();
        ctx.arc(px, py, 2 + s.life * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life * 0.7})`;
        ctx.fill();
      }

      // ── 4. Draw ambient floating particles ──
      ambientParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Wrap around edges
        if (p.x < 0) p.x = size;
        if (p.x > size) p.x = 0;
        if (p.y < 0) p.y = size;
        if (p.y > size) p.y = 0;

        const pOp = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${pOp})`;
        ctx.fill();
      });

      // ── 5. Glass overlay ring ──
      const ringPulse = Math.sin(t * 0.015) * 0.02 + 0.04;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 1.02, 0, Math.PI * 2);
      const glassGrad = ctx.createLinearGradient(
        cx - maxR, cy - maxR,
        cx + maxR, cy + maxR
      );
      glassGrad.addColorStop(0, `rgba(255, 255, 255, ${ringPulse})`);
      glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      glassGrad.addColorStop(1, `rgba(129, 140, 248, ${ringPulse * 0.5})`);
      ctx.strokeStyle = glassGrad;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    }

    render();

    // Add mouse listener for interactivity
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size, handleMouseMove]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Multi-layer glow backdrop */}
      <div
        className="absolute rounded-full bg-indigo-500/[0.07] blur-3xl animate-pulse"
        style={{
          width: `${size * 0.75}px`,
          height: `${size * 0.75}px`,
        }}
      />
      <div
        className="absolute rounded-full bg-violet-500/[0.04] blur-[80px]"
        style={{
          width: `${size * 0.5}px`,
          height: `${size * 0.5}px`,
          animationDelay: "1s",
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative z-10 filter drop-shadow-[0_0_30px_rgba(99,102,241,0.15)]"
        style={{ pointerEvents: "none" }}
      />

      {/* Agent labels floating around the nexus */}
      <div className="absolute z-20 pointer-events-none" style={{ width: size, height: size }}>
        {/* Sentinel label */}
        <div
          className="absolute text-[9px] font-bold tracking-[0.15em] uppercase text-indigo-400/60 animate-pulse"
          style={{ top: "8%", right: "5%" }}
        >
          Sentinel
        </div>
        {/* Companion label */}
        <div
          className="absolute text-[9px] font-bold tracking-[0.15em] uppercase text-violet-400/60 animate-pulse"
          style={{ bottom: "15%", left: "2%", animationDelay: "0.5s" }}
        >
          Companion
        </div>
        {/* Bridge label */}
        <div
          className="absolute text-[9px] font-bold tracking-[0.15em] uppercase text-blue-400/60 animate-pulse"
          style={{ bottom: "8%", right: "15%", animationDelay: "1s" }}
        >
          Bridge
        </div>
      </div>
    </div>
  );
}
