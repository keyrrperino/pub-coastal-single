import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

interface PlayerTutorialScreen3Props {
  onNext?: () => void;
}

export default function PlayerTutorialScreen3({ onNext }: PlayerTutorialScreen3Props) {
  const logos = [
    {
      value: 'Mangroves',
      logo: 'mangrove.svg',
    },
    {
      value: 'Seawall',
      logo: 'seawall.webp',
    },
    {
      value: 'LAND RECLAMATION',
      logo: 'land-reclemation.webp',
    },
    {
      value: 'COASTAL BARRIERS',
      logo: 'coastal-barriers.webp',
    },
    {
      value: 'HYBRID MEASURE',
      logo: 'hybrid-measure.webp',
    },
    {
      value: 'Artificial reef',
      logo: 'artificial-reef.webp',
    },
  ];

  return (
    <div className="fixed inset-0 w-full min-h-[100svh] h-[100dvh] overflow-hidden overscroll-none">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/tutorial-bg.webp"
          alt="Coastal background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[64px]" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 overflow-y-auto overscroll-contain pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="px-6 w-full max-w-[1100px] mx-auto uppercase min-h-full flex flex-col justify-center">
          <div className="flex flex-col items-center gap-6">
            {/* Top Section - Instructional Text */}
            <div className="flex flex-col gap-3 text-center">
              <motion.p
                className="text-white font-bold text-[clamp(18px,2.6vh,30px)]"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                In each sector, choose one measure to protect your
                coast.
              </motion.p>
              <motion.p
                className="text-[#FFDD3D] font-bold text-[clamp(18px,2.6vh,30px)]"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                Each measure has different strengths, weaknesses and
                costs.
              </motion.p>
            </div>

            {/* Middle Section - Protection Measure Cards */}
            <div className="flex flex-wrap md:flex-nowrap gap-4 justify-center items-stretch">
              {/* Cards */}
              {logos.map((logo, index) => {
                return (
                  <motion.div
                    key={logo.value}
                    className="bg-white/20 backdrop-blur-sm border-2 border-[#91E2FF] rounded-lg p-4 shadow-lg flex flex-col justify-between h-auto w-[40vw] sm:w-[28vw] md:w-[18vw] lg:w-[12vw]"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.25,
                    }}
                  >
                    <div className="flex flex-col text-center items-center gap-3">
                      <div className="bg-green-400 rounded-full relative overflow-hidden w-[24vw] h-[24vw] sm:w-[14vw] sm:h-[14vw] md:w-[9vw] md:h-[9vw] lg:w-[8vw] lg:h-[8vw]">
                        <Image
                          src={`/assets/${logo.logo}`}
                          alt={logo.value}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white font-bold text-[clamp(12px,1.1vw,16px)]">
                        {logo.value}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Section - Game Instructions */}
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.p
                className="text-[#FF6A6C] font-bold max-w-[85%] text-[clamp(16px,2.4vh,28px)]"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                Hint: Consider your sector's land use to help you make
                better decisions
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

