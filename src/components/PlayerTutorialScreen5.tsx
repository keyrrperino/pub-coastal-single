import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function PlayerTutorialScreen5() {
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
        <div className="w-full max-w-[1100px] px-4 sm:px-6">
          <div className="flex flex-col items-center gap-8">
            {/* Top Section - Instructional Text */}
            <div className="flex flex-col gap-3 text-center  uppercase">
              <p className="text-white font-bold text-[clamp(18px,2.6vh,30px)]">
                Spend wisely, your team has a{' '}
                <span className="text-[#FFDD3D]">
                  collective budget of{' '}
                  <span className="number-enhanced">10</span> coins
                  per round.
                </span>
              </p>
            </div>

            {/* Middle Section - Three Protection Measure Cards */}
            <div className="flex gap-4 justify-center items-stretch w-full">
              <div className="bg-white/20 backdrop-blur-sm border-2 border-[#91E2FF] rounded-[25px] px-4 py-4 md:px-6 md:py-6 shadow-lg flex flex-col justify-between h-auto w-[92vw] sm:w-auto">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-white font-bold uppercase tracking-wider text-[clamp(18px,4.5vh,56px)]">
                      OVERALL BUDGET
                    </span>
                  </div>

                  <div className="flex gap-2 w-full items-center justify-center">
                    <div className="grid grid-cols-5 grid-rows-2 gap-x-3 gap-y-2 w-full items-center justify-center">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <motion.img
                          key={'coin-' + index}
                          src="/assets/coin-icon.webp"
                          alt="Coin"
                          className="object-contain w-[clamp(28px,7vw,64px)] h-[clamp(28px,7vw,64px)] 4k:w-[160px] 4k:h-[160px]"
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.25 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-bold text-[clamp(18px,2.6vh,30px)]">
                      <motion.span 
                        className="number-enhanced"
                        initial={{ content: "0" }}
                        animate={{ content: "10" }}
                        transition={{ duration: 2.0, delay: 2.0 }}
                      >
                        10
                      </motion.span>{' '}
                      coins PER ROUND
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-center  uppercase">
              <p className="text-white font-bold text-[clamp(18px,2.6vh,30px)]">
                Your starting score is 2500. Each negative outcome
                will deduct points from the total score.
              </p>
              <p className="text-[#FF8181] font-bold text-[clamp(18px,2.6vh,30px)]">
                Strategize with your teammates NOW!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

