
import React, { useState } from 'react';
import { RevealText } from './RevealText';
import { OFFICIAL_STORY_IMAGE } from '../constants';

export const Story: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-32 bg-[#0a0a0a] border-y-2 border-[#C1272D]/20 overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-rugged-red/[0.03] to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          <RevealText direction="left" className="flex-1 order-2 lg:order-1 relative w-full flex justify-center">
            <div 
              className="relative group w-full max-w-lg"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Permanent Visual Record Frame */}
              <div className="relative p-6 pb-24 bg-[#F2F2F2] shadow-[0_50px_100px_rgba(0,0,0,0.9)] rotate-[-3deg] transition-all duration-700 group-hover:rotate-0 group-hover:scale-[1.02] border border-black/10 rounded-sm overflow-hidden text-black">
                <div className="flex justify-between items-center mb-6 px-2 text-black/40 font-mono text-[10px] uppercase font-black">
                   <span>ID: ORIGIN_UNIT</span>
                   <span>LOC: MAIN_STORY</span>
                </div>

                <div className="relative aspect-square w-full shadow-inner bg-neutral-900 rounded-sm overflow-hidden flex items-center justify-center border-4 border-black/5">
                  <img 
                    key="permanent-mascot-img-v1"
                    src={OFFICIAL_STORY_IMAGE} 
                    alt="Survivor Mascot" 
                    className="w-full h-full object-cover grayscale brightness-75 transition-all duration-1000 group-hover:grayscale-0 group-hover:brightness-100"
                    loading="eager"
                    decoding="sync"
                    onError={(e) => {
                      // Forced refresh to GitHub raw if it fails
                      const target = e.target as HTMLImageElement;
                      if (target.src !== OFFICIAL_STORY_IMAGE) {
                        target.src = OFFICIAL_STORY_IMAGE;
                      }
                    }}
                  />
                  
                  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-[#3A5F3D]/10"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#3A5F3D] shadow-[0_0_20px_#3A5F3D] animate-[scan_3s_linear_infinite]"></div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
                     <div className="border-4 border-rugged-red text-rugged-red px-3 py-1 font-black uppercase text-xs rotate-[-12deg] bg-white shadow-xl">OFFICIAL MASCOT</div>
                     <div className="border-4 border-rugged-red text-rugged-red px-3 py-1 font-black uppercase text-xs rotate-[8deg] bg-white shadow-xl">THE SURVIVOR</div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-0 w-full px-10 flex flex-col gap-2 text-black/80 font-mono">
                  <div className="flex justify-between items-center border-b border-black/10 pb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">FILE:</span>
                    <span className="text-[9px] font-bold">STORY_PROFILE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">STATUS:</span>
                    <span className="text-[9px] font-black uppercase text-rugged-green">PERMANENT_RECORD</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealText>

          <div className="flex-1 order-1 lg:order-2 space-y-12">
            <div className="space-y-4">
              <RevealText direction="right" className="flex items-center gap-4">
                <span className="w-16 h-[2px] bg-rugged-red"></span>
                <span className="font-mono text-rugged-red font-black text-xs tracking-[0.4em] uppercase">The Survivor Chronicles</span>
              </RevealText>
              <RevealText direction="right" delay={100}>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white italic uppercase">
                  Legacy of <br/> 
                  <span className="text-rugged-green not-italic">Integrity</span>
                </h2>
              </RevealText>
            </div>
            
            <div className="space-y-10 text-xl md:text-2xl leading-relaxed text-[#F2F2F2]/70 font-medium">
              <RevealText direction="up" delay={200} className="relative pl-10 border-l-4 border-rugged-gray/20">
                <p>
                  This character is not just a meme; it is a <span className="text-white font-black underline decoration-rugged-red decoration-4 underline-offset-8">symbol of endurance.</span>
                </p>
              </RevealText>
              
              <RevealText direction="up" delay={300}>
                <p>
                  While others chase shadows and paid hype, the RuggedDev survivor stands grounded in reality. The exhaustion in the eyes is earned—it's the look of someone who has seen every rug and still refuses to quit.
                </p>
              </RevealText>

              <RevealText direction="up" delay={400}>
                <p>
                  By hardcoding our origin, we ensure the protocol is never forgotten. This visual identity is locked into the core of $RDEV. It represents the symmetry we seek to restore to the trenches.
                </p>
              </RevealText>

              <RevealText direction="scale" delay={500} className="pt-10 flex flex-col gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 font-mono text-[11px] md:text-xs text-rugged-gray uppercase tracking-widest leading-loose">
                  [ INTEL ] <br/>
                  "A MASCOT THAT DOESN'T HIDE BEHIND GLAMOUR REFLECTS A TOKEN THAT DOESN'T HIDE BEHIND DECEPTION."
                </div>
              </RevealText>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};