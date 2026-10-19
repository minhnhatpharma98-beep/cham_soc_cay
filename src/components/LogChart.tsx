"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/tet";

type Point = { date: string; value: number };

const W = 320;
const H = 140;
const PAD = { top: 12, right: 12, bottom: 22, left: 32 };

/** Single-series line chart with a shaded safe band and a hover tooltip. */
export default function LogChart({
  title,
  unit,
  points,
  safe,
}: {
  title: string;
  unit: string;
  points: Point[];
  safe: [number, number];
}) {
  const [hover, setHover] = useState<number | null>(null);

  const values = points.map((p) => p.value);
  const lo = Math.min(safe[0], ...values);
  const hi = Math.max(safe[1], ...values);
  const span = hi - lo || 1;
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;

  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * ih;
  const ticks = [safe[0], safe[1]];
  const out = (v: number) => v < safe[0] || v > safe[1];
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const h = hover !== null ? points[hover] : null;
  // Flip the tooltip under the point when the point sits in the top half, so it never covers the title.
  const below = h ? y(h.value) < H / 2 : false;

  return (
    <figure className="rounded-3xl border border-line bg-white p-4 shadow-soft">
      <figcaption className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted">
          Vùng an toàn {safe[0]}–{safe[1]}
          {unit}
        </span>
      </figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title} theo thời gian`} onMouseLeave={() => setHover(null)}>
          <rect x={PAD.left} y={y(safe[1])} width={iw} height={y(safe[0]) - y(safe[1])} className="fill-brand-soft" />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray="3 3" />
              <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[10px]">
                {t}
              </text>
            </g>
          ))}
          <text x={PAD.left} y={H - 4} className="fill-muted text-[10px]">{fmtDate(points[0].date).slice(0, 5)}</text>
          {points.length > 1 && (
            <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-muted text-[10px]">
              {fmtDate(points[points.length - 1].date).slice(0, 5)}
            </text>
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} className="stroke-muted" strokeWidth={1} />}
          <path d={path} fill="none" className="stroke-brand" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={hover === i ? 5.5 : 4} strokeWidth={2} className={`stroke-white ${out(p.value) ? "fill-accent" : "fill-brand"}`} />
              {/* larger invisible hit target than the mark */}
              <rect
                x={x(i) - iw / Math.max(points.length, 2) / 2}
                y={PAD.top}
                width={iw / Math.max(points.length, 2)}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              />
            </g>
          ))}
        </svg>
        {h && hover !== null && (
          <div
            className={`pointer-events-none absolute z-10 w-max max-w-[220px] -translate-x-1/2 rounded-xl bg-foreground px-2.5 py-1.5 text-xs text-white shadow-lift ${
              below ? "mt-3" : "-mt-3 -translate-y-full"
            }`}
            style={{ left: `${Math.min(80, Math.max(20, (x(hover) / W) * 100))}%`, top: `${(y(h.value) / H) * 100}%` }}
          >
            <span className="font-semibold">
              {h.value}
              {unit}
            </span>{" "}
            · {fmtDate(h.date)}
            {out(h.value) && <span className="ml-1 font-semibold text-amber-300">ngoài vùng an toàn</span>}
          </div>
        )}
      </div>
    </figure>
  );
}
