
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/sounds';

interface SecretGameProps {
  isOpen: boolean;
  onClose: () => void;
  playerImage: string;
}

interface Candle {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export const SecretGame: React.FC<SecretGameProps> = ({ isOpen, onClose, playerImage }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [displayScore, setDisplayScore] = useState(0);
  
  // Use refs for game state to keep the loop stable and performant
  const scoreRef = useRef(0);
  const targetPlayerX = useRef(50); 
  const currentPlayerX = useRef(50);
  const lastX = useRef(50);
  const velocityX = useRef(0);
  const [visualPlayerX, setVisualPlayerX] = useState(50);
  const [visualVelocity, setVisualVelocity] = useState(0);

  const [candles, setCandles] = useState<Candle[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastCandleRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    scoreRef.current = 0;
    setDisplayScore(0);
    targetPlayerX.current = 50;
    currentPlayerX.current = 50;
    lastX.current = 50;
    velocityX.current = 0;
    setVisualPlayerX(50);
    setVisualVelocity(0);
    setCandles([]);
    setGameState('playing');
    sounds.playClick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    targetPlayerX.current = Math.max(5, Math.min(95, x));
  };

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    // Smooth movement logic
    const lerpFactor = 0.25; 
    currentPlayerX.current += (targetPlayerX.current - currentPlayerX.current) * lerpFactor;
    
    // Calculate tilt based on movement speed
    velocityX.current = (currentPlayerX.current - lastX.current) * 2.5;
    lastX.current = currentPlayerX.current;
    
    // Update visual states
    setVisualPlayerX(currentPlayerX.current);
    setVisualVelocity(velocityX.current);

    setCandles(prev => {
      const now = Date.now();
      let next = [...prev];

      // Spawn candles based on current score
      const spawnRate = Math.max(150, 800 - scoreRef.current * 12);
      if (now - lastCandleRef.current > spawnRate) {
        next.push({
          id: now,
          x: Math.random() * 90 + 5,
          y: -10,
          speed: 1.5 + (scoreRef.current / 25)
        });
        lastCandleRef.current = now;
      }

      // Update and filter candles
      next = next.map(c => ({ ...c, y: c.y + c.speed })).filter(c => {
        const hitX = Math.abs(c.x - currentPlayerX.current);
        const hitY = c.y;
        
        const isMobile = window.innerWidth < 640;
        const widthThreshold = isMobile ? 12 : 8;
        const bottomThreshold = isMobile ? 75 : 80;

        // Collision detection
        if (hitY > bottomThreshold && hitY < 95 && hitX < widthThreshold) {
          setGameState('gameover');
          sounds.playRug();
          return false;
        }
        
        // Scoring
        if (c.y >= 105) {
          scoreRef.current += 1;
          setDisplayScore(scoreRef.current);
          return false;
        }
        return true;
      });

      return next;
    });

    gameLoopRef.current = requestAnimationFrame(update);
  }, [gameState]); // Only depend on gameState to avoid loop restarts

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(update);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, update]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 font-mono overflow-hidden">
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-[3/4] sm:aspect-video bg-[#050505] border-2 sm:border-4 border-[#3A5F3D] overflow-hidden cursor-crosshair shadow-[0_0_150px_rgba(58,95,61,0.3)] rounded-3xl sm:rounded-[2.5rem] touch-none"
        onPointerMove={handlePointerMove}
      >
        {/* HUD */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex flex-col gap-1 sm:gap-2 pointer-events-none">
          <div className="text-rugged-green font-black text-xl sm:text-3xl lg:text-4xl tracking-tighter uppercase italic leading-none animate-reveal">
            SURVIVED: {displayScore}
          </div>
          <div className="w-24 sm:w-48 h-1.5 sm:h-2 bg-rugged-green/20 mt-1 sm:mt-1 rounded-full overflow-hidden border border-white/5">
             <div className="h-full bg-rugged-green shadow-[0_0_15px_#3A5F3D] transition-all duration-300" style={{ width: `${Math.min(100, displayScore * 1.5)}%` }}></div>
          </div>
        </div>

        {gameState === 'start' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-center p-6 sm:p-10 backdrop-blur-md animate-reveal">
            <div className="mb-4 sm:mb-6 w-24 h-24 sm:w-32 lg:w-40 sm:h-32 lg:h-40 border-2 sm:border-4 border-rugged-green rounded-full p-2 sm:p-3 flex items-center justify-center animate-pulse-glitch shadow-[0_0_60px_rgba(58,95,61,0.4)] bg-black/40">
                <img src={playerImage} className="w-full h-full object-contain drop-shadow-2xl" alt="Identity Preview" />
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-2 italic tracking-tighter uppercase leading-tight sm:leading-none">Rug-Dodge</h2>
            <p className="text-rugged-green text-[10px] sm:text-xl lg:text-2xl font-black mb-6 sm:mb-8 uppercase tracking-[0.2em] sm:tracking-[0.4em] animate-pulse">Refined Protocol</p>
            <button 
              onClick={resetGame}
              className="px-8 sm:px-12 py-3 sm:py-5 bg-rugged-green text-white font-black text-sm sm:text-xl lg:text-2xl hover:bg-white hover:text-rugged-green transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_60px_#3A5F3D] uppercase tracking-widest rounded-xl sm:rounded-2xl"
            >
              Initiate Override
            </button>
            <p className="mt-4 sm:mt-6 text-[8px] sm:text-sm text-rugged-gray uppercase tracking-widest opacity-60 font-black italic">Move Mouse or Finger to Survive</p>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div 
              className="absolute bottom-8 sm:bottom-12 w-16 h-16 sm:w-24 lg:w-28 sm:h-24 lg:h-28 flex flex-col items-center justify-center will-change-transform"
              style={{ 
                left: `${visualPlayerX}%`, 
                transform: `translate3d(-50%, 0, 0) rotate(${visualVelocity}deg)`,
                transition: 'none' // Disable CSS transition during active gameplay updates
              }}
            >
              <div className="absolute -bottom-4 w-full h-4 bg-black/80 blur-xl rounded-full scale-x-75"></div>
              <img src={playerImage} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(58,95,61,0.8)] relative z-10" alt="Player" />
              <div className="absolute -top-4 sm:-top-8 bg-rugged-green text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1 uppercase tracking-tighter rounded sm:rounded-md shadow-2xl border border-white/20">
                SURVIVOR
              </div>
            </div>

            {candles.map(c => (
              <div 
                key={c.id}
                className="absolute w-2.5 h-16 sm:w-6 sm:h-48 bg-rugged-red shadow-[0_0_30px_rgba(193,39,45,0.8)] rounded-md sm:rounded-lg overflow-hidden border-x border-white/10 will-change-transform"
                style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate3d(-50%, 0, 0)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40"></div>
                <div className="w-full h-1 bg-white/20 absolute top-1/4"></div>
                <div className="w-full h-1 bg-white/20 absolute bottom-1/4"></div>
              </div>
            ))}

            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
               {Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="absolute w-[1px] bg-white animate-pulse-glitch" style={{ height: '100px', left: `${i * 15}%`, top: `${(Date.now() / 6 + i * 300) % 150}%` }} />
               ))}
            </div>
          </>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/98 text-center p-6 sm:p-12 backdrop-blur-2xl animate-reveal">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-rugged-red mb-4 sm:mb-6 italic tracking-tighter uppercase animate-shake drop-shadow-[0_0_80px_rgba(193,39,45,0.7)]">Rugged!</h2>
            <div className="bg-white/5 border-2 sm:border-4 border-white/10 p-6 sm:p-6 lg:p-10 rounded-2xl sm:rounded-[2rem] mb-6 sm:mb-8 lg:mb-10 max-w-md lg:max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all">
                <p className="text-white text-5xl sm:text-6xl lg:text-7xl font-black mb-1 sm:mb-2 uppercase tracking-tighter leading-none">{displayScore}</p>
                <p className="text-rugged-gray text-[10px] sm:text-lg lg:text-xl font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] italic">Rank Logged</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 w-full max-w-md lg:max-w-xl">
              <button onClick={resetGame} className="flex-1 py-4 sm:py-5 bg-rugged-green text-white font-black text-base sm:text-xl lg:text-2xl hover:bg-white hover:text-black transition-all uppercase rounded-xl sm:rounded-2xl shadow-2xl active:scale-95">Re-Deploy</button>
              <button onClick={onClose} className="flex-1 py-4 sm:py-5 border-2 sm:border-4 border-rugged-gray text-rugged-gray font-black text-base sm:text-xl lg:text-2xl hover:border-white hover:text-white transition-all uppercase rounded-xl sm:rounded-2xl active:scale-95">Retreat</button>
            </div>
          </div>
        )}

        <div className="absolute inset-0 opacity-20 chart-grid pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,1)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_6px] opacity-25"></div>
      </div>
    </div>
  );
};
