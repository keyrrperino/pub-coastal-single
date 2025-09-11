import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from 'next/image';
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
import AnimatedModal from "@/games/pub-coastal-game/compontents/AnimatedModal";
import AnimatedTitle from "@/games/pub-coastal-game/compontents/AnimatedTitle";
import RoundStartAnimationModal from "@/games/pub-coastal-game/compontents/RoundStartAnimationModal";
import { usePreparingProgress } from "./hooks/usePreparingProgress";
import ScoreBreakdownModal from "@/games/pub-coastal-game/compontents/ScoreBreakdownModal";
import { SectorPerformance, useSectorScores } from "./hooks/useSectorScores";
import TutorialScreen3 from "@/components/TutorialScreen3";
import TutorialScreen2 from "@/components/TutorialScreen2";
import TutorialScreen1 from "@/components/TutorialScreen1";
import { useLobbyInstruction } from "./hooks/useLobbyInstruction";
import Round1Screen from "./Round1Screen";
import { useLobbyStoryline } from "./hooks/useLobbyStoryline";

// DEV MODE TOGGLE - Set to true to enable manual tutorial controls
const DEV_MODE_MANUAL_TUTORIALS = false; //process.env.NODE_ENV === 'development';
import Round2Screen from "./Round2Screen";
import Round3Screen from "./Round3Screen";
import { useTimer } from "./hooks/useTimer";
import { PHASE_DURATIONS } from "./hooks/phaseUtils";
import EndingScreen from "./EndingScreen";
import TeamNameInputScreen from "./TeamNameInputScreen";
import EndingLeaderboardOverlay from "./EndingLeaderboardOverlay";
import LeaderboardOverlay from "./LeaderboardOverlay";
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
  useHideAllTriggers(isLoaded, splineAppRef, lobbyState);
  useLobbyPreparation({ lobbyState, gameRoomServiceRef });

  useSplineLoader(
    canvasRef,
    splineAppRef,
    setIsLoaded
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
    if (triggerProgress >= 100) {
      setTriggersLoading(false);
    }

  }, [triggerProgress]);

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

  // Dev mode manual tutorial state
  const [manualTutorialIndex, setManualTutorialIndex] = useState(0);
  
  const {currentTutorial: timerBasedTutorial} = useLobbyInstruction(lobbyState, triggersLoading, gameRoomServiceRef);
  const {timeRemaining: timeRemainingStoryLine} = useLobbyStoryline(lobbyState, triggersLoading, gameRoomServiceRef);
  
  // Use manual tutorial index in dev mode, otherwise use timer-based
  const currentTutorial = DEV_MODE_MANUAL_TUTORIALS ? manualTutorialIndex : timerBasedTutorial;
  const showCountdown = timeRemainingStoryLine <= 3;
  useLobbyRoundBreakdown(lobbyState, triggersLoading, gameRoomServiceRef);
  useLobbyRoundAnimation(lobbyState, triggersLoading, gameRoomServiceRef);


  const isScoreEndingModalTimesUp = () => {
    if (gameRoomServiceRef.current) {
      if (lobbyState.gameLobbyStatus === GameLobbyStatus.ENDING) {
        gameRoomServiceRef.current.updateLobbyState({
          ...lobbyState, ...{
          [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.TEAM_NAME_INPUT,
          [LobbyStateEnum.PHASE_START_TIME]: 0,
          [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.TEAM_NAME_INPUT,
        }});
      }
    }
  };

  useTimer({
    duration: lobbyState.phaseDuration,
    onTimeUp: isScoreEndingModalTimesUp,
    startImmediately: !triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ENDING,
    syncWithTimestamp: lobbyState.phaseStartTime,
  });

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

  const backToStart = async () => {
    await gameRoomServiceRef.current?.deleteActivities();
    await gameRoomServiceRef.current?.updateLobbyState(lobbyStateDefaultValue);
  }

  const renderEndingScreen = (!triggersLoading && lobbyState.gameLobbyStatus === GameLobbyStatus.ENDING) && (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10"
      style={{ borderRadius: 0 }}
    >
      <EndingScreen performance={totalPerformance} finalScore={totalScore} />
    </div>
  )
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
        onClose={backToStart}
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
      className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10"
      style={{ borderRadius: 0 }}
    >

      {lobbyState.round === 1 && <PlayerRound1Screen timeRemaining={showCountdown ? timeRemainingStoryLine : undefined} />}
      {lobbyState.round === 2 && <PlayerRound2Screen timeRemaining={showCountdown ? timeRemainingStoryLine : undefined} />}
      {lobbyState.round === 3 && <PlayerRound3Screen timeRemaining={showCountdown ? timeRemainingStoryLine : undefined} />}
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
          className={"w-full z-9 h-[70%] m-0 p-0 " + (triggersLoading && "d-none")}
          style={{ display: "block", borderRadius: 0, border: "none" }}
        />

        {/* Loading overlay with percentage */}
        {(triggersLoading) && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10"
            style={{ borderRadius: 0 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <span className="text-xl font-semibold text-blue-700 mb-2">
              {isLoaded ? `Loading Map... ${triggerProgress}%` : "Loading Map..."}
            </span>
          </div>
        )}

      </div>
      {!triggersLoading && <SectorControl onClickSector={onClickSector} sector={sector} roomName={roomName} isSplineLoading={triggersLoading} />}

      {/* {renderScore} */}
      {renderProgressBar}
      {/* {renderInstroductions} */}
      {renderStoryLine}
      {renderEndingScreen}
      {/* {renderInputTeamName} */}
      {renderEndingLeaderBoard}
      {renderRoundAnimation}
      {renderRoundScoreBreakdown}
    </>
  );
};

export default SplineFirebase; 