"use client";

/**
 * Hand-rolled SVG charts in the Cyberbrutalist style (2px black strokes,
 * flat fills, no rounding, no gradients). Three shapes cover every panel.
 */
import { useState } from "react";

const BLACK = "#000000";

// ---------- Area / line chart ----------

export type AreaPoint = { label: string; value: number; sub?: string };

export function AreaChart({ data, unit = "kg" }: { data: AreaPoint[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 200;
  const pad = { l: 44, r: 12, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(1, ...data.map((d) => d.value));
  // Round the axis ceiling up to a clean number so gridlines read well.
  const mag = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / mag) * mag;
  const x = (i: number) => pad.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / top) * ih;

  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${x(0)},${y(0)} ${line} ${x(data.length - 1)},${y(0)}`;
  const every = Math.ceil(data.length / 8);
  const h = hover === null ? null : data[hover];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Tren tonase harian">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(top * t)} y2={y(top * t)} stroke={BLACK} strokeWidth={t === 0 ? 2 : 1} strokeDasharray={t === 0 ? undefined : "4 4"} opacity={t === 0 ? 1 : 0.35} />
            <text x={pad.l - 6} y={y(top * t) + 4} textAnchor="end" fontSize={11} fontFamily="var(--font-mono-ui)">
              {Math.round(top * t).toLocaleString("id-ID")}
            </text>
          </g>
        ))}
        <polygon points={area} fill="#d4ff00" stroke="none" />
        <polyline points={line} fill="none" stroke={BLACK} strokeWidth={3} strokeLinejoin="miter" />
        {data.map((d, i) => (
          <g key={d.label}>
            <rect x={x(i) - 4} y={y(d.value) - 4} width={8} height={8} fill={hover === i ? "#2563eb" : "#ffffff"} stroke={BLACK} strokeWidth={2} />
            {i % every === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono-ui)">
                {d.label}
              </text>
            )}
            <rect
              x={x(i) - iw / data.length / 2}
              y={pad.t}
              width={iw / data.length}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(i)}
            />
          </g>
        ))}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute border-2 border-border bg-terminal px-2 py-1 font-mono-ui text-[11px] text-white"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0, transform: "translateX(-50%)" }}
        >
          {h.label}: {h.value.toLocaleString("id-ID")} {unit}
          {h.sub && <span className="text-lime"> · {h.sub}</span>}
        </div>
      )}
    </div>
  );
}

// ---------- Donut ----------

export type DonutSlice = { label: string; value: number; color: string };

export function Donut({ slices, centerLabel }: { slices: DonutSlice[]; centerLabel: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label="Distribusi status case">
        <circle cx={70} cy={70} r={R} fill="none" stroke="#e5e5e0" strokeWidth={26} />
        {total > 0 &&
          slices
            .filter((s) => s.value > 0)
            .map((s) => {
              const len = (s.value / total) * C;
              const el = (
                <circle
                  key={s.label}
                  cx={70}
                  cy={70}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={26}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        <circle cx={70} cy={70} r={R + 13} fill="none" stroke={BLACK} strokeWidth={2} />
        <circle cx={70} cy={70} r={R - 13} fill="none" stroke={BLACK} strokeWidth={2} />
        <g transform="rotate(90 70 70)">
          <text x={70} y={72} textAnchor="middle" fontSize={22} fontWeight={800} fontFamily="var(--font-display)">
            {total}
          </text>
          <text x={70} y={88} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono-ui)">
            {centerLabel}
          </text>
        </g>
      </svg>
      <ul className="flex flex-col gap-1 font-mono-ui text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border-2 border-border" style={{ background: s.color }} />
            <span className="w-20">{s.label}</span>
            <span className="font-bold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Horizontal bars ----------

export type Bar = { label: string; value: number; color?: string; display?: string };

export function BarList({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <ul className="flex flex-col gap-2">
      {bars.map((b) => (
        <li key={b.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 font-mono-ui text-xs">
          <span>{b.label}</span>
          <div className="h-5 border-2 border-border bg-white">
            <div className="h-full" style={{ width: `${(b.value / max) * 100}%`, background: b.color ?? "#2563eb" }} />
          </div>
          <span className="min-w-14 text-right font-bold">{b.display ?? b.value}</span>
        </li>
      ))}
    </ul>
  );
}
