
import React from 'react';
import { RevealText } from './RevealText';

export const Community: React.FC = () => {
  const links = [
    { name: 'X / TWITTER', url: 'https://x.com/RuggedDevSol', color: '#3A5F3D' },
    { name: 'PUMP.FUN', url: 'https://pump.fun/coin/2Z2d9kY4F8L7GJAEdv7n7zWBDGmgvrefWJjFVxzzpump', color: '#C1272D' },
    { name: 'DEX SCREENER', url: 'https://dexscreener.com/solana/fw4oz2cllajre35dsglcudxwnsarm25pemvi16og3f7m', color: '#6E6E6E' },
    { name: 'DEX TOOLS', url: 'https://www.dextools.io/app/solana/pair-explorer/2Z2d9kY4F8L7GJAEdv7n7zWBDGmgvrefWJjFVxzzpump', color: '#6E6E6E' },
  ];

  return (
    <section className="py-24 bg-[#111111]">
      <div className="container mx-auto px-4 text-center">
        <RevealText>
          <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase italic">Survivor Coordination</h2>
          <p className="text-[#6E6E6E] text-lg font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            RuggedDev does not buy hype. We build coordination. <br className="hidden md:block" />
            Instead of paying insiders, we empower survivors to be the protocol's voice.
          </p>
        </RevealText>

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto text-left">
           <div className="p-8 border-2 border-white/5 bg-white/5 rounded-3xl">
              <h3 className="text-white font-black text-xl mb-4 uppercase italic">Survivor Toolkit</h3>
              <p className="text-[#6E6E6E] text-sm leading-relaxed mb-6">
                To enable organic coordination, we provide the tools for survivors to define the narrative:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-rugged-green rounded-full"></div>
                  Survivor Visual Forge
                </li>
                <li className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-rugged-green rounded-full"></div>
                  Propaganda Lab (Meme Suite)
                </li>
              </ul>
           </div>
           <div className="p-8 border-2 border-white/5 bg-white/5 rounded-3xl flex flex-col justify-center">
              <p className="text-white font-black text-2xl uppercase tracking-tighter italic mb-4">
                "Survival is an organic state. It cannot be purchased."
              </p>
              <div className="flex gap-4">
                <span className="text-[10px] font-black text-[#6E6E6E] uppercase tracking-[0.3em]">Truth</span>
                <span className="text-[10px] font-black text-[#6E6E6E] uppercase tracking-[0.3em]">Structure</span>
                <span className="text-[10px] font-black text-[#6E6E6E] uppercase tracking-[0.3em]">Energy</span>
              </div>
           </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderColor: link.color }}
              className="py-10 border-4 bg-black text-white font-black text-2xl hover:scale-105 transition-all flex items-center justify-center hover:bg-white/5 rounded-2xl"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
