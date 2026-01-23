
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { FALLBACK_IMAGE } from '../constants';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

interface PFPGeneratorProps {
  onImageGenerated?: (url: string) => void;
}

export const PFPGenerator: React.FC<PFPGeneratorProps> = ({ onImageGenerated }) => {
  const [pfpImage, setPfpImage] = useState<string>(FALLBACK_IMAGE);
  const [frameType, setFrameType] = useState<'circle' | 'square'>('circle');
  const [zoom, setZoom] = useState(1);
  const [overlay, setOverlay] = useState<'none' | 'verified' | 'glitch' | 'survival'>('verified');
  const [hasImage, setHasImage] = useState(true);

  const [forgePrompt, setForgePrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadCountRef = useRef(0);

  const getBase64FromUrl = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url.split(',')[1];
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
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
        
        if (msg.includes("requested entity was not found")) {
          setApiError("Intel Key Invalid: Project or Billing Missing. Re-select your paid API key.");
          if (typeof window.aistudio !== 'undefined') {
            window.aistudio.openSelectKey();
          }
          throw err;
        }

        if ((err?.status === 503 || err?.status === 429 || msg.includes("overloaded") || msg.includes("rate limit")) && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1500));
          continue;
        }
        throw err;
      } finally {
        setIsRetrying(false);
      }
    }
    throw lastError;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        setPfpImage(event.target?.result as string);
        setHasImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenKey = async () => {
    sounds.playCommandClick();
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setApiError(null);
    }
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
        
        const identityPrompt = `
          INSTRUCTION: You MUST use Google Search to accurately reference any real-world brand logos, crypto project logos (e.g., Solana, Phantom, Ledger), or specific meme templates mentioned in the prompt.

          CHARACTER IDENTITY:
          A RuggedDev Wojak survivor character. 
          Variations: Can be male or female. 
          Shared Appearance: Pale off-white Wojak face, droopy tired eyes, dark circles, small nose, flat neutral mouth.
          Expression: Tired, numb, observant. Never smiling. Never heroic. Identical head shape for the specific character type.
          Proportions: Realistic adult human body proportions. Head proportional to body. Grounded anatomy.
          Art Style: Extremely simple and crude art style. Very thick black outlines. Lines are uneven, wobbly, and inconsistent. Looks hand-drawn quickly with no cleanup. No smooth curves. Line work feels shaky and unpolished. Plain internet meme illustration style.
          Coloring: Flat and simple single-color fills. No gradients, no lighting effects.
          Color Palette: Muted colors (olive green, dull browns, warm off-white, dusty grays). No neon.
          Clothing: Simple military worn outfit and helmet. Helmet ALWAYS has rough, messy, hand-written "SURVIVOR" text.
          
          INTEGRATION: If a logo is retrieved via search, render it in this same crude, shaky, hand-drawn style.
          
          PFP Traits: ${forgePrompt}.
          Constraint: Only one character.
          
          NEGATIVE PROMPT:
          No clean line art, no smooth outlines, no polished illustration, no digital painting, no soft shading, no gradients, no lighting effects, no cinematic look, no realism in rendering, no anime, no 3D, no vector art, no "professional" style, no excitement.
        `.trim();
        
        const config: any = {
          imageConfig: { 
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any
          },
          tools: [{ googleSearch: {} }] // Enabled for logo/real-world asset accuracy
        };

        return await ai.models.generateContent({
          model,
          contents: { parts: [{ text: identityPrompt }] },
          config
        }) as GenerateContentResponse;
      });

      if (!response.candidates?.[0]) {
        throw new Error("Forge blocked by safety filters.");
      }

      let foundImageUrl: string | null = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) {
        setPfpImage(foundImageUrl);
        setHasImage(true);
        sounds.playNeutralBlip();
      } else {
        throw new Error("No identity data forged.");
      }
    } catch (err: any) {
      setApiError(err.message || "Forge Error. Signal lost in trenches.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToGallery = () => {
    if (canvasRef.current && onImageGenerated) {
      const url = canvasRef.current.toDataURL('image/png');
      onImageGenerated(url);
      sounds.playCommandClick();
    }
  };

  const downloadPFP = () => {
    if (!canvasRef.current) return;
    sounds.playCommandClick();
    const link = document.createElement('a');
    link.download = `rugged-identity-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const editPFP = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setApiError(null);
    sounds.playClick();
    try {
      const base64Data = await getBase64FromUrl(pfpImage);
      const mimeType = pfpImage.startsWith('data:') ? pfpImage.split(';')[0].split(':')[1] : 'image/png';
      
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const identityLock = `
          Modify the input RuggedDev Wojak image.
          Identity: Pale face, tired eyes, helmet with 'SURVIVOR'. Realistic human body proportions. Male or Female variation as specified.
          EDIT: ${editPrompt}. 
          Maintain extremely crude meme art style with thick wobbly black outlines.
        `.trim();
        
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: identityLock }
              ]
          }
        }) as GenerateContentResponse;
      });

      if (!response.candidates?.[0]) {
        throw new Error("Morph blocked by safety filters.");
      }

      let foundImageUrl: string | null = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) {
        setPfpImage(foundImageUrl);
        sounds.playNeutralBlip();
      }
    } catch (err: any) {
      setApiError(err.message || "Modification Failed.");
    } finally {
      setIsEditing(false);
      setEditPrompt('');
    }
  };

  const drawPFP = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const currentLoadId = ++loadCountRef.current;
    const width = 1000;
    const ratioParts = aspectRatio.split(':').map(Number);
    const height = Math.floor((width * (ratioParts[1] || 1)) / (ratioParts[0] || 1));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (currentLoadId !== loadCountRef.current) return;
      canvas.width = width; canvas.height = height; ctx.clearRect(0, 0, width, height); ctx.save();
      if (frameType === 'circle') { ctx.beginPath(); ctx.arc(width/2, height/2, Math.min(width, height)/2, 0, Math.PI*2); ctx.clip(); }
      const imgAspect = img.width/img.height; const canvasAspect = width/height;
      let dW, dH, dX, dY;
      if (imgAspect > canvasAspect) { dH = height*zoom; dW = dH*imgAspect; } else { dW = width*zoom; dH = dW/imgAspect; }
      dX = (width-dW)/2; dY = (height-dH)/2; ctx.drawImage(img, dX, dY, dW, dH); ctx.restore();

      // Overlays
      if (overlay === 'verified') {
        ctx.fillStyle = '#3A5F3D';
        ctx.beginPath(); ctx.arc(width * 0.85, height * 0.85, 50, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = '900 60px Inter'; ctx.textAlign = 'center';
        ctx.fillText('✓', width * 0.85, height * 0.87);
      } else if (overlay === 'glitch') {
        ctx.fillStyle = 'rgba(193, 39, 45, 0.2)';
        ctx.fillRect(0, height * 0.4, width, 10);
        ctx.fillRect(0, height * 0.6, width, 4);
      } else if (overlay === 'survival') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, height * 0.85, width, height * 0.15);
        ctx.fillStyle = 'white'; ctx.font = '900 35px Inter'; ctx.textAlign = 'center';
        ctx.fillText('WOJAK SURVIVOR', width / 2, height * 0.95);
      }

      setIsDrawing(false);
    };
    img.src = pfpImage;
  };

  useEffect(() => { drawPFP(); }, [pfpImage, frameType, zoom, overlay, aspectRatio, hasImage]);

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
          {/* Controls Column */}
          <div className="w-[45%] sm:w-[450px] bg-black/40 p-2 md:p-8 rounded-xl flex flex-col gap-3 md:gap-6 border border-white/5 h-full overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-rugged-green rounded-full animate-pulse"></div>
                <label className="text-[7px] md:text-[10px] font-black text-rugged-green uppercase tracking-widest">Web Search Active</label>
              </div>
              <label className="text-[7px] md:text-[10px] font-black text-rugged-gray uppercase">Nano Pro</label>
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
                <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="w-full bg-black border border-white/10 text-[8px] md:text-[10px] text-white p-1 font-bold rounded">
                  <option value="1K">1K</option>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                </select>
              </div>
              <textarea value={forgePrompt} onChange={(e) => setForgePrompt(e.target.value)} placeholder="Traits (e.g., 'wearing a Solana hat')..." className="w-full bg-black border border-rugged-gray/20 p-1 text-white font-mono text-[9px] min-h-[40px] md:min-h-[60px] rounded outline-none focus:border-rugged-green" />
              <button onClick={generatePFP} disabled={isGenerating || !forgePrompt.trim()} className="w-full py-2 bg-rugged-green text-white font-black text-[8px] uppercase rounded hover:brightness-110 active:scale-95 transition-all">
                {isGenerating ? 'FORGING...' : 'SUMMON'}
              </button>
            </div>

            <div className="bg-[#111] p-2 md:p-4 border border-rugged-gray/10 rounded-lg space-y-2">
              <label className="text-[7px] md:text-[10px] font-black text-rugged-gray uppercase">Morph (Legacy)</label>
              <input value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Filter..." className="w-full bg-black border border-rugged-gray/20 p-1 text-white font-mono text-[9px] rounded outline-none" />
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

            <select value={overlay} onChange={(e) => setOverlay(e.target.value as any)} className="w-full bg-black border border-white/5 p-1.5 text-white text-[7px] font-black uppercase rounded outline-none">
              <option value="none">No Overlay</option>
              <option value="verified">Verified</option>
              <option value="glitch">Glitch</option>
              <option value="survival">Survivor</option>
            </select>

            <div className="flex flex-col gap-1 mt-auto">
              <div className="flex gap-1">
                <button onClick={() => { setPfpImage(FALLBACK_IMAGE); setHasImage(true); }} className="flex-1 py-1.5 border border-[#3A5F3D]/30 text-[7px] font-black uppercase text-white rounded">Reset</button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1.5 border border-[#6E6E6E]/30 text-[7px] font-black uppercase text-[#6E6E6E] rounded">Upload</button>
              </div>
              <button onClick={downloadPFP} className="w-full py-2 bg-black border border-white/10 text-white font-black uppercase text-[8px] rounded hover:bg-white hover:text-black transition-all">Download</button>
              <button onClick={handleAddToGallery} className="w-full py-2 bg-white text-black font-black uppercase text-[8px] rounded hover:bg-rugged-gray transition-all">Add Archive</button>
              <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Preview Column */}
          <div className="w-[55%] flex-1 flex flex-col items-center h-full sm:h-auto">
            <div className="relative w-full aspect-square shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden bg-neutral-900 border-2 border-white/5 rounded-xl flex items-center justify-center sticky top-0">
              {(isDrawing || isRetrying || isEditing) && <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"><div className="text-rugged-green font-black text-[8px] uppercase tracking-widest animate-pulse">{isEditing ? 'MORPHING...' : 'FORGING...'}</div></div>}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
            <p className="mt-2 text-[6px] md:text-[8px] text-[#6E6E6E] uppercase font-black tracking-widest text-center">Identity Snapshot 0{loadCountRef.current}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
