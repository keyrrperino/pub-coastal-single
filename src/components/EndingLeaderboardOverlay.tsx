import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import React from 'react';

interface LeaderboardDisplayEntry {
  name: string;
  points: number;
  position?: number;
}

interface EndingLeaderboardOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  leaderboardData?: LeaderboardDisplayEntry[];
  topWinner?: {
    name: string;
    points: number;
  } | null;
  bottomHighlight?: {
    name: string;
    points: number;
    position: number;
  } | null;
}

// Figma data (463:8094)
const figmaTopWinner = { name: 'PUB', points: 2500 };
const figmaLeaderboard: LeaderboardDisplayEntry[] = [
  { name: 'KEN', points: 2400, position: 2 },
  { name: 'MZH', points: 2400, position: 3 },
  { name: 'TOM', points: 2400, position: 4 },
  { name: 'KIR', points: 2300, position: 5 },
];
const figmaBottomHighlight = {
  name: 'RfF',
  points: 500,
  position: 15,
};

export default function EndingLeaderboardOverlay({
  isOpen,
  onClose,
  leaderboardData = figmaLeaderboard,
  topWinner = figmaTopWinner,
  bottomHighlight = figmaBottomHighlight,
}: EndingLeaderboardOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="inset-0 z-[100] flex flex-col items-center justify-center w-full h-[100dvh] max-h-[100dvh] overscroll-contain px-[2dvh] py-[2dvh]"
      role="dialog"
      aria-modal="true"
    >
      {/* Main Container - match Figma dimensions */}
      <div className="relative w-[min(92vw,80vh)] h-[min(86dvh,80vh)] max-w-[40dvw]">
        {/* Background container */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-0 left-0 w-full h-full z-20 drop-shadow-[2vh_2vh_0_#8491C6]">
            {/* Header section (white) */}
            <div className="w-full p-[2dvh] bg-white rounded-t-[2dvh] flex items-center justify-center">
              <h2
                className="text-[#202020] text-[4dvh] font-bold text-center leading-[1.2] tracking-wide"
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                LEADERBOARD
              </h2>
            </div>

            {/* Top winner section (blue) */}
            <div className="w-full bg-[#2A81FA] flex flex-col items-center justify-center px-[1dvh] py-[2dvh]">
              <div className="flex items-stretch justify-between w-full mb-2">
                <span
                  className="text-white text-[4dvh] font-bold leading-[1]"
                  style={{
                    fontFamily: 'novecento-sans-narrow, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  TOP 1
                </span>
                <span
                  className="text-white font-bold leading-[1] text-[4dvh]"
                  style={{
                    fontFamily: 'novecento-sans-narrow, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {topWinner?.points || 0} pts
                </span>
              </div>
              <div
                className="text-white text-[5dvh] font-bold text-center leading-[0.7] tracking-wide"
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                {topWinner?.name || 'N/A'}
              </div>
            </div>

            {/* Regular leaderboard section (white) */}
            <div
              className={cn(
                'w-full bg-white px-[4dvh] py-[4dvh] h-auto min-h-[42dvh]'
              )}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-[1dvh]">
                <motion.span
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-[#2A81FA] text-[3dvh] font-bold leading-[1.2]"
                  style={{
                    fontFamily:
                      'novecento-sans-condensed, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  Team name
                </motion.span>
                <motion.div
                  className="flex-1 mx-4 border-b-[3.7px] border-dashed border-[#2A81FA]"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
                <motion.span
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-[#2A81FA] text-[3dvh] font-bold leading-[1.2] text-right"
                  style={{
                    fontFamily:
                      'novecento-sans-condensed, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  Total points
                </motion.span>
              </div>

              {/* Leaderboard entries */}
              <div className="space-y-[18px]">
                {leaderboardData.map((entry, index) => {
                  // Calculate position based on bottomHighlight position
                  const basePosition =
                    bottomHighlight && bottomHighlight.position <= 5
                      ? bottomHighlight.position + 1
                      : 2;
                  const displayPosition = basePosition + index;

                  return (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between"
                    >
                      <motion.span
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 * index,
                          ease: 'easeInOut',
                        }}
                        className="text-[#202020] text-[4dvh] font-bold leading-[1.2]"
                        style={{
                          fontFamily:
                            'novecento-sans-condensed, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {displayPosition}. {entry.name}
                      </motion.span>
                      <motion.div
                        className="flex-1 mx-4 border-b-[3.7px] border-dashed border-[#2A81FA]"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 * index,
                          ease: 'easeInOut',
                        }}
                      />
                      <motion.span
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 * index,
                          ease: 'easeInOut',
                        }}
                        className="text-[#202020] text-[4dvh] font-bold leading-[1.2] text-right"
                        style={{
                          fontFamily:
                            'novecento-sans-narrow, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {entry.points}
                      </motion.span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Bottom highlight section (yellow) - current team */}
            {bottomHighlight && (
              <div className="w-full p-[3dvh] bg-[#FFE169] rounded-b-[2dvh] px-[4dvh] flex items-center">
                <motion.span
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-[#202020] text-[5dvh] font-bold leading-[1.2]"
                  style={{
                    fontFamily:
                      'novecento-sans-condensed, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {bottomHighlight.position}. {bottomHighlight.name}
                </motion.span>
                <motion.div
                  className="flex-1 mx-4 border-b-[3.7px] border-dashed border-[#2A81FA]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeIn' }}
                />
                <motion.span
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-[#202020] text-[5dvh] font-bold leading-[1.2] text-right"
                  style={{
                    fontFamily: 'novecento-sans-narrow, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {bottomHighlight.points}
                </motion.span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 w-full items-center mt-[2dvh]">
        <button
          onClick={onClose}
          className="w-[min(70vw,40vh)] max-w-[520px] py-[2dvh] px-[3dvh] bg-[white] text-[#005DFF] hover:text-[white] text-[3dvh] font-bold rounded-full hover:bg-[#0052e6] transition-colors duration-200 active:scale-[0.99]"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}

