import { useState } from 'react';
import { GitCompareArrows, FlaskConical, MessageSquareText } from 'lucide-react';
import type { Molecule } from '../utils/types';
import ParetoView from './views/ParetoView';
import ScoringView from './views/ScoringView';
import ParallelView from './views/ParallelView';
import CompareView from './views/CompareView';
import RadarView from './views/RadarView';
import TableView from './views/TableView';
import EggView from './views/EggView';
import SimilarityMatrixView from './views/SimilarityMatrixView';
import ActivityCliffsView from './views/ActivityCliffsView';

export default function Content({ molecules, compareIndices, selectedMolIdx, setSelectedMolIdx, exportContainerRef, setCompareIndices }: { molecules: Molecule[]; compareIndices: number[]; selectedMolIdx: number | null; setSelectedMolIdx?: (idx: number | null) => void; exportContainerRef?: React.RefObject<HTMLDivElement | null>; setCompareIndices?: React.Dispatch<React.SetStateAction<number[]>> }) {
  const [activeTab, setActiveTab] = useState('pareto');

  if (molecules.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-[calc(100vh-73px)] text-[#9C9893] text-center">
        <div className="max-w-[440px]">
          <h3 className="text-[20px] mb-3 text-[#E8E6E3] font-semibold tracking-tight">
            Paste molecules to begin analysis
          </h3>
          <p className="text-[13px] leading-relaxed mb-6">
            Enter SMILES in the sidebar, drag an SDF file, or load an example set to get started.
          </p>
          <div className="grid grid-cols-1 gap-3 text-left mb-8">
            {[
              { Icon: GitCompareArrows, title: 'Pareto ranking', desc: 'Find non-dominated molecules across MW, LogP, HBD, HBA, TPSA, RotBonds' },
              { Icon: FlaskConical, title: 'Drug-likeness filters', desc: 'Lipinski Ro5, Veber, Ghose, Lead-like with pass/fail overlay on every chart' },
              { Icon: MessageSquareText, title: 'AI Copilot', desc: 'Ask questions about your molecules with context-aware AI (BYOK)' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 p-3 bg-[#22201F] border border-white/5 rounded-md">
                <f.Icon size={18} className="text-[#5F7367] mt-0.5 shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-[13px] font-medium text-[#E8E6E3]">{f.title}</div>
                  <div className="text-[11px] text-[#9C9893] mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9C9893]/60">
            100% client-side · no data leaves your browser · <a href="https://github.com/IlkhamFY/molparetolab" target="_blank" className="underline hover:text-[#9C9893]">open source</a>
          </p>
        </div>
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
          { id: 'similarity', label: 'Similarity' },
          { id: 'cliffs', label: 'Activity cliffs' },
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
      <div className="view-container" ref={exportContainerRef}>
        {activeTab === 'pareto' && <ParetoView molecules={molecules} onSelectMolecule={setSelectedMolIdx ? (idx) => setSelectedMolIdx(idx) : undefined} selectedMolIdx={selectedMolIdx} />}
        {activeTab === 'egg' && <EggView molecules={molecules} />}
        {activeTab === 'radar' && <RadarView molecules={molecules} selectedMolIdx={selectedMolIdx} />}
        {activeTab === 'scoring' && <ScoringView molecules={molecules} />}
        {activeTab === 'parallel' && <ParallelView molecules={molecules} />}
        {activeTab === 'similarity' && <SimilarityMatrixView molecules={molecules} onComparePair={setCompareIndices ? (i, j) => { setCompareIndices([i, j]); setActiveTab('compare'); } : undefined} />}
        {activeTab === 'cliffs' && <ActivityCliffsView molecules={molecules} onComparePair={setCompareIndices ? (i, j) => { setCompareIndices([i, j]); setActiveTab('compare'); } : undefined} />}
        {activeTab === 'compare' && <CompareView molecules={molecules} compareIndices={compareIndices} setCompareIndices={setCompareIndices} />}
        {activeTab === 'table' && <TableView molecules={molecules} selectedMolIdx={selectedMolIdx} />}
      </div>
    </div>
  );
}
