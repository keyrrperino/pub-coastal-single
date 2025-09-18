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
    }, 50000000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden">
      {/* Background Image */}

      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-center min-h-[100dvh] py-[4dvh]'
        )}
      >
        {/* Main Content Centered */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Title Section */}
          <div className="flex flex-col items-center gap-[6dvh]">
            <h1
              className="text-white text-[6dvh] md:text-[7dvh] lg:text-[8dvh] text-center leading-[0.9] tracking-wide drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              THANK YOU FOR PLAYING!
            </h1>
            <p
              className="text-white text-[3.5dvh] md:text-[4dvh] lg:text-[4.5dvh] text-center drop-shadow-[0_4px_4px_rgba(148,107,199,1)] px-[10dvw]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              TO LEARN MORE ABOUT PUB’S PLANS FOR COASTAL PROTECTION in SINGAPORE, VISIT <a className="underline" href="https://www.pub.gov.sg/" target='blank'>https://www.pub.gov.sg/</a>
            </p>

            {<div className="transform">
            <button
              className="focus:outline-none"
              aria-label="PUB Logo"
            >
              <img
                src="/assets/PUB logo_white_transparent 2.png"
                alt="PUB Riding the Tides Logo"
                className={cn(
                  'w-auto h-[7dvh] 4k:!w-[342px] 4k:!h-[212px]',
                  'object-contain',
                )}
              />
            </button>
          </div>}
          
          {<div className="flex flex-col items-center justify-center gap-4 text-[2.6dvh] md:text-[3dvh] text-white drop-shadow-[0_4px_4px_rgba(148,107,199,1)]">
            {/* Buttons */}
            <div className="flex flex-row justify-center gap-5 w-full">
              <img
                  src="/assets/credits.png"
                  className={cn(
                    'w-auto h-[7dvh] 4k:!w-[342px] 4k:!h-[212px]',
                    'object-contain',
                  )}
                />
            </div>
          </div>}

          {/* Player and Buttons Section */}
          {<div className="flex flex-col items-center justify-center gap-4 text-[2.6dvh] md:text-[3dvh] text-white">
            {/* Buttons */}
            <div className="flex flex-row justify-center gap-5 w-full">
              <button
                onClick={onClose}
                className="h-[6dvh] px-[6dvh] bg-[#005DFF] text-white text-[2vh] rounded-full hover:bg-gray-100 hover:text-[#005DFF] active:scale-95 transition-all duration-200 whitespace-nowrap"
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                Back to main menu
              </button>
            </div>
          </div>}
        </div>              
        </div>
      </div>
    </div>
  );
}

