
import React from 'react';
import { RevealText } from './RevealText';

export const Transparency: React.FC = () => {
  return (
    <section className="py-24 bg-[#111111]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto border-4 border-[#3A5F3D] p-8 md:p-12 relative overflow-hidden bg-[#3A5F3D]/5 rounded-3xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#F2F2F2" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          
          <RevealText className="text-center">
            <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Survival Protocol</h2>
            <p className="text-[#3A5F3D] font-bold mb-12 uppercase tracking-widest text-sm italic">Engineered for Radical Transparency</p>
          </RevealText>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-black border-2 border-rugged-green rounded-xl">
              <h3 className="text-xl font-black mb-2 text-white uppercase tracking-tighter">I. Absolute Parity</h3>
              <p className="text-[#6E6E6E] font-medium leading-relaxed">The dev wallet was limited to a $20 entry at launch. No presales, no insiders, no hidden allocations. The creator's risk is identical to that of any other survivor.</p>
            </div>
            <div className="p-6 bg-black border-2 border-rugged-green rounded-xl">
              <h3 className="text-xl font-black mb-2 text-white uppercase tracking-tighter">II. Zero Spend Rule</h3>
              <p className="text-[#6E6E6E] font-medium leading-relaxed">Zero marketing budget. Zero paid influencers. Zero advertisements. Growth is a pure measurement of community energy, not a dev's bank account.</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-black/40 border border-[#3A5F3D]/30 rounded-2xl">
            <h3 className="text-[#3A5F3D] font-black text-xl mb-4 uppercase tracking-tighter italic text-center">Incentive Split: The 30/70 Protocol</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-white font-black text-3xl mb-1 italic">30%</p>
                <p className="text-[10px] text-[#6E6E6E] font-bold uppercase tracking-widest">Protocol Support</p>
                <p className="text-[9px] mt-2 text-[#6E6E6E]/60 italic leading-tight">Reserved for operational maintenance and baseline infrastructure support for the tools.</p>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-6">
                <p className="text-rugged-green font-black text-3xl mb-1 italic">70%</p>
                <p className="text-[10px] text-[#6E6E6E] font-bold uppercase tracking-widest">Survivor Coordination</p>
                <p className="text-[9px] mt-2 text-[#6E6E6E]/60 italic leading-tight">Directly allocated to survivor incentives, community giveaways, and ecosystem growth.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-xs font-medium text-[#6E6E6E] leading-relaxed italic uppercase tracking-widest">
              "There are no hidden taxes or backdoor mechanics. Every operational cost is stated openly."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
