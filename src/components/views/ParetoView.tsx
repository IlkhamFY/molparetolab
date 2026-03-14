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

export default function ParetoView({ molecules }: { molecules: Molecule[] }) {
  const [axes, setAxes] = useState<ScatterAxes[]>(DEFAULT_AXES);
  const [showAll, setShowAll] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['lipinski']));

  const visibleAxes = showAll ? axes : axes.slice(0, 2);

  const toggleFilter = (name: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAxisChange = (idx: number, xy: 'x' | 'y', val: keyof Molecule['props']) => {
    setAxes(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [xy]: val };
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-[#9C9893] py-1">Overlays:</span>
        {Object.entries(DRUG_FILTERS).map(([fname, fdef]) => (
          <button
            key={fname}
            onClick={() => toggleFilter(fname)}
            title={(fdef as any).desc}
            className={`px-3 py-1 text-[11px] rounded-full border transition-colors ${
              activeFilters.has(fname)
                ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                : 'bg-[#2C2A28] border-white/5 text-[#9C9893] hover:border-[#5F7367]'
            }`}
          >
            {fdef.label}
          </button>
        ))}
      </div>

      {/* Legend: reflects first active overlay filter */}
      {(() => {
        const filterOrder = ['lipinski', 'veber', 'ghose'] as const;
        const active = filterOrder.find(k => activeFilters.has(k));
        const label = active ? (DRUG_FILTERS[active] as { label: string }).label : 'Filter';
        return (
          <div className="flex items-center gap-4 text-[12px] text-[#9C9893] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span> {label} Pass
            </div>
            <div className="flex items-center gap-2">
              <span className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#ef4444]"></span> {label} Fail
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0 border-t-2 border-dashed border-[#14b8a6]"></span> Pareto Front
            </div>
          </div>
        );
      })()}

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleAxes.map((axis, i) => (
          <div key={i} className="bg-[#22201F] border border-white/5 rounded-lg p-4 flex flex-col h-[380px]">
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
               <ScatterChart molecules={molecules} xKey={axis.x} yKey={axis.y} activeFilters={activeFilters} />
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

const FILTER_ORDER = ['lipinski', 'veber', 'ghose'] as const;

function ScatterChart({ molecules, xKey, yKey, activeFilters }: { molecules: Molecule[]; xKey: keyof Molecule['props']; yKey: keyof Molecule['props']; activeFilters: Set<string> }) {
  const data = useMemo(() => {
    const passData: { x: number; y: number; label: string; molIndex: number }[] = [];
    const failData: { x: number; y: number; label: string; molIndex: number }[] = [];
    const filterKey = FILTER_ORDER.find((k) => activeFilters.has(k)) ?? 'lipinski';

    molecules.forEach((m, idx) => {
      const pt = { x: m.props[xKey], y: m.props[yKey], label: m.name, molIndex: idx };
      const pass = m.filters[filterKey]?.pass ?? false;
      if (pass) passData.push(pt);
      else failData.push(pt);
    });

    const paretoMols = molecules
      .filter((m) => m.paretoRank === 1)
      .map((m) => ({ x: m.props[xKey], y: m.props[yKey], label: m.name, molIndex: molecules.indexOf(m) }))
      .sort((a: { x: number }, b: { x: number }) => a.x - b.x);

    return {
      datasets: [
        {
          label: 'Pass',
          data: passData,
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderColor: '#22c55e',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'circle' as const,
        },
        {
          label: 'Fail',
          data: failData,
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderColor: '#ef4444',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'triangle' as const,
        },
        ...(paretoMols.length >= 2
          ? [
              {
                label: 'Pareto Front',
                data: paretoMols,
                type: 'line' as const,
                borderColor: 'rgba(20,184,166,0.6)',
                borderWidth: 2,
                borderDash: [6, 3],
                pointRadius: 0,
                fill: false,
                tension: 0,
                order: -1,
              },
            ]
          : []),
      ],
    };
  }, [molecules, xKey, yKey, activeFilters]);

  const tooltipRef = useRef<HTMLDivElement>(null);

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
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
                      <div class="text-[#9C9893] mb-2">${xKey}: ${m.props[xKey].toFixed(2)} · ${yKey}: ${m.props[yKey].toFixed(2)}</div>
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
              const pad = (max - min) * 0.1 || 1;
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
              const pad = (max - min) * 0.1 || 1;
              return { min: min - pad, max: max + pad };
            })()),
          }
        }
      }} 
    />
    </div>
  );
}
