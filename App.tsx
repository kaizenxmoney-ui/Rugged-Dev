
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { Transparency } from './components/Transparency';
import { MemeGenerator } from './components/MemeGenerator';
import { PFPGenerator } from './components/PFPGenerator';
import { AILab } from './components/AILab';
import { Gallery } from './components/Gallery';
import { Tokenomics } from './components/Tokenomics';
import { Community } from './components/Community';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { SecretGame } from './components/SecretGame';
import { IdentityInitiation } from './components/IdentityInitiation';
import { FALLBACK_IMAGE, STORAGE_KEYS } from './constants';
import { sounds } from './utils/sounds';

const App: React.FC = () => {
  const [baseCharacter, setBaseCharacter] = useState<string>(FALLBACK_IMAGE);
  const [memeBaseImage, setMemeBaseImage] = useState<string>(FALLBACK_IMAGE);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  
  // Easter Egg States
  const [easterEggPhase, setEasterEggPhase] = useState<'none' | 'rugged' | 'recovery'>('none');
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window.aistudio !== 'undefined') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(hasKey);
      } else {
        setIsAuthorized(true);
      }
      
      // Load custom character
      const storedChar = localStorage.getItem(STORAGE_KEYS.CUSTOM_CHARACTER);
      
      if (storedChar) {
        setBaseCharacter(storedChar);
      }

      setIsChecking(false);
    };
    checkAuth();
  }, []);

  const addToGallery = (imageUrl: string) => {
    setGalleryImages(prev => {
      if (prev.includes(imageUrl)) return prev;
      return [imageUrl, ...prev].slice(0, 12);
    });
  };

  const deleteFromGallery = (index: number) => {
    sounds.playClick();
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetCustomCharacter = (imageUrl: string) => {
    setBaseCharacter(imageUrl);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CHARACTER, imageUrl);
    sounds.playNeutralBlip();
  };

  const handleAuthorize = async () => {
    sounds.playClick();
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setIsAuthorized(true);
    }
  };

  const handleForgeMeme = (imageUrl: string) => {
    setMemeBaseImage(imageUrl);
    const element = document.getElementById('meme-factory');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerEasterEgg = () => {
    setEasterEggPhase('rugged');
    sounds.playRug();
    
    setTimeout(() => {
      setEasterEggPhase('recovery');
    }, 2000);

    setTimeout(() => {
      setEasterEggPhase('none');
      setShowGame(true);
    }, 4000);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#3A5F3D] font-black text-2xl animate-pulse tracking-widest uppercase">
          Verifying Clearance...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 chart-grid opacity-20"></div>
        <div className="max-w-md w-full border-4 border-[#C1272D] bg-black p-10 relative z-10 shadow-[0_0_50px_rgba(193,39,45,0.3)]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 border-4 border-[#C1272D] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C1272D" strokeWidth="3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Access Restricted</h1>
            <p className="text-[#6E6E6E] font-bold text-sm uppercase tracking-widest">Protocol Authorization Required</p>
          </div>
          
          <p className="text-sm text-[#F2F2F2]/70 mb-8 leading-relaxed text-center">
            To access the Survivor Visual Forge and Propaganda Lab, you must select an API key from a project with active billing.
          </p>

          <button 
            onClick={handleAuthorize}
            className="w-full py-5 bg-[#C1272D] text-white font-black text-xl hover:bg-white hover:text-black transition-all mb-4 shadow-xl active:scale-95"
          >
            AUTHORIZE SYSTEM
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-center text-xs font-bold text-[#6E6E6E] hover:text-[#3A5F3D] transition-colors uppercase tracking-widest"
          >
            API Setup Documentation ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#111111] text-[#F2F2F2] selection:bg-[#3A5F3D] selection:text-white ${easterEggPhase === 'rugged' ? 'animate-shake' : ''}`}>
      <Hero baseImage={baseCharacter} onTriggerEasterEgg={triggerEasterEgg} />
      
      <IdentityInitiation onIdentitySet={handleSetCustomCharacter} />
      
      <Story baseImage={FALLBACK_IMAGE} />
      <Transparency />
      <AILab 
        baseImage={baseCharacter} 
        onForgeToMeme={handleForgeMeme} 
        onImageGenerated={addToGallery}
      />
      <MemeGenerator 
        baseImage={memeBaseImage} 
        onResetBase={() => setMemeBaseImage(baseCharacter)} 
        onImageGenerated={addToGallery}
      />
      <PFPGenerator onImageGenerated={addToGallery} />
      <Gallery images={galleryImages.length > 0 ? galleryImages : [FALLBACK_IMAGE]} onDeleteImage={deleteFromGallery} />
      <Tokenomics />
      <Community />
      <FAQ />
      <Footer />

      {/* Easter Egg Sequence Overlay */}
      {easterEggPhase !== 'none' && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden pointer-events-none p-4">
          <div 
            className={`w-12 sm:w-20 h-full transition-all duration-1000 transform flex flex-col items-center justify-center ${
              easterEggPhase === 'rugged' 
                ? 'bg-[#C1272D] translate-y-0 scale-y-150' 
                : 'bg-[#3A5F3D] -translate-y-full scale-y-150'
            }`}
          >
            <div className="text-white font-black text-2xl sm:text-6xl rotate-90 whitespace-nowrap uppercase tracking-tighter">
              {easterEggPhase === 'rugged' ? 'RUGGED' : 'RECOVER'}
            </div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h2 className={`text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter transition-all duration-500 uppercase leading-none ${
              easterEggPhase === 'rugged' ? 'text-[#C1272D] scale-110' : 'text-[#3A5F3D] scale-110'
            }`}>
              {easterEggPhase === 'rugged' ? 'RUGGED AGAIN.' : 'SYSTEM RECOVERY.'}
            </h2>
          </div>
        </div>
      )}

      {/* Mini Game Modal */}
      <SecretGame isOpen={showGame} onClose={() => setShowGame(false)} playerImage={baseCharacter} />
    </div>
  );
};

export default App;
