import { useState, useEffect } from 'react';
import type { Molecule } from '../utils/types';
import { EXAMPLES } from '../utils/types';
import { initRDKitCache, parseAndAnalyze } from '../utils/chem';

interface SidebarProps {
  molecules: Molecule[];
  setMolecules: (m: Molecule[]) => void;
  selectedMolIdx: number | null;
  setSelectedMolIdx: (idx: number | null) => void;
  compareIndices: number[];
  setCompareIndices: (indices: number[]) => void;
}

export default function Sidebar({ 
  molecules, 
  setMolecules, 
  selectedMolIdx, 
  setSelectedMolIdx,
  compareIndices,
  setCompareIndices
}: SidebarProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRDKitReady, setIsRDKitReady] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'|'info'}>({ msg: 'loading rdkit...', type: 'info' });

  useEffect(() => {
    initRDKitCache()
      .then(() => {
        setIsRDKitReady(true);
        setStatus({ msg: 'rdkit loaded — paste SMILES and click analyze', type: 'success' });
      })
      .catch((e) => {
        setStatus({ msg: 'failed to load rdkit: ' + e.message, type: 'error' });
      });
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim() || !isRDKitReady) return;
    setIsLoading(true);
    setStatus({ msg: 'Crunching descriptors...', type: 'info' });
    
    try {
      const { molecules: newMols, errors, failedLookups } = await parseAndAnalyze(input);
      setMolecules(newMols);
      
      let finalMsg = `${newMols.length} molecules analyzed`;
      if (errors > 0 || failedLookups > 0) {
        finalMsg += ` (${errors} errors, ${failedLookups} lookup failures)`;
        setStatus({ msg: finalMsg, type: 'error' });
      } else {
        setStatus({ msg: finalMsg, type: 'success' });
      }
    } catch (e: any) {
      setStatus({ msg: 'analysis error: ' + e.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleLoad = (key: keyof typeof EXAMPLES) => {
    setInput(EXAMPLES[key]);
  };

  return (
    <aside className="border-r border-white/5 p-5 overflow-y-auto max-h-[calc(100vh-73px)] custom-scrollbar">
      <div className="text-[11px] uppercase tracking-[1.2px] text-[#9C9893] mb-2 font-semibold">
        Input SMILES
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-[140px] bg-[#22201F] border border-white/5 rounded-md text-[#E8E6E3] font-mono text-[13px] p-3 resize-y outline-none transition-colors focus:border-[#5F7367]"
        placeholder="paste SMILES (one per line)..."
      />
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !input.trim() || !isRDKitReady}
        className="w-full mt-3 bg-[#5F7367] text-white py-2.5 rounded-md text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#798F81] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? <span className="spinner-ring" /> : null}
        {isLoading ? 'loading...' : (isRDKitReady ? 'Analyze Molecules' : 'Loading RDKit...')}
      </button>

      {status.msg && (
        <div className={`mt-2 text-[11px] ${status.type === 'error' ? 'text-[#B05C56]' : status.type === 'success' ? 'text-[#6B8E6A]' : 'text-[#9C9893]'}`}>
          {status.msg}
        </div>
      )}

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-[1.2px] text-[#9C9893] mb-2 font-semibold">
          Quick Load
        </div>
        {Object.entries({
          'Drug-like set': 'druglike',
          'Lipinski edge cases': 'lipinski',
          'Diverse chemical space': 'diverse',
          'Kinase inhibitors': 'kinase',
        }).map(([name, key]) => (
          <button
            key={key}
            onClick={() => handleExampleLoad(key as keyof typeof EXAMPLES)}
            className="w-full text-left p-2 bg-[#22201F] border border-white/5 rounded-md text-[#9C9893] text-[12px] mb-1.5 transition-colors hover:border-[#5F7367] hover:text-[#E8E6E3]"
          >
            <span className="text-[#E8E6E3] font-medium">{name}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {molecules.map((m, i) => {
          const isSelected = selectedMolIdx === i;
          const isCompared = compareIndices.includes(i);
          
          return (
            <div 
              key={i} 
              onClick={() => setSelectedMolIdx(isSelected ? null : i)}
              onContextMenu={(e) => {
                e.preventDefault();
                setCompareIndices((prev: number[]) => {
                  if (prev.includes(i)) return prev.filter((x: number) => x !== i);
                  if (prev.length >= 2) return [prev[1], i];
                  return [...prev, i];
                });
              }}
              className={`p-3 bg-[#22201F] border rounded-md transition-colors cursor-pointer ${
                isCompared
                  ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                  : isSelected 
                    ? 'border-[#2dd4bf] ring-1 ring-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.2)]'
                    : m.paretoRank === 1 
                      ? 'border-[#22c55e]/50 hover:border-[#22c55e]' 
                      : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex gap-3">
                <div 
                  className="w-[100px] h-[75px] bg-[#1A1918] rounded shrink-0 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full" 
                  dangerouslySetInnerHTML={{ __html: m.svg }} 
                />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate" title={m.name}>{m.name}</div>
                <div className="text-[11px] text-[#9C9893] mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>MW:</span>
                    <span className="font-mono text-white">{m.props.MW.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LogP:</span>
                    <span className="font-mono text-white">{m.props.LogP.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {m.paretoRank === 1 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22c55e]/15 text-[#22c55e]">
                  pareto
                </span>
              )}
              {Object.entries(m.filters).map(([fname, res]) => (
                <span key={fname} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  res.pass ? 'bg-white/10 text-white' : 'bg-[#ef4444]/15 text-[#ef4444]'
                }`}>
                  {fname.slice(0,3)} {res.pass ? '✓' : '✗'}
                </span>
              ))}
            </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
