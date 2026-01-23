
import React, { useRef, useState } from 'react';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

interface IdentityInitiationProps {
  onIdentitySet: (imageUrl: string) => void;
}

export const IdentityInitiation: React.FC<IdentityInitiationProps> = ({ onIdentitySet }) => {
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
                <p className="text-[#3A5F3D] font-black text-xl uppercase tracking-[0.2em] animate-pulse mb-2">
                  Verify your visual identity
                </p>
                <p className="text-[#6E6E6E] font-medium text-lg uppercase tracking-widest leading-relaxed">
                  The trenches require a clear mask. Update your visual identity to stand with the survivors. <br/>
                  <span className="text-[#3A5F3D] font-black">Reforge your image. Become the survivor.</span>
                </p>
              </div>
              
              {!preview ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-10 py-5 bg-[#3A5F3D] text-white font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(58,95,61,0.3)] rounded-xl"
                >
                  Upload Visual
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={handleConfirm}
                    className="px-10 py-5 bg-[#3A5F3D] text-white font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(58,95,61,0.3)] rounded-xl"
                  >
                    Confirm Identity
                  </button>
                  <button 
                    onClick={() => setPreview(null)}
                    className="px-10 py-5 border-2 border-[#C1272D] text-[#C1272D] font-black text-xl uppercase tracking-widest hover:bg-[#C1272D] hover:text-white transition-all rounded-xl"
                  >
                    Abort
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
              <div className="relative w-64 h-64 border-4 border-white/10 rounded-3xl overflow-hidden bg-black shadow-2xl group cursor-pointer" onClick={() => !preview && fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="Survivor Identity Preview" className="w-full h-full object-cover animate-reveal" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#3A5F3D]">Add Character</p>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#3A5F3D] shadow-[0_0_10px_#3A5F3D] animate-[scan_4s_linear_infinite] opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
