import React from 'react';
import MeasureOption from './MeasureOption';
import styles from './styles.module.css';

interface CoastalProtectionMeasureProps {
  title: string;
  subtitle?: string;
  icon: 'land-reclamation' | 'seawall' | 'mangroves' | 'storm-surge-barrier' | 'artificial-reef' | 'hybrid-measure' | 'revetment';
  options: Array<{
    title: string;
    coinCount: number;
    onClick?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
  }>;
  isActive?: boolean;
  hasNoMoreAvailableUpgrades?: boolean;
}

const CoastalProtectionMeasure: React.FC<CoastalProtectionMeasureProps> = ({
  title,
  subtitle,
  icon,
  options,
  isActive = true,
  hasNoMoreAvailableUpgrades = false
}) => {
  const getIconSrc = () => {
    switch (icon) {
      case 'land-reclamation':
        return '/assets/land-reclamation-icon-6b707d.png';
      case 'seawall':
        return '/assets/seawall-icon-41fadd.png';
      case 'mangroves':
        return '/assets/mangroves-icon-3a15a8.png';
      case 'storm-surge-barrier':
        return '/assets/storm-surge-barrier-icon.png';
      case 'artificial-reef':
        return '/assets/artificial-reef-icon.png';
      case 'hybrid-measure':
        return '/assets/hybrid-measure-icon.png';
      case 'revetment':
        return '/assets/seawall-icon-41fadd.png'; // Using seawall icon as fallback
      default:
        return '';
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case 'land-reclamation':
        return '#8CFFEC';
      case 'seawall':
        return '#8CFFEC'; // Using same color as land reclamation based on Figma
      case 'mangroves':
        return '#BFFFBE';
      case 'storm-surge-barrier':
        return '#8CFFEC'; // Matches Figma design
      case 'artificial-reef':
        return '#BFFFBE'; // Matches Figma design
      case 'hybrid-measure':
        return '#8CFFEC'; // Matches Figma design
      case 'revetment':
        return '#B0C4DE'; // Light steel blue for revetment
      default:
        return '#FFFFFF';
    }
  };

  return (
    <div
      className={`${styles.coastalProtectionCard} flex flex-col justify-center items-center w-auto gap-[0.5vh]`}
      style={{
        opacity: isActive ? 1 : 0.4,
        pointerEvents: isActive ? 'auto' : 'none',
        filter: isActive ? 'none' : 'grayscale(0.7)',
        transition: 'opacity 0.3s, filter 0.3s'
      }}
    >
      <div className="flex items-center gap-[0.7vw] w-full">
        <div 
          className="flex justify-center items-center w-[2vw] h-[2vw] rounded-full overflow-hidden"
          style={{ backgroundColor: getIconBgColor() }}
        >
          <img 
            src={getIconSrc()} 
            alt={title}
            className="w-[1.5vw] h-[1.5vw] object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className={`${styles.novecentoBold} text-[1vw] leading-[14px] text-white uppercase`} style={{lineHeight: '0.8em'}}>
            {title}
          </div>
          {subtitle && (
            <div className={`${styles.novecentoBold} text-[10px] leading-[8px] text-white uppercase`} style={{lineHeight: '0.8em'}}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-center gap-[0.4vw] w-full">
        {hasNoMoreAvailableUpgrades ? (
          <div className="flex flex-col items-center">
            <div className="flex flex-col justify-center items-center w-[76px] h-[76px]">
              <div className={`${styles.novecentoBold} text-[14px] font-bold leading-[14px] text-white uppercase text-center`}>
                NO MORE<br/>AVAILABLE<br/>UPGRADES
              </div>
            </div>
            <div style={{height: '20px'}}></div> {/* Match CoinIndicator height */}
          </div>
        ) : (
          options.map((option, index) => (
            <MeasureOption
              key={index}
              title={option.title}
              coinCount={option.coinCount}
              onClick={option.onClick}
              isSelected={option.isSelected}
              disabled={option.disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CoastalProtectionMeasure;