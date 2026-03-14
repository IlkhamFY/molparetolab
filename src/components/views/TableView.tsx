import { useState } from 'react';
import type { Molecule } from '../../utils/types';
import { PROPERTIES, DRUG_FILTERS } from '../../utils/types';

export default function TableView({ molecules, selectedMolIdx }: { molecules: Molecule[], selectedMolIdx: number | null }) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['lipinski', 'veber', 'ghose']));
  const [sortKey, setSortKey] = useState<keyof Molecule['props'] | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const toggleFilter = (name: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSort = (key: keyof Molecule['props']) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 1 ? -1 : 1);
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const sortedMolecules = [...molecules].sort((a, b) => {
    if (!sortKey) return 0;
    const vA = a.props[sortKey] as number;
    const vB = b.props[sortKey] as number;
    return (vA - vB) * sortDir;
  });

  const tableCols = PROPERTIES.slice(0, 10);
  const filterCols = Array.from(activeFilters);

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#9C9893] py-1">Show filters:</span>
        {Object.entries(DRUG_FILTERS).map(([fname, fdef]) => (
          <button
            key={fname}
            onClick={() => toggleFilter(fname)}
            className={`px-3 py-1 text-[11px] rounded-full border transition-colors ${
              activeFilters.has(fname)
                ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                : 'bg-[#2C2A28] border-white/5 text-[#9C9893] hover:border-[#5F7367]'
            }`}
          >
            {(fdef as any).label}
          </button>
        ))}
      </div>

      <div className="bg-[#22201F] border border-white/5 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[14px] font-medium text-white">Molecular Properties</h3>
          <p className="text-[12px] text-[#9C9893]">click column headers to sort</p>
        </div>
        
        <div className="overflow-x-auto w-full max-w-[calc(100vw-450px)]">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#1A1918] text-[#9C9893] border-b border-white/10 uppercase tracking-wider">
                <th className="p-3 font-medium whitespace-nowrap min-w-[200px]">Molecule</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('MW')}>MW {sortKey === 'MW' && (sortDir === 1 ? '↑' : '↓')}</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('LogP')}>LogP {sortKey === 'LogP' && (sortDir === 1 ? '↑' : '↓')}</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('HBD')}>HBD {sortKey === 'HBD' && (sortDir === 1 ? '↑' : '↓')}</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('HBA')}>HBA {sortKey === 'HBA' && (sortDir === 1 ? '↑' : '↓')}</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('TPSA')}>TPSA {sortKey === 'TPSA' && (sortDir === 1 ? '↑' : '↓')}</th>
                <th className="p-3 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('RotBonds')}>RotB {sortKey === 'RotBonds' && (sortDir === 1 ? '↑' : '↓')}</th>
                {filterCols.map(fn => (
                  <th key={fn} className="p-3 font-medium">{(DRUG_FILTERS as any)[fn]?.label}</th>
                ))}
                <th className="p-3 font-medium">Pareto</th>
              </tr>
            </thead>
            <tbody>
              {sortedMolecules.map(m => {
                const originalIdx = molecules.indexOf(m);
                const isSelected = selectedMolIdx === originalIdx;
                
                return (
                  <tr key={m.smiles} className={`border-b border-white/5 hover:bg-[#1A1918] ${isSelected ? 'bg-[#14b8a6]/10' : ''}`}>
                    <td className="p-3 font-medium text-white truncate max-w-[200px]" title={m.name}>{m.name}</td>
                    
                    {tableCols.slice(0, 6).map(p => {
                      const v = m.props[p.key as keyof Molecule['props']] as number;
                      let isBad = false;
                      if (p.lipinski && v > p.lipinski.max) isBad = true;
                      
                      return (
                        <td key={p.key} className={`p-3 font-mono ${isBad ? 'text-[#ef4444]' : 'text-[#9C9893]'}`}>
                          {v.toFixed(1)}
                        </td>
                      );
                    })}

                    {filterCols.map(fn => {
                      const res = m.filters[fn];
                      return (
                        <td key={fn} className="p-3">
                          {res?.pass ? (
                            <span className="text-[#22c55e]">pass</span>
                          ) : (
                            <span className="text-[#ef4444]">{res?.violations || 1} fail</span>
                          )}
                        </td>
                      );
                    })}

                    <td className={`p-3 font-medium ${m.paretoRank === 1 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {m.paretoRank === 1 ? 'yes' : 'no'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DominanceMatrix molecules={molecules} />
    </div>
  );
}

function DominanceMatrix({ molecules }: { molecules: Molecule[] }) {
  if (molecules.length > 15) {
    return (
      <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
        <p className="text-[#9C9893]">Dominance matrix limited to 15 molecules for readability.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Dominance Matrix</h3>
        <p className="text-[12px] text-[#9C9893]">Row dominates column? (on MW, LogP, HBD, HBA, TPSA, RotBonds)</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div 
          className="grid gap-[1px] bg-[#3a3a4a] border-t border-l border-[#3a3a4a] text-[11px] font-mono"
          style={{ gridTemplateColumns: `auto repeat(${molecules.length}, 56px)`, width: 'max-content' }}
        >
          {/* Top Header Row */}
          <div key="corner" className="bg-[#1a1a24] p-2 flex items-center justify-end font-semibold text-[#8888a0]"></div>
          {molecules.map((m, idx) => (
            <div key={`h_${idx}`} className="bg-[#1a1a24] text-[#8888a0] flex items-center justify-center w-[56px] h-10 px-1 truncate text-center text-[10px]" title={m.name}>
              {m.name}
            </div>
          ))}

          {/* Body Rows */}
          {molecules.map((rowMol, i) => (
            <div key={`row_${i}`} className="contents">
              {/* Row Header */}
              <div key={`rh_${i}`} className="bg-[#1a1a24] text-[#8888a0] p-2 flex items-center justify-end truncate max-w-[120px]" title={rowMol.name}>
                {rowMol.name.slice(0, 10)}
              </div>

              {/* Row Cells */}
              {molecules.map((_colMol, j) => {
                let cellClass = 'bg-[#12121a] text-[#555] w-[56px]';
                let cellText = '~';

                if (i === j) {
                  cellClass = 'bg-[#2a2a3a] text-[#888] w-[56px]';
                  cellText = '-';
                } else if (rowMol.dominates?.includes(j)) {
                  cellClass = 'bg-[#22c55e]/20 text-[#22c55e] font-bold w-[56px]';
                  cellText = 'DOM';
                } else if (rowMol.dominatedBy?.includes(j)) {
                  cellClass = 'bg-[#ef4444]/20 text-[#ef4444] w-[56px]';
                  cellText = 'dom';
                }

                return (
                  <div key={`c_${i}_${j}`} className={`flex items-center justify-center ${cellClass}`}>
                    {cellText}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <h4 className="text-[13px] font-medium text-white mb-3">Dominance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
          {molecules.map(m => (
            <div key={'s_'+m.smiles} className="flex justify-between items-center p-2 bg-[#1A1918] rounded border border-white/5">
              <span className="text-white font-medium truncate w-[150px]">{m.name}</span>
              <span className="text-[#9C9893]">
                dominates {m.dominates?.length || 0}, dominated by {m.dominatedBy?.length || 0}
              </span>
              <span className={`w-[90px] text-right font-medium ${m.paretoRank === 1 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {m.paretoRank === 1 ? 'pareto-optimal' : 'dominated'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
