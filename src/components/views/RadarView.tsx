import { Radar } from 'react-chartjs-2';
import type { Molecule } from '../../utils/types';
import { PROPERTIES } from '../../utils/types';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Avoid re-registering if already done globally, but we do need RadialScale for this chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend);

const COLORS = [
  '#2dd4bf', '#a78bfa', '#f472b6', '#fbbf24', '#38bdf8', '#fb923c', '#a3e635'
];

export default function RadarView({ molecules, selectedMolIdx }: { molecules: Molecule[], selectedMolIdx: number | null }) {
  const labels = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds', 'FrCSP3'];
  
  const maxVals: Record<string, number> = {};
  labels.forEach(k => {
    const propDef = PROPERTIES.find(p => p.key === k);
    if (propDef && propDef.lipinski) {
      maxVals[k] = propDef.lipinski.max;
    } else {
      maxVals[k] = Math.max(...molecules.map(m => m.props[k as keyof Molecule['props']] as number), 1);
    }
  });

  const datasets = molecules.map((m, i) => {
    const isSelected = selectedMolIdx === i;
    const color = COLORS[i % COLORS.length];

    return {
      label: m.name,
      data: labels.map(k => Math.max(0, Math.min((m.props[k as keyof Molecule['props']] as number) / maxVals[k], 1.5))),
      borderColor: color,
      backgroundColor: color + '35', // ~20% opacity fill
      borderWidth: isSelected ? 3 : 2,
      pointRadius: isSelected ? 5 : 3,
      pointBackgroundColor: color,
    };
  });

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Property Radar</h3>
        <p className="text-[12px] text-[#9C9893]">normalized to Lipinski limits (1.0 = threshold)</p>
      </div>

      <div className="w-full h-[420px]">
        <Radar
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const mol = molecules[ctx.datasetIndex];
                    const key = labels[ctx.dataIndex];
                    const val = mol.props[key as keyof Molecule['props']];
                    return `${mol.name}: ${key} = ${typeof val === 'number' ? val.toFixed(1) : val}`;
                  }
                }
              }
            },
            scales: {
              r: {
                grid: { color: 'rgba(80,80,100,0.4)' },
                angleLines: { color: 'rgba(80,80,100,0.4)' },
                pointLabels: { color: '#e0e0e8', font: { size: 13 } },
                ticks: { color: '#8888a0', backdropColor: 'rgba(26,25,24,0.75)', stepSize: 0.25, maxTicksLimit: 5, display: true },
                suggestedMin: 0,
                suggestedMax: 1.0,
              }
            }
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#9C9893]">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {ds.label}
          </div>
        ))}
      </div>
    </div>
  );
}
