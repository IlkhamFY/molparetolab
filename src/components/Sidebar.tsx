import { useState, useEffect, useRef } from 'react';
import type { Molecule } from '../utils/types';
import { EXAMPLES } from '../utils/types';
import { initRDKitCache, parseAndAnalyze, parseAndAnalyzeChunked, parseSDFFile, fetchChEMBLBatch } from '../utils/chem';

interface SidebarProps {
  molecules: Molecule[];
  setMolecules: (m: Molecule[]) => void;
  selectedMolIdx: number | null;
  setSelectedMolIdx: (idx: number | null) => void;
  compareIndices: number[];
  setCompareIndices: React.Dispatch<React.SetStateAction<number[]>>;
  initialPayloadFromUrl?: string | null;
  onUrlPayloadConsumed?: () => void;
  onToast?: (msg: string) => void;
}

export default function Sidebar({ 
  molecules, 
  setMolecules, 
  selectedMolIdx, 
  setSelectedMolIdx,
  compareIndices,
  setCompareIndices,
  initialPayloadFromUrl,
  onUrlPayloadConsumed,
  onToast
}: SidebarProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRDKitReady, setIsRDKitReady] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'|'info'}>({ msg: 'loading rdkit...', type: 'info' });
  const [progress, setProgress] = useState<{ done: number; total: number; phase?: 'resolve' | 'analyze' } | null>(null);
  const [chemblInput, setChemblInput] = useState('');
  const [chemblOpen, setChemblOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CHUNK_THRESHOLD = 30;

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

  useEffect(() => {
    if (!isRDKitReady || !initialPayloadFromUrl?.trim() || !onUrlPayloadConsumed) return;
    setStatus({ msg: 'Loading from link...', type: 'info' });
    parseAndAnalyze(initialPayloadFromUrl)
      .then(({ molecules: newMols, errors, failedLookups }) => {
        setMolecules(newMols);
        setCompareIndices([]);
        setSelectedMolIdx(null);
        onUrlPayloadConsumed();
        if (newMols.length > 0) {
          setStatus({ msg: `Loaded ${newMols.length} molecules from link`, type: 'success' });
          onToast?.('Loaded from link');
        } else {
          setStatus({ msg: 'No valid molecules in link', type: 'error' });
        }
        if (errors > 0 || failedLookups > 0) {
          setStatus((s) => ({ ...s, msg: `${s.msg} (${errors} errors, ${failedLookups} lookup failures)` }));
        }
      })
      .catch((e: unknown) => {
        onUrlPayloadConsumed();
        setStatus({ msg: 'Failed to load from link: ' + (e instanceof Error ? e.message : String(e)), type: 'error' });
      });
  }, [isRDKitReady, initialPayloadFromUrl, onUrlPayloadConsumed, setMolecules, setCompareIndices, setSelectedMolIdx, onToast]);

  const handleAnalyze = async () => {
    if (!input.trim() || !isRDKitReady) return;
    setIsLoading(true);
    setProgress(null);
    const lineCount = input.trim().split('\n').filter((l) => l.trim()).length;
    const useChunked = lineCount >= CHUNK_THRESHOLD;
    setStatus({ msg: useChunked ? `Starting… 0/${lineCount}` : 'Crunching descriptors...', type: 'info' });

    try {
      const result = useChunked
        ? await parseAndAnalyzeChunked(input, {
            chunkSize: 25,
            onProgress: (done, total, phase) => {
              setProgress({ done, total, phase });
              const msg = phase === 'resolve' ? `Resolving names ${done}/${total}...` : `Analyzing ${done}/${total}...`;
              setStatus({ msg, type: 'info' });
            },
          })
        : await parseAndAnalyze(input);
      const { molecules: newMols, errors, failedLookups } = result;
      setMolecules(newMols);
      setCompareIndices([]);
      setSelectedMolIdx(null);
      setProgress(null);

      let finalMsg = `${newMols.length} molecules analyzed`;
      if (errors > 0 || failedLookups > 0) {
        finalMsg += ` (${errors} errors, ${failedLookups} lookup failures)`;
        setStatus({ msg: finalMsg, type: 'error' });
      } else {
        setStatus({ msg: finalMsg, type: 'success' });
      }
    } catch (e: unknown) {
      setProgress(null);
      setStatus({ msg: 'analysis error: ' + (e instanceof Error ? e.message : String(e)), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleLoad = (key: keyof typeof EXAMPLES) => {
    setInput(EXAMPLES[key]);
  };

  const handleSDFFile = async (file: File) => {
    if (!file.name.match(/\.(sdf|sd)$/i)) {
      setStatus({ msg: 'Please upload a .sdf or .sd file', type: 'error' });
      return;
    }
    if (!isRDKitReady) {
      setStatus({ msg: 'Waiting for RDKit...', type: 'info' });
      return;
    }
    setIsLoading(true);
    setStatus({ msg: 'Parsing SDF...', type: 'info' });
    try {
      const text = await file.text();
      const lines = await parseSDFFile(text);
      if (lines.length === 0) {
        setStatus({ msg: 'No valid molecules found in SDF', type: 'error' });
        return;
      }
      const { molecules: newMols, errors, failedLookups } = await parseAndAnalyze(lines.join('\n'));
      setMolecules(newMols);
      setCompareIndices([]);
      setSelectedMolIdx(null);
      setInput(lines.join('\n'));
      let finalMsg = `Loaded ${newMols.length} molecules from ${file.name}`;
      if (errors > 0 || failedLookups > 0) finalMsg += ` (${errors} errors, ${failedLookups} lookup failures)`;
      setStatus({ msg: finalMsg, type: errors + failedLookups > 0 ? 'error' : 'success' });
      onToast?.(`Loaded ${newMols.length} from SDF`);
    } catch (e: unknown) {
      setStatus({ msg: 'SDF parse error: ' + (e instanceof Error ? e.message : String(e)), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSDFFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
    if (file) {
      e.preventDefault();
      handleSDFFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    const hasFiles = e.dataTransfer.types?.includes('Files') ?? false;
    if (hasFiles) e.preventDefault();
  };

  const handleFetchChEMBL = async () => {
    const ids = chemblInput.split(/[\s,;]+/).filter((s) => s.trim().toUpperCase().startsWith('CHEMBL'));
    if (ids.length === 0) {
      setStatus({ msg: 'Enter ChEMBL IDs (e.g. CHEMBL1, CHEMBL2)', type: 'error' });
      return;
    }
    if (!isRDKitReady) return;
    setIsLoading(true);
    setProgress({ done: 0, total: ids.length });
    setStatus({ msg: `Fetching ChEMBL ${0}/${ids.length}...`, type: 'info' });
    try {
      const lines = await fetchChEMBLBatch(ids, (done, total) => {
        setProgress({ done, total });
        setStatus({ msg: `Fetching ChEMBL ${done}/${total}...`, type: 'info' });
      });
      setProgress(null);
      if (lines.length === 0) {
        setStatus({ msg: 'No molecules found for these ChEMBL IDs', type: 'error' });
        return;
      }
      setInput(lines.join('\n'));
      const { molecules: newMols, errors, failedLookups } = await parseAndAnalyze(lines.join('\n'));
      setMolecules(newMols);
      setCompareIndices([]);
      setSelectedMolIdx(null);
      setStatus({ msg: `Loaded ${newMols.length} from ChEMBL${errors + failedLookups > 0 ? ` (${errors} errors, ${failedLookups} not found)` : ''}`, type: errors + failedLookups > 0 ? 'error' : 'success' });
      setChemblOpen(false);
      setChemblInput('');
    } catch (e: unknown) {
      setProgress(null);
      setStatus({ msg: 'ChEMBL fetch error: ' + (e instanceof Error ? e.message : String(e)), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="border-r border-white/5 p-5 overflow-y-auto max-h-none md:max-h-[calc(100vh-73px)] custom-scrollbar">
      <div className="text-[11px] uppercase tracking-[1.2px] text-[#9C9893] mb-2 font-semibold">
        Input SMILES
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full h-[140px] bg-[#22201F] border border-white/5 rounded-md text-[#E8E6E3] font-mono text-[13px] p-3 resize-y outline-none transition-colors focus:border-[#5F7367]"
        placeholder="paste SMILES (one per line) or drag SDF here..."
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !input.trim() || !isRDKitReady}
          className="flex-1 bg-[#5F7367] text-white py-2.5 rounded-md text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#798F81] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? <span className="spinner-ring" /> : null}
          {isLoading ? 'loading...' : (isRDKitReady ? 'Analyze Molecules' : 'Loading RDKit...')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sdf,.sd"
          className="hidden"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!isRDKitReady || isLoading}
          className="px-4 py-2.5 bg-[#2C2A28] border border-white/5 rounded-md text-[13px] font-medium text-[#E8E6E3] hover:border-[#5F7367] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SDF
        </button>
      </div>

      {status.msg && (
        <div className={`mt-2 text-[11px] ${status.type === 'error' ? 'text-[#B05C56]' : status.type === 'success' ? 'text-[#6B8E6A]' : 'text-[#9C9893]'}`}>
          {status.msg}
        </div>
      )}
      {progress && (
        <div className="mt-1.5 h-1 bg-[#1A1918] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5F7367] transition-all duration-300"
            style={{ width: `${(progress.done / progress.total) * 100}%` }}
          />
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

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setChemblOpen(!chemblOpen)}
          className="w-full text-left p-2 bg-[#22201F] border border-white/5 rounded-md text-[#9C9893] text-[12px] transition-colors hover:border-[#5F7367] hover:text-[#E8E6E3]"
        >
          <span className="text-[#E8E6E3] font-medium">Fetch by ChEMBL IDs</span>
        </button>
        {chemblOpen && (
          <div className="mt-2 p-2 bg-[#1A1918] border border-white/5 rounded-md">
            <input
              type="text"
              value={chemblInput}
              onChange={(e) => setChemblInput(e.target.value)}
              placeholder="CHEMBL1, CHEMBL2, ..."
              className="w-full bg-[#22201F] border border-white/5 rounded px-2 py-1.5 text-[12px] text-[#E8E6E3] placeholder-[#9C9893] outline-none focus:border-[#5F7367]"
            />
            <button
              type="button"
              onClick={handleFetchChEMBL}
              disabled={!isRDKitReady || isLoading}
              className="mt-2 w-full py-1.5 bg-[#5F7367] text-white text-[12px] font-medium rounded hover:bg-[#798F81] disabled:opacity-40"
            >
              Fetch and analyze
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 pb-20">
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
                <div className="text-[13px] font-medium text-white truncate" title={m.name}>{m.name.replace(/_/g, ' ')}</div>
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
            
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {m.paretoRank === 1 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22c55e]/15 text-[#22c55e]">
                  pareto
                </span>
              )}
              {Object.entries(m.filters).map(([fname, res]) => (
                <span key={fname} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  res.pass ? 'bg-white/10 text-white' : 'bg-[#ef4444]/15 text-[#ef4444]'
                }`}>
                  {fname.slice(0,3)} {res.pass ? 'pass' : 'fail'}
                </span>
              ))}
            </div>

            {/* Expanded details when selected */}
            {isSelected && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
                  {(['HBD','HBA','TPSA','RotBonds','FrCSP3','Rings'] as const).map(k => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#9C9893]">{k}</span>
                      <span className="font-mono text-[#E8E6E3]">{typeof m.props[k] === 'number' ? (m.props[k] as number).toFixed(k === 'FrCSP3' ? 2 : 0) : m.props[k]}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-1 p-1.5 bg-[#1A1918] rounded text-[10px] font-mono text-[#9C9893] break-all cursor-pointer hover:text-[#E8E6E3] transition-colors"
                  title="Click to copy SMILES"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(m.smiles).then(() => onToast?.('SMILES copied'));
                  }}
                >
                  {m.smiles}
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
