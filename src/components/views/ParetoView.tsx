import { useState, useMemo } from 'react';
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
  const [showAll, setShowAll] = useState(false);
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-[12px] text-[#9C9893] mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span> Ro5 Pass
        </div>
        <div className="flex items-center gap-2">
          <span className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#ef4444]"></span> Ro5 Fail
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0 border-t-2 border-dashed border-[#14b8a6]"></span> Pareto Front
        </div>
      </div>

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
               <ScatterChart molecules={molecules} xKey={axis.x} yKey={axis.y} />
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

function ScatterChart({ molecules, xKey, yKey }: { molecules: Molecule[], xKey: keyof Molecule['props'], yKey: keyof Molecule['props'] }) {
  const data = useMemo(() => {
    const passData: any[] = [];
    const failData: any[] = [];
    
    molecules.forEach((m) => {
      const pt = { x: m.props[xKey], y: m.props[yKey], label: m.name };
      if (m.filters.lipinski?.pass) passData.push(pt); 
      else failData.push(pt);
    });

    const paretoMols = molecules.filter(m => m.paretoRank === 1)
      .map(m => ({ x: m.props[xKey], y: m.props[yKey], label: m.name }))
      .sort((a: any, b: any) => a.x - b.x);

    return {
      datasets: [
        {
          label: 'Ro5 Pass',
          data: passData,
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderColor: '#22c55e',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'circle' as const,
        },
        {
          label: 'Ro5 Fail',
          data: failData,
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderColor: '#ef4444',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'triangle' as const,
        },
        ...(paretoMols.length >= 2 ? [{
          label: 'Pareto Front',
          data: paretoMols,
          type: 'line' as const,
          borderColor: 'rgba(255,255,255,0.25)',
          borderWidth: 1.5,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
          tension: 0,
          order: -1,
        }] : [])
      ]
    };
  }, [molecules, xKey, yKey]);

  return (
    <Scatter 
      data={data as any} 
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ctx.raw.label || ''
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: xKey as string, color: '#8888a0' },
            grid: { color: 'rgba(42,42,58,0.5)' },
            ticks: { color: '#8888a0' }
          },
          y: {
            title: { display: true, text: yKey as string, color: '#8888a0' },
            grid: { color: 'rgba(42,42,58,0.5)' },
            ticks: { color: '#8888a0' }
          }
        }
      }} 
    />
  );
}
