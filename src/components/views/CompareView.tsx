import { Bar } from 'react-chartjs-2';
import type { Molecule } from '../../utils/types';
import { DRUG_FILTERS } from '../../utils/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CompareProps {
  molecules: Molecule[];
  compareIndices: number[]; // We'll pass this in from the parent state
}

const COMPARE_PROPS = [
  { key: 'MW', label: 'Molecular Weight', unit: 'Da', ideal: 'lower', idealRange: [0, 500] },
  { key: 'LogP', label: 'cLogP', unit: '', ideal: 'range', idealRange: [0, 5] },
  { key: 'HBD', label: 'H-Bond Donors', unit: '', ideal: 'lower', idealRange: [0, 5] },
  { key: 'HBA', label: 'H-Bond Acceptors', unit: '', ideal: 'lower', idealRange: [0, 10] },
  { key: 'TPSA', label: 'TPSA', unit: 'Å²', ideal: 'range', idealRange: [20, 140] },
  { key: 'RotBonds', label: 'Rotatable Bonds', unit: '', ideal: 'lower', idealRange: [0, 10] },
  { key: 'FrCSP3', label: 'Fraction Csp3', unit: '', ideal: 'higher', idealRange: [0, 1] },
  { key: 'HeavyAtoms', label: 'Heavy Atoms', unit: '', ideal: 'lower', idealRange: [0, 50] },
  { key: 'MR', label: 'Molar Refractivity', unit: '', ideal: 'range', idealRange: [40, 130] },
];

function getWinner(prop: typeof COMPARE_PROPS[0], v1: number, v2: number) {
  if (prop.ideal === 'lower') return v1 < v2 ? 1 : v1 > v2 ? 2 : 0;
  if (prop.ideal === 'higher') return v1 > v2 ? 1 : v1 < v2 ? 2 : 0;
  if (prop.ideal === 'range') {
    const [lo, hi] = prop.idealRange;
    const d1 = (v1 >= lo && v1 <= hi) ? 0 : Math.min(Math.abs(v1 - lo), Math.abs(v1 - hi));
    const d2 = (v2 >= lo && v2 <= hi) ? 0 : Math.min(Math.abs(v2 - lo), Math.abs(v2 - hi));
    return d1 < d2 ? 1 : d1 > d2 ? 2 : 0;
  }
  return 0;
}

