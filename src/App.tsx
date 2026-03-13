import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import CopilotPanel from './components/CopilotPanel';
import type { Molecule } from './utils/types';

export default function App() {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [selectedMolIdx, setSelectedMolIdx] = useState<number | null>(null);
  const [compareIndices, setCompareIndices] = useState<number[]>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans text-[#e0e0e8]">
      <Header moleculeCount={molecules.length} />
      
      <main className="flex-1 grid grid-cols-[380px_1fr] min-h-[calc(100vh-73px)]">
        <Sidebar 
          molecules={molecules} 
          setMolecules={setMolecules} 
          selectedMolIdx={selectedMolIdx}
          setSelectedMolIdx={setSelectedMolIdx}
          compareIndices={compareIndices}
          setCompareIndices={setCompareIndices}
        />
        
        <div className="bg-[#1A1918] relative">
          <Content 
            molecules={molecules} 
            compareIndices={compareIndices} 
            selectedMolIdx={selectedMolIdx} 
          />
        </div>
      </main>

      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1A1918] border border-white/10 rounded-full flex items-center justify-center text-2xl shadow-lg hover:border-[#2dd4bf] hover:text-[#2dd4bf] transition-all z-40 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50"
        title="AI Copilot"
      >
        ✨
      </button>

      {/* Slide-out Copilot Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-[420px] bg-[#12121a] border-l border-[#2a2a3a] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
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
