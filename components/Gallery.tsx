
import React, { useMemo, useRef } from 'react';
import { RevealText } from './RevealText';
import { FALLBACK_IMAGE } from '../constants';
import { sounds } from '../utils/sounds';

interface GalleryProps {
  images: string[];
  onDeleteImage?: (index: number) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDeleteImage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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
              <div key={`marquee-${i}`} className="inline-block w-48 h-48 md:w-64 md:h-64 flex-shrink-0 mx-4 border-2 border-white/10 rounded-xl overflow-hidden group relative">
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
                  className={`
                    group relative overflow-hidden border-2 border-[#6E6E6E]/20 rounded-3xl bg-black aspect-square shadow-2xl transition-all hover:border-rugged-green/40 
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
    </section>
  );
};
