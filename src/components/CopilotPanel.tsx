import { X } from 'lucide-react';

export default function CopilotPanel({ isOpen, onClose, molecules }) {
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

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] text-[#9C9893] text-center p-1">
          AI copilot ready. Ask anything about your molecules.
        </div>
      </div>

      <div className="p-5 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-[#1A1918] border border-white/5 rounded-md text-[#E8E6E3] text-[13px] px-3.5 py-2.5 outline-none font-sans min-h-[40px] max-h-[120px] resize-none focus:border-[#5F7367]"
            placeholder="Ask about your molecules..."
            rows={1}
          />
          <button className="bg-[#5F7367] text-white w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center hover:bg-[#798F81] transition-colors">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
