import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PlayerRoundScreenProps {
  onContinue?: () => void;
  timeRemaining?: number;
  isControlScreen?: boolean;
  round: number;
  year: string;
  info: React.ReactNode;
  waterLevelIndicator: React.ReactNode;
  isCenterScreen?: boolean;
  screenDuration: number;
}

export default function PlayerRoundScreen({
  onContinue,
  timeRemaining,
  isControlScreen = false,
  isCenterScreen = false,
  round,
  year,
  info,
  waterLevelIndicator,
}: PlayerRoundScreenProps) {
  return (
    <div className="fixed inset-0 w-full min-h-[100svh] h-[100dvh] overflow-hidden overscroll-none">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex mx-auto flex-col md:flex-row justify-center items-center h-full w-full max-w-[1200px] gap-4 md:gap-6 px-4 sm:px-6 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),6rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
          isControlScreen && 'justify-center',
        )}
      >
        {!isControlScreen && waterLevelIndicator}
        <div
          className={cn(
            'flex flex-col flex-grow w-full gap-4',
            isControlScreen
              ? 'justify-center items-center'
              : '',
            isCenterScreen && 'text-center',
          )}
        >
          {/* Round Title and Year */}
          <div
            className={cn(
              'flex flex-col',
              isControlScreen && 'text-center',
            )}
          >
            <h1 className="text-white font-bold leading-tight tracking-wide drop-shadow-[0_3px_3px_rgba(148,107,199,1)] text-[clamp(20px,3.5vh,40px)]">
              ROUND {round}
            </h1>
            <h2 className="text-white font-bold leading-tight tracking-wide drop-shadow-[0_3px_3px_rgba(148,107,199,1)] text-[clamp(20px,3.5vh,40px)]">
              YEAR {year}
            </h2>
          </div>

          {/* Game Info Card */}
          <div className="bg-[rgba(175,240,255,0.3)] backdrop-blur-[22px] border-2 rounded-[33px] shadow-[0_7px_37px_rgba(0,0,0,0.15)]">
            {info}
          </div>
        </div>
      </div>

      {/* Countdown - always reserve space to prevent layout shift */}
      <div className="absolute inset-x-0 bottom-[2dvh] z-50 p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              onContinue?.();
            }}
            className="bg-white text-blue-500 hover:bg-blue-600 hover:text-white transition text-[clamp(16px,2.4vh,24px)] px-[clamp(16px,4vw,32px)] py-[clamp(8px,1.6vh,14px)] rounded-[100px]"
          >
            START ROUND
          </button>
        </div>
      </div>
    </div>
  );
}

