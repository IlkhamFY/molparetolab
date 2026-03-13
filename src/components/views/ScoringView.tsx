import { useState, useMemo } from 'react';
import type { Molecule } from '../../utils/types';

const SCORING_PROFILES = {
  balanced: { label: 'Balanced', weights: { MW: 0.2, LogP: 0.2, HBD: 0.15, HBA: 0.15, TPSA: 0.2, RotBonds: 0.1 } },
  cns: { label: 'CNS-Permeant', weights: { MW: 0.25, LogP: 0.3, HBD: 0.2, HBA: 0.1, TPSA: 0.1, RotBonds: 0.05 } },
  oral: { label: 'Oral Bioavailability', weights: { MW: 0.1, LogP: 0.2, HBD: 0.2, HBA: 0.2, TPSA: 0.2, RotBonds: 0.1 } },
  custom: { label: 'Custom', weights: { MW: 0, LogP: 0, HBD: 0, HBA: 0, TPSA: 0, RotBonds: 0 } }
};

type ProfileName = keyof typeof SCORING_PROFILES;
type Weights = typeof SCORING_PROFILES['balanced']['weights'];

export default function ScoringView({ molecules }: { molecules: Molecule[] }) {
  const [currentProfile, setCurrentProfile] = useState<ProfileName>('balanced');
  const [weights, setWeights] = useState<Weights>(SCORING_PROFILES.balanced.weights);

  const setProfile = (name: ProfileName) => {
    setCurrentProfile(name);
    if (name !== 'custom') {
      setWeights({ ...SCORING_PROFILES[name].weights });
    }
  };

  const updateWeight = (key: keyof Weights, val: string) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
    setCurrentProfile('custom');
  };

  const ranked = useMemo(() => {
    const keys: (keyof Weights)[] = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'];
    const utopia: Record<string, number> = {};
    const nadir: Record<string, number> = {};

    keys.forEach(k => {
      const vals = molecules.map(m => m.props[k]);
      utopia[k] = Math.min(...vals);
      nadir[k] = Math.max(...vals);
    });

    const scores = molecules.map((m, i) => {
      let maxTerm = 0;
      let worstProp = '';
      const terms: Record<string, number> = {};
      
      keys.forEach(k => {
        const range = nadir[k] - utopia[k] || 1;
        const term = weights[k] * Math.abs(m.props[k] - utopia[k]) / range;
        terms[k] = term;
        if (term > maxTerm) { maxTerm = term; worstProp = k; }
      });
      
      return { idx: i, mol: m, score: maxTerm, terms, worstProp };
    });

    return scores.sort((a, b) => a.score - b.score);
  }, [molecules, weights]);

  const maxScore = ranked.length > 0 ? ranked[ranked.length - 1].score : 1;

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Scoring Profiles</h3>
        <p className="text-[12px] text-[#9C9893]">Weighted Chebyshev distance to ideal utopia point</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        {Object.entries(SCORING_PROFILES).map(([pname, pdef]) => (
          <button
            key={pname}
            onClick={() => setProfile(pname as ProfileName)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded transition-colors ${
              currentProfile === pname 
                ? 'bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/40' 
                : 'bg-[#1A1918] text-[#9C9893] border border-white/5 hover:border-white/20 hover:text-[#E8E6E3]'
            }`}
          >
            {pdef.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
        {(Object.entries(weights) as [keyof Weights, number][]).map(([k, w]) => (
          <div key={k} className="flex items-center text-[12px]">
            <span className="w-32 text-[#9C9893]">{k}</span>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={w} 
              onChange={e => updateWeight(k, e.target.value)}
              className="flex-1 accent-[#14b8a6] mx-3"
            />
            <span className="font-mono text-[#E8E6E3] w-8 text-right">{w.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {ranked.map((r, ri) => {
          const pct = maxScore > 0 ? (1 - r.score / maxScore) * 100 : 100;
          const barColor = ri === 0 ? '#22c55e' : r.mol.paretoRank === 1 ? '#14b8a6' : '#ef4444';
          const sortedTerms = Object.entries(r.terms).sort((a, b) => a[1] - b[1]);
          const strength = sortedTerms[0][0];
          const weakness = sortedTerms[sortedTerms.length - 1][0];

          return (
            <div key={r.idx} className={`p-3 rounded-md flex items-center justify-between border ${r.mol.paretoRank === 1 ? 'border-[#14b8a6]/20 bg-[#14b8a6]/5' : 'border-white/5 bg-[#1A1918]'}`}>
              <div className="font-mono text-[#9C9893] text-[12px] w-8">#{ri + 1}</div>
              <div className="flex-1 px-4">
                <div className="text-[13px] font-medium text-white mb-1.5 flex items-center gap-2">
                  {r.mol.name}
                  {r.mol.paretoRank === 1 && <span className="text-[#14b8a6] text-[10px]">● pareto</span>}
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: barColor }} />
                </div>
                <div className="text-[11px] text-[#9C9893]">
                  best: {strength} · worst: {weakness}
                </div>
              </div>
              <div className="font-mono font-medium text-[14px]" style={{ color: ri === 0 ? '#22c55e' : '#E8E6E3' }}>
                {r.score.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
