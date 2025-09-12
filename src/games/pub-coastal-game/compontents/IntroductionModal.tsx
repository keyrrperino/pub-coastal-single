import React, { useEffect, useState } from 'react';
import PlayerTutorialScreen1 from '@/components/PlayerTutorialScreen1';
import PlayerTutorialScreen2 from '@/components/PlayerTutorialScreen2';
import PlayerTutorialScreen3 from '@/components/PlayerTutorialScreen3';
import PlayerTutorialScreen4 from '@/components/PlayerTutorialScreen4';
import PlayerTutorialScreen5 from "@/components/PlayerTutorialScreen5";
import { useServerTime } from '@/components/ServerTimeContext';

// DEV MODE TOGGLE - Set to true to enable manual tutorial controls

interface IntroductionModalProps {
  isOpen: boolean;
  onDurationComplete?: () => void;
  duration: number;
  syncWithTimestamp?: number;
}

const IntroductionModal: React.FC<IntroductionModalProps> = ({ 
  isOpen, 
  onDurationComplete,
}) => {
  const { getAdjustedCurrentTime } = useServerTime();
  const [manualScreen, setManualScreen] = useState(1);
  
  const currentScreen = manualScreen;


  useEffect(() => {
    if (currentScreen >= 6) {
      setManualScreen(1);
      onDurationComplete?.();
    }
  }, [currentScreen]);

  if (!isOpen) return null;  

  // Render the appropriate tutorial screen
  const renderCurrentScreen = () => {

    switch (currentScreen) {
      case 1:
        return <PlayerTutorialScreen1 />;
      case 2:
        return <PlayerTutorialScreen2 />;
      case 3:
        return <PlayerTutorialScreen3 />;
      case 4:
        return <PlayerTutorialScreen4 />;
      case 5:
        return <PlayerTutorialScreen5 />;
      default:
        return <PlayerTutorialScreen1 />;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {renderCurrentScreen()}
      
      <div className="fixed bottom-[3vh] left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
        {/* <button
          onClick={() => setManualScreen(Math.max(1, manualScreen - 1))}
          disabled={manualScreen === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Previous ({manualScreen > 1 ? manualScreen - 1 : 'Start'})
        </button>
        <div className="px-4 py-2 bg-gray-200 text-black rounded">
          Tutorial {manualScreen} of 5
        </div> */}
        <button
          onClick={() => {
            setManualScreen(Math.min(6, manualScreen + 1));
          }}
          className="bg-white text-blue-500 text-[3vh] px-[3vw] py-[1vh] rounded-[100px] hover:bg-blue-600 hover:text-white"
        >
          GO NEXT
        </button>
      </div>
    </div>
  );
};

export default IntroductionModal;