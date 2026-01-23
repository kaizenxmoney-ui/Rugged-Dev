
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { FALLBACK_IMAGE } from '../constants';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

interface MemeGeneratorProps {
  baseImage: string;
  onResetBase?: () => void;
  onImageGenerated?: (url: string) => void;
}

type DragTarget = 'top' | 'bottom' | null;

export const MemeGenerator: React.FC<MemeGeneratorProps> = ({ baseImage, onResetBase, onImageGenerated }) => {
  const [topText, setTopText] = useState('ME AFTER');
  const [bottomText, setBottomText] = useState('GETTING RUGGED AGAIN');
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textSize, setTextSize] = useState(70);
  const [textColor, setTextColor] = useState('#F2F2F2');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(10);
  const [localCustomImage, setLocalCustomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasActiveMeme, setHasActiveMeme] = useState(true);
  
  const [topTextX, setTopTextX] = useState(500);
  const [topTextY, setTopTextY] = useState(80);
  const [bottomTextX, setBottomTextX] = useState(500);
  const [bottomTextY, setBottomTextY] = useState(920);
  
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);

  const [apiError, setApiError] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [frameType, setFrameType] = useState<'square' | 'circle'>('square');
  const [overlay, setOverlay] = useState<'none' | 'verified' | 'glitch' | 'survival'>('none');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadCountRef = useRef(0);

  const effectiveImage = localCustomImage || baseImage || FALLBACK_IMAGE;

  const handleOpenKey = async () => {
    sounds.playCommandClick();
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setApiError(null);
    }
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url.split(',')[1];
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => { resolve((reader.result as string).split(',')[1]); };
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
          setApiError("Intel Key Expired: Re-select your paid project API key.");
          throw err;
        }
        if ((err?.status === 503 || err?.status === 429 || msg.includes("overloaded")) && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1500));
          continue;
        }
        throw err;
      } finally { setIsRetrying(false); }
    }
    throw lastError;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const reader = new FileReader();
      reader.onload = (event) => { setLocalCustomImage(event.target?.result as string); setHasActiveMeme(true); };
      reader.readAsDataURL(file);
    }
  };

  const editMemeImage = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setApiError(null);
    sounds.playClick();
    try {
      const base64Data = await getBase64FromUrl(effectiveImage);
      const mimeType = effectiveImage.startsWith('data:') ? effectiveImage.split(';')[0].split(':')[1] : 'image/png';
      
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const characterGuidance = `You are a professional crypto-survivor meme editor. Modify the input image of the RuggedDev Wojak character. Maintain the gritty, hand-drawn, exhausted Wojak identity. 
        REQUEST: ${editPrompt}. 
        Examples of possible edits: "Add a retro filter", "Remove the background", "Add a soldier helmet", "Put him in a warzone".
        Keep style consistent.`;

        return await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: characterGuidance }
            ]
          }
        }) as GenerateContentResponse;
      });

      let foundImageUrl: string | null = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) { 
        setLocalCustomImage(foundImageUrl); 
        setHasActiveMeme(true); 
        sounds.playNeutralBlip();
      }
    } catch (err: any) { 
      setApiError(err.message || "AI Morph Failed."); 
    } finally { 
      setIsEditing(false); 
      setEditPrompt(''); 
    }
  };

  const handleAddToGallery = () => { if (canvasRef.current && onImageGenerated) { onImageGenerated(canvasRef.current.toDataURL('image/png')); sounds.playCommandClick(); } };
  const downloadMeme = () => { if (!hasActiveMeme || !canvasRef.current) return; sounds.playCommandClick(); const link = document.createElement('a'); link.download = `rdev-${Date.now()}.png`; link.href = canvasRef.current.toDataURL('image/png'); link.click(); };

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasActiveMeme) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsLoading(true);
    const currentLoadId = ++loadCountRef.current;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (currentLoadId !== loadCountRef.current) return;
      canvas.width = 1000; canvas.height = 1000; ctx.clearRect(0, 0, 1000, 1000); ctx.save();
      if (frameType === 'circle') { ctx.beginPath(); ctx.arc(500, 500, 500, 0, Math.PI * 2); ctx.clip(); }
      const imgAspect = img.width / img.height;
      let dW, dH, dX, dY;
      if (imgAspect > 1) { dH = 1000 * zoom; dW = dH * imgAspect; } else { dW = 1000 * zoom; dH = dW / imgAspect; }
      dX = (1000 - dW) / 2; dY = (1000 - dH) / 2; ctx.drawImage(img, dX, dY, dW, dH); ctx.restore();

      if (overlay === 'verified') { ctx.fillStyle = '#3A5F3D'; ctx.beginPath(); ctx.arc(880, 880, 50, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = '900 60px Inter'; ctx.textAlign = 'center'; ctx.fillText('✓', 880, 900); }
      else if (overlay === 'glitch') { ctx.fillStyle = 'rgba(193, 39, 45, 0.2)'; ctx.fillRect(0, 300, 1000, 10); ctx.fillRect(0, 700, 1000, 4); }
      else if (overlay === 'survival') { ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 880, 1000, 120); ctx.fillStyle = 'white'; ctx.font = '900 40px Inter'; ctx.textAlign = 'center'; ctx.fillText('WOJAK SURVIVOR UNIT', 500, 950); }

      ctx.fillStyle = textColor; ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth; ctx.font = `900 ${textSize}px ${fontFamily}, sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.textBaseline = 'top';
      topText.toUpperCase().split('\n').forEach((line, i) => { ctx.strokeText(line, topTextX, topTextY + (i * (textSize + 10))); ctx.fillText(line, topTextX, topTextY + (i * (textSize + 10))); });
      ctx.textBaseline = 'bottom';
      bottomText.toUpperCase().split('\n').forEach((line, i) => { const lines = bottomText.toUpperCase().split('\n'); const yPos = bottomTextY - ((lines.length - 1 - i) * (textSize + 10)); ctx.strokeText(line, bottomTextX, yPos); ctx.fillText(line, bottomTextX, yPos); });
      setIsLoading(false);
    };
    img.src = effectiveImage;
  }, [topText, bottomText, effectiveImage, fontFamily, textSize, textColor, strokeColor, strokeWidth, topTextX, topTextY, bottomTextX, bottomTextY, hasActiveMeme, zoom, frameType, overlay]);

  useEffect(() => { drawMeme(); }, [drawMeme]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: ((clientX - rect.left) / rect.width) * 1000, y: ((clientY - rect.top) / rect.height) * 1000 };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCanvasCoords(e);
    if (Math.sqrt(Math.pow(x - topTextX, 2) + Math.pow(y - topTextY, 2)) < 150) { setDragTarget('top'); sounds.playClick(); }
    else if (Math.sqrt(Math.pow(x - bottomTextX, 2) + Math.pow(y - bottomTextY, 2)) < 150) { setDragTarget('bottom'); sounds.playClick(); }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragTarget) return; const { x, y } = getCanvasCoords(e);
    if (dragTarget === 'top') { setTopTextX(Math.round(x)); setTopTextY(Math.round(y)); }
    else { setBottomTextX(Math.round(x)); setBottomTextY(Math.round(y)); }
  };

  return (
    <section id="meme-factory" className="py-8 sm:py-24 bg-[#0d0d0d] border-t-2 border-[#6E6E6E]/10">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-16">
          <RevealText><h2 className="text-3xl sm:text-7xl font-black mb-2 sm:mb-4 tracking-tighter uppercase italic">Propaganda Lab</h2></RevealText>
        </div>
        
        {apiError && (
          <div className="max-w-4xl mx-auto mb-4 p-3 border-2 border-rugged-red bg-rugged-red/10 text-white flex flex-col sm:flex-row items-center justify-between gap-2 rounded uppercase text-[8px] font-black">
            <span>{apiError}</span>
            <button onClick={handleOpenKey} className="px-3 py-1 bg-rugged-red rounded">RE-SELECT</button>
          </div>
        )}

        <div className="flex flex-row lg:flex-row gap-2 sm:gap-12 max-w-7xl mx-auto items-start h-[70vh] sm:h-auto overflow-hidden sm:overflow-visible">
          {/* Side-by-Side Settings Panel on Mobile */}
          <div className="w-[45%] sm:flex-1 space-y-3 sm:space-y-8 bg-black/40 p-2 sm:p-10 rounded-xl sm:rounded-3xl border border-white/5 shadow-2xl h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[8px] sm:text-[10px] font-black text-rugged-green uppercase tracking-[0.1em] sm:tracking-[0.2em]">Transmission</label>
              <input value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="TOP" className="w-full bg-[#111] border border-white/10 p-2 sm:p-4 text-white font-black uppercase text-xs sm:text-lg rounded-lg focus:border-rugged-green outline-none" />
              <input value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="BOTTOM" className="w-full bg-[#111] border border-white/10 p-2 sm:p-4 text-white font-black uppercase text-xs sm:text-lg rounded-lg focus:border-rugged-green outline-none" />
            </div>

            <div className="p-2 sm:p-6 bg-[#111] border border-rugged-red/20 rounded-lg space-y-2">
               <label className="text-[7px] sm:text-[9px] font-black text-rugged-red uppercase">Morph (Flash 2.5)</label>
               <input value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Edit..." className="w-full bg-black border border-white/10 p-2 text-white font-mono text-[9px] rounded outline-none" />
               <button onClick={editMemeImage} disabled={isEditing || !editPrompt.trim()} className="w-full py-2 bg-rugged-red text-white font-black uppercase text-[8px] rounded">
                 {isEditing ? '...' : 'MORPH'}
               </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="py-2 border border-white/10 text-white font-black uppercase text-[8px] rounded">Upload</button>
              <button onClick={() => { setLocalCustomImage(null); setHasActiveMeme(true); onResetBase?.(); }} className="py-2 border border-white/10 text-white font-black uppercase text-[8px] rounded">Reset</button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={downloadMeme} className="py-2 bg-black border border-white/10 text-white font-black text-[8px] uppercase rounded">DOWNLOAD</button>
              <button onClick={handleAddToGallery} className="py-2 bg-rugged-green text-white font-black text-[8px] uppercase rounded">ADD TO GALLERY</button>
            </div>
          </div>

          {/* Side-by-Side Preview on Mobile */}
          <div className="w-[55%] sm:flex-1 flex flex-col items-center h-full sm:h-auto">
            <div 
              className="relative w-full aspect-square shadow-2xl rounded-xl overflow-hidden border-2 border-white/10 flex items-center justify-center bg-neutral-900 cursor-crosshair sticky top-0"
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setDragTarget(null)} onMouseLeave={() => setDragTarget(null)} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={() => setDragTarget(null)}
            >
              {(isLoading || isRetrying || isEditing) && <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm"><div className="text-rugged-green font-black text-[8px] sm:text-[10px] uppercase tracking-widest animate-pulse">{isEditing ? 'MORPHING...' : 'SYNCING...'}</div></div>}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
            <p className="mt-2 text-[7px] text-[#6E6E6E] uppercase font-bold tracking-widest text-center">DRAG TEXT TO REPOSITION</p>
          </div>
        </div>
      </div>
    </section>
  );
};
