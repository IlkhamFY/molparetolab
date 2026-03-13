import { Share, Download, FileText, Star, MessageSquare } from 'lucide-react';

const Header = ({ moleculeCount }: { moleculeCount: number }) => {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Mol<span className="text-[#798F81]">Pareto</span>Lab
          </h1>
          <div className="text-[13px] text-[#9C9893] mt-0.5">
            multi-objective molecule analysis
          </div>
        </div>
        {moleculeCount > 0 && (
          <span className="text-xs px-3 py-1 rounded-md bg-teal-500/15 text-[#798F81] font-semibold text-nowrap">
            {moleculeCount} molecule{moleculeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {moleculeCount > 0 && (
          <>
            <ActionButton icon={<Share size={14} />} label="Share URL" />
            <ActionButton icon={<Download size={14} />} label="Export Figure" />
            <ActionButton icon={<Download size={14} />} label="Export CSV" />
            <ActionButton icon={<FileText size={14} />} label="Cite" />
          </>
        )}
        <a
          href="https://github.com/IlkhamFY/molparetolab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#9C9893] bg-[#2C2A28] border border-white/5 rounded-md hover:border-white/20 hover:text-white transition-colors"
        >
          <Star size={14} /> Star
        </a>
        <a
          href="https://github.com/IlkhamFY/molparetolab/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#9C9893] bg-[#2C2A28] border border-white/5 rounded-md hover:border-white/20 hover:text-white transition-colors"
        >
          <MessageSquare size={14} /> Feedback
        </a>
      </div>
    </header>
  );
};

const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2C2A28] border border-white/5 rounded-md hover:border-[#5F7367] hover:text-[#798F81] transition-colors"
  >
    {icon} {label}
  </button>
);

export default Header;
