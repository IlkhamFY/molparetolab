import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import CopilotPanel from './components/CopilotPanel';
import type { Molecule } from './utils/types';
import { getInitialPayloadFromUrl, getShareableUrl } from './utils/share';
import { downloadCSV } from './utils/export';

export default function App() {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [selectedMolIdx, setSelectedMolIdx] = useState<number | null>(null);
  const [compareIndices, setCompareIndices] = useState<number[]>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [initialPayloadFromUrl, setInitialPayloadFromUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const payload = getInitialPayloadFromUrl();
    if (payload) setInitialPayloadFromUrl(payload);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Keyboard navigation: arrow keys to cycle molecules, Escape to deselect
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (molecules.length === 0) return;
      // Don't intercept when typing in input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedMolIdx(prev => prev === null ? 0 : Math.min(prev + 1, molecules.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedMolIdx(prev => prev === null ? 0 : Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setSelectedMolIdx(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [molecules.length]);

  const handleShareURL = () => {
    if (molecules.length === 0) return;
    const url = getShareableUrl(molecules);
    navigator.clipboard.writeText(url).then(
      () => setToast('Link copied to clipboard'),
      () => {
        window.prompt('Copy this shareable link:', url);
      }
    );
  };

  const handleExportCSV = () => {
    if (molecules.length === 0) return;
    downloadCSV(molecules);
    setToast('CSV exported');
  };

  const exportContainerRef = useRef<HTMLDivElement>(null);

  const handleExportFigure = () => {
    if (molecules.length === 0) return;
    const el = exportContainerRef.current;
    const canvas = el?.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'molparetolab_figure.png';
      a.click();
      setToast('Figure exported');
    } else {
      setToast('No canvas to export (switch to Pareto, Egg, Radar, or Parallel tab)');
    }
  };

  const handleCite = () => {
    const citation = `@software{molparetolab2026,
  author = {Yabbarov, Ilkham},
  title = {MolParetoLab: Interactive Multi-Objective Pareto Analysis of Drug-Like Molecules},
  year = {2026},
  url = {https://molparetolab.ilkham.com},
  note = {Client-side web application. Source: https://github.com/IlkhamFY/molparetolab}
}`;
    navigator.clipboard.writeText(citation).then(
      () => setToast('BibTeX citation copied'),
      () => {
        window.prompt('Copy BibTeX citation:', citation);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#121110] flex flex-col font-sans text-[#E8E6E3]">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-[#2C2A28] border border-[#5F7367] rounded-md text-sm text-[#E8E6E3] shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
      <Header
        moleculeCount={molecules.length}
        onShareURL={handleShareURL}
        onExportCSV={handleExportCSV}
        onExportFigure={handleExportFigure}
        onCite={handleCite}
      />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] min-h-[calc(100vh-73px)]">
        <Sidebar
          molecules={molecules}
          setMolecules={setMolecules}
          selectedMolIdx={selectedMolIdx}
          setSelectedMolIdx={setSelectedMolIdx}
          compareIndices={compareIndices}
          setCompareIndices={setCompareIndices}
          initialPayloadFromUrl={initialPayloadFromUrl}
          onUrlPayloadConsumed={() => setInitialPayloadFromUrl(null)}
          onToast={setToast}
        />

        <div className="bg-[#1A1918] relative">
          <Content
            molecules={molecules}
            compareIndices={compareIndices}
            selectedMolIdx={selectedMolIdx}
            setSelectedMolIdx={setSelectedMolIdx}
            exportContainerRef={exportContainerRef}
            setCompareIndices={setCompareIndices}
          />
        </div>
      </main>

      {molecules.length > 0 && (
        <footer className="text-center py-3 text-[11px] text-[#9C9893]/50">
          Built by <a href="https://ilkham.com" target="_blank" className="hover:text-[#9C9893] transition-colors">Ilkham Yabbarov</a> · Client-side only · <a href="https://github.com/IlkhamFY/molparetolab" target="_blank" className="hover:text-[#9C9893] transition-colors">Open Source</a>
        </footer>
      )}

      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#2C2A28] border border-white/5 rounded-full flex items-center justify-center text-base font-semibold text-[#E8E6E3] hover:bg-[#5F7367] hover:border-transparent hover:text-white transition-all z-40 focus:outline-none focus:ring-2 focus:ring-[#5F7367]/50"
        title="AI Copilot"
      >
        AI
      </button>

      {/* Slide-out Copilot Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-[#1A1918] border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCopilotOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <CopilotPanel
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          molecules={molecules}
        />
      </div>
    </div>
  );
}
