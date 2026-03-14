import { useEffect, useRef, useMemo, useState } from 'react';
import type { Molecule } from '../../utils/types';
import { computeTanimotoMatrix, getDiversityScore } from '../../utils/chem';

function lerpColor(t: number): string {
  if (t <= 0) return 'rgb(59, 130, 246)';
  if (t >= 1) return 'rgb(234, 179, 8)';
  const r = Math.round(59 + (234 - 59) * t);
  const g = Math.round(130 + (179 - 130) * t);
  const b = Math.round(246 + (8 - 246) * t);
  return `rgb(${r},${g},${b})`;
}

export default function SimilarityMatrixView({ molecules }: { molecules: Molecule[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ i: number; j: number } | null>(null);


  const { matrix, diversity } = useMemo(() => {
    const mat = computeTanimotoMatrix(molecules);
    const div = getDiversityScore(mat);
    return { matrix: mat, diversity: div };
  }, [molecules]);

  const n = molecules.length;
  const labels = useMemo(() => molecules.map((m) => m.name.replace(/_/g, ' ').slice(0, 12)), [molecules]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || n === 0) return;
    const canvas = canvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padLeft = 120;
    const padTop = 10;
    const padBottom = 60;
    const padRight = 20;
    const cellW = (W - padLeft - padRight) / n;
    const cellH = (H - padTop - padBottom) / n;
    const size = Math.min(cellW, cellH, 56);
    const offsetX = padLeft;
    const offsetY = padTop;
    ctx.fillStyle = '#1A1918';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const t = matrix[i][j];
        const isHover = hoverCell?.i === i && hoverCell?.j === j;
        ctx.fillStyle = lerpColor(t);
        ctx.globalAlpha = isHover ? 1 : 0.85;
        const x = offsetX + j * size;
        const y = offsetY + i * size;
        ctx.fillRect(x, y, size - 1, size - 1);
        ctx.globalAlpha = 1;
      }
    }

    const labelFontSize = Math.max(11, Math.min(12, size * 0.35));
    ctx.fillStyle = '#9C9893';
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const y = offsetY + i * size + size / 2;
      ctx.fillText(labels[i] || `${i + 1}`, offsetX - 6, y);
    }

    // X-axis labels (rotated 45 degrees)
    ctx.save();
    ctx.fillStyle = '#9C9893';
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let j = 0; j < n; j++) {
      const x = offsetX + j * size + size / 2;
      const y = offsetY + n * size + 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(labels[j] || `${j + 1}`, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Similarity values inside cells when cells are large enough
    if (size >= 32) {
      ctx.font = `${Math.max(8, size * 0.22)}px mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const x = offsetX + j * size + size / 2;
          const y = offsetY + i * size + size / 2;
          const t = matrix[i][j];
          ctx.fillStyle = t > 0.6 ? '#1A1918' : '#E8E6E3';
          ctx.fillText((t * 100).toFixed(0), x, y);
        }
      }
    }
  }, [matrix, n, labels, hoverCell]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || n === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padLeft = 120;
    const padTop = 10;
    const padBottom = 60;
    const padRight = 20;
    const cellW = (rect.width - padLeft - padRight) / n;
    const cellH = (rect.height - padTop - padBottom) / n;
    const size = Math.min(cellW, cellH, 56);
    const offsetX = padLeft;
    const offsetY = padTop;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const j = Math.floor((x - offsetX) / size);
    const i = Math.floor((y - offsetY) / size);
    if (i >= 0 && i < n && j >= 0 && j < n) {
      setHoverCell({ i, j });
    } else {
      setHoverCell(null);
    }
  };

  const handleMouseLeave = () => setHoverCell(null);

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-white">Tanimoto similarity matrix</h3>
        <span className="text-[12px] text-[#9C9893]">
          Diversity score: <span className="font-mono text-[#E8E6E3]">{(diversity * 100).toFixed(1)}%</span> (higher = more diverse)
        </span>
      </div>
      <div ref={containerRef} className="w-full h-[400px] relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      {hoverCell && (
        <div className="mt-3 text-[12px] text-[#9C9893]">
          <span className="text-[#E8E6E3]">{molecules[hoverCell.i].name}</span> vs{' '}
          <span className="text-[#E8E6E3]">{molecules[hoverCell.j].name}</span>: Tanimoto ={' '}
          <span className="font-mono text-[#798F81]">{(matrix[hoverCell.i][hoverCell.j] * 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
