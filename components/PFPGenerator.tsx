
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { FALLBACK_IMAGE, OFFICIAL_STORY_IMAGE } from '../constants';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

interface PFPGeneratorProps {
  onImageGenerated?: (url: string) => void;
}

export const PFPGenerator: React.FC<PFPGeneratorProps> = ({ onImageGenerated }) => {
  const [pfpImage, setPfpImage] = useState<string>(FALLBACK_IMAGE);
  const [frameType, setFrameType] = useState<'circle' | 'square'>('circle');
  const [zoom, setZoom] = useState(1);
  const [overlay, setOverlay] = useState<'none' | 'verified' | 'glitch' | 'survival'>('none');
  const [hasImage, setHasImage] = useState(true);

  const [forgePrompt, setForgePrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadCountRef = useRef(0);

  const TRENCH_FORGE_PROTOCOL = `
    TRENCH FORGE PROTOCOL - ART STYLE (STRICT):
    - STYLE: Modern Wojak meme comic style. Bold outlines, flat colors.
    - CHARACTER: Wojak survivor unit.
    - FACE: Tired expression, neutral tone.
    - COLOR: Muted palette.
  `;

  // Speed Optimization: Resize to 512px before sending to API
  const getOptimizedBase64 = async (url: string): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const MAX_DIM = 512;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = (height * MAX_DIM) / width; width = MAX_DIM; }
          else { width = (width * MAX_DIM) / height; height = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const [header, data] = dataUrl.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        resolve({ data, mimeType });
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const withRetry = async <T,>(fn: () => Promise<T>, maxRetries = 5): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (i > 0) setIsRetrying(true);
        return await fn();
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || String(err)).toLowerCase();
        if ((err?.status === 503 || err?.status === 429 || msg.includes("overloaded")) && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1200));
          continue;
        }
        throw err;
      } finally { setIsRetrying(false); }
    }
    throw lastError;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const reader = new FileReader();
      reader.onload = (event) => { setPfpImage(event.target?.result as string); setHasImage(true); };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenKey = async () => {
    sounds.playCommandClick();
    if (typeof window.aistudio !== 'undefined') { await window.aistudio.openSelectKey(); setApiError(null); }
  };

  const generatePFP = async () => {
    if (!forgePrompt.trim()) return;
    setIsGenerating(true);
    setApiError(null);
    sounds.playClick();
    try {
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-image-preview'; 
        
        const config: any = {
          imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any },
          tools: [{ googleSearch: {} }]
        };

        return await ai.models.generateContent({
          model,
          contents: { parts: [{ text: `${TRENCH_FORGE_PROTOCOL}\nREQUEST: ${forgePrompt}` }] },
          config
        }) as GenerateContentResponse;
      });

      let foundImageUrl: string | null = null;
      if (response.candidates?.[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (foundImageUrl) { setPfpImage(foundImageUrl); setHasImage(true); sounds.playNeutralBlip(); }
    } catch (err: any) { setApiError(err.message || "Forge Error."); }
    finally { setIsGenerating(false); }
  };

  const editPFP = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setApiError(null);
    sounds.playClick();
    try {
      const optimized = await getOptimizedBase64(pfpImage);
      
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-image-preview';
        
        const config: any = {
          imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any },
          tools: [{ googleSearch: {} }]
        };

        return await ai.models.generateContent({
          model,
          contents: {
              parts: [
                { inlineData: { data: optimized.data, mimeType: optimized.mimeType } },
                { text: `CHANGE: ${editPrompt}. ${TRENCH_FORGE_PROTOCOL}` }
              ]
          },
          config
        }) as GenerateContentResponse;
      });

      let foundImageUrl: string | null = null;
      if (response.candidates?.[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      if (foundImageUrl) { setPfpImage(foundImageUrl); sounds.playNeutralBlip(); }
    } catch (err: any) { setApiError(err.message || "Modification Failed."); }
    finally { setIsEditing(false); setEditPrompt(''); }
  };

  const drawPFP = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const currentLoadId = ++loadCountRef.current;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (currentLoadId !== loadCountRef.current) return;
      canvas.width = 1000; canvas.height = 1000; ctx.clearRect(0, 0, 1000, 1000); ctx.save();
      if (frameType === 'circle') { ctx.beginPath(); ctx.arc(500, 500, 500, 0, Math.PI*2); ctx.clip(); }
      const imgAspect = img.width/img.height;
      let dW, dH, dX, dY;
      if (imgAspect > 1) { dH = 1000*zoom; dW = dH*imgAspect; } else { dW = 1000*zoom; dH = dW/imgAspect; }
      dX = (1000-dW)/2; dY = (1000-dH)/2; ctx.drawImage(img, dX, dY, dW, dH); ctx.restore();

      if (overlay === 'verified') {
        ctx.fillStyle = '#3A5F3D'; ctx.beginPath(); ctx.arc(850, 850, 50, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = '900 60px Inter'; ctx.textAlign = 'center'; ctx.fillText('✓', 850, 870);
      } else if (overlay === 'survival') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 850, 1000, 150);
        ctx.fillStyle = 'white'; ctx.font = '900 35px Inter'; ctx.textAlign = 'center'; ctx.fillText('SURVIVOR UNIT', 500, 950);
      }
      setIsDrawing(false);
    };
    img.src = pfpImage;
  };

  useEffect(() => { drawPFP(); }, [pfpImage, frameType, zoom, overlay, aspectRatio, hasImage, imageSize]);

  return (
    <section id="pfp-forge" className="py-8 md:py-24 bg-[#0d0d0d] border-t-2 border-[#6E6E6E]/10">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-16">
          <RevealText><h2 className="text-2xl md:text-6xl font-black mb-2 sm:mb-4 tracking-tighter uppercase italic">Identity Forge</h2></RevealText>
        </div>
        
        {apiError && (
          <div className="max-w-xl mx-auto mb-4 p-2 border-2 border-rugged-red bg-rugged-red/10 text-white flex items-center justify-between gap-2 rounded uppercase text-[8px] font-black">
            <span>{apiError}</span>
            <button onClick={handleOpenKey} className="px-2 py-1 bg-rugged-red rounded hover:brightness-110">RE-SELECT</button>
          </div>
        )}

        <div className="flex flex-row lg:flex-row gap-2 md:gap-12 items-start h-[70vh] sm:h-auto overflow-hidden sm:overflow-visible">
          <div className="w-[45%] sm:w-[450px] bg-black/40 p-2 md:p-8 rounded-xl flex flex-col gap-3 md:gap-6 border border-white/5 h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-rugged-green rounded-full animate-pulse"></div>
                <label className="text-[7px] md:text-[10px] font-black text-rugged-green uppercase tracking-widest">Web Grounding Active</label>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[7px] md:text-[10px] font-black text-rugged-gray uppercase">Nano Pro Mode</label>
              </div>
            </div>

            <div className="bg-[#111] p-2 md:p-4 border-2 border-dashed border-rugged-green/20 rounded-lg space-y-2 md:space-y-3">
              <label className="text-[7px] md:text-[10px] font-black text-rugged-green uppercase">Forge Identity</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-black border border-white/10 text-[8px] md:text-[10px] text-white p-1 font-bold rounded">
                  <option value="1:1">1:1</option>
                  <option value="3:4">3:4</option>
                  <option value="4:3">4:3</option>
                  <option value="9:16">9:16</option>
                  <option value="16:9">16:9</option>
                </select>
                <select value={imageSize} onChange={(e) => { setImageSize(e.target.value as any); sounds.playRelayClick(); }} className="w-full bg-black border border-white/10 text-[8px] md:text-[10px] text-white p-1 font-bold rounded">
                  <option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option>
                </select>
              </div>
              <textarea value={forgePrompt} onChange={(e) => setForgePrompt(e.target.value)} placeholder="Traits..." className="w-full bg-black border border-rugged-gray/20 p-1 text-white font-mono text-[9px] min-h-[40px] md:min-h-[60px] rounded outline-none focus:border-rugged-green" />
              <button onClick={generatePFP} disabled={isGenerating || !forgePrompt.trim()} className="w-full py-2 bg-rugged-green text-white font-black text-[8px] uppercase rounded hover:brightness-110 active:scale-95 transition-all">
                {isGenerating ? 'FORGING...' : 'SUMMON'}
              </button>
            </div>

            <div className="bg-[#111] p-2 md:p-4 border border-rugged-gray/10 rounded-lg space-y-2">
              <label className="text-[7px] md:text-[10px] font-black text-rugged-gray uppercase">Morph</label>
              <input value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Edit current..." className="w-full bg-black border border-rugged-gray/20 p-1 text-white font-mono text-[9px] rounded outline-none" />
              <button onClick={editPFP} disabled={isEditing || !editPrompt.trim()} className="w-full py-1.5 bg-white text-black font-black text-[8px] uppercase rounded hover:bg-rugged-gray transition-all">
                {isEditing ? '...' : 'MORPH'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-rugged-gray uppercase">Zoom</label>
                <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-rugged-green" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => setFrameType('square')} className={`flex-1 py-1 text-[7px] font-black border rounded ${frameType === 'square' ? 'border-rugged-green text-rugged-green' : 'border-white/10 text-white/40'}`}>SQ</button>
                <button onClick={() => setFrameType('circle')} className={`flex-1 py-1 text-[7px] font-black border rounded ${frameType === 'circle' ? 'border-rugged-green text-rugged-green' : 'border-white/10 text-white/40'}`}>CIR</button>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-auto">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-1.5 border border-[#6E6E6E]/30 text-[7px] font-black uppercase text-[#6E6E6E] rounded">Upload Base</button>
              <button onClick={() => canvasRef.current && window.open(canvasRef.current.toDataURL('image/png'))} className="w-full py-2 bg-black border border-white/10 text-white font-black uppercase text-[8px] rounded">Preview Large</button>
              <button onClick={() => canvasRef.current && onImageGenerated && onImageGenerated(canvasRef.current.toDataURL('image/png'))} className="w-full py-2 bg-white text-black font-black uppercase text-[8px] rounded">Add Archive</button>
              <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="w-[55%] flex-1 flex flex-col items-center h-full sm:h-auto">
            <div className="relative w-full aspect-square shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden bg-neutral-900 border-2 border-white/5 rounded-xl flex items-center justify-center sticky top-0">
              {(isDrawing || isRetrying || isEditing || isGenerating) && <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="text-rugged-green font-black text-[8px] uppercase tracking-widest animate-pulse">Syncing Payload...</div>
                <div className="text-white/20 text-[6px] uppercase mt-2">Uploading Reference (Optimized)</div>
              </div>}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
