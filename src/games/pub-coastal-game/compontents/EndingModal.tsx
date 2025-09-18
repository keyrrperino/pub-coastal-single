import React, { useEffect } from 'react';
import { useTimer } from '@/components/hooks/useTimer';
import PlayerEndingScreen, { PlayerEndingType } from '@/components/PlayerEndingScreen';
import { SectorPerformance } from '@/components/hooks/useSectorScores';

interface EndingModalProps {
  isOpen: boolean;
  onContinue?: () => void;
  finalScore?: number;
  duration?: number;
  syncWithTimestamp?: number;
  totalPerformance?: SectorPerformance;
}

const EndingModal: React.FC<EndingModalProps> = ({ 
  isOpen, 
  onContinue, 
  finalScore = 0,
  duration = 15,
  syncWithTimestamp,
  totalPerformance = 'okay'
}) => {

  if (!isOpen) return null;

  console.log('🟢 ENDING MODAL: Rendering ending screen for performance:', totalPerformance);

  // Map performance to PlayerEndingType
  const getEndingType = (performance: SectorPerformance): PlayerEndingType => {
    switch (performance) {
      case 'good':
        return 'success';
      case 'okay':
        return 'moderate';
      case 'bad':
        return 'failure';
      default:
        return 'moderate';
    }
  };

  const endingType = getEndingType(totalPerformance);
  console.log('🟢 ENDING MODAL: Rendering PlayerEndingScreen with type:', endingType, 'for performance:', totalPerformance);

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] overscroll-contain"
      role="dialog"
      aria-modal="true"
    >
      <PlayerEndingScreen 
        onContinue={() => {
          onContinue?.();
        }}
        endingType={endingType}
        finalScore={finalScore}
      />
    </div>
  );
};

export default EndingModal;