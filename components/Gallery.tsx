import React, { useMemo, useRef, useState, useEffect } from 'react';
import { RevealText } from './RevealText';
import { FALLBACK_IMAGE } from '../constants';
import { sounds } from '../utils/sounds';

interface GalleryProps {
  images: string[];
  onDeleteImage?: (index: number) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDeleteImage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Memoize the marquee content to ensure it fills the screen width for the infinite loop
  const marqueeImages = useMemo(() => {
    if (images.length === 0) return [];
    // Repeat images to make sure we have enough for a smooth infinite scroll
    const base = [...images];
    while (base.length < 15) {
      base.push(...images);
    }
    return base;
  }, [images]);

  const handleDownload = (imgUrl: string, index: number) => {
    sounds.playCommandClick();
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `rdev-archive-${index}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLargeGallery = images.length > 6;

  return (
    <section id="meme-gallery" className="py-24 bg-[#111111] overflow-hidden">
      <style>{`
        .custom-horizontal-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-horizontal-scrollbar::-webkit-scrollbar-track {
          background: rgba(110, 110, 110, 0.1);
          border-radius: 10px;
        }
        .custom-horizontal-scrollbar::-webkit-scrollbar-thumb {
          background: #3A5F3D;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C1272D;
        }
      `}</style>

      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-col items-center">
          <RevealText className="text-center">
            <h2 className="text-4xl font-black tracking-tight uppercase italic">Trench Records</h2>
            <p className="text-[10px] text-rugged-gray uppercase tracking-widest mt-2">Verified Propaganda Archive</p>
          </RevealText>
        </div>
      </div>

      {/* Separate Scrolling Feature: Propaganda Stream Marquee (Automatic) */}
      {images.length > 0 && images[0] !== FALLBACK_IMAGE && (
        <div className="relative w-full bg-black py-8 border-y-2 border-white/5 mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-4 z-10 bg-rugged-red text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter -translate-y-1/2">
            Live_Transmission_Feed
          </div>
          <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
            {marqueeImages.map((img, i) => (
              <div 
                key={`marquee-${i}`} 
                onClick={() => { setSelectedImage(img); sounds.playClick(); }}
                className="inline-block w-48 h-48 md:w-64 md:h-64 flex-shrink-0 mx-4 border-2 border-white/10 rounded-xl overflow-hidden group relative cursor-pointer"
              >
                <img 
                  src={img} 
                  alt="Propaganda" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">RECORD_ID_{i % 999}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Overlay for depth */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111111] to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#111111] to-transparent z-10"></div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {images.length === 0 || (images.length === 1 && images[0] === FALLBACK_IMAGE) ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-[#6E6E6E]/20 rounded-3xl opacity-20">
            <p className="uppercase font-black text-xs tracking-widest">Gallery Empty. Forge and Approve identities above.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-rugged-gray/40"></span>
                  <span className="text-[10px] font-black text-rugged-gray uppercase tracking-[0.3em]">Static Archive</span>
               </div>
               {isLargeGallery && (
                 <div className="flex items-center gap-2 text-rugged-green font-black text-[9px] uppercase tracking-widest animate-pulse">
                   <span>Manual Scroll Required</span>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                     <path d="M5 12h14m-4-4 4 4-4 4" />
                   </svg>
                 </div>
               )}
            </div>

            <div 
              ref={scrollRef}
              className={`
                ${isLargeGallery 
                  ? 'flex overflow-x-auto pb-12 gap-8 custom-horizontal-scrollbar snap-x snap-mandatory' 
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                } transition-all duration-500
              `}
            >
              {images.map((displayImg, i) => (
                <div 
                  key={i} 
                  onClick={() => { setSelectedImage(displayImg); sounds.playClick(); }}
                  className={`
                    group relative overflow-hidden border-2 border-[#6E6E6E]/20 rounded-3xl bg-black aspect-square shadow-2xl transition-all hover:border-rugged-green/40 cursor-pointer
                    ${isLargeGallery ? 'min-w-[300px] md:min-w-[400px] snap-start' : 'w-full'}
                  `}
                >
                  <img 
                    src={displayImg} 
                    alt={`Archive Image ${i}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  
                  {/* Tactical Scanline UI */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-white/10 group-hover:border-rugged-green transition-colors"></div>
                    <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-white/10 group-hover:border-rugged-green transition-colors"></div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-4 left-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Delete Button */}
                    {onDeleteImage && displayImg !== FALLBACK_IMAGE && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteImage(i);
                        }}
                        className="bg-rugged-red text-white p-2 rounded-lg hover:scale-110 active:scale-95 shadow-xl border border-white/20"
                        title="Purge Record"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}

                    {/* Download Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(displayImg, i);
                      }}
                      className="bg-rugged-green text-white p-2 rounded-lg hover:scale-110 active:scale-95 shadow-xl border border-white/20"
                      title="Download Propaganda"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>

                  {/* Visual Glitch Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity bg-rugged-red"></div>
                  
                  {/* Status Overlay for Large Gallery */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/80 border border-white/10 px-3 py-1 text-[9px] font-black text-white uppercase rounded-md backdrop-blur-sm">
                      ARCHIVE_0{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <Lightbox 
          src={selectedImage} 
          onClose={() => { setSelectedImage(null); sounds.playClick(); }} 
        />
      )}
    </section>
  );
};

interface LightboxProps {
  src: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-10"
      onMouseUp={handleMouseUp}
    >
      {/* Lightbox Header / UI */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="bg-rugged-green/10 border border-rugged-green/20 px-4 py-2 rounded-xl backdrop-blur-md">
          <span className="text-rugged-green font-black text-[10px] sm:text-xs uppercase tracking-widest animate-pulse">
            Secure_Propaganda_View // {Math.round(scale * 100)}%
          </span>
        </div>
        <button 
          onClick={onClose}
          className="pointer-events-auto bg-rugged-red text-white p-3 sm:p-4 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-2xl border border-white/20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Main Image Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div 
          className="transition-transform duration-200 ease-out will-change-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <img 
            src={src} 
            alt="Propaganda High Res" 
            className="max-w-[90vw] max-h-[80vh] object-contain shadow-[0_0_100px_rgba(0,0,0,1)] border-4 border-white/5 rounded-2xl"
            draggable={false}
          />
        </div>
      </div>

      {/* Lightbox Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 border border-white/10 p-2 rounded-2xl backdrop-blur-xl shadow-2xl">
        <button 
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="p-4 text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div className="w-[1px] h-8 bg-white/10 my-auto"></div>
        <button 
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); sounds.playClick(); }}
          className="px-6 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all"
        >
          Reset
        </button>
        <div className="w-[1px] h-8 bg-white/10 my-auto"></div>
        <button 
          onClick={handleZoomIn}
          disabled={scale >= 5}
          className="p-4 text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      {/* Visual Scanners */}
      <div className="absolute inset-0 pointer-events-none opacity-20 border-[20px] border-black/50 sm:border-[40px]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-rugged-green shadow-[0_0_20px_#3A5F3D] animate-[scan_4s_linear_infinite]"></div>
      </div>
    </div>
  );
};
