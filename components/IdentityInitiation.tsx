
import React, { useRef, useState, useEffect } from 'react';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';
import { FALLBACK_IMAGE } from '../constants';

interface IdentityInitiationProps {
  onIdentitySet: (imageUrl: string) => void;
  currentIdentity: string;
}

export const IdentityInitiation: React.FC<IdentityInitiationProps> = ({ onIdentitySet, currentIdentity }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
        sounds.playNeutralBlip();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onIdentitySet(preview);
      sounds.playCommandClick();
      setPreview(null);
    }
  };

  // Ensure displayImage always has a value (either preview, current, or fallback)
  const displayImage = preview || currentIdentity || FALLBACK_IMAGE;
  const isConfirmed = currentIdentity && currentIdentity !== FALLBACK_IMAGE;
  const isEmpty = !isConfirmed && !preview;

  return (
    <section className="py-20 bg-black border-y border-[#3A5F3D]/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="border-4 border-dashed border-[#3A5F3D]/40 p-8 md:p-12 rounded-[2rem] bg-[#3A5F3D]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3A5F3D]/40 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <RevealText>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Survivor Verification</h2>
              </RevealText>
              
              <div className="mb-6">
                <p className={`font-black text-xl uppercase tracking-[0.2em] mb-2 ${isConfirmed && !preview ? 'text-rugged-green animate-pulse' : 'text-rugged-red animate-pulse'}`}>
                  {isConfirmed && !preview ? 'Identity Verified' : 'AWAITING_BIOMETRIC_DATA'}
                </p>
                <p className="text-[#6E6E6E] font-medium text-lg uppercase tracking-widest leading-relaxed">
                  {isConfirmed && !preview 
                    ? 'Your visual record is logged in the trench protocol. You can re-forge your image at any time.'
                    : 'The trenches require a clear mask. Update your visual identity to stand with the survivors.'}
                </p>
              </div>
              
              {!preview ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-10 py-5 bg-[#3A5F3D] text-white font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(58,95,61,0.3)] rounded-xl"
                >
                  {isConfirmed ? 'RE-FORGE IDENTITY' : 'INITIATE UPLOAD'}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={handleConfirm}
                    className="px-10 py-5 bg-[#3A5F3D] text-white font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(58,95,61,0.3)] rounded-xl"
                  >
                    CONFIRM NEW MASK
                  </button>
                  <button 
                    onClick={() => setPreview(null)}
                    className="px-10 py-5 border-2 border-[#C1272D] text-[#C1272D] font-black text-xl uppercase tracking-widest hover:bg-[#C1272D] hover:text-white transition-all rounded-xl"
                  >
                    ABORT
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="w-full md:w-1/3 flex justify-center">
              <div 
                className="relative w-64 h-64 border-4 border-white/10 rounded-3xl overflow-hidden bg-black shadow-2xl group cursor-pointer transition-all hover:border-rugged-green/50" 
                onClick={() => !preview && fileInputRef.current?.click()}
              >
                <img 
                  src={displayImage} 
                  alt="Survivor Identity" 
                  className={`w-full h-full object-cover transition-all duration-700 ${preview ? 'animate-reveal' : isEmpty ? 'opacity-30 grayscale blur-sm' : 'opacity-100'}`} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                
                {/* Tactical Scan Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
                
                {isEmpty && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    {/* Targeting Reticle */}
                    <div className="absolute inset-10 border-2 border-rugged-green/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-12 border border-dashed border-rugged-green/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    
                    {/* Corner Brackets */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-rugged-green animate-pulse"></div>
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-rugged-green animate-pulse"></div>
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-rugged-green animate-pulse"></div>
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-rugged-green animate-pulse"></div>
                    
                    <div className="z-10 text-center">
                      <p className="text-rugged-green font-black text-[10px] tracking-[0.3em] uppercase mb-1 drop-shadow-md">No_Data_Detected</p>
                      <div className="h-[2px] w-20 bg-rugged-green/30 mx-auto animate-pulse"></div>
                      <p className="text-white/40 font-mono text-[8px] uppercase mt-2 tracking-widest">Scanning_Visual_Planes...</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#3A5F3D] shadow-[0_0_10px_#3A5F3D] animate-[scan_4s_linear_infinite] opacity-30"></div>
                
                {/* Confirmation Glow */}
                {isConfirmed && !preview && (
                  <div className="absolute inset-0 border-8 border-rugged-green/20 animate-pulse pointer-events-none"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
