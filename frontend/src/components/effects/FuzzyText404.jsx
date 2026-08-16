import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';

export function FuzzyText404({
  children = '404',
  fontSize = 'clamp(4rem, 14vw, 11rem)',
  fontWeight = 700,
  color = '#306998',
  baseIntensity = 0.2,
  hoverIntensity = 0.6,
  fuzzRange = 28,
  className,
}) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
  let rafId;
  const canvas = canvasRef.current;
  if (!canvas) return undefined;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  const fontString = `${fontWeight} ${fontSize} 'Fraunces', Georgia, serif`;

  const draw = () => {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);
  ctx.font = fontString;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const intensity = hovered ? hoverIntensity : baseIntensity;

  for (let x = 0; x < width; x += 3) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  const jitter = (Math.random() - 0.5) * 2 * fuzzRange * intensity;
  ctx.setTransform(dpr, 0, 0, dpr, x + jitter, height / 2);
  const slice = ctx.measureText(children).width / width;
  ctx.scale(slice, 1);
  ctx.fillText(children, width / 2, height / 2);
  ctx.restore();
  }

  rafId = requestAnimationFrame(draw);
  };

  draw();
  return () => cancelAnimationFrame(rafId);
  }, [children, fontSize, fontWeight, color, baseIntensity, hoverIntensity, fuzzRange, hovered]);

  return (
  <canvas
  ref={canvasRef}
  className={cn('w-full', className)}
  style={{ height: 'clamp(8rem, 28vw, 20rem)' }}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  />
  );
}