
import React, { useState, useMemo } from 'react';
import { sounds } from '../utils/sounds';
import { FALLBACK_IMAGE } from '../constants';
import { RevealText } from './RevealText';

interface HeroProps {
  baseImage: string;
  onTriggerEasterEgg?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ baseImage, onTriggerEasterEgg }) => {
  const [isRugging, setIsRugging] = useState(false);
  const [imgSrc, setImgSrc] = useState(baseImage);
  const [clickCount, setClickCount] = useState(0);
  const contractAddress = "2Z2d9kY4F8L7GJAEdv7n7zWBDGmgvrefWJjFVxzzpump";

  React.useEffect(() => {
    setImgSrc(baseImage);
  }, [baseImage]);

  const triggerRug = () => {
    if (isRugging) return;
    setIsRugging(true);
    sounds.playRug();
    setTimeout(() => setIsRugging(false), 2000);
  };

  const handleImageClick = () => {
    sounds.playClick();
    const newCount = clickCount + 1;
    if (newCount >= 7) {
      setClickCount(0);
      onTriggerEasterEgg?.();
    } else {
      setClickCount(newCount);
    }
  };

  const handleBuyClick = () => {
    sounds.playClick();
    window.open(`https://pump.fun/coin/${contractAddress}`, '_blank');
  };

  const candles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const layer = i % 3;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 40}s`,
        duration: layer === 0 ? `${25 + Math.random() * 15}s` : layer === 1 ? `${15 + Math.random() * 10}s` : `${8 + Math.random() * 7}s`,
        height: layer === 0 ? `${20 + Math.random() * 40}px` : layer === 1 ? `${50 + Math.random() * 80}px` : `${100 + Math.random() * 120}px`,
        width: layer === 0 ? '1px' : layer === 1 ? '2px' : '3px',
        wickHeight: layer === 0 ? '40px' : '100px',
        opacity: layer === 0 ? 0.05 : layer === 1 ? 0.1 : 0.15,
        blur: layer === 0 ? 'blur(2px)' : 'none',
        zIndex: layer === 0 ? 0 : layer === 1 ? 1 : 2,
        jitter: Math.random() > 0.9 ? 'animate-pulse' : '',
      };
    });
  }, []);

  return (
    <section className={`relative min-h-screen flex flex-col items-center justify-center pt-16 sm:pt-24 pb-8 sm:pb-12 px-2 sm:px-6 overflow-hidden bg-black transition-colors duration-500 ${isRugging ? 'bg-[#C1272D]/5' : 'bg-black'}`}>
      
      <div className="absolute inset-0 z-0 chart-grid pointer-events-none select-none opacity-10 sm:opacity-20"></div>
      
      <div className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden transition-transform duration-1000 ${isRugging ? 'scale-110 sm:scale-125' : 'scale-100'}`}>
        {candles.map((candle) => (
          <div
            key={candle.id}
            className={`absolute flex flex-col items-center will-change-transform ${candle.jitter}`}
            style={{
              left: candle.left,
              animation: `fallingCandle ${isRugging ? '1.5s' : candle.duration} linear infinite`,
              animationDelay: isRugging ? '0s' : candle.delay,
              top: '-500px',
              opacity: candle.opacity,
              filter: candle.blur,
              zIndex: candle.zIndex,
            }}
          >
            <div className="w-[1px] bg-[#C1272D]" style={{ height: candle.wickHeight }} />
            <div className="bg-[#C1272D] rounded-sm shadow-[0_0_10px_rgba(193,39,45,0.3)]" style={{ height: isRugging ? '800px' : candle.height, width: candle.width }} />
            <div className="w-[1px] bg-[#C1272D]" style={{ height: candle.wickHeight }} />
          </div>
        ))}
      </div>

      <div className={`z-10 container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-24 max-w-7xl ${isRugging ? 'animate-shake' : ''}`}>
        
        <div className="flex-1 text-center lg:text-left z-20 w-full px-2 sm:px-0">
          <RevealText direction="down" delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-black border border-[#3A5F3D]/40 rounded-full mb-4 sm:mb-8 backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-rugged-green rounded-full animate-pulse"></div>
              <span className="text-[7px] sm:text-xs font-black text-[#3A5F3D] tracking-[0.1em] sm:tracking-[0.2em] uppercase whitespace-nowrap">Fairness over hype.</span>
            </div>
          </RevealText>
          
          <div className="relative mb-3 sm:mb-6 group inline-block">
            <RevealText direction="left" delay={200}>
              <h1 className="text-4xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-[0.85] uppercase transition-all">
                Rugged<br/>Dev
              </h1>
            </RevealText>
            <div className="absolute -right-3 -top-1 sm:-right-12 sm:-top-4 bg-rugged-red text-white text-[6px] sm:text-[10px] font-black px-1 py-0.5 rotate-12 group-hover:rotate-0 transition-transform">THE ORIGIN</div>
          </div>
          
          <RevealText direction="up" delay={400}>
            <h2 className="text-xl sm:text-4xl lg:text-6xl font-black text-[#3A5F3D] mb-4 sm:mb-10 tracking-tight flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
               <span className="opacity-40 font-mono">$</span>RDEV
               <span className="h-[1px] sm:h-[2px] w-8 sm:w-20 bg-rugged-green/20"></span>
            </h2>
          </RevealText>
          
          <div className="space-y-3 sm:space-y-6 mb-6 sm:mb-12 max-w-xl mx-auto lg:mx-0">
            <RevealText direction="left" delay={500}>
              <p className="text-base sm:text-3xl font-black text-white italic uppercase tracking-tighter border-l-2 sm:border-l-4 border-rugged-red pl-3 sm:pl-6">Survival Protocol</p>
            </RevealText>
            <div className="flex flex-col gap-2 sm:gap-4 pl-4 sm:pl-10 text-left">
              <RevealText direction="up" delay={600}>
                <div className="flex items-start gap-2 sm:gap-4">
                  <span className="text-rugged-red font-mono font-bold pt-0.5 text-[10px] sm:text-sm">01/</span>
                  <p className="text-[10px] sm:text-xl font-bold text-[#F2F2F2]/90 uppercase leading-tight">Dev held exactly $20 at launch. No hidden bias.</p>
                </div>
              </RevealText>
              <RevealText direction="up" delay={700}>
                <div className="flex items-start gap-2 sm:gap-4">
                  <span className="text-rugged-red font-mono font-bold pt-0.5 text-[10px] sm:text-sm">02/</span>
                  <p className="text-[10px] sm:text-xl font-bold text-[#F2F2F2]/90 uppercase leading-tight">Zero marketing spend. Pure community coordination.</p>
                </div>
              </RevealText>
            </div>
            <RevealText direction="scale" delay={800}>
              <div className="mt-4 sm:mt-8 p-3 sm:p-6 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <p className="text-[9px] sm:text-base text-white/80 leading-relaxed italic">
                  RuggedDev is for the survivors. If you have been rugged and didn’t quit, you are already part of the protocol. We provide the tools; you provide the energy.
                </p>
              </div>
            </RevealText>
          </div>

          <RevealText direction="up" delay={900}>
            <div className="flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-3 mb-6 sm:mb-12">
              {['Fair Launch', 'No Insiders'].map((tag) => (
                <div key={tag} className="px-2 py-1 sm:px-5 sm:py-2 border border-white/5 bg-white/5 text-[7px] sm:text-[11px] font-black uppercase tracking-widest text-white/40">
                  {tag}
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText direction="up" delay={1000}>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 justify-center lg:justify-start items-center w-full">
              <button 
                onClick={handleBuyClick} 
                className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-6 bg-[#3A5F3D] text-white font-black text-base sm:text-xl shadow-2xl transition-all"
              >
                 <span className="relative z-10 uppercase tracking-[0.1em]">BUY ON PUMP.FUN</span>
              </button>
              <button onClick={triggerRug} className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-6 border-2 sm:border-4 border-[#C1272D] text-[#C1272D] font-black text-base sm:text-xl transition-all hover:bg-[#C1272D] hover:text-white active:scale-95 group overflow-hidden">
                <span className="relative z-10 uppercase">{isRugging ? 'DUMPING...' : 'Simulate Rugged'}</span>
              </button>
            </div>
          </RevealText>
        </div>

        <RevealText direction="scale" delay={300} className="flex-1 relative w-full flex justify-center items-center py-4 sm:py-10">
          <div className="absolute -inset-5 sm:-inset-20 bg-[#C1272D]/5 blur-[40px] sm:blur-[120px] rounded-full animate-pulse"></div>
          <div onClick={handleImageClick} className="relative w-full max-w-[240px] sm:max-w-xl aspect-square bg-[#0d0d0d] border border-white/5 rounded-xl sm:rounded-[3rem] overflow-hidden shadow-2xl float-shadow group cursor-pointer active:scale-95 transition-transform">
            <img src={imgSrc} alt="" className={`w-full h-full object-cover transition-all duration-700 ${isRugging ? 'scale-110 brightness-125 contrast-125' : 'brightness-100 group-hover:scale-105'} ${imgSrc === FALLBACK_IMAGE ? 'opacity-0' : 'opacity-100'}`} onError={() => { if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE); }} />

            {imgSrc === FALLBACK_IMAGE && !isRugging && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#3A5F3D] font-black text-[10px] sm:text-2xl uppercase tracking-[0.4em] opacity-40 group-hover:opacity-80 transition-opacity">Awaiting Subject</p>
              </div>
            )}

            {clickCount > 0 && <div className="absolute top-4 right-4 sm:top-10 sm:right-10 z-40 bg-rugged-red text-white font-black px-2 py-0.5 sm:px-5 sm:py-2 rounded-full text-base sm:text-2xl animate-bounce shadow-2xl border sm:border-4 border-white">{clickCount}</div>}
            {isRugging && <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-30 backdrop-blur-[2px]"><span className="text-3xl sm:text-9xl font-black text-rugged-red -rotate-12 drop-shadow-[0_0_20px_rgba(193,39,45,1)] animate-reveal uppercase">Rugged!</span></div>}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
          </div>
        </RevealText>
      </div>
    </section>
  );
};
