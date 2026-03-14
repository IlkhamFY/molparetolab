import { useState, useMemo, useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import type { Molecule } from '../../utils/types';
import { DRUG_FILTERS } from '../../utils/types';

interface ScatterAxes {
  x: keyof Molecule['props'];
  y: keyof Molecule['props'];
}

const DEFAULT_AXES: ScatterAxes[] = [
  { x: 'MW', y: 'LogP' },
  { x: 'MW', y: 'TPSA' },
  { x: 'LogP', y: 'TPSA' },
  { x: 'HBD', y: 'HBA' },
  { x: 'MW', y: 'RotBonds' },
  { x: 'LogP', y: 'FrCSP3' },
];

const FILTER_COLORS: Record<string, string> = {
  lipinski: '#22c55e',
  veber: '#eab308',
  ghose: '#06b6d4',
};

export default function ParetoView({ molecules }: { molecules: Molecule[] }) {
  const [axes, setAxes] = useState<ScatterAxes[]>(DEFAULT_AXES);
  const [showAll, setShowAll] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>('lipinski');

  const visibleAxes = showAll ? axes : axes.slice(0, 2);

  const toggleFilter = (name: string) => {
    setActiveFilter(prev => (prev === name ? null : name));
  };

  const handleAxisChange = (idx: number, xy: 'x' | 'y', val: keyof Molecule['props']) => {
    setAxes(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [xy]: val };
      return next;
    });
  };

  const activeColor = activeFilter ? FILTER_COLORS[activeFilter] ?? '#22c55e' : '#22c55e';
  const activeLabel = activeFilter
    ? (DRUG_FILTERS[activeFilter as keyof typeof DRUG_FILTERS] as { label: string }).label
    : 'Filter';
  const allPass = activeFilter
    ? molecules.every(m => m.filters[activeFilter]?.pass ?? false)
    : false;

  return (
    <div className="space-y-4">
      {/* Filters — radio style */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-[#9C9893] py-1">Overlays:</span>
        {Object.entries(DRUG_FILTERS).map(([fname, fdef]) => {
          const isActive = activeFilter === fname;
          const color = FILTER_COLORS[fname] ?? '#22c55e';
          return (
            <button
              key={fname}
              onClick={() => toggleFilter(fname)}
              title={(fdef as any).desc}
              className={`px-3 py-1 text-[11px] rounded-full border transition-colors ${
                isActive
                  ? 'bg-opacity-10 border-current'
                  : 'bg-[#2C2A28] border-white/5 text-[#9C9893] hover:border-[#5F7367]'
              }`}
              style={isActive ? { color, backgroundColor: color + '1a', borderColor: color } : undefined}
            >
              {fdef.label}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[12px] text-[#9C9893] mb-4">
        {activeFilter && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} /> {activeLabel} Pass
            </div>
            <div className="flex items-center gap-2">
              <span className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#ef4444]" /> {activeLabel} Fail
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-[#fbbf24] bg-transparent" /> Pareto-optimal
        </div>
        {activeFilter && allPass && (
          <span className="text-[11px] text-[#9C9893]/70 italic">All molecules pass {activeLabel}</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleAxes.map((axis, i) => (
          <div key={`${axis.x}-${axis.y}-${i}`} className="bg-[#22201F] border border-white/5 rounded-lg p-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[13px] font-medium">{axis.x} vs {axis.y}</div>
              <div className="flex gap-3 text-[11px]">
                <label className="flex items-center gap-1 text-[#9C9893]">
                  X:
                  <select
                    value={axis.x}
                    onChange={e => handleAxisChange(i, 'x', e.target.value as any)}
                    className="bg-[#1A1918] border border-white/10 rounded px-1.5 py-0.5 outline-none text-[#E8E6E3]"
                  >
                    {['MW','LogP','HBD','HBA','TPSA','RotBonds','FrCSP3'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-1 text-[#9C9893]">
                  Y:
                  <select
                    value={axis.y}
                    onChange={e => handleAxisChange(i, 'y', e.target.value as any)}
                    className="bg-[#1A1918] border border-white/10 rounded px-1.5 py-0.5 outline-none text-[#E8E6E3]"
                  >
                    {['MW','LogP','HBD','HBA','TPSA','RotBonds','FrCSP3'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex-1 relative">
               <ScatterChart molecules={molecules} xKey={axis.x} yKey={axis.y} activeFilter={activeFilter} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className="text-[#9C9893] text-[12px] underline hover:text-[#E8E6E3] mt-2 block mx-auto py-2"
      >
        {showAll ? 'Show fewer' : 'Show all 6 plots'}
      </button>
    </div>
  );
}

interface PointData {
  x: number;
  y: number;
  label: string;
  molIndex: number;
  paretoRank: number | null;
}

function ScatterChart({ molecules, xKey, yKey, activeFilter }: { molecules: Molecule[]; xKey: keyof Molecule['props']; yKey: keyof Molecule['props']; activeFilter: string | null }) {
  const data = useMemo(() => {
    const passData: PointData[] = [];
    const failData: PointData[] = [];

    molecules.forEach((m, idx) => {
      const pt: PointData = {
        x: m.props[xKey],
        y: m.props[yKey],
        label: m.name,
        molIndex: idx,
        paretoRank: m.paretoRank,
      };
      if (activeFilter) {
        const pass = m.filters[activeFilter]?.pass ?? false;
        if (pass) passData.push(pt);
        else failData.push(pt);
      } else {
        passData.push(pt);
      }
    });

    return {
      datasets: [
        {
          label: 'Pass',
          data: passData,
          backgroundColor: activeFilter ? 'rgba(34,197,94,0.7)' : 'rgba(120,143,129,0.7)',
          borderColor: 'transparent',
          pointRadius: 8,
          pointHoverRadius: 10,
          pointStyle: 'circle' as const,
        },
        ...(failData.length > 0
          ? [
              {
                label: 'Fail',
                data: failData,
                backgroundColor: 'rgba(239,68,68,0.7)',
                borderColor: 'transparent',
                pointRadius: 8,
                pointHoverRadius: 10,
                pointStyle: 'triangle' as const,
              },
            ]
          : []),
      ],
    };
  }, [molecules, xKey, yKey, activeFilter]);

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Custom plugin: gold ring for Pareto-optimal
  const customPlugin = useMemo(() => ({
    id: 'paretoRing',
    afterDatasetsDraw(chart: any) {
      const ctx = chart.ctx as CanvasRenderingContext2D;
      ctx.save();

      for (let dsIdx = 0; dsIdx < chart.data.datasets.length; dsIdx++) {
        const meta = chart.getDatasetMeta(dsIdx);
        if (!meta.visible) continue;
        const dataset = chart.data.datasets[dsIdx];
        meta.data.forEach((element: any, idx: number) => {
          const raw = dataset.data[idx] as PointData | undefined;
          if (!raw) return;

          if (raw.paretoRank === 1) {
            const ex = element.x as number;
            const ey = element.y as number;
            ctx.beginPath();
            ctx.arc(ex, ey, 12, 0, Math.PI * 2);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        });
      }

      ctx.restore();
    },
  }), []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={tooltipRef}
        id="pareto-tooltip"
        className="absolute z-10 pointer-events-none hidden md:block px-3 py-2 bg-[#1A1918] border border-white/10 rounded-lg shadow-xl text-left max-w-[220px]"
        style={{ opacity: 0 }}
      />
      <Scatter
        data={data as any}
        plugins={[customPlugin]}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 300 },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
              external(context: unknown) {
                const ctx = context as { tooltip: { opacity: number; caretX?: number; caretY?: number; dataPoints?: Array<{ raw?: { label?: string; molIndex?: number } }> }; chart: { canvas: HTMLCanvasElement } };
                const el = tooltipRef.current;
                if (!el) return;
                if (ctx.tooltip.opacity === 0) {
                  el.style.opacity = '0';
                  el.style.visibility = 'hidden';
                  return;
                }
                const dp = ctx.tooltip.dataPoints?.[0];
                const raw = dp?.raw as { label?: string; molIndex?: number } | undefined;
                const molIndex = raw?.molIndex ?? -1;
                const m = molIndex >= 0 && molIndex < molecules.length ? molecules[molIndex] : null;
                const { offsetLeft: posX, offsetTop: posY } = ctx.chart.canvas;
                const caretX = ctx.tooltip.caretX ?? 0;
                const caretY = ctx.tooltip.caretY ?? 0;
                if (m) {
                  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(m.svg)));
                  el.innerHTML = `
                    <div class="text-[12px]">
                      <div class="font-semibold text-white mb-1">${(m.name || '').replace(/</g, '&lt;')}</div>
                      <div class="text-[#9C9893] mb-2">${xKey}: ${m.props[xKey].toFixed(2)} &middot; ${yKey}: ${m.props[yKey].toFixed(2)}</div>
                      <img src="${svgDataUrl}" alt="" class="w-24 h-[72px] object-contain bg-[#09090b] rounded" />
                    </div>
                  `;
                  el.style.left = posX + caretX + 10 + 'px';
                  el.style.top = posY + caretY - 10 + 'px';
                } else {
                  el.innerHTML = `<div class="text-[12px] text-[#E8E6E3]">${(raw?.label || '').replace(/</g, '&lt;')}</div>`;
                  el.style.left = posX + caretX + 10 + 'px';
                  el.style.top = posY + caretY - 10 + 'px';
                }
                el.style.visibility = 'visible';
                el.style.opacity = '1';
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: xKey as string, color: '#8888a0' },
              grid: { color: 'rgba(42,42,58,0.5)' },
              ticks: { color: '#8888a0' },
              ...((() => {
                const vals = molecules.map(m => m.props[xKey]);
                if (vals.length === 0) return {};
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                const pad = (max - min) * 0.15 || 1;
                return { min: min - pad, max: max + pad };
              })()),
            },
            y: {
              title: { display: true, text: yKey as string, color: '#8888a0' },
              grid: { color: 'rgba(42,42,58,0.5)' },
              ticks: { color: '#8888a0' },
              ...((() => {
                const vals = molecules.map(m => m.props[yKey]);
                if (vals.length === 0) return {};
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                const pad = (max - min) * 0.15 || 1;
                return { min: min - pad, max: max + pad };
              })()),
            }
          }
        }}
      />
    </div>
  );
}