export default function CompareView({ molecules, compareIndices }: CompareProps) {
  if (!compareIndices || compareIndices.length < 2) {
    return (
      <div className="bg-[#22201F] border border-white/5 rounded-lg p-12 text-center flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">🔬</div>
        <h3 className="text-[17px] font-medium text-white mb-2">Select 2 molecules to compare</h3>
        <p className="text-[#9C9893] text-[13px] max-w-sm leading-relaxed">
          Right-click (or long-press/Cmd-click) on two molecule cards in the sidebar to select them for side-by-side comparison.
        </p>
      </div>
    );
  }

  const m1 = molecules[compareIndices[0]];
  const m2 = molecules[compareIndices[1]];

  let m1Wins = 0, m2Wins = 0, ties = 0;
  COMPARE_PROPS.forEach(p => {
    const w = getWinner(p, m1.props[p.key as keyof Molecule['props']] as number, m2.props[p.key as keyof Molecule['props']] as number);
    if (w === 1) m1Wins++;
    else if (w === 2) m2Wins++;
    else ties++;
  });

  const chartData = {
    labels: COMPARE_PROPS.map(p => p.label),
    datasets: [
      {
        label: m1.name,
        data: COMPARE_PROPS.map(p => m1.props[p.key as keyof Molecule['props']] as number),
        backgroundColor: 'rgba(20, 184, 166, 0.7)', // #14b8a6
        borderColor: '#14b8a6',
        borderWidth: 1,
      },
      {
        label: m2.name,
        data: COMPARE_PROPS.map(p => m2.props[p.key as keyof Molecule['props']] as number),
        backgroundColor: 'rgba(6, 182, 212, 0.7)', // #06b6d4
        borderColor: '#06b6d4',
        borderWidth: 1,
      },
    ]
  };

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-6">
        <h3 className="text-[14px] font-medium text-white">Molecule Comparison</h3>
        <p className="text-[12px] text-[#9C9893]">{m1.name} vs {m2.name}</p>
      </div>

      {/* Score summary */}
      <div className="flex justify-center gap-12 mb-8 p-4 bg-[#1A1918] rounded-md border border-white/5">
        <div className="text-center">
          <div className="text-3xl font-bold text-[#14b8a6]">{m1Wins}</div>
          <div className="text-[11px] text-[#9C9893] mt-1">{m1.name} wins</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-[#9C9893]">{ties}</div>
          <div className="text-[11px] text-[#9C9893] mt-1">ties</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-[#06b6d4]">{m2Wins}</div>
          <div className="text-[11px] text-[#9C9893] mt-1">{m2.name} wins</div>
        </div>
      </div>

      {/* Structures */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-3 bg-[#1A1918] rounded-lg border-2 border-[#14b8a6]/30">
          <div className="flex justify-center h-[120px] items-center [&>svg]:max-h-full" dangerouslySetInnerHTML={{ __html: m1.svg }} />
          <div className="font-semibold text-white mt-2 text-[13px]">{m1.name}</div>
          <div className="text-[10px] text-[#9C9893] font-mono mt-1 break-all px-2">{m1.smiles}</div>
        </div>
        <div className="text-center p-3 bg-[#1A1918] rounded-lg border-2 border-[#06b6d4]/30">
          <div className="flex justify-center h-[120px] items-center [&>svg]:max-h-full" dangerouslySetInnerHTML={{ __html: m2.svg }} />
          <div className="font-semibold text-white mt-2 text-[13px]">{m2.name}</div>
          <div className="text-[10px] text-[#9C9893] font-mono mt-1 break-all px-2">{m2.smiles}</div>
        </div>
      </div>

      {/* Property comparison bars */}
      <div className="mb-8 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_1fr_80px] gap-1 mb-2 text-[10px] text-[#9C9893] uppercase tracking-wide">
          <div className="text-right truncate pr-2">{m1.name}</div>
          <div></div>
          <div className="text-center">Property</div>
          <div></div>
          <div className="truncate pl-2">{m2.name}</div>
        </div>
        
        <div className="space-y-1">
          {COMPARE_PROPS.map(p => {
            const v1 = m1.props[p.key as keyof Molecule['props']] as number;
            const v2 = m2.props[p.key as keyof Molecule['props']] as number;
            const maxVal = Math.max(Math.abs(v1), Math.abs(v2), p.idealRange[1]) || 1;
            const pct1 = Math.min(Math.abs(v1) / maxVal * 100, 100);
            const pct2 = Math.min(Math.abs(v2) / maxVal * 100, 100);
            const winner = getWinner(p, v1, v2);
            const fmt = p.key === 'FrCSP3' ? 3 : 1;

            return (
              <div key={p.key} className="grid grid-cols-[80px_1fr_120px_1fr_80px] gap-1 items-center bg-[#1A1918]/50 py-1 hover:bg-[#1A1918]">
                <div className={`text-right font-mono text-[12px] pr-2 ${winner === 1 ? 'text-[#22c55e] font-semibold' : 'text-[#E8E6E3]'}`}>
                  {v1.toFixed(fmt)}
                </div>
                <div className="relative h-4 flex justify-end items-center mr-2">
                  <div className={`h-2 rounded-l-sm transition-all ${winner === 1 ? 'bg-[#22c55e]' : 'bg-[#14b8a6]/80'}`} style={{ width: `${pct1}%` }} />
                </div>
                <div className="text-center text-[12px] text-[#9C9893] truncate px-1">{p.label}</div>
                <div className="relative h-4 flex justify-start items-center ml-2">
                  <div className={`h-2 rounded-r-sm transition-all ${winner === 2 ? 'bg-[#22c55e]' : 'bg-[#06b6d4]/80'}`} style={{ width: `${pct2}%` }} />
                </div>
                <div className={`text-left font-mono text-[12px] pl-2 ${winner === 2 ? 'text-[#22c55e] font-semibold' : 'text-[#E8E6E3]'}`}>
                  {v2.toFixed(fmt)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar chart comparison */}
      <div className="h-[300px] mb-8">
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#8888a0', font: { size: 11 } } },
            },
            scales: {
              x: {
                ticks: { color: '#8888a0', font: { size: 10 }, maxRotation: 45 },
                grid: { color: 'rgba(42,42,58,0.3)' },
              },
              y: {
                ticks: { color: '#8888a0' },
                grid: { color: 'rgba(42,42,58,0.3)' },
              },
            },
          }}
        />
      </div>

      {/* Filter comparison */}
      <div>
        <div className="text-[13px] font-semibold text-white mb-3">Drug-likeness Filters</div>
        <div className="bg-[#1A1918] rounded border border-white/5 divide-y divide-white/5">
          {Object.entries(DRUG_FILTERS).map(([fname, fdef]) => {
            const r1 = m1.filters[fname];
            const r2 = m2.filters[fname];
            return (
              <div key={fname} className="flex justify-between items-center px-4 py-2.5 text-[12px]">
                <span className={`w-24 text-right ${r1?.pass ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {r1?.pass ? '✓ Pass' : `✗ Fail (${r1?.violations})`}
                </span>
                <span className="text-[#9C9893] truncate px-4">{(fdef as any).label}</span>
                <span className={`w-24 text-left ${r2?.pass ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {r2?.pass ? '✓ Pass' : `✗ Fail (${r2?.violations})`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
