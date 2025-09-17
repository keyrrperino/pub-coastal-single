import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function PlayerTutorialScreen2() {
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

      {/* Main container to center content vertically */}
      <div className="relative z-10 h-full flex items-center justify-center overflow-y-auto overscroll-contain pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Content Container */}
        <div className="flex flex-col w-full h-full max-w-[1100px] px-4 sm:px-6">

          {/* Map Container */}
          <div className="relative w-full flex-1">
            {/* Description */}
            <div className="w-full mt-4">
              <motion.p
                className="text-white text-center font-bold uppercase tracking-wider mx-auto max-w-[900px] md:max-w-[65%] text-[clamp(18px,2.6vh,28px)]"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                Singapore is divided into three sectors with two
                subsectors, each with its own land use. Take a look
                around — which sector are you in charge of?
              </motion.p>
            </div>

            {/* Base Singapore Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut',
                }}
                src="/assets/map-v2.svg?v=1"
                alt="Singapore Map"
                width={1012}
                height={567}
                className="object-contain"
              />
            </div>

            {/* Map Highlight Overlay */}
            <div className="absolute inset-0 flex items-center justify-center -mt-[55px]">
              {/* Sector 1 Highlight */}
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 1.5,
                  ease: 'easeInOut',
                }}
                src="/assets/sector1-highlight-v2.svg"
                alt="Sector 1 Highlight"
                width={1012}
                height={567}
                className="object-contain absolute opacity-0 animate-fadeIn"
                style={{
                  animation: 'fadeIn 1s ease-in-out 0.5s forwards',
                }}
              />

              {/* Sector 2 Highlight */}
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 2.5,
                  ease: 'easeInOut',
                }}
                src="/assets/sector2-highlight-v2.svg"
                alt="Sector 2 Highlight"
                width={1012}
                height={567}
                className="object-contain absolute opacity-0"
                style={{
                  animation: 'fadeIn 1s ease-in-out 1.5s forwards',
                }}
              />

              {/* Sector 3 Highlight */}
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 3.5,
                  ease: 'easeInOut',
                }}
                src="/assets/sector3-highlight-v2.svg"
                alt="Sector 3 Highlight"
                width={1012}
                height={567}
                className="object-contain absolute opacity-0"
                style={{
                  animation: 'fadeIn 1s ease-in-out 2.5s forwards',
                }}
              />
            </div>
            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}

