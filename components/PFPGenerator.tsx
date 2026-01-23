import React, { useState, useRef, useEffect } from 'react';
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
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
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
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('rate') || msg.includes('overload')) {
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
    if (!file) return;
    sounds.playClick();
    const reader = new FileReader();
    reader.onload = e => {
      setPfpImage(e.target?.result as string);
      setHasImage(true);
    };
    reader.readAsDataURL(file);
  };

  const generatePFP = async () => {
    if (!forgePrompt.trim()) return;
    setIsGenerating(true);
    setApiError(null);
    sounds.playClick();

    const identityPrompt = `
A RuggedDev Wojak survivor character.
Extremely crude meme art.
Thick wobbly black outlines.
Helmet with hand-written "SURVIVOR".
Traits: ${forgePrompt}
`.trim();

    try {
      const response = await withRetry(async () => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'forge',
            prompt: identityPrompt,
            aspectRatio,
            imageSize,
          }),
        });
        if (!res.ok) throw new Error('Forge failed');
        return await res.json();
      });

      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);
      if (!imagePart) throw new Error('No image returned');

      setPfpImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      setHasImage(true);
      sounds.playNeutralBlip();
    } catch (err: any) {
      setApiError(err.message || 'Forge Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const editPFP = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setApiError(null);
    sounds.playClick();

    try {
      const base64Data = await getBase64FromUrl(pfpImage);
      const response = await withRetry(async () => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'edit',
            prompt: editPrompt,
            image: {
              data: base64Data,
              mimeType: 'image/png',
            },
          }),
        });
        if (!res.ok) throw new Error('Edit failed');
        return await res.json();
      });

      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);
      if (!imagePart) throw new Error('No edited image');

      setPfpImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      sounds.playNeutralBlip();
    } catch (err: any) {
      setApiError(err.message || 'Edit failed');
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
    const [w, h] = aspectRatio.split(':').map(Number);
    const height = Math.floor((width * h) / w);

    const img = new Image();
    img.onload = () => {
      if (currentLoadId !== loadCountRef.current) return;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      if (frameType === 'circle') {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      const dw = width * zoom;
      const dh = height * zoom;
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
      ctx.restore();
      setIsDrawing(false);
    };
    img.src = pfpImage;
  };

  useEffect(() => {
    drawPFP();
  }, [pfpImage, frameType, zoom, overlay, aspectRatio, hasImage]);

  return (
    <section id="pfp-forge" className="py-8 md:py-24 bg-[#0d0d0d]">
      <div className="container mx-auto">
        <RevealText>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic text-center mb-6">
            Identity Forge
          </h2>
        </RevealText>

        {apiError && (
          <div className="text-center text-red-500 text-xs mb-4">{apiError}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 space-y-3">
            <textarea
              value={forgePrompt}
              onChange={e => setForgePrompt(e.target.value)}
              placeholder="Describe traits..."
              className="w-full p-2 bg-black border text-white"
            />
            <button onClick={generatePFP} className="w-full bg-green-600 py-2 font-black">
              {isGenerating ? 'FORGING...' : 'SUMMON'}
            </button>

            <input
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              placeholder="Edit..."
              className="w-full p-2 bg-black border text-white"
            />
            <button onClick={editPFP} className="w-full bg-white text-black py-2 font-black">
              {isEditing ? '...' : 'MORPH'}
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="w-full border py-2">
              Upload
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          </div>

          <div className="w-full lg:w-1/2">
            <canvas ref={canvasRef} className="w-full aspect-square bg-black" />
          </div>
        </div>
      </div>
    </section>
  );
};
