import { useRef } from 'react';
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
      maxVals[k] = propDef.lipinski.max * 1.5;
    } else {
      maxVals[k] = Math.max(...molecules.map(m => m.props[k as keyof Molecule['props']] as number), 1);
    }
  });

  const datasets = molecules.map((m, i) => {
    const isSelected = selectedMolIdx === i;
    const color = COLORS[i % COLORS.length];

    return {
      label: m.name,
      data: labels.map(k => Math.min((m.props[k as keyof Molecule['props']] as number) / maxVals[k], 1.5)),
      borderColor: color,
      backgroundColor: color + '20', // Add alpha
      borderWidth: isSelected ? 3 : 1.5,
      pointRadius: isSelected ? 4 : 2,
    };
  });

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Property Radar</h3>
        <p className="text-[12px] text-[#9C9893]">normalized to Lipinski limits (1.0 = threshold)</p>
      </div>

      <div className="w-full h-[500px]">
        <Radar 
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#8888a0', font: { size: 11 } } },
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
                grid: { color: 'rgba(42,42,58,0.5)' },
                angleLines: { color: 'rgba(42,42,58,0.5)' },
                pointLabels: { color: '#e0e0e8', font: { size: 12 } },
                ticks: { color: '#8888a0', backdropColor: 'transparent', stepSize: 0.5 },
                suggestedMin: 0,
                suggestedMax: 1.2,
              }
            }
          }}
        />
      </div>
    </div>
  );
}
