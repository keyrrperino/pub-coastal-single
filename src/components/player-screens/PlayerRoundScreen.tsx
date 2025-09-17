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
    <div className="fixed w-full h-screen overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex mx-auto flex-row justify-center items-center h-full w-screen max-w-[75vw] gap-[2vh]',
          isControlScreen && 'justify-center',
        )}
      >
        {!isControlScreen && waterLevelIndicator}
        <div
          className={cn(
            'flex flex-col flex-grow w-full gap-4',
            isControlScreen
              ? 'justify-center items-center'
              : '4k:max-w-[2348px]',
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
            <h1 className="text-white text-[4vh] font-bold leading-tight tracking-wide drop-shadow-[0_3px_3px_rgba(148,107,199,1)]">
              ROUND {round}
            </h1>
            <h2 className="text-white text-[4vh] font-bold leading-tight tracking-wide drop-shadow-[0_3px_3px_rgba(148,107,199,1)]">
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
      <div className="flex items-center justify-center absolute bottom-15 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => {
            onContinue?.();
          }}
          className="bg-white text-blue-500 text-[3vh] px-[3vw] py-[1vh] rounded-[100px] hover:bg-blue-600 hover:text-white"
        >
          START ROUND
        </button>
      </div>
    </div>
  );
}

