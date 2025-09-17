import React, { useState, useRef } from 'react';
import Image from 'next/image';
import CreditsModal from './CreditsModal';
import { cn } from '@/lib/utils';

interface StartScreenProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  playerNumber: number;
  isLeaderboardOpen: boolean;
}

export default function StartScreen({
  onStartGame,
  onShowLeaderboard,
  playerNumber,
  isLeaderboardOpen,
}: StartScreenProps) {
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const clickCountRef = useRef(0);
  const firstClickTimeRef = useRef<number | null>(null);

  const handleLogoClick = () => {
    const now = Date.now();

    // Reset if more than 15 seconds have passed since first click
    if (
      firstClickTimeRef.current &&
      now - firstClickTimeRef.current > 15000
    ) {
      clickCountRef.current = 0;
      firstClickTimeRef.current = null;
    }

    // Set first click time if this is the first click
    if (firstClickTimeRef.current === null) {
      firstClickTimeRef.current = now;
    }

    clickCountRef.current++;

    // Check if we've reached 10 clicks within 15 seconds
    if (
      clickCountRef.current >= 10 &&
      firstClickTimeRef.current &&
      now - firstClickTimeRef.current <= 15000
    ) {
      setIsCreditsModalOpen(true);
      // Reset the counter
      clickCountRef.current = 0;
      firstClickTimeRef.current = null;
    }
  };

  if (isLeaderboardOpen) {
    return null;
  }
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}

      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-between h-full py-[4vh]',
          isCreditsModalOpen && 'opacity-0',
        )}
      >
        {/* Main Content Centered */}
        <div className="flex flex-col items-center gap-[2vh] mt-[4vh]">
          {/* PUB Logo - Fixed at bottom */}
          {<div className="transform">
            <button
              onClick={handleLogoClick}
              className="focus:outline-none"
              aria-label="PUB Logo"
            >
              <img
                src="/assets/PUB_RidingTheTides_White.png"
                alt="PUB Riding the Tides Logo"
                className={cn(
                  'w-auto h-[7vh] 4k:!w-[342px] 4k:!h-[212px]',
                  'object-contain',
                )}
              />
            </button>
          </div>}
          
          {/* Title Section */}
          <div className="flex flex-col items-center">
            <h1
              className="text-white text-[8vh] text-center leading-[0.9] tracking-wide drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              COASTAL
            </h1>
            <h1
              className="text-white text-[8vh] text-center leading-[0.9] tracking-wide drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              PROTECTORS
            </h1>
            <h2
              className="text-white text-[5vh] text-center drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              2025-2100
            </h2>
            <p
              className="text-white text-[4vh] text-center drop-shadow-[0_4px_4px_rgba(148,107,199,1)]"
              style={{
                fontFamily: 'novecento-sans-narrow, sans-serif',
                fontWeight: 700,
              }}
            >
              an interactive timeline game
            </p>
          </div>

              
        </div>

          {/* Player and Buttons Section */}
          {<div className="flex flex-col items-center justify-center gap-4">
            {/* Player Indicator */}

            {/* Buttons */}
            <div className="flex flex-row justify-center gap-5 w-full">
              <button
                onClick={onStartGame}
                className="h-[6vh] px-[6vh] bg-white text-[#005DFF] text-[2vh] rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 whitespace-nowrap"
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                Start Game
              </button>

              <button
                onClick={onShowLeaderboard}
                className="h-[6vh] px-[6vh] bg-transparent text-white text-[2vh] rounded-full hover:bg-[#005DFF] active:scale-95 transition-all duration-200 whitespace-nowrap border-[0.2vh] border-white"
                style={{
                  fontFamily: 'novecento-sans-narrow, sans-serif',
                  fontWeight: 700,
                }}
              >
                {isLeaderboardOpen
                  ? 'Hide Leaderboard'
                  : 'Show Leaderboard'}
              </button>
            </div>
            <span className="text-white">*BEST PLAYED ON GOOGLE CHROME</span>
          </div>}
      </div>

      {/* Credits Modal */}
      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </div>
  );
}

