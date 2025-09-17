import React, { ReactElement } from 'react';
import { UserSectorEnum } from '@/lib/enums';
import {
  OverallScoresTypes,
  RoundType,
} from '@/lib/types';
import { OVERALL_SCORE_POINTS } from '@/lib/constants';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  breakdown: { [key in RoundType]?: OverallScoresTypes | undefined };
  roundNumber: RoundType;
  totalScore: number;
  syncWithTimestamp?: number;
  onDurationComplete?: () => void;
  upperContent?: ReactElement;
}

export default function ScoreBreakdownModal({
  isOpen,
  breakdown,
  roundNumber,
  onDurationComplete,
  upperContent
}: ScoreBreakdownModalProps) {
  const roundColors: {
    [key in RoundType]: { color1: string; color2: string };
  } = {
    1: {
      color1: 'rgba(132, 145, 198, 1)',
      color2: '#2A81FA',
    },
    2: {
      color1: 'rgba(230, 202, 119, 1)',
      color2: 'rgba(239, 159, 12, 1)',
    },
    3: {
      color1: 'rgba(230, 119, 133, 1)',
      color2: 'rgba(221, 0, 70, 1)',
    },
  };

  if (!isOpen || !breakdown) return null;

  const getTotalPoints = () => {
    let overAllScore =
      OVERALL_SCORE_POINTS -
      ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_3?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_3?.totalScoreToDeduct ?? 0));

    if (roundNumber === 1) {
      overAllScore =
        OVERALL_SCORE_POINTS -
        ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0));
    }

    if (roundNumber === 2) {
      overAllScore =
        OVERALL_SCORE_POINTS -
        ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_3?.totalScoreToDeduct ?? 0));
    }

    return overAllScore;
  };

  const getPrviousRoundTotalPoints = () => {
    let overAllScore =
      OVERALL_SCORE_POINTS -
      ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[2]?.user_sector_3?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_1?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_2?.totalScoreToDeduct ?? 0) +
        (breakdown[3]?.user_sector_3?.totalScoreToDeduct ?? 0));

    if (roundNumber === 1) {
      overAllScore = OVERALL_SCORE_POINTS;
    }

    if (roundNumber === 2) {
      overAllScore =
        OVERALL_SCORE_POINTS -
        ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0));
    }

    if (roundNumber === 3) {
      overAllScore =
        OVERALL_SCORE_POINTS -
        ((breakdown[1]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[1]?.user_sector_3?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_1?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_2?.totalScoreToDeduct ?? 0) +
          (breakdown[2]?.user_sector_3?.totalScoreToDeduct ?? 0));
    }

    return overAllScore;
  };

  const boxShadow = {
    1: "2vh 2vh 0 #8491C6",
    2: "2vh 2vh 0 #E6CA77",
    3: "2vh 2vh 0 #8491C6"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 flex-col">
      {/* Main Container - responsive and larger */}
      <div className="relative max-w-[50vh] flex flex-col items-center justify-center h-full w-full">
        {/* Content Container */}
        <div
          className="flex w-full flex-col rounded-[2vh] overflow-hidden"
          style={{
            // boxShadow: boxShadow[roundNumber]
          }}
        >
          {/* Header Section */}
          <div className="bg-white flex items-center justify-center">
            <h1 className="text-[#202020] text-[4vh] font-bold text-center leading-[1.2] tracking-wide pt-[3vh]">
              Round {roundNumber} SCORE
              <br />
              BREAKDOWN
            </h1>
          </div>

          {/* Breakdown List in White Section */}
          <div className="flex-1 bg-white px-[3vw] py-[1vh]">
            <div className="flex flex-col space-y-[0.8vh]">
              {/* Total Points */}
              <div className="flex items-center justify-between">
                <span className="text-[#202020] text-[3vh] leading-normal font-bold font-condensed">
                  ROUND START SCORE
                </span>
                <div
                  style={{
                    borderColor: roundColors[roundNumber].color2,
                  }}
                  className="flex-1 mx-3 border-b-[3.37px] border-dashed"
                />
                <span className="text-[#202020] text-[3vh] leading-normal font-bold font-condensed">
                  {getPrviousRoundTotalPoints() ?? 0}
                </span>
              </div>

              {Object.values(UserSectorEnum).map((userSector) => {
                const playerData = (breakdown[roundNumber] ?? {})[
                  userSector
                ];
                const playerScore =
                  playerData?.totalScoreToDeduct ?? 0;
                const playerCoinsSpent =
                  playerData?.totalCoinsToDeduct ?? 0;
                const playerName = `S${userSector.split('_').pop()}`;

                return (
                  <React.Fragment key={userSector}>
                    <div className="flex items-center justify-between">
                      <span className="text-[#202020] text-[2.5vh] leading-normal font-bold font-condensed">
                        {playerName} SCORE DEDUCTION
                      </span>
                      <div
                        style={{
                          borderColor:
                            roundColors[roundNumber].color2,
                        }}
                        className="flex-1 mx-3 border-b-[3.37px] border-dashed"
                      />
                      <span
                        className="text-[2.5vh] leading-normal font-bold font-condensed"
                        style={{
                          color:
                            playerScore > 0 ? '#FF0000' : '#202020',
                        }}
                      >
                        {playerScore === 0 ? '' : '-'}
                        {playerScore}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#202020] text-[2.5vh] leading-normal font-bold font-condensed">
                        {playerName} COINS SPENT
                      </span>
                      <div
                        style={{
                          borderColor:
                            roundColors[roundNumber].color2,
                        }}
                        className="flex-1 mx-3 border-b-[3.37px] border-dashed"
                      />
                      <div className="flex gap-2">
                        {Array(playerCoinsSpent)
                          .fill(null)
                          .map((_, index) => (
                            <img
                              key={`${userSector}_coin_${index}`}
                              src="/assets/coin-icon.png"
                              alt="coin"
                              className="w-[1.8vh] h-[1.8vh]"
                            />
                          ))}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - Final Score */}
          <div
            style={{
              backgroundColor: roundColors[roundNumber].color2,
            }}
            className="px-[1vh] py-[1vh]"
          >
            <div className="text-center">
              <div className="text-[3vh] font-bold text-white">
                END OF ROUND {roundNumber} SCORE
              </div>
              <div className="text-[3vh] font-bold text-white">
                {getTotalPoints() ?? 0}
              </div>
            </div>
          </div>
          {upperContent}
        </div>
        <button
          onClick={() => {
            onDurationComplete?.();
          }}
          className="bg-white text-blue-500 text-[3vh] px-[3vw] py-[1vh] rounded-[100px] hover:bg-blue-600 hover:text-white"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}

