import { useMemo } from 'react';
import type { Molecule } from '../../utils/types';
import { computeTanimotoMatrix, computeActivityCliffs } from '../../utils/chem';

interface ActivityCliffsViewProps {
  molecules: Molecule[];
  onComparePair?: (i: number, j: number) => void;
}

export default function ActivityCliffsView({ molecules, onComparePair }: ActivityCliffsViewProps) {
  const cliffs = useMemo(() => {
    const matrix = computeTanimotoMatrix(molecules);
    return computeActivityCliffs(molecules, matrix, 0.5, 10);
  }, [molecules]);

  if (cliffs.length === 0) {
    return (
      <div className="bg-[#22201F] border border-white/5 rounded-lg p-12 text-center">
        <h3 className="text-[17px] font-medium text-white mb-2">No activity cliffs found</h3>
        <p className="text-[#9C9893] text-[13px] max-w-sm mx-auto">
          Pairs with Tanimoto &gt; 0.5 and large property differences will appear here. Try a set with structurally similar molecules that differ in properties.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Activity cliffs (structurally similar, property-different)</h3>
        <p className="text-[12px] text-[#9C9893] mt-1">Top pairs by cliff score = Tanimoto × normalized property distance</p>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {cliffs.map((c, idx) => (
          <div
            key={`${c.i}-${c.j}`}
            className="p-3 bg-[#1A1918] border border-white/5 rounded-md flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#9C9893] w-6">#{idx + 1}</span>
              <span className="text-[13px] text-[#E8E6E3] font-medium">{molecules[c.i].name}</span>
              <span className="text-[#9C9893]">vs</span>
              <span className="text-[13px] text-[#E8E6E3] font-medium">{molecules[c.j].name}</span>
            </div>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="text-[#9C9893]">Tanimoto: <span className="font-mono text-white">{(c.tanimoto * 100).toFixed(0)}%</span></span>
              <span className="text-[#9C9893]">Cliff: <span className="font-mono text-[#798F81]">{c.cliffScore.toFixed(2)}</span></span>
              <span className="text-[#9C9893]">Diff: <span className="text-[#E8E6E3]">{c.topDifferingProps.join(', ')}</span></span>
              {onComparePair && (
                <button
                  type="button"
                  onClick={() => onComparePair(c.i, c.j)}
                  className="px-2 py-1 text-[11px] font-medium bg-[#5F7367]/30 text-[#798F81] rounded hover:bg-[#5F7367]/50 hover:text-white transition-colors"
                >
                  Compare
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
