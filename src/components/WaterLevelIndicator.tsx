import React, { useEffect, useRef } from 'react';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaterLevelIndicatorProps {
  minLevel: number;
  maxLevel: number;
  currentLevel: number;
  unit?: string;
  className?: string;
  scaleMax: number;
  currentWaterColor: {
    from: string;
    to: string;
  };
  projectedWaterColor: {
    from: string;
    to: string;
  };
}

export default function WaterLevelIndicator({
  minLevel,
  maxLevel,
  currentLevel,
  unit = 'metres',
  className = '',
  scaleMax,
  currentWaterColor,
  projectedWaterColor,
}: WaterLevelIndicatorProps) {
  const barRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth number animation
  const animatedMaxLevelValue = useMotionValue(minLevel);
  const displayMaxLevel = useTransform(
    animatedMaxLevelValue,
    (value: number) => value.toFixed(1),
  );

  const textControls = useAnimation();
  const scaleControls = useAnimation();
  const containerControls = useAnimation();
  const currentWaterControls = useAnimation();
  const projectedWaterControls = useAnimation();

  // Orchestrate the animation sequence
  useEffect(() => {
    const animateSequence = async () => {
      const actualHeight = barRef.current?.clientHeight ?? window.innerHeight * 0.5;
      const textOffset = actualHeight * 0.16;

      // Start text animations
      await Promise.all([
        textControls.start({
          opacity: 1,
          y: -(maxLevel / scaleMax) * actualHeight + textOffset,
          transition: { duration: 0.8, ease: 'easeOut' },
        }),
        scaleControls.start({
          opacity: 1,
          x: 0,
          transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
        }),
        containerControls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: 'easeOut', delay: 0.4 },
        }),
      ]);

      await currentWaterControls.start({
        height: `${(currentLevel / scaleMax) * 100}%`,
        transition: { duration: 1.2, ease: 'easeOut' },
      });

      await Promise.all([
        projectedWaterControls.start({
          height: `${((maxLevel - currentLevel) / scaleMax) * 100}%`,
          transition: { duration: 1.0, ease: 'easeOut' },
        }),
        animate(animatedMaxLevelValue, maxLevel, {
          duration: 1.0,
          ease: 'easeOut',
        }),
      ]);
    };

    animateSequence();
  }, [
    currentLevel,
    maxLevel,
    scaleMax,
    textControls,
    scaleControls,
    containerControls,
    currentWaterControls,
    projectedWaterControls,
    animatedMaxLevelValue,
  ]);

  // Generate scale labels dynamically
  const scaleLabels = [];
  const labelCount = 3;
  for (let i = 0; i < labelCount; i++) {
    const value = scaleMax - (i * scaleMax) / (labelCount - 1);
    scaleLabels.push(value);
  }

  return (
    <div
      className={cn(
        'flex w-auto items-end gap-4 h-[50dvh]',
        className,
      )}
    >
      {/* Text Information */}
      <motion.div
        className="flex w-full flex-col items-end gap-2 relative"
        initial={{ opacity: 0 }}
        animate={textControls}
      >
        <div className="text-white text-[4vh] font-bold text-nowrap leading-[1.3] text-right drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          Seawater level rise:
        </div>
        <div className="text-[#FF6A6C] text-[4vh] font-bold text-nowrap leading-[1.3] text-right drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          {minLevel} to <motion.span>{displayMaxLevel}</motion.span>{' '}
          {unit}
        </div>
      </motion.div>

      {/* Visual Water Level Gauge */}
      <div className="flex flex-row h-full gap-[1vh]">
        {/* Scale Labels */}
        <motion.div
          className="h-full flex flex-col justify-between items-start"
          initial={{ opacity: 0, x: -16 }}
          animate={scaleControls}
        >
          {scaleLabels.map((value, index) => (
            <span
              key={index}
              className="text-white text-[2vh] font-bold leading-[1.3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            >
              {value}
              {unit.charAt(0)}
            </span>
          ))}
        </motion.div>

        {/* Water Level Container */}
        <motion.div
          className="relative h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={containerControls}
        >
          {/* Main container with border */}
          <div
            ref={barRef}
            className="w-[3vh] h-full border-[0.1vh] border-white rounded-full relative overflow-hidden"
          >
            {/* Current water level */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-b-full"
              initial={{ height: 0 }}
              animate={currentWaterControls}
              style={{
                background: `linear-gradient(180deg, ${currentWaterColor.from} 0%, ${currentWaterColor.to} 100%)`,
              }}
            />

            {/* Projected additional water level */}
            <motion.div
              className="absolute left-0 right-0"
              initial={{ height: 0 }}
              animate={projectedWaterControls}
              style={{
                bottom: `${(currentLevel / scaleMax) * 100}%`,
                background: `linear-gradient(180deg, ${projectedWaterColor.from} 0%, ${projectedWaterColor.to} 100%)`,
                borderRadius: maxLevel >= scaleMax ? '22px 22px 0 0' : '0',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
