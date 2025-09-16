import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StartScreenProps {
  onClose: () => void;
}

export default function ThankYouScreen({
  onClose
}: StartScreenProps) {  
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}

      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-between h-full py-[4vh]'
        )}
      >
        {/* Main Content Centered */}
        <div className="flex flex-col items-center gap-[2vh] mt-[4vh]">
          
          {/* Title Section */}
          <div className="flex flex-col items-center gap-[5vh]">
            <h1
              className="text-white text-[8vh] text-center leading-[0.9] tracking-wide drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              THANK YOU FOR PLAYING!
            </h1>
            {<div className="transform">
            <button
              className="focus:outline-none"
              aria-label="PUB Logo"
            >
              <img
                src="/assets/PUB logo_white_transparent 2.svg"
                alt="PUB Riding the Tides Logo"
                className={cn(
                  'w-auto h-[7vh] 4k:!w-[342px] 4k:!h-[212px]',
                  'object-contain',
                )}
              />
            </button>
          </div>}
            <p
              className="text-white text-[4.5vh] text-center drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              Checkout this website to learn more about <br />
              Coastal Protectors by PUB
            </p>
          </div>

              
        </div>

          {/* Player and Buttons Section */}
          {<div className="flex flex-col items-center justify-center gap-4 text-[3vh] text-white drop-shadow-[0_4px_4px_rgba(148,107,199,1)]">
            {/* Player Indicator */}
            <h3 className="text-[2vh]">Credits</h3>
            {/* Buttons */}
            <div className="flex flex-row justify-center gap-5 w-full">
              <div
              >
                EMERSE
              </div>

              <div
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                PUB COASTAL
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
}

