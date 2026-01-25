
import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';
import { OFFICIAL_STORY_IMAGE } from '../constants';

interface AILabProps {
  baseImage: string;
  onForgeToMeme: (url: string) => void;
  onImageGenerated?: (url: string) => void;
}

export const AILab: React.FC<AILabProps> = ({ baseImage, onForgeToMeme, onImageGenerated }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string, sources?: any[]}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [forgeEditPrompt, setForgeEditPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [searchGrounding, setSearchGrounding] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isSoundEnabled());

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sounds.setSoundEnabled(newState);
    sounds.playRelayClick();
  };

  const handleOpenKey = async () => {
    sounds.playCommandClick();
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setApiError(null);
    }
  };

  const getProcessedImageData = async (url: string): Promise<{ data: string; mimeType: string } | null> => {
    // Optimization: Skip fetching if it's the official story image to avoid CORS/Network issues.
    // The model already has the character locked via text description.
    if (url === OFFICIAL_STORY_IMAGE) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      const mimeType = blob.type || 'image/png';
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const MAX_DIM = 1024; 
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
            else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, width, height);
          const finalDataUrl = canvas.toDataURL(mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.85);
          const [header, data] = finalDataUrl.split(',');
          const finalMime = header.split(':')[1].split(';')[0];
          resolve({ data, mimeType: finalMime });
        };
        img.onerror = () => resolve(null);
        img.src = objectUrl;
      });
    } catch (e) {
      return null;
    }
  };

  const withRetry = async <T,>(fn: () => Promise<T>, maxRetries = 7): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (i > 0) setIsRetrying(true);
        return await fn();
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || String(err)).toLowerCase();
        if (msg.includes("requested entity was not found")) {
          setApiError("Authorization Key Expired. Re-select your paid API key.");
          throw err;
        }
        if ((err?.status === 503 || err?.status === 429 || msg.includes("overloaded") || msg.includes("rate limit")) && i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2.2, i) * 2000));
          continue;
        }
        throw err;
      } finally { setIsRetrying(false); }
    }
    throw lastError;
  };

  const runChat = async () => {
    if (!chatInput.trim()) return;
    setApiError(null);
    sounds.playCommandClick();
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const response = await withRetry(async () => {
        const model = thinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config: any = {
          systemInstruction: "You are the RuggedDev Intelligence Hub. You analyze crypto trends with absolute transparency. Use Google Search to verify live data.",
        };
        if (searchGrounding) config.tools = [{ googleSearch: {} }];
        if (thinkingMode) config.thinkingConfig = { thinkingBudget: 32768 };
        return await ai.models.generateContent({ model, contents: userMsg, config }) as GenerateContentResponse;
      });
      const text = response.text || "SIGNAL_LOST: Protocol interrupted...";
      setChatHistory(prev => [...prev, { role: 'bot', text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] }]);
      sounds.playNeutralBlip();
    } catch (err: any) { setApiError(err.message || "Trench connection error."); } 
    finally { setIsTyping(false); }
  };

  const generateImage = async () => {
    if (!genPrompt.trim()) return;
    setApiError(null);
    sounds.playCommandClick();
    setIsGenerating(true);
    try {
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-image-preview';
        const baseImgInfo = await getProcessedImageData(baseImage);

        // Character Identity Prompt (Always enforced even without uploaded image)
        const identityPrompt = `
          INSTRUCTION: Use Google Search to include accurate logos or brands mentioned. 
          CORE CHARACTER: The RuggedDev Wojak survivor. 
          VISUALS: Pale off-white Wojak face, extremely tired droopy eyes with dark circles.
          OUTFIT: Olive military helmet with crude hand-written 'SURVIVOR' text. 
          STYLE: Extremely simple, crude, hand-drawn internet meme aesthetic. Thick, wobbly, inconsistent black outlines. Flat colors, no shading or lighting.
          SCENE: ${genPrompt}.
          MANDATORY: Maintain this shaky, wobbly, hand-drawn meme look for everything. Hide ticker '$RDEV' in the scene.
        `.trim();
        
        const config: any = { 
          imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any },
          tools: [{ google_search: {} }] 
        };

        const parts: any[] = [];
        if (baseImgInfo) {
           parts.push({ inlineData: { data: baseImgInfo.data, mimeType: baseImgInfo.mimeType } });
           parts.push({ text: `REFERENCE ATTACHED: Use this custom base but keep the RuggedDev traits: ${identityPrompt}` });
        } else {
           parts.push({ text: `DEFAULT IDENTITY ACTIVE: Generate the RuggedDev survivor in this scene: ${identityPrompt}` });
        }

        return await ai.models.generateContent({ model, contents: { parts }, config }) as GenerateContentResponse;
      });
      
      let foundImageUrl: string | null = null;
      if (response.candidates?.[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (foundImageUrl) { setGeneratedImg(foundImageUrl); sounds.playNeutralBlip(); }
      else { throw new Error("Forge response blocked or empty."); }
    } catch (err: any) { setApiError(err.message || "Forge Timeout. System overloaded."); }
    finally { setIsGenerating(false); }
  };

  const morphForgeImage = async () => {
    if (!forgeEditPrompt.trim() || !generatedImg) return;
    setIsMorphing(true);
    setApiError(null);
    sounds.playCommandClick();
    try {
      const imgInfo = await getProcessedImageData(generatedImg);
      const response = await withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: imgInfo?.data || '', mimeType: imgInfo?.mimeType || 'image/png' } },
              { text: `Maintain the character identity but apply this change: ${forgeEditPrompt}. Keep crude meme style with thick outlines.` }
            ]
          }
        }) as GenerateContentResponse;
      });

      let foundImageUrl: string | null = null;
      if (response.candidates?.[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      if (foundImageUrl) { setGeneratedImg(foundImageUrl); sounds.playNeutralBlip(); }
    } catch (err: any) { setApiError(err.message || "Forge Morph Failed."); } 
    finally { setIsMorphing(false); setForgeEditPrompt(''); }
  };

  const handleAddToGallery = () => { if (generatedImg && onImageGenerated) { onImageGenerated(generatedImg); sounds.playCommandClick(); } };
  const handleDownloadForge = () => { if (!generatedImg) return; sounds.playCommandClick(); const link = document.createElement('a'); link.download = `ruggeddev-forge-${Date.now()}.png`; link.href = generatedImg; link.click(); };

  return (
    <section id="chat-terminal" className="py-12 sm:py-24 bg-[#111111] border-y-2 border-[#6E6E6E]/20 relative">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <button onClick={toggleSound} className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 uppercase font-black text-[9px] sm:text-[10px] rounded-lg transition-all ${soundEnabled ? 'border-rugged-green text-rugged-green' : 'border-white/10 text-white/30'}`}>SOUND: {soundEnabled ? 'ON' : 'OFF'}</button>
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <RevealText>
            <h2 className="text-3xl sm:text-6xl font-black mb-3 tracking-tighter uppercase italic">Propaganda Terminal</h2>
            <p className="text-[#3A5F3D] font-black text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase">Intelligence & Trench Forge Pro Hub</p>
          </RevealText>
        </div>

        {apiError && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 p-4 sm:p-6 border-2 sm:border-4 border-rugged-red bg-rugged-red/10 text-white flex flex-col items-center gap-4 rounded-xl">
            <p className="font-black uppercase text-xs sm:text-sm italic text-center">SYSTEM_ERROR: {apiError}</p>
            <button onClick={handleOpenKey} className="px-5 py-2 sm:px-6 sm:py-2 bg-rugged-red text-white font-black text-[10px] sm:text-xs uppercase rounded-lg hover:brightness-110">Re-select Key</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Protocol Terminal */}
          <div className="border-2 sm:border-4 border-white/5 bg-black p-4 sm:p-10 flex flex-col h-[500px] sm:h-[850px] rounded-2xl sm:rounded-[2rem] shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-rugged-green uppercase italic tracking-widest">Protocol Intelligence</h3>
              <div className="flex gap-2">
                <button onClick={() => { setThinkingMode(!thinkingMode); sounds.playRelayClick(); }} className={`flex-1 sm:flex-none text-[8px] sm:text-[9px] font-bold px-3 py-1.5 rounded-full border transition-all ${thinkingMode ? 'bg-rugged-red border-rugged-red text-white' : 'border-white/20 text-white/40'}`}>{thinkingMode ? 'DEEP_THINK' : 'FAST_LINK'}</button>
                <button onClick={() => { setSearchGrounding(!searchGrounding); sounds.playRelayClick(); }} className={`flex-1 sm:flex-none text-[8px] sm:text-[9px] font-bold px-3 py-1.5 rounded-full border transition-all ${searchGrounding ? 'bg-rugged-green border-rugged-green text-white' : 'border-white/20 text-white/40'}`}>GROUNDING</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 sm:mb-8 space-y-4 pr-2 custom-scrollbar font-mono text-xs sm:text-sm">
              {chatHistory.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/10 font-black text-center px-4 uppercase tracking-widest leading-loose">
                  Query the Survivor Intelligence Protocol...
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-rugged-green/10 text-white border border-rugged-green/20' : 'bg-white/5 text-white/80 border border-white/10'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                        <span className="text-[8px] font-black text-rugged-green uppercase tracking-widest">Intel Sources:</span>
                        {msg.sources.map((s, idx) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-white/60 hover:text-rugged-green transition-colors truncate flex items-center gap-2">
                            <span className="text-rugged-green">[{idx + 1}]</span>
                            {s.web?.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-rugged-green font-black text-[10px] animate-pulse tracking-widest uppercase">Transmitting...</div>}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runChat()} placeholder="XMIT COMMAND..." className="flex-1 bg-[#111] border border-white/10 p-4 text-white rounded-xl focus:border-rugged-green outline-none text-sm font-mono" />
              <button onClick={runChat} className="bg-rugged-green px-6 sm:px-10 font-black text-white uppercase rounded-xl active:scale-95 text-xs sm:text-base">XMIT</button>
            </div>
          </div>

          {/* Visual Forge */}
          <div className="flex flex-col gap-8">
            <div className="border-2 sm:border-4 border-white/5 bg-black p-4 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-2xl relative">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-lg sm:text-xl font-black text-rugged-red uppercase italic tracking-widest">Trench Forge Pro</h3>
                <span className="bg-rugged-red text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Search Enabled</span>
              </div>
              
              <textarea 
                value={genPrompt} 
                onChange={(e) => setGenPrompt(e.target.value)} 
                placeholder="Describe a new scene for the RuggedDev survivor. Use real-world brands (e.g. 'holding a Phantom wallet') for grounded accuracy. Powered by the Trench Engine..." 
                className="w-full bg-[#111] border border-white/10 p-4 text-white min-h-[100px] rounded-xl mb-6 focus:border-rugged-red outline-none text-sm font-mono" 
              />
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-[#111] border border-white/10 text-white p-3 text-[10px] sm:text-xs font-bold rounded-xl outline-none">
                    <option value="1:1">1:1 Square</option>
                    <option value="3:4">3:4 Portrait</option>
                    <option value="4:3">4:3 Landscape</option>
                    <option value="9:16">9:16 Story</option>
                    <option value="16:9">16:9 Cinema</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Resolution (Pro Forge)</label>
                  <div className="flex bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                    {(['1K', '2K', '4K'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`flex-1 py-3 text-[10px] font-black transition-all ${imageSize === size ? 'bg-rugged-red text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={generateImage} disabled={isGenerating || !genPrompt.trim()} className="w-full bg-rugged-red py-4 sm:py-6 font-black text-white text-lg sm:text-xl rounded-xl active:scale-95 uppercase tracking-widest shadow-[0_10px_30px_rgba(193,39,45,0.3)]">
                  {isGenerating ? 'FORGING...' : 'INITIATE TRENCH FORGE'}
                </button>

                {generatedImg && (
                  <div className="p-4 bg-white/5 border border-rugged-green/20 rounded-xl space-y-3 animate-reveal">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rugged-green rounded-full"></div>
                      <span className="text-[10px] font-black text-rugged-green uppercase tracking-widest">Morph Protocol (v2.5)</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={forgeEditPrompt} 
                        onChange={(e) => setForgeEditPrompt(e.target.value)} 
                        placeholder="Apply changes (e.g. 'add a mask')..." 
                        className="flex-1 bg-black border border-white/10 p-3 text-white rounded-lg focus:border-rugged-green outline-none text-[11px] font-mono"
                      />
                      <button 
                        onClick={morphForgeImage} 
                        disabled={isMorphing || !forgeEditPrompt.trim()} 
                        className="bg-rugged-green px-6 font-black text-white uppercase rounded-lg active:scale-95 text-[11px]"
                      >
                        {isMorphing ? '...' : 'MORPH'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 relative rounded-2xl overflow-hidden border-2 border-white/5 aspect-square flex items-center justify-center bg-[#050505]">
                {(isGenerating || isMorphing) ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-rugged-red border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="font-black uppercase text-[10px] tracking-widest animate-pulse text-rugged-red">Syncing Trench Engine...</span>
                  </div>
                ) : generatedImg ? (
                  <div className="relative w-full h-full group">
                    <img src={generatedImg} className="w-full h-full object-contain" alt="Forged Identity" />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => onForgeToMeme(generatedImg)} className="bg-rugged-green text-white font-black px-4 py-2 uppercase text-[9px] rounded-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">USE AS BASE</button>
                       <button onClick={handleDownloadForge} className="bg-rugged-red text-white font-black px-4 py-2 uppercase text-[9px] rounded-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">DOWNLOAD</button>
                       <button onClick={handleAddToGallery} className="bg-white text-black font-black px-4 py-2 uppercase text-[9px] rounded-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">ARCHIVE</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 opacity-40">
                    <p className="uppercase text-[#3A5F3D] text-[12px] font-black tracking-widest leading-loose">Forge Grounded Propaganda</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-2 text-[#6E6E6E]">Using Trench Forge Pro with Google Search Guidance</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
