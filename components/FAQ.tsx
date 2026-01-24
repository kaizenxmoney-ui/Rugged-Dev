import React, { useState } from 'react';
import { RevealText } from './RevealText';
import { sounds } from '../utils/sounds';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Does the dev hold hidden wallets?", a: "No. The $20 launch entry is verifiable. There are no secondary allocations or hidden team tokens. The creator is a participant, not a ruler." },
    { q: "How is growth possible without marketing?", a: "Coordination. We provide the Visual Forge and Propaganda Lab. Growth is an organic measurement of survivor energy, not a dev's budget." },
    { q: "Is this financial advice?", a: "No. RuggedDev is an experiment in structural integrity. It is high risk, high transparency, and built for those who understand the reality of the trench." },
    { q: "How does the protocol support itself?", a: "The 30/70 protocol. 30% of tool-generated rewards support infrastructure maintenance. There are zero taxes on token transactions." },
  ];

  const toggle = (index: number) => {
    const isOpening = openIndex !== index;
    setOpenIndex(isOpening ? index : null);
    sounds.playExpand(isOpening);
  };

  return (
    <section className="relative py-24 bg-[#111111] border-t-2 border-[#6E6E6E]/10 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 max-w-3xl">
        <RevealText className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tighter uppercase italic">Survivor Intel</h2>
          <p className="text-[#6E6E6E] font-bold mt-2 uppercase tracking-widest text-sm">Clearance for verified trench knowledge</p>
        </RevealText>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <RevealText key={i}>
              <div 
                className={`group border-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-xl ${
                  openIndex === i 
                    ? 'border-[#3A5F3D] bg-black shadow-[0_0_30px_rgba(58,95,61,0.15)]' 
                    : 'border-[#6E6E6E]/20 bg-black/40 hover:border-[#6E6E6E]/40'
                }`}
                onClick={() => toggle(i)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h3 className={`text-xl font-black transition-all duration-300 uppercase italic ${
                    openIndex === i ? 'text-[#3A5F3D]' : 'text-white'
                  }`}>
                    {faq.q}
                  </h3>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${
                    openIndex === i ? 'border-[#3A5F3D] rotate-180 bg-[#3A5F3D]/10' : 'border-[#6E6E6E]/30'
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={openIndex === i ? '#3A5F3D' : '#6E6E6E'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    openIndex === i ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-8 text-[#F2F2F2]/80 leading-relaxed border-t border-[#6E6E6E]/5 pt-6 relative">
                    <div className="absolute left-6 top-6 bottom-8 w-1 bg-[#3A5F3D]/20 rounded-full"></div>
                    <div className="pl-6 font-bold">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
};