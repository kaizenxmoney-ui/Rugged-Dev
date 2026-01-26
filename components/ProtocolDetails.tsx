import React from 'react';
import { RevealText } from './RevealText';

export const ProtocolDetails: React.FC = () => {
  const sections = [
    {
      id: '01',
      title: "Hard Cap Integrity",
      category: "ECONOMY",
      desc: "The RuggedDev protocol initiates with a strict $20 hard cap on the developer's entry. This creates absolute symmetry between the creator and the first survivors. No hidden allocations, no team-locked tokens, no privileged exits.",
      details: ["Verifiable Solana TX", "Zero Insider Bias", "Shared Risk Architecture"]
    },
    {
      id: '02',
      title: "Zero-Hype Growth",
      category: "MARKETING",
      desc: "We operate on a Zero Spend Protocol. We do not hire 'Callers', we do not buy 'Trending', and we do not pay influencers. Growth is a pure measurement of organic community energy and tool utility.",
      details: ["Community Coordination", "Word-of-Mouth Scaling", "Anti-Sybil Incentives"]
    },
    {
      id: '03',
      title: "The 30/70 Split",
      category: "REWARDS",
      desc: "Infrastructure maintenance and survivor incentives are balanced. 30% of protocol-generated value supports the servers and tool-stack, while 70% is funneled back into survivor-led initiatives and giveaways.",
      details: ["Sustainable Tooling", "Pro-Survivor Bias", "Transparent Allocation"]
    },
    {
      id: '04',
      title: "Survival Physics",
      category: "COMMUNITY",
      desc: "The protocol is designed for those who have weathered the crypto warzone. We replace the 'Team Lead' with 'Survival Coordination'. You don't follow a dev; you follow the protocol's immutable structure.",
      details: ["Decentralized Energy", "Rug-Resistant Socials", "Survivor Consensus"]
    }
  ];

  return (
    <section id="protocol-details" className="py-24 sm:py-32 bg-[#0d0d0d] border-y-2 border-white/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 chart-grid opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <RevealText direction="left">
              <span className="text-rugged-green font-black text-xs tracking-[0.4em] uppercase mb-4 block">Operation: RuggedDev</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
                Protocol <br/> <span className="text-rugged-green">Operations</span>
              </h2>
            </RevealText>
            <RevealText direction="up" delay={200}>
              <p className="text-[#6E6E6E] text-xl font-medium leading-relaxed uppercase tracking-tight">
                A detailed tactical breakdown of the most symmetric experiment in the Solana ecosystem. 
                Built by survivors, for survivors.
              </p>
            </RevealText>
          </div>
          
          <RevealText direction="scale" className="hidden lg:block">
            <div className="p-6 border-2 border-rugged-green/20 rounded-2xl bg-black rotate-3 shadow-2xl">
               <div className="text-[10px] font-black text-white/30 uppercase mb-2">STATUS: SYSTEM_OPTIMIZED</div>
               <div className="w-32 h-1 bg-rugged-green/40 rounded-full">
                  <div className="w-2/3 h-full bg-rugged-green animate-pulse"></div>
               </div>
            </div>
          </RevealText>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {sections.map((item, i) => (
            <RevealText key={item.id} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 100}>
              <div className="group h-full flex flex-col p-1 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] hover:from-rugged-green/20 transition-all duration-700">
                <div className="flex-1 bg-black p-8 sm:p-12 rounded-[2.4rem] border border-white/5 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-10 right-10 text-6xl font-black text-white/[0.03] pointer-events-none group-hover:text-rugged-green/[0.05] transition-colors">
                    {item.id}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-rugged-green/10 border border-rugged-green/20 rounded text-[9px] font-black text-rugged-green uppercase tracking-widest">
                      {item.category}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-6 uppercase italic tracking-tighter group-hover:text-rugged-green transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-[#6E6E6E] text-lg leading-relaxed mb-10 font-medium">
                    {item.desc}
                  </p>

                  <div className="mt-auto space-y-4">
                    {item.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/item">
                        <div className="w-2 h-2 rounded-full border border-rugged-green group-hover/item:bg-rugged-green transition-all"></div>
                        <span className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest group-hover/item:text-white transition-colors">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealText>
          ))}
        </div>

        <RevealText direction="up" delay={600} className="mt-20">
          <div className="border-4 border-dashed border-white/5 p-10 rounded-[3rem] bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-white font-black text-2xl uppercase italic mb-2">Immutable Survival</h4>
              <p className="text-[#6E6E6E] text-sm font-bold uppercase tracking-widest">The code is deployment-locked. The principles are survival-hardened.</p>
            </div>
            <div className="flex gap-4">
               <div className="flex flex-col items-center">
                  <span className="text-rugged-green text-3xl font-black italic">$20</span>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">DEV_CAP</span>
               </div>
               <div className="w-[1px] h-12 bg-white/5"></div>
               <div className="flex flex-col items-center">
                  <span className="text-white text-3xl font-black italic">0%</span>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">PAID_HYPE</span>
               </div>
               <div className="w-[1px] h-12 bg-white/5"></div>
               <div className="flex flex-col items-center">
                  <span className="text-rugged-red text-3xl font-black italic">∞</span>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">RESILIENCE</span>
               </div>
            </div>
          </div>
        </RevealText>
      </div>
    </section>
  );
};
