
import React, { useState } from 'react';
import { TOKEN_INFO } from '../constants';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

export const Tokenomics: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const contractAddress = "11111111111111111111111111111111111";

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#111111] border-t-2 border-[#6E6E6E]/10">
      <div className="container mx-auto px-4">
        <RevealText className="text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-10 sm:mb-16 tracking-tighter uppercase italic">Survivor Protocol</h2>
        </RevealText>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Object.entries(TOKEN_INFO).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-4 sm:p-6 border border-[#6E6E6E]/20 bg-black hover:border-[#3A5F3D] transition-colors rounded-xl">
              <span className="text-[10px] sm:text-xs font-bold text-[#6E6E6E] uppercase tracking-widest">{key.replace('_', ' ')}</span>
              <span className="text-base sm:text-xl font-black text-[#F2F2F2] uppercase text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto text-center p-6 sm:p-10 bg-white/5 border border-dashed border-white/10 rounded-2xl sm:rounded-3xl">
           <h3 className="text-white font-black text-2xl sm:text-3xl mb-4 sm:mb-6 uppercase tracking-tighter italic">Statement of Intent</h3>
           <div className="space-y-4 text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              <p>RuggedDev is an origin, not a guarantee. We make no promise of success or profit. Our only commitment is to structural integrity.</p>
              <p className="text-white font-black text-lg sm:text-xl uppercase tracking-tighter">Survivor Experiment</p>
              <p>A coordination-led experiment in incentive physics. No dev leverage, no paid hype, no exit-liquidity. Only the protocol survives.</p>
           </div>
        </div>
        
        <div className="mt-16 sm:mt-24 flex flex-col items-center w-full">
          <div className="group relative flex flex-col sm:flex-row items-center gap-4 bg-black border-2 border-[#3A5F3D]/30 p-4 sm:p-6 rounded-2xl hover:border-[#3A5F3D] transition-all w-full max-w-2xl">
            <div className="flex flex-col w-full text-center sm:text-left overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-black text-[#3A5F3D] uppercase tracking-[0.2em] mb-1">Survivor Contract Address</span>
              <p className="text-[#3A5F3D] font-black text-sm sm:text-2xl font-mono tracking-tight animate-pulse break-all">
                {contractAddress}
              </p>
            </div>
            
            <button 
              onClick={handleCopy}
              className={`w-full sm:w-auto flex-shrink-0 p-3 sm:p-4 border-2 transition-all flex items-center justify-center min-w-[80px] sm:min-w-[100px] rounded-xl ${
                copied 
                  ? 'bg-[#3A5F3D] border-[#3A5F3D] text-white' 
                  : 'bg-transparent border-[#3A5F3D] text-[#3A5F3D] hover:bg-[#3A5F3D] hover:text-white'
              }`}
            >
              {copied ? (
                <span className="text-[10px] font-black uppercase">Copied</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
          <p className="mt-4 text-[9px] font-bold text-[#6E6E6E] uppercase tracking-[0.3em] opacity-50 italic">Verified for Trench Combat</p>
        </div>
      </div>
    </section>
  );
};
