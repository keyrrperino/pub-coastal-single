import React from 'react';
import { useTimer } from '@/components/hooks/useTimer';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  isRunning?: boolean;
  syncWithTimestamp?: number;
  hintText?: string;
  showHint?: boolean;
  currentRound?: number;
}

const Timer: React.FC<TimerProps> = ({ 
  duration,
  onTimeUp,
  isRunning = true,
  syncWithTimestamp,
  hintText = "HINT: DEMOLISH BEFORE YOU CAN BUILD A NEW COASTAL PROTECTION MEASURE",
  showHint = true,
  currentRound,
}) => {
  const {
    timeRemaining,
    progressPercentage,
    isAlmostUp,
  } = useTimer({
    duration,
    onTimeUp,
    startImmediately: isRunning,
    syncWithTimestamp,
  });

  return (
    <div className="flex flex-row items-center justify-center gap-4 w-full">
      {/* Left: column with white box (clock+bar) and hint below */}
      <div className="flex flex-col justify-start items-center w-full">
        {/* Round indicator */}
        {/* White box: clock + bar */}
        <div className="flex flex-row items-center w-full rounded-[1vh] bg-white px-[1vh] py-[0.5vh] opacity-40">
          {/* Clock icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 34 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 xl:mr-3 xl:w-8 xl:h-8"
          >
            <circle cx="16.7614" cy="17.5001" r="14.6122" stroke="black" strokeWidth="3.96262" />
            <rect x="14.5332" y="9.32715" width="3.96262" height="9.41121" fill="black" />
            <rect x="22.458" y="16.7571" width="3.96262" height="7.92523" transform="rotate(90 22.458 16.7571)" fill="black" />
          </svg>
          {/* Progress bar */}
          <div className="relative flex-1 h-[1.3vh] rounded-[1.3vh] overflow-hidden bg-white">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-1000 ease-linear bg-[#002CFF]"
              style={{
                width: `${progressPercentage}%`,
                borderRadius: '0.7vh',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;