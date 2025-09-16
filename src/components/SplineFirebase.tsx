import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Application, SplineEventName } from "@splinetool/runtime";
import { GameRoomService, getGlobalLeaderboard, ProcessedLeaderboardData } from "@/lib/gameRoom";
import ProgressBar from "@/games/pub-coastal-game/compontents/ProcessBar";
import { ActivityLogType, LobbyStateType, RoundType } from "@/lib/types";
import { GAME_ROUND_TIMER, GAME_STARST_IN_COUNTDOWN, lobbyStateDefaultValue, MODAL_CLOSE_COUNTDOWN_VALUE, OVERALL_SCORE_POINTS, SPLINE_URL, SplineTriggersConfig, TOTAL_COINS_PER_ROUND } from "@/lib/constants";
import { CutScenesEnum, GameEnum, GameLobbyStatus, LobbyStateEnum, UserSectorEnum } from "@/lib/enums";
import { useInitialize } from "./hooks/initialize";
 
import { useSplineTriggers } from "./hooks/useSplineTriggers";
import { useLobbyPreparation } from "./hooks/useLobbyPreparation";
import { getPlayerNumber, isGameOnGoing } from "@/lib/utils";
import { useSplineLoader } from "./hooks/useSplineLoader";
import { CutScenesStatusEnum, useCutSceneSequence } from "./hooks/useSplineCutSceneTriggers";
import { useHideAllTriggers } from "./hooks/useHideAllSplineTriggers";
import RoundStartAnimationModal from "@/games/pub-coastal-game/compontents/RoundStartAnimationModal";
import ScoreBreakdownModal from "@/games/pub-coastal-game/compontents/ScoreBreakdownModal";
import { SectorPerformance, useSectorScores } from "./hooks/useSectorScores";
import { useLobbyStoryline } from "./hooks/useLobbyStoryline";
import { useTimer } from "./hooks/useTimer";
import { PHASE_DURATIONS } from "./hooks/phaseUtils";
import EndingScreen from "./EndingScreen";
import EndingLeaderboardOverlay from "./EndingLeaderboardOverlay";
import TutorialScreen4 from "@/components/TutorialScreen4";
import { PlayerRound1Screen, PlayerRound2Screen, PlayerRound3Screen } from "./player-screens";
import TutorialScreen5 from "@/components/TutorialScreen5";
import { useLobbyRoundBreakdown } from "./hooks/useLobbyRoundBreakdown";
import { useLobbyRoundAnimation } from "./hooks/useLobbyRoundAnimation";
import { useServerTime } from './ServerTimeContext';
import dynamic from "next/dynamic";
import PostRoundModal from "./PostRoundModal";

const SectorControl = dynamic(() => import('@/components/coastal-protection/SectorControl'), { ssr: false });

interface SplineFirebaseProps {
  roomName: string;
  onClickSector: (value: string) => void;
  sector: string;
}

