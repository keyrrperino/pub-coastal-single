import React from 'react';
import Image from 'next/image';
import { TUTORIAL_4_CARDS } from '@/lib/constants';
import { motion } from 'motion/react';

export default function PlayerTutorialScreen4() {
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
        <div className="w-full max-w-[1100px] uppercase mt-[-5dvh]">
          <div className="flex flex-col items-center gap-10 uppercase">
            {/* Top Section - Instructional Text */}
            <p className="text-white font-bold text-center max-w-[80%] mx-auto text-[clamp(18px,2.6vh,30px)]">
              Once you select your measure and the sea level rise that
              you are planning for, it is locked in for the round.
            </p>

            <div className="flex flex-col items-center gap-2">
              {/* Middle Section - Three Protection Measure Cards */}
              <div className="flex flex-wrap md:flex-nowrap gap-[2.5vh] justify-center items-stretch">
                {TUTORIAL_4_CARDS.map((card, index) => (
                  <motion.div
                    key={card.name}
                    className="bg-white/20 backdrop-blur-sm border-2 border-[#91E2FF] gap-4 rounded-[25px] px-6 py-3 shadow-lg flex flex-col justify-center items-center h-full w-[90vw] sm:w-auto"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.4 }}
                  >
                    <div className="flex flex-row items-center gap-[1vh]">
                      <div className="relative overflow-hidden">
                        <img
                          src={card.icon}
                          alt={card.name}
                          className="object-cover w-[37px] h-[37px] rounded-full bg-[#BFFFBE] aspect-square"
                        />
                      </div>
                      <span className="text-white font-bold text-[clamp(16px,2.2vh,22px)]">
                        {card.name}
                      </span>
                    </div>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${card.action.length}, 1fr)`,
                      }}
                    >
                      {card.action.map((action) => (
                        <div
                          key={action.name}
                          className="flex flex-col justify-center items-center gap-[1vh]"
                        >
                          <span className="text-black font-bold bg-[#B6FFF3] to-[#14F4CF] rounded-full aspect-square h-full w-[8dvh] flex items-center justify-center text-[clamp(12px,2vh,16px)]">
                            {action.name}
                          </span>
                          <div className="flex gap-[1vh]">
                            {Array.from({ length: action.cost }).map((_, i) => (
                              <div key={i} className="relative w-[clamp(12px,2.2vh,24px)] h-[clamp(12px,2.2vh,24px)]">
                                <Image
                                  src="/assets/coin-icon.webp"
                                  alt="Coin"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.img
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                src="/assets/arrows-down.svg"
                alt="Mangroves"
                className="position w-[clamp(120px,50svh,480px)] h-auto"
              />

              {/* Middle Section - Three Protection Measure Cards */}
              <div className="flex flex-wrap md:flex-nowrap gap-[2.5vh] justify-center items-stretch">
                {TUTORIAL_4_CARDS.map((card, index) => (
                  <motion.div
                    key={card.name}
                    className="bg-white/20 backdrop-blur-sm border-2 border-[#91E2FF] gap-4 rounded-[25px] px-6 py-3 shadow-lg flex flex-col justify-center items-center h-full w-[90vw] sm:w-auto"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: card.active ? 1 : 0.4, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1 + 1.7,
                    }}
                  >
                    <div className="flex flex-row items-center gap-[1vh]">
                      <div className="relative overflow-hidden">
                        <img
                          src={card.icon}
                          alt={card.name}
                          className="object-cover w-[37px] h-[37px] rounded-full bg-[#BFFFBE] aspect-square"
                        />
                      </div>
                      <span className="text-white font-bold text-[clamp(16px,2.2vh,22px)]">
                        {card.name}
                      </span>
                    </div>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${card.action.length}, 1fr)`,
                      }}
                    >
                      {card.action.map((action) => (
                        <div
                          key={action.name}
                          className="flex flex-col justify-center items-center gap-[1vh]"
                        >
                          <motion.span
                            initial={
                              action.selected
                                ? {
                                    background:
                                      'radial-gradient(279.64% 279.64% at 10.52% 83.59%, #B6FFF3 0%, #14F4CF 100%)',
                                    boxShadow:
                                      '0 12.57px 62.851px 0 rgba(0, 0, 0, 0.15)',
                                  }
                                : { opacity: 1 }
                            }
                            animate={
                              action.selected
                                ? {
                                    background:
                                      'radial-gradient(279.64% 279.64% at 10.52% 83.59%, #FFEF3E 0%, #FFA557 100%)',
                                    boxShadow:
                                      '0 12.57px 62.851px 0 rgba(0, 0, 0, 0.15)',
                                  }
                                : { opacity: 0.4 }
                            }
                            transition={{
                              duration: 0.5,
                              ease: 'easeInOut',
                              delay: index * 0.1 + 2,
                            }}
                            className="text-black font-bold bg-[#B6FFF3] to-[#14F4CF] rounded-full aspect-square h-full w-[8dvh] flex items-center justify-center text-[clamp(12px,2vh,16px)]"
                          >
                            {action.name}
                          </motion.span>
                          <div className="flex gap-[1vh]">
                            {Array.from({ length: action.cost }).map((_, i) => (
                              <div key={i} className="relative w-[clamp(12px,2.2vh,24px)] h-[clamp(12px,2.2vh,24px)]">
                                <Image
                                  src="/assets/coin-icon.webp"
                                  alt="Coin"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Hint Section */}
            <div className="flex flex-col gap-3 text-center uppercase max-w-[80%] mx-auto">
              <p className="text-[#FF6A6C] font-bold text-[clamp(16px,2.4vh,28px)]">
                Hint: What is the projected sea level rise in that
                period? Can your measure be raised over time?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

