import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

interface TutorialScreen1Props {
  onNext?: () => void;
}

export default function PlayerTutorialScreen1({
  onNext
}: TutorialScreen1Props) {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden overscroll-none">
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
      <div className="relative z-10 flex flex-col items-center justify-center h-full overflow-y-auto overscroll-contain pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Dark Blue Central Panel with Light Gray Border */}
        <div className="w-full h-full max-w-[1100px] max-h-[85dvh] md:max-h-[85dvh] mt-[-10dvh] xl:mt-[-10dvh] px-4 sm:px-6">
          <div className="flex flex-col h-full justify-center uppercase gap-[min(7vh,6rem)]">
            {/* Welcome Title - Centered */}

            <div className="text-center">
              <motion.h1
                className="text-white font-bold leading-tight tracking-wide text-[clamp(28px,6vh,72px)]"
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                Welcome to the
                <br />
                Coastal Protection Taskforce!
              </motion.h1>
            </div>

            {/* Mission Description - Centered */}
            <p className="text-white text-center tracking-wider flex flex-col gap-[4vh] text-[clamp(16px,3vh,28px)]">
              <motion.span
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                Sea levels around Singapore are rising due to climate
                change.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 2 }}
              >
                Your goal is to protect every sector of our nation
                from coastal flooding. You have three rounds to
                carefully place your coastal defences - balancing the{' '}
                <span className="text-[#FFDD3D]">time</span>,{' '}
                <span className="text-[#FFDD3D]">budget</span>, and{' '}
                <span className="text-[#FFDD3D]">effectiveness</span>.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 4 }}
              >
                The future of our island is in your hands. Are you
                ready to protect our shores?
              </motion.span>
            </p>

            {/* Disclaimer - Centered */}
            <motion.p
              className="text-white text-center tracking-wider text-[clamp(14px,2.5vh,22px)]"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 5 }}
            >
              *Disclaimer: This game is a simplified simulation and
              might not reflect real-life situations or scenarios.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

