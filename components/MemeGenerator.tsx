import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FALLBACK_IMAGE } from '../constants';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

interface MemeGeneratorProps {
  baseImage: string;
  onResetBase?: () => void;
  onImageGenerated?: (url: string) => void;
}

type DragTarget = 'top' | 'bottom' | null;

export const MemeGenerator: React.FC<MemeGeneratorProps> = ({
  baseImage,
  onResetBase,
  onImageGenerated,
}) => {
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
        const msg = (err?.message || String(err)).toLowerCase();
        if (
          (err?.status === 503 ||
            err?.status === 429 ||
            msg.includes('overloaded')) &&
          i < maxRetries - 1
        ) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const reader = new FileReader();
      reader.onload = e => {
        setLocalCustomImage(e.target?.result as string);
        setHasActiveMeme(true);
      };
      reader.readAsDataURL(file);
    }
  };

  /* 🔐 FIXED: AI MORPH GOES THROUGH /api/generate */
  const editMemeImage = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setApiError(null);
    sounds.playClick();

    try {
      const base64Data = await getBase64FromUrl(effectiveImage);
      const mimeType = effectiveImage.startsWith('data:')
        ? effectiveImage.split(';')[0].split(':')[1]
        : 'image/png';

      const characterGuidance = `You are a professional crypto-survivor meme editor. Modify the input image of the RuggedDev Wojak character. Maintain the gritty, hand-drawn, exhausted Wojak identity.
REQUEST: ${editPrompt}.
Examples: Add a retro filter, remove background, add helmet, warzone.
Keep style consistent.`;

      const response = await withRetry(async () => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: characterGuidance,
            image: { data: base64Data, mimeType },
          }),
        });

        if (!res.ok) throw new Error('AI Morph Failed');
        return await res.json();
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
      setApiError(err.message || 'AI Morph Failed.');
    } finally {
      setIsEditing(false);
      setEditPrompt('');
    }
  };

  const handleAddToGallery = () => {
    if (canvasRef.current && onImageGenerated) {
      onImageGenerated(canvasRef.current.toDataURL('image/png'));
      sounds.playCommandClick();
    }
  };

  const downloadMeme = () => {
    if (!hasActiveMeme || !canvasRef.current) return;
    sounds.playCommandClick();
    const link = document.createElement('a');
    link.download = `rdev-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

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
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.clearRect(0, 0, 1000, 1000);
      ctx.save();

      if (frameType === 'circle') {
        ctx.beginPath();
        ctx.arc(500, 500, 500, 0, Math.PI * 2);
        ctx.clip();
      }

      const imgAspect = img.width / img.height;
      let dW, dH;
      if (imgAspect > 1) {
        dH = 1000 * zoom;
        dW = dH * imgAspect;
      } else {
        dW = 1000 * zoom;
        dH = dW / imgAspect;
      }

      ctx.drawImage(img, (1000 - dW) / 2, (1000 - dH) / 2, dW, dH);
      ctx.restore();

      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.font = `900 ${textSize}px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';

      ctx.textBaseline = 'top';
      topText.toUpperCase().split('\n').forEach((line, i) => {
        ctx.strokeText(line, topTextX, topTextY + i * (textSize + 10));
        ctx.fillText(line, topTextX, topTextY + i * (textSize + 10));
      });

      ctx.textBaseline = 'bottom';
      bottomText.toUpperCase().split('\n').forEach((line, i, arr) => {
        const yPos = bottomTextY - (arr.length - 1 - i) * (textSize + 10);
        ctx.strokeText(line, bottomTextX, yPos);
        ctx.fillText(line, bottomTextX, yPos);
      });

      setIsLoading(false);
    };

    img.src = effectiveImage;
  }, [
    topText,
    bottomText,
    effectiveImage,
    fontFamily,
    textSize,
    textColor,
    strokeColor,
    strokeWidth,
    topTextX,
    topTextY,
    bottomTextX,
    bottomTextY,
    hasActiveMeme,
    zoom,
    frameType,
    overlay,
  ]);

  useEffect(() => {
    drawMeme();
  }, [drawMeme]);

  /* JSX BELOW IS 100% UNCHANGED */
  return (
    <section id="meme-factory" className="py-8 sm:py-24 bg-[#0d0d0d] border-t-2 border-[#6E6E6E]/10">
      {/* JSX CONTINUES EXACTLY AS YOU POSTED */}
    </section>
  );
};
