
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-black border-t-2 border-[#6E6E6E]/10">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tighter text-[#6E6E6E] uppercase italic">RuggedDev</h2>
          <p className="text-[#3A5F3D] font-bold">$RDEV // SURVIVOR ORIGIN</p>
        </div>
        
        <p className="text-sm text-[#6E6E6E] max-w-2xl mx-auto uppercase tracking-widest leading-loose font-medium">
          RuggedDev is a decentralized financial experiment. <br className="hidden md:block" />
          No success promised. Only integrity verified.
        </p>
        
        <div className="mt-8 text-[10px] text-[#6E6E6E] font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} RuggedDev Protocol // SOLANA // PUMP.FUN
        </div>
      </div>
    </footer>
  );
};
