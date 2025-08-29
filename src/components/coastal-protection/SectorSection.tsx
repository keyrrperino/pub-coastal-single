import React from 'react';
import CoastalProtectionMeasure from './CoastalProtectionMeasure';
import CoinIndicator from './CoinIndicator';
import styles from './styles.module.css';

interface SectorSectionProps {
  title: string;
  titleReverse: boolean;
  measures: Array<{
    type: 'land-reclamation' | 'seawall' | 'mangroves' | 'storm-surge-barrier' | 'artificial-reef' | 'hybrid-measure' | 'revetment';
    title: string;
    subtitle?: string;
    hasNoMoreAvailableUpgrades?: boolean;
    isActive?: boolean;
    options: Array<{
      title: string;
      coinCount: number;
      onClick?: () => void;
      isSelected?: boolean;
      disabled?: boolean;
    }>;
  }>;
  demolishOption?: {
    coinCount: number;
    onClick?: () => void;
    disabled?: boolean;
  };
}

const SectorSection: React.FC<SectorSectionProps> = ({ 
  title, 
  measures, 
  demolishOption,
  titleReverse
}) => {

  const renderDemolishButton = () => {
    return (
      <div className="flex flex-col items-center" style={!demolishOption ? { opacity: 0 }: {}}>
        <button
          onClick={demolishOption?.disabled ? undefined : demolishOption?.onClick}
          disabled={demolishOption?.disabled}
          className={`${styles.demolishButton} flex flex-col rounded-[1vh] justify-center items-center ${demolishOption?.disabled ? 'opacity-50 cursor-not-allowed' : 'pulseAnimation'}`}
        >
          <div className={`${styles.novecentoBold} text-[16px] font-bold leading-[13px] text-white uppercase flex gap-[0.2vw] items-center p-[0.5vh]`}>
            <CoinIndicator count={demolishOption?.coinCount} direction="row" /> DEMOLISH
          </div>
        </button>
      </div>
    );
  };
  const renderTitle = titleReverse ? (
    <>
      {renderDemolishButton()}
      <div>
        {title}
      </div>
    </>
  ) : (
    <>
      <div>
          {title}
      </div>
      {renderDemolishButton()}
    </>
  );

  return (
    <div className="flex flex-col items-center gap-[1vh] w-auto flex-1">
      <div className={`${styles.novecentoBold} text-[1.5vh] font-bold text-center text-white uppercase w-full flex justify-between`}>
        {renderTitle}
      </div>
      <div className="flex flex-row items-center justify-center w-full">
        {/* Demolish button and coin below */}
        {/* Measure cards */}
        <div className="grid grid-cols-3 items-start w-full justify-center gap-[1vw]">
          {measures.map((measure, index) => {
            return (
                <CoastalProtectionMeasure
                  key={index}
                  title={measure.title}
                  subtitle={measure.subtitle}
                  icon={measure.type}
                  options={measure.options}
                  isActive={measure.isActive ?? true}
                  hasNoMoreAvailableUpgrades={measure.hasNoMoreAvailableUpgrades}
                />
              )
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorSection;