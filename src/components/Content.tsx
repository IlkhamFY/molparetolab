import { useState } from 'react';
import type { Molecule } from '../utils/types';
import ParetoView from './views/ParetoView';
import ScoringView from './views/ScoringView';
import ParallelView from './views/ParallelView';
import CompareView from './views/CompareView';
import RadarView from './views/RadarView';
import TableView from './views/TableView';
import EggView from './views/EggView';

export default function Content({ molecules, compareIndices, selectedMolIdx }: { molecules: Molecule[], compareIndices: number[], selectedMolIdx: number | null }) {
  const [activeTab, setActiveTab] = useState('pareto');

  if (molecules.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-[calc(100vh-73px)] text-[#9C9893] text-center">
        <h3 className="text-[17px] mb-1.5 text-[#E8E6E3] font-medium tracking-tight">
          Paste molecules to begin analysis
        </h3>
        <p className="text-[13px] max-w-[320px] leading-relaxed">
          Enter SMILES in the sidebar or load an example set.
        </p>
      </div>
    );
  }

  const paretoCount = molecules.filter(m => m.paretoRank === 1).length;
  const ro5Fail = molecules.filter(m => !m.filters.lipinski?.pass).length;

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-73px)] custom-scrollbar">
      {/* Summary Line */}
      <div className="flex items-center gap-2 text-[13px] mb-6 text-[#9C9893]">
        <span className="font-semibold text-white">{molecules.length}</span> molecules
        <span className="text-white/20">·</span>
        <span className="font-semibold text-[#22c55e]">{paretoCount}</span> pareto-optimal
        <span className="text-white/20">·</span>
        {ro5Fail > 0 ? (
          <span className="font-semibold text-[#ef4444]">{ro5Fail} Ro5 fail</span>
        ) : (
          <span>all Ro5 pass</span>
        )}
      </div>

      {/* Tabs - Bug Fix: Reliable Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/5 pb-0 overflow-x-auto">
        {[
          { id: 'pareto', label: 'Pareto' },
          { id: 'egg', label: 'BOILED-Egg' },
          { id: 'radar', label: 'Radar' },
          { id: 'scoring', label: 'Scoring' },
          { id: 'parallel', label: 'Parallel' },
          { id: 'compare', label: 'Compare' },
          { id: 'table', label: 'Table & Dominance' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#5F7367] text-white' 
                : 'border-transparent text-[#9C9893] hover:text-[#E8E6E3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div className="view-container">
        {activeTab === 'pareto' && <ParetoView molecules={molecules} />}
        {activeTab === 'egg' && <EggView molecules={molecules} />}
        {activeTab === 'radar' && <RadarView molecules={molecules} selectedMolIdx={selectedMolIdx} />}
        {activeTab === 'scoring' && <ScoringView molecules={molecules} />}
        {activeTab === 'parallel' && <ParallelView molecules={molecules} />}
        {activeTab === 'compare' && <CompareView molecules={molecules} compareIndices={compareIndices} />}
        {activeTab === 'table' && <TableView molecules={molecules} selectedMolIdx={selectedMolIdx} />}
      </div>
    </div>
  );
}
