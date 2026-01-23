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

  const withRetry = async <T,>(fn: () => Promise<T>, maxRetries = 5): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (i > 0) setIsRetrying(true);
        return await fn();
      } catch (err) {
        lastError = err;
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1500));
        }
      } finally {
        setIsRetrying(false);
      }
    }
    throw lastError;
  };

  const generatePFP = async () => {
    if (!forgePrompt.trim()) return;
    setIsGenerating(true);
    setApiError(null);
    sounds.playClick();

    try {
      const response = await withRetry(async () => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: forgePrompt,
            aspectRatio,
            imageSize
          }),
        });

        if (!res.ok) {
          throw new Error('Generation failed');
        }

        return await res.json();
      });

      if (!response?.images?.[0]) {
        throw new Error('No image returned');
      }

      setPfpImage(response.images[0]);
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
      const response = await withRetry(async () => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: editPrompt,
            image: pfpImage,
          }),
        });

        if (!res.ok) {
          throw new Error('Edit failed');
        }

        return await res.json();
      });

      if (!response?.images?.[0]) {
        throw new Error('No edited image returned');
      }

      setPfpImage(response.images[0]);
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

      const scale = zoom;
      const dw = width * scale;
      const dh = height * scale;
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
    <section id="pfp-forge">
      {/* UI untouched */}
    </section>
  );
};