const SplineFirebase: React.FC<SplineFirebaseProps> = ({
  roomName,
  onClickSector,
  sector,
}) => {
  const { getAdjustedCurrentTime } = useServerTime();
  const {
    canvasRef,
    splineAppRef,
    gameRoomServiceRef,
    isLoaded, setIsLoaded,
    activities,
    newActivities,
    lobbyState,
    triggersLoading, setTriggersLoading,
    triggerProgress, setTriggerProgress,
  } = useInitialize(roomName);

  const [totalScore, setTotalScore] = useState<number>(2500);
  const [criticalProgress, setCriticalProgress] = useState<number>(0);
  const [criticalLoadedCount, setCriticalLoadedCount] = useState<number>(0);
  const [criticalTotalCount, setCriticalTotalCount] = useState<number>(0);

  const [assetsProgress, setAssetsProgress] = useState<number>(0);
  const [assetsLoadedCount, setAssetsLoadedCount] = useState<number>(0);
  const [assetsTotalCount, setAssetsTotalCount] = useState<number>(0);
  useHideAllTriggers(isLoaded, splineAppRef, lobbyState);
  useLobbyPreparation({ lobbyState, gameRoomServiceRef });

  useSplineLoader(
    canvasRef,
    splineAppRef,
    setIsLoaded,
    lobbyState,
    isLoaded
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const calmAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [coinsLeft, setCoinsLeft] = useState(TOTAL_COINS_PER_ROUND); // 1. Add new state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    (async () => { 
      if (lobbyState.gameLobbyStatus === GameLobbyStatus.RESTARTING) {
        await resetGame();
      }
    })();
  }, [lobbyState.gameLobbyStatus]);

  // Listen to showLeaderboard state changes
  useEffect(() => {
    const showLeaderboard = lobbyState[LobbyStateEnum.SHOW_LEADERBOARD];
    if (typeof showLeaderboard === 'boolean') {
      setIsLeaderboardOpen(showLeaderboard);
    }
  }, [lobbyState]);

  useEffect(() => {
    if (triggerProgress >= 100 && criticalProgress >= 100 && isLoaded) {
      setTriggersLoading(false);
    }

  }, [triggerProgress, criticalProgress, isLoaded]);

  useSplineTriggers({
    isLoaded,
    splineAppRef,
    activities,
    newActivities,
    triggerProgress,
    setTriggerProgress,
    lobbyState
  });

  const onRoundGameplayTimeUp = () => {
    if (gameRoomServiceRef.current && lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_GAMEPLAY) {
      gameRoomServiceRef.current.updateLobbyState({
        ...lobbyState, ...{
        [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.ROUND_CUTSCENES,
        [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime(),
        [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.ROUND_CUTSCENES,
      }});
    }
  };
  
  const {onNext: onNextStoryLine} = useLobbyStoryline(lobbyState, gameRoomServiceRef);
  
  // Use manual tutorial index in dev mode, otherwise use timer-based
  const {isScoreBreakdownTimesUp} = useLobbyRoundBreakdown(lobbyState, triggersLoading, gameRoomServiceRef);
  useLobbyRoundAnimation(lobbyState, triggersLoading, gameRoomServiceRef);

  const [leaderboardData, setLeaderboardData] = useState<ProcessedLeaderboardData>({
    topWinner: null,
    top5: [],
    currentTeamEntry: null
  });

  // Inactivity watchdog during TEAM_NAME_INPUT (monitor only team name input activity)
  const lastInteractionRef = useRef<number>(Date.now());
  const INACTIVITY_RESET_MS = 60000; // 60 seconds of inactivity triggers reset

  // Bump interaction timestamp when team name changes
  useEffect(() => {
    // Any change (including clearing) counts as interaction
    lastInteractionRef.current = Date.now();
  }, [lobbyState?.[LobbyStateEnum.TEAM_NAME]]);

  // Start/reset inactivity timer when entering TEAM_NAME_INPUT
  useEffect(() => {
    if (lobbyState.gameLobbyStatus !== GameLobbyStatus.TEAM_NAME_INPUT) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (lastInteractionRef.current || 0);
      if (elapsed >= INACTIVITY_RESET_MS) {
        clearInterval(intervalId);
        // Reset game due to inactivity while waiting for team name input
        resetGame();
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lobbyState.gameLobbyStatus]);

  useEffect(() => {
    if (lobbyState.gameLobbyStatus === GameLobbyStatus.LEADERBOARD_DISPLAY) {
      const currentTeamNameScore = lobbyState?.[LobbyStateEnum.TEAM_NAME] || undefined;
      getGlobalLeaderboard(currentTeamNameScore).then(data => {
        setLeaderboardData(data);
      });
    }
  }, [lobbyState.gameLobbyStatus]);


  const [totalPerformance, setTotalPerformance] = useState<SectorPerformance>('okay');
  
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance>('okay');

  const overAllScores = useSectorScores({
    activities: activities ?? [],
    lobbyState,
    setTotalScore,
    setCoinsLeft,
    setSector1Performance: setSectorPerformance,
    setSector2Performance: setSectorPerformance,
    setSector3Performance: setSectorPerformance,
    setTotalPerformance,
    triggersLoading,
    newActivities,
    roomName
  });

  const { cutSceneStatus, currentCutScene } = 
    useCutSceneSequence(lobbyState, overAllScores);

  useEffect(() => {
    if (cutSceneStatus === CutScenesStatusEnum.ENDED && lobbyState.round <= 3) {
      if (gameRoomServiceRef.current) {
        gameRoomServiceRef.current.updateLobbyState({
          ...lobbyState, ...{
          [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.ROUND_SCORE_BREAKDOWN,
          [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime(),
          [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.ROUND_SCORE_BREAKDOWN,
        }});
      }
    }
  }, [cutSceneStatus]);

  // Start/stop background music depending on cutscene phase
  useEffect(() => {
    const newsEl = audioRef.current;
    const calmEl = calmAudioRef.current;
    if (!newsEl || !calmEl) return;

    if (lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_CUTSCENES) {
      // Play news background during cutscenes, pause calm music
      calmEl.pause();
      calmEl.currentTime = 0;
      newsEl.loop = true;
      const playPromise = newsEl.play();
      playPromise?.catch(() => {});
    } else {
      // Outside cutscenes, play calm background and pause news music
      newsEl.pause();
      newsEl.currentTime = 0;
      calmEl.loop = true;
      const playPromise = calmEl.play();
      playPromise?.catch(() => {});
    }
  }, [lobbyState.gameLobbyStatus]);

  // Adjust volume based on whether current cutscene is a news intro
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (lobbyState.gameLobbyStatus !== GameLobbyStatus.ROUND_CUTSCENES) return;

    const isIntro =
      currentCutScene === CutScenesEnum.NEWS_INTRO_1 ||
      currentCutScene === CutScenesEnum.NEWS_INTRO_2 ||
      currentCutScene === CutScenesEnum.NEWS_INTRO_3;

    el.volume = isIntro ? 1.0 : 0.5;
    if (el.paused) {
      const playPromise = el.play();
      playPromise?.catch(() => {});
    }
  }, [currentCutScene, lobbyState.gameLobbyStatus]);

  const resetGame = async () => {
    await gameRoomServiceRef.current?.deleteActivities();
    await gameRoomServiceRef.current?.updateLobbyState(lobbyStateDefaultValue);
    window.location.reload(); 
  }

  // Preload cutscene overlay images and critical intro videos with progress
  const cutsceneAssetUrls = useMemo(() => {
    const values = Object.values(CutScenesEnum);
    const toSlug = (value: string) => value?.replaceAll("-", " ").toLocaleLowerCase();
    const imageUrls = values.map(v => `/games/pub-coastal-spline/flash-reports/images/${toSlug(v)}.png?v=1.1`);

    const allVideoUrls = values.map(v => ({ key: v, url: `/games/pub-coastal-spline/flash-reports/videos/${toSlug(v)}.webm?v=1.1`}));
    const isIntro = (k: string) => [CutScenesEnum.NEWS_INTRO_1, CutScenesEnum.NEWS_INTRO_2, CutScenesEnum.NEWS_INTRO_3].includes(k as CutScenesEnum);
    const videoCriticalUrls = allVideoUrls.filter(v => isIntro(v.key)).map(v => v.url);
    const videoDeferredUrls = allVideoUrls.filter(v => !isIntro(v.key)).map(v => v.url);

    return { imageUrls, videoCriticalUrls, videoDeferredUrls };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const criticalTotal = (cutsceneAssetUrls.videoCriticalUrls.length + cutsceneAssetUrls.imageUrls.length);
    const allTotal = criticalTotal + cutsceneAssetUrls.videoDeferredUrls.length;
    setCriticalTotalCount(criticalTotal);
    setAssetsTotalCount(allTotal);

    if (criticalTotal === 0) {
      setCriticalProgress(100);
    }
    if (allTotal === 0) {
      setAssetsProgress(100);
    }

    const preloadImage = (url: string) => new Promise<void>((resolve) => {
      try {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      } catch {
        resolve();
      }
    });

    const preloadVideoMetadata = (url: string) => new Promise<void>((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        const done = () => {
          try { video.removeAttribute('src'); video.load(); } catch {}
          resolve();
        };
        video.addEventListener('loadedmetadata', done, { once: true });
        video.addEventListener('error', done, { once: true });
        setTimeout(done, 5000);
        video.src = url;
      } catch {
        resolve();
      }
    });

    const bumpCritical = () => setCriticalLoadedCount(prev => {
      const next = prev + 1;
      setCriticalProgress(Math.round((next / Math.max(1, criticalTotal)) * 100));
      return next;
    });
    const bumpAll = () => setAssetsLoadedCount(prev => {
      const next = prev + 1;
      setAssetsProgress(Math.round((next / Math.max(1, allTotal)) * 100));
      return next;
    });

    const runWithConcurrency = async (
      work: Array<{ task: () => Promise<void>; isCritical: boolean }>,
      limit: number
    ) => {
      let idx = 0;
      let running = 0;
      return new Promise<void>((resolveAll) => {
        const launchNext = () => {
          if (isCancelled) return resolveAll();
          while (running < limit && idx < work.length) {
            const { task, isCritical } = work[idx++];
            running++;
            task().then(() => {
              if (isCritical) bumpCritical();
              bumpAll();
            }).finally(() => {
              running--;
              if (idx >= work.length && running === 0) {
                resolveAll();
              } else {
                launchNext();
              }
            });
          }
        };
        launchNext();
      });
    };

    const criticalTasks: Array<{ task: () => Promise<void>; isCritical: boolean }> = [
      ...cutsceneAssetUrls.imageUrls.map((u) => ({ task: () => preloadImage(u), isCritical: true })),
      ...cutsceneAssetUrls.videoCriticalUrls.map((u) => ({ task: () => preloadVideoMetadata(u), isCritical: true })),
    ];

    const deferredTasks: Array<{ task: () => Promise<void>; isCritical: boolean }> = [
      ...cutsceneAssetUrls.videoDeferredUrls.map((u) => ({ task: () => preloadVideoMetadata(u), isCritical: false })),
    ];

    // Start both queues; critical is allowed higher concurrency
    runWithConcurrency(criticalTasks, 4);
    runWithConcurrency(deferredTasks, 2);

    return () => { isCancelled = true; };
  }, [cutsceneAssetUrls]);

  const displayThankYou = async () => {
    if (gameRoomServiceRef.current) {
      gameRoomServiceRef.current.updateLobbyState({
        ...lobbyState, ...{
        [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.THANK_YOU,
        [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime(),
        [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.THANK_YOU,
      }});
    }
  }

  const renderAllCutScences = (
    Object.values(CutScenesEnum).map(value => {
      return (
        <div
          className="fixed inset-0 h-screen m-0 p-0 bg-black z-10 w-[101%]"
          style={{ opacity: 1, display: value === currentCutScene ? "block" : "none" }}
        >
          <video
            src={`/games/pub-coastal-spline/flash-reports/videos/${value?.replaceAll("-", " ").toLocaleLowerCase()}.webm?v=1.1`}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            onLoadedMetadata={(e) => {
              if (![CutScenesEnum.NEWS_INTRO_1, CutScenesEnum.NEWS_INTRO_2, CutScenesEnum.NEWS_INTRO_3].includes(value)) {
                e.currentTarget.playbackRate = 0.7143;
              }
            }}
            onPlay={(e) => {
              if (![CutScenesEnum.NEWS_INTRO_1, CutScenesEnum.NEWS_INTRO_2, CutScenesEnum.NEWS_INTRO_3].includes(value)) {
                e.currentTarget.playbackRate = 0.7143;
              }
            }}
            className="fixed w-full h-full m-0 p-0 z-10"
          />
          {/* Frame Overlay */}
          <div className="fixed inset-0 z-20 flex items-center justify-center h-[100vh]">
            <img
              src={`/games/pub-coastal-spline/flash-reports/images/${value?.replaceAll("-", " ").toLocaleLowerCase()}.png?v=1.1`}
              className="pointer-events-none max-h-[100vh]"
              // style={{ objectFit: "" }}
              alt="Frame Overlay"
            />
          </div>
        </div>
      )
    })
  )

  const renderEndingLeaderBoard = (!triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.LEADERBOARD_DISPLAY) && (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-opacity-80 z-10"
      style={{ borderRadius: 0 }}
    >
      <EndingLeaderboardOverlay
        isOpen={true}
        onClose={displayThankYou}
        topWinner={leaderboardData.topWinner || undefined}
        leaderboardData={leaderboardData.top5}
        bottomHighlight={leaderboardData.currentTeamEntry || { 
          name: lobbyState?.[LobbyStateEnum.TEAM_NAME], 
          points: totalScore, 
          position: 10 
        }}
      />
    </div>
  )

  const renderProgressBar = (
    (!triggersLoading && isGameOnGoing(lobbyState.gameLobbyStatus) && cutSceneStatus !== CutScenesStatusEnum.STARTED) && 
      <ProgressBar
          containerClassName="fixed z-10 top-[9vh] left-[30vw] px-[1vw] py-[1.3vw] w-[40vw]"
          style={{display: "none"}}
          key={`${lobbyState.round ?? 1}-${lobbyState.gameLobbyStatus}`}
          duration={lobbyState.phaseDuration}
          onTimeUp={onRoundGameplayTimeUp}
          isRunning={!triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_GAMEPLAY}
          syncWithTimestamp={lobbyState.phaseStartTime}
          lobbyState={lobbyState}
        />
  )

  const renderStoryLine = (
    (!triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_STORYLINE) && 
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-opacity-80 z-10"
      style={{ borderRadius: 0 }}
    >

      {lobbyState.round === 1 && <PlayerRound1Screen onContinue={onNextStoryLine} />}
      {lobbyState.round === 2 && <PlayerRound2Screen onContinue={onNextStoryLine} />}
      {lobbyState.round === 3 && <PlayerRound3Screen  onContinue={onNextStoryLine} />}
    </div>
  )

  const renderRoundAnimation = (
    !triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_ANIMATION && (
      <RoundStartAnimationModal
        isOpen={true}
        round={lobbyState.round ?? 1}
      />
    )
  );

  const renderRoundScoreBreakdown = (
    !triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ROUND_SCORE_BREAKDOWN && (
      <ScoreBreakdownModal
        isOpen={true}
        key={lobbyState.round + "-breakdownmodal"}
        breakdown={overAllScores}
        totalScore={totalScore}
        onDurationComplete={isScoreBreakdownTimesUp}
        roundNumber={(lobbyState.round ?? 1) as 1|2|3}
        upperContent={
          <PostRoundModal
            isOpen={true}
            performance={sectorPerformance}
            overallScoresData={overAllScores}
            currentRound={lobbyState?.[LobbyStateEnum.ROUND] || 1}
            sector={
              ('user_sector_' + getPlayerNumber(sector)) as UserSectorEnum
            }
          />
        }
      />
    )
  );

  return (
    <>
      <div
        className="fixed inset-0 w-[101%] h-screen m-0 p-0 bg-black z-0"
        // style={{ borderRadius: 0, gap: 0 }}
      >
        {/* Only show Spline when triggers are done loading */}
        
        {renderAllCutScences}

        <audio
          ref={audioRef}
          src="/games/pub-coastal-spline/flash-reports/audio/news-background-music.mp3"
        />
        <audio
          ref={calmAudioRef}
          src="/games/pub-coastal-spline/flash-reports/audio/Calm Background Music.mp3"
        />

        <canvas
          ref={canvasRef}
          className={"w-full z-9 h-[70%] m-0 p-0 " + ((triggersLoading && isLoaded) && "d-none")}
          style={{ display: "block", borderRadius: 0, border: "none" }}
        />

        {/* Loading overlay with combined percentage (assets + triggers) */}
        {(triggersLoading || !isLoaded || criticalProgress < 100) && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            <div className="absolute inset-0 z-[-1]" style={{
              backgroundImage: "url('/assets/bg-loading.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#008DF0'
            }} />
            {/* Map overlay fill based on combined resources percentage */}
            {(() => {
              const combined = Math.round((assetsProgress + Math.min(100, triggerProgress)) / 2);
              return (
                <div
                  className="relative w-full flex items-end justify-center"
                >
                  <img
                          src="/assets/Loading Map BG.png"
                          alt="Loading Map Overlay"
                          className="w-[25%] h-auto select-none pointer-events-none"
                          draggable={false}
                        />
                  
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div className="w-[27%] h-full relative pt-[200px]">
                      <div
                        className="absolute bottom-[-1vh] left-0 right-0 overflow-hidden flex items-end justify-center"
                        style={{ height: `${combined}%` }}
                      >
                        <img
                          src="/assets/Loading Map Overlay.png"
                          alt="Loading Map Overlay"
                          className="w-full h-auto select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <h2 className="mt-5 text-white text-2xl md:text-4xl font-extrabold tracking-wide text-center uppercase">
              WE'RE GETTING THINGS READY. HOLD TIGHT!
            </h2>

            <div className="mt-4 flex items-center gap-6 text-white text-base md:text-xl font-extrabold tracking-wider uppercase">
              <span>ASSETS {assetsProgress}%</span>
              <span className="opacity-70">|</span>
              <span>MAP {Math.min(100, triggerProgress)}%</span>
            </div>
          </div>
        )}

      </div>
      {!triggersLoading && isLoaded && <SectorControl
        onClickSector={onClickSector}
        sector={sector}
        roomName={roomName}
        isSplineLoading={triggersLoading}
      />}

      {/* {renderScore} */}
      {renderProgressBar}
      {/* {renderInstroductions} */}
      {renderStoryLine}
      {/* {renderInputTeamName} */}
      {renderEndingLeaderBoard}
      {renderRoundAnimation}
      {renderRoundScoreBreakdown}
    </>
  );
};

export default SplineFirebase; 