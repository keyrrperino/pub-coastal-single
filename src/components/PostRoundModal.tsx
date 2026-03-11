import React from 'react';
import { OverallScoresTypes, RoundType } from '@/lib/types';
import { UserSectorEnum } from '@/lib/enums';

export type PostRoundPerformance = 'good' | 'okay' | 'bad';

interface PostRoundModalProps {
  isOpen: boolean;
  performance: PostRoundPerformance;
  currentRound: number;
  overallScoresData: { [key in RoundType]?: OverallScoresTypes };
  onClose?: () => void;
  onContinue?: () => void;
}

interface PerformanceConfig {
  title: string;
  message: string;
  bgColor: string;
  borderGradient: string;
}

const performanceConfigs: Record<
  PostRoundPerformance,
  PerformanceConfig
> = {
  good: {
    title: 'LITTLE FLOODING',
    message:
      "You've successfully protected our coasts - continue to implement further adaptive measures.",
    bgColor: 'rgba(123, 255, 215, 0.5)',
    borderGradient:
      'linear-gradient(135deg, #91E2FF 0%, #FFFFFF 100%)',
  },
  okay: {
    title: 'MODERATE FLOODING',
    message:
      'Build your measures higher in response to sea level rise to avoid flooding in your sector',
    bgColor: 'rgba(251, 255, 176, 0.5)',
    borderGradient:
      'linear-gradient(135deg, #F7FF69 0%, #FFFFFF 100%)',
  },
  bad: {
    title: 'HEAVY FLOODING',
    message:
      'Your coastal defence is not water-tight. Immediate changes are required to ensure adequate protection against rising sea levels.',
    bgColor: 'rgba(255, 176, 176, 0.5)',
    borderGradient:
      'linear-gradient(135deg, #FF7CE3 0%, #FFFFFF 100%)',
  },
};

export default function PostRoundModal({
  isOpen,
  overallScoresData,
  currentRound,
}: PostRoundModalProps) {
  if (!isOpen) return null;

  const getPerformanceRound = (): PostRoundPerformance => {
    const roundData = overallScoresData[(currentRound ?? 1) as RoundType];

    const sectorDeductions = Object.values(UserSectorEnum).map((userSectorEnum) =>
      roundData ? (roundData[userSectorEnum]?.totalScoreToDeduct ?? 0) : 0
    );

    const getSectorPerf = (deduction: number): PostRoundPerformance => {
      if (currentRound === 1) {
        // Round 1: Little Flooding 0 to -5, Moderate -5.01 to -60, Heavy -60.01 to -120
        if (deduction <= 5) return 'good';
        if (deduction <= 60) return 'okay';
        return 'bad';
      }
      if (currentRound === 2) {
        // Round 2: Little Flooding 0 to -10, Moderate -10.01 to -149.99, Heavy -150 to -300
        if (deduction <= 10) return 'good';
        if (deduction <= 149.99) return 'okay';
        return 'bad';
      }
      if (currentRound === 3) {
        // Round 3: Little Flooding 0 to -20, Moderate -20.01 to -179.99, Heavy -180 to -400
        if (deduction <= 20) return 'good';
        if (deduction <= 179.99) return 'okay';
        return 'bad';
      }
      return 'okay';
    };

    // Evaluate each sector individually and return the worst performance
    const perfs = sectorDeductions.map(getSectorPerf);
    if (perfs.includes('bad')) return 'bad';
    if (perfs.includes('okay')) return 'okay';
    return 'good';
  };

  const config = performanceConfigs[getPerformanceRound()];

  return (
      <div
        className="p-[1dvh] rounded-b-[2dvh] text-center mb-[1dvh] backdrop-blur-[17px] shadow-lg border border-[white]"
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderGradient,
        }}
      >
        {/* Content */}
        <div className="flex flex-col items-center gap-[1dvh] text-center">
          <h2 className="text-white text-[4dvh] font-bold max-w-full w-full uppercase">
            {config.title}
          </h2>
          <p className="text-white text-[3dvh] font-bold uppercase leading-relaxed">
            {config.message}
          </p>
        </div>
      </div>
  );
}

