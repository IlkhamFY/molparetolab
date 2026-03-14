import { useEffect, useRef } from 'react';
import type { Molecule } from '../../utils/types';

export default function EggView({ molecules }: { molecules: Molecule[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    const W = rect.width;
    const H = rect.height;

    const xMin = -3, xMax = 8;
    const yMin = 0, yMax = 200;
    const padLeft = 60, padRight = 30, padTop = 20, padBottom = 50;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    function toPixel(logp: number, tpsa: number) {
      const px = padLeft + ((logp - xMin) / (xMax - xMin)) * plotW;
      const py = padTop + ((yMax - tpsa) / (yMax - yMin)) * plotH;
      return [px, py];
    }

    // Background
    ctx.fillStyle = '#1A1918';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(42,42,58,0.5)';
    ctx.lineWidth = 0.5;
    for (let x = -2; x <= 7; x++) {
      const [px] = toPixel(x, 0);
      ctx.beginPath(); ctx.moveTo(px, padTop); ctx.lineTo(px, H - padBottom); ctx.stroke();
    }
    for (let y = 0; y <= 200; y += 20) {
      const [, py] = toPixel(0, y);
      ctx.beginPath(); ctx.moveTo(padLeft, py); ctx.lineTo(W - padRight, py); ctx.stroke();
    }

    const eggWhiteCx = 2.5, eggWhiteCy = 72;
    const eggWhiteRx = 4.2, eggWhiteRy = 78;

    ctx.save();
    ctx.beginPath();
    const [ewcx, ewcy] = toPixel(eggWhiteCx, eggWhiteCy);
    const ewrx = (eggWhiteRx / (xMax - xMin)) * plotW;
    const ewry = (eggWhiteRy / (yMax - yMin)) * plotH;
    ctx.ellipse(ewcx, ewcy, ewrx, ewry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240, 240, 235, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 200, 195, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const yolkCx = 2.2, yolkCy = 38;
    const yolkRx = 2.5, yolkRy = 40;

    ctx.save();
    ctx.beginPath();
    const [ycx, ycy] = toPixel(yolkCx, yolkCy);
    const yrx = (yolkRx / (xMax - xMin)) * plotW;
    const yry = (yolkRy / (yMax - yMin)) * plotH;
    ctx.ellipse(ycx, ycy, yrx, yry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 220, 80, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(200,200,195,0.5)';
    ctx.textAlign = 'center';
    const [wlx, wly] = toPixel(eggWhiteCx, 140);
    ctx.fillText('GI Absorbed (White)', wlx, wly);
    
    ctx.fillStyle = 'rgba(255,200,50,0.6)';
    const [ylx, yly] = toPixel(yolkCx, yolkCy);
    ctx.fillText('BBB Penetrant (Yolk)', ylx, yly - 10);

    function insideEllipse(logp: number, tpsa: number, cx: number, cy: number, rx: number, ry: number) {
      return ((logp - cx) ** 2) / (rx ** 2) + ((tpsa - cy) ** 2) / (ry ** 2) <= 1;
    }

    // Axis labels
    ctx.save();
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = '#8888a0';
    ctx.textAlign = 'center';
    ctx.fillText('WLOGP', padLeft + plotW / 2, H - 8);
    ctx.save();
    ctx.translate(16, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('TPSA', 0, 0);
    ctx.restore();
    ctx.restore();

    // Tick labels
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#8888a0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = -2; x <= 7; x++) {
      const [px] = toPixel(x, 0);
      ctx.fillText(String(x), px, H - padBottom + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= 200; y += 40) {
      const [, py] = toPixel(0, y);
      ctx.fillText(String(y), padLeft - 6, py);
    }

    molecules.forEach((m) => {
      const logp = m.props.LogP;
      const tpsa = m.props.TPSA;
      const [px, py] = toPixel(logp, tpsa);

      const inYolk = insideEllipse(logp, tpsa, yolkCx, yolkCy, yolkRx, yolkRy);
      const inWhite = insideEllipse(logp, tpsa, eggWhiteCx, eggWhiteCy, eggWhiteRx, eggWhiteRy);

      let fillColor, strokeColor;
      if (inYolk) {
        fillColor = 'rgba(255, 200, 50, 0.9)';
        strokeColor = '#cca000';
      } else if (inWhite) {
        fillColor = 'rgba(240, 240, 235, 0.9)';
        strokeColor = '#999';
      } else {
        fillColor = 'rgba(200, 200, 200, 0.4)';
        strokeColor = '#555';
      }

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#c0c0cc';
      ctx.textAlign = 'center';
      ctx.fillText(m.name.length > 12 ? m.name.slice(0, 10) + '…' : m.name, px, py - 10);
    });

  }, [molecules]);

  return (
    <div className="bg-[#22201F] border border-white/5 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-white">BOILED-Egg Plot</h3>
        <p className="text-[12px] text-[#9C9893]">Brain Or Intestinal EstimateD permeation — Daina & Zoete, ChemMedChem 2016</p>
      </div>

      <div className="flex items-center gap-4 text-[12px] text-[#9C9893] mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white/80 border border-[#aaa]"></span> Egg White (HIA — GI absorbed)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ffdc50]/80 border border-[#cca000]"></span> Yolk (BBB penetrant)
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[500px] relative rounded-md overflow-hidden bg-[#1A1918]">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      <div className="mt-4 text-[11px] text-[#9C9893] leading-relaxed">
        <strong>How to read:</strong> The BOILED-Egg model uses WLOGP (Wildman-Crippen LogP) and TPSA to predict passive gastrointestinal absorption (white region) and blood-brain barrier penetration (yellow yolk). Molecules in the white are predicted to be absorbed by the GI tract. Molecules in the yolk are predicted to also cross the BBB.
      </div>
    </div>
  );
}
