import { useState } from 'react';
import { X } from 'lucide-react';
import type { Molecule } from '../utils/types';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  molecules: Molecule[];
}

function buildCannedSummary(molecules: Molecule[]): string {
  if (molecules.length === 0) return 'Load some molecules first to get a summary.';
  const pareto = molecules.filter((m) => m.paretoRank === 1);
  const ro5Fail = molecules.filter((m) => !m.filters.lipinski?.pass);
  let text = `You have ${molecules.length} molecule(s). `;
  text += `${pareto.length} are Pareto-optimal (non-dominated on MW, LogP, HBD, HBA, TPSA, RotBonds). `;
  if (ro5Fail.length > 0) {
    text += `${ro5Fail.length} fail Lipinski Ro5. `;
  } else {
    text += 'All pass Lipinski Ro5. ';
  }
  if (pareto.length > 0) {
    const names = pareto.slice(0, 5).map((m) => m.name.replace(/_/g, ' ')).join(', ');
    text += `Pareto set: ${names}${pareto.length > 5 ? '...' : ''}. Use the Scoring tab to rank by profile (e.g. CNS Drug, Oral).`;
  }
  return text;
}

function buildWhyPareto(molecules: Molecule[], nameOrIndex: string): string {
  const idx = molecules.findIndex((m) => m.name.toLowerCase().includes(nameOrIndex.toLowerCase()) || String(molecules.indexOf(m)) === nameOrIndex.trim());
  const m = idx >= 0 ? molecules[idx] : null;
  if (!m) return `I couldn't find a molecule matching "${nameOrIndex}". Try using the exact name from the sidebar or its position (1-based).`;
  if (m.paretoRank !== 1) {
    return `${m.name} is not Pareto-optimal — it's dominated by at least one other molecule (better or equal on all 6 properties, strictly better on one). Check the Dominance matrix to see who dominates it.`;
  }
  const best: string[] = [];
  const keys = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'] as const;
  keys.forEach((k) => {
    const vals = molecules.map((mol) => mol.props[k]);
    if (m.props[k] === Math.min(...vals)) best.push(k);
  });
  return `${m.name} is Pareto-optimal because no other molecule in your set is strictly better on all six properties (MW, LogP, HBD, HBA, TPSA, RotBonds). It is best in the set on: ${best.length ? best.join(', ') : 'none (but no one dominates it)'}. So it sits on the Pareto front.`;
}

export default function CopilotPanel({ isOpen, onClose, molecules }: CopilotPanelProps) {
  const [input, setInput] = useState('');
  const [replies, setReplies] = useState<{ user: string; text: string }[]>([]);

  const handleSubmit = () => {
    const q = input.trim().toLowerCase();
    if (!q) return;
    setInput('');
    let text: string;
    if (q.includes('summar') || q.includes('trade-off') || q.includes('overview') || q === 'summary') {
      text = buildCannedSummary(molecules);
    } else if (q.includes('why') && (q.includes('pareto') || q.includes('optimal'))) {
      const name = q.replace(/why\s*(is\s*)?/i, '').replace(/\s*(pareto|optimal).*$/i, '').trim() || (molecules.length > 0 ? molecules[0].name : '');
      text = buildWhyPareto(molecules, name);
    } else {
      text = "Coming soon — full AI answers in a future release. Try: \"Why is [name] Pareto-optimal?\" or \"Summarize my set\" for canned answers.";
    }
    setReplies((prev) => [...prev, { user: q, text }]);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-[420px] h-screen bg-[#22201F] border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5F7367] animate-pulse" />
          AI Copilot
        </h3>
        <button
          onClick={onClose}
          className="text-[#9C9893] hover:text-white hover:bg-[#2C2A28] p-1 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
        <div className="text-[11px] text-[#9C9893] text-center p-1">
          Ask &quot;Summarize my set&quot; or &quot;Why is [name] Pareto-optimal?&quot;
        </div>
        {replies.map((r, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[11px] text-[#798F81] font-medium">You</div>
            <div className="text-[12px] text-[#E8E6E3] bg-[#1A1918] rounded px-2 py-1.5 border border-white/5">{r.user}</div>
            <div className="text-[11px] text-[#798F81] font-medium mt-2">Copilot</div>
            <div className="text-[12px] text-[#E8E6E3] bg-[#1A1918] rounded px-2 py-1.5 border border-white/5 whitespace-pre-wrap">{r.text}</div>
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
            className="flex-1 bg-[#1A1918] border border-white/5 rounded-md text-[#E8E6E3] text-[13px] px-3.5 py-2.5 outline-none font-sans min-h-[40px] max-h-[120px] resize-none focus:border-[#5F7367]"
            placeholder="Ask about your molecules..."
            rows={1}
          />
          <button type="button" onClick={handleSubmit} className="bg-[#5F7367] text-white w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center hover:bg-[#798F81] transition-colors">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
