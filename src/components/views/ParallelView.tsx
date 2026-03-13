import { useEffect, useRef } from 'react';
import type { Molecule } from '../../utils/types';

export default function ParallelView({ molecules }: { molecules: Molecule[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pcBrushesRef = useRef<Record<string, [number, number]>>({});

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
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

    const pcBrushes = pcBrushesRef.current;

    function drawParallelCoords() {
      if (!ctx || !canvas) return;
      const W = rect.width;
      const H = rect.height;

      const axes = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'];
      const padLeft = 40, padRight = 40, padTop = 40, padBottom = 40;
      const plotW = W - padLeft - padRight;
      const plotH = H - padTop - padBottom;
      const axisSpacing = plotW / Math.max(1, axes.length - 1);

      const ranges: Record<string, { min: number, max: number }> = {};
      axes.forEach(k => {
        const vals = molecules.map(m => m.props[k as keyof Molecule['props']] as number);
        const mn = Math.min(...vals);
        const mx = Math.max(...vals);
        const pad = (mx - mn) * 0.05 || 1;
        ranges[k] = { min: mn - pad, max: mx + pad };
      });

      const lipinskiLimits: Record<string, number> = { MW: 500, LogP: 5, HBD: 5, HBA: 10, TPSA: 140, RotBonds: 10 };

      function axisX(i: number) { return padLeft + i * axisSpacing; }
      function valToY(key: string, val: number) {
        const r = ranges[key];
        return padTop + plotH - ((val - r.min) / (r.max - r.min)) * plotH;
      }
      function yToVal(key: string, y: number) {
        const r = ranges[key];
        return r.min + ((padTop + plotH - y) / plotH) * (r.max - r.min);
      }

      function passesBrushes(m: Molecule) {
        for (const [key, br] of Object.entries(pcBrushes)) {
          const v = m.props[key as keyof Molecule['props']] as number;
          if (v < br[0] || v > br[1]) return false;
        }
        return true;
      }

      ctx.fillStyle = '#12121a';
      ctx.fillRect(0, 0, W, H);

      axes.forEach((k, i) => {
        const x = axisX(i);
        ctx.strokeStyle = '#3a3a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotH);
        ctx.stroke();

        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#e0e0e8';
        ctx.textAlign = 'center';
        ctx.fillText(k, x, padTop - 14);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#8888a0';
        ctx.fillText(ranges[k].max.toFixed(1), x, padTop - 2);
        ctx.fillText(ranges[k].min.toFixed(1), x, padTop + plotH + 14);

        if (lipinskiLimits[k] !== undefined) {
          const ly = valToY(k, lipinskiLimits[k]);
          if (ly >= padTop && ly <= padTop + plotH) {
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'; // #eab30866
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(x - 12, ly);
            ctx.lineTo(x + 12, ly);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        if (pcBrushes[k]) {
          const by1 = valToY(k, pcBrushes[k][1]);
          const by2 = valToY(k, pcBrushes[k][0]);
          ctx.fillStyle = 'rgba(20,184,166,0.15)';
          ctx.fillRect(x - 10, by1, 20, by2 - by1);
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 10, by1, 20, by2 - by1);
        }
      });

      const sorted = molecules.map((m, i) => ({ m, i, passes: passesBrushes(m) }));
      
      // Faded lines (fail brush)
      sorted.filter(s => !s.passes).forEach(({ m }) => {
        ctx.strokeStyle = 'rgba(100,100,120,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        axes.forEach((k, ai) => {
          const x = axisX(ai);
          const y = valToY(k, m.props[k as keyof Molecule['props']] as number);
          if (ai === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      // Passing lines
      sorted.filter(s => s.passes).forEach(({ m }) => {
        const isPareto = m.paretoRank === 1;
        ctx.strokeStyle = isPareto ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.35)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        axes.forEach((k, ai) => {
          const x = axisX(ai);
          const y = valToY(k, m.props[k as keyof Molecule['props']] as number);
          if (ai === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      return { yToVal, axisX, axes };
    }

    const API = drawParallelCoords();
    if (!API) return;

    let isDragging = false;
    let dragAxisIdx = -1;
    let dragStartY = 0;

    canvas.onmousedown = (e) => {
      const cr = canvas.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;
      
      for (let ai = 0; ai < API.axes.length; ai++) {
        if (Math.abs(mx - API.axisX(ai)) < 20) {
          isDragging = true;
          dragAxisIdx = ai;
          dragStartY = my;
          break;
        }
      }
    };

    canvas.onmouseup = (e) => {
      if (!isDragging) return;
      const cr = canvas.getBoundingClientRect();
      const my = e.clientY - cr.top;
      const key = API.axes[dragAxisIdx];
      
      if (Math.abs(my - dragStartY) < 5) {
        // Click -> clear
        delete pcBrushes[key];
      } else {
        // Drag -> brush
        const v1 = API.yToVal(key, dragStartY);
        const v2 = API.yToVal(key, my);
        pcBrushes[key] = [Math.min(v1, v2), Math.max(v1, v2)];
      }
      isDragging = false;
      dragAxisIdx = -1;
      drawParallelCoords();
    };

    canvas.onmousemove = (_e) => {
      // Not handling full molecule tooltips in Parallel Coordinates yet to save space + complexity,
      // just implementing the core brushing functionality.
      if (isDragging) return;
      canvas.style.cursor = 'crosshair';
    };

    canvas.onmouseleave = () => { isDragging = false; };

  }, [molecules]);

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">Parallel Coordinates</h3>
        <p className="text-[12px] text-[#9C9893]">drag on axes to brush-filter molecules · click axis to clear</p>
      </div>

      <div className="flex items-center gap-4 text-[12px] text-[#9C9893] mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span> Pareto-optimal
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Dominated
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0 border-t-2 border-dashed border-[#eab308]"></span> Lipinski limit
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[500px] relative rounded-md overflow-hidden bg-[#12121a]">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </div>
  );
}
