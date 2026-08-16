import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * SpotlightGrid — re-skinned from onlineComponents/CursorGrid. A subtle
 * canvas lattice that lights up around the cursor in the brand colour. Used
 * as an interactive backdrop behind hero content.
 *
 * Props: color (hex, defaults to primary-600), radius, cellSize, className.
 * Honors prefers-reduced-motion (renders nothing animated).
 */
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(v.slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export function SpotlightGrid({
  color = '#306998',
  radius = 130,
  cellSize = 64,
  maxOpacity = 0.5,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { color, radius, cellSize, maxOpacity };

  useEffect(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const container = containerRef.current;
  const canvas = canvasRef.current;
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cols = 0, rows = 0, offX = 0, offY = 0, w = 0, h = 0;
  let alphas = new Float32Array(0);
  let touched = new Float64Array(0);
  let raf = 0, running = false, last = 0;

  const rebuild = () => {
  const p = propsRef.current;
  w = container.offsetWidth; h = container.offsetHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = Math.ceil(w / p.cellSize) + 1;
  rows = Math.ceil(h / p.cellSize) + 1;
  offX = (w - cols * p.cellSize) / 2;
  offY = (h - rows * p.cellSize) / 2;
  alphas = new Float32Array(cols * rows);
  touched = new Float64Array(cols * rows);
  };

  const cellCenter = (i) => {
  const p = propsRef.current;
  return [
  offX + (i % cols) * p.cellSize + p.cellSize / 2,
  offY + Math.floor(i / cols) * p.cellSize + p.cellSize / 2,
  ];
  };

  const energize = (x, y) => {
  const p = propsRef.current;
  const r = Math.max(p.radius, 1);
  const now = performance.now();
  const minC = Math.max(0, Math.floor((x - r - offX) / p.cellSize));
  const maxC = Math.min(cols - 1, Math.floor((x + r - offX) / p.cellSize));
  const minR = Math.max(0, Math.floor((y - r - offY) / p.cellSize));
  const maxR = Math.min(rows - 1, Math.floor((y + r - offY) / p.cellSize));
  for (let cR = minR; cR <= maxR; cR++) {
  for (let cC = minC; cC <= maxC; cC++) {
  const i = cR * cols + cC;
  const [cx, cy] = cellCenter(i);
  const dist = Math.hypot(cx - x, cy - y);
  if (dist > r) continue;
  const level = (1 - dist / r) ** 2 * p.maxOpacity;
  if (level > alphas[i]) { alphas[i] = level; touched[i] = now; }
  }
  }
  };

  const draw = (now) => {
  const p = propsRef.current;
  const dt = Math.min(now - last, 50); last = now;
  ctx.clearRect(0, 0, w, h);
  const [cr, cg, cb] = hexToRgb(p.color);
  const half = p.cellSize / 2;
  let any = false;
  for (let i = 0; i < alphas.length; i++) {
  let a = alphas[i];
  if (a <= 0) continue;
  if (now - touched[i] > 350) { a = Math.max(0, a - dt / 600); alphas[i] = a; if (a <= 0) continue; }
  any = true;
  const [cx, cy] = cellCenter(i);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx - half + 0.5, cy - half + 0.5, p.cellSize - 1, p.cellSize - 1);
  }
  if (any) raf = requestAnimationFrame(draw);
  else running = false;
  };

  const wake = () => { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(draw); };
  const toLocal = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const onMove = (e) => { energize(...toLocal(e)); wake(); };

  const ro = new ResizeObserver(() => { rebuild(); wake(); });
  ro.observe(container);
  rebuild(); wake();
  container.addEventListener('pointermove', onMove);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); container.removeEventListener('pointermove', onMove); };
  }, []);

  return (
  <div ref={containerRef} className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
  <canvas ref={canvasRef} className="h-full w-full" />
  </div>
  );
}

export default SpotlightGrid;
