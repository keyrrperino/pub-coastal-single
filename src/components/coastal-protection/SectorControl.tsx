import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import Image from 'next/image';
import SectorSection from './SectorSection';
import styles from './styles.module.css';
import BudgetDisplay from './BudgetDisplay';
import Timer from './Timer';
import InsufficientBudgetModal from './InsufficientBudgetModal';
import {
  GameRoomService,
  saveTeamScoreToGlobalLeaderboard,
  getGlobalLeaderboard,
  ProcessedLeaderboardData,
} from '@/lib/gameRoom';
import {
  ActivityTypeEnum,
  GameEnum,
  GameLobbyStatus,
  LobbyStateEnum,
  SubSectorEnum,
  UserSectorEnum,
} from '@/lib/enums';
import { ActivityLogType, LobbyStateType } from '@/lib/types';
import {
  SplineTriggersConfig,
  GAME_ROUND_TIMER,
} from '@/lib/constants';
import { SplineTriggerConfigItem } from '@/lib/types';
import { useGameContext } from '@/games/pub-coastal-game-spline/GlobalGameContext';
import { useProgression } from '@/components/hooks/useProgression';
import { getPhaseDuration, PHASE_DURATIONS } from '@/components/hooks/phaseUtils';
import {
  useGameFlowController,
  createDefaultLobbyState,
} from '@/components/hooks/useGameFlowController';
import { useServerTime } from '@/components/ServerTimeContext';
import {
  useSectorScores,
  SectorPerformance,
} from '@/components/hooks/useSectorScores';
import {
  hasAnyConstructionInSector,
  hasAnySelectableActionsInMeasureType,
  getCPMCompletionRound,
  getSectorActions,
  calculateActiveActions,
  getActiveCPMPath,
  calculateRoundStartButtonSet,
  isSectorDemolishable,
  getActionState,
} from '@/lib/progressionUtils';

import { ActionStatus, ActionState } from '@/lib/types';

// Import modal components
import IntroductionModal from '@/games/pub-coastal-game/compontents/IntroductionModal';
import RoundInstructionsModal from '@/games/pub-coastal-game/compontents/RoundInstructionsModal';

import EndingModal from '@/games/pub-coastal-game/compontents/EndingModal';
import TeamNameInputModal from '@/games/pub-coastal-game/compontents/TeamNameInputModal';
import StartScreen from '@/components/StartScreen';
import PlayerBackToMenuScreen from '@/components/PlayerBackToMenuScreen';
import LeaderboardOverlay from '@/components/LeaderboardOverlay';
import EndingLeaderboardOverlay from '@/components/EndingLeaderboardOverlay';
import PostRoundModal from '@/components/PostRoundModal';
import Modal from '@/games/pub-coastal-game/compontents/Modal';
import PlayerCutsceneModal from '@/games/pub-coastal-game/compontents/PlayerCutsceneModal';
import RoundStartAnimationModal from '@/games/pub-coastal-game/compontents/RoundStartAnimationModal';
import { getPlayerNumber } from '@/lib/utils';

interface SectorControlProps {
  sector: string;
  roomName: string;
  onClickSector: (value: string) => void;
  isSplineLoading: boolean;
  resetWater?: () => void;
}

// Helper function to get sector titles
const getSectorTitles = (sector: string) => {
  const sectorTitles: Record<
    string,
    { sectorA: string; sectorB: string }
  > = {
    'sector-1': {
      sectorA: 'Sector 1A: Industrial',
      sectorB: 'Sector 1B: RECREATIONAL',
    },
    'sector-2': {
      sectorA: 'Sector 2A: Commercial',
      sectorB: 'Sector 2B: Industrial',
    },
    'sector-3': {
      sectorA: 'Sector 3A: NATURE',
      sectorB: 'Sector 3B: RESIDENTIAL',
    },
  };
  return (
    sectorTitles[sector] || {
      sectorA: 'Sector A',
      sectorB: 'Sector B',
    }
  );
};

// Type for storing round-start button sets
type RoundStartButtonSets = Record<
  string,
  Record<string, { config: any; status: ActionStatus }[]>
>;

const SectorControl: React.FC<SectorControlProps> = ({
  sector,
  roomName,
  onClickSector,
  isSplineLoading,
  resetWater
}) => {
  const { triggerSingleBuild } = useGameContext();
  const { updateFromGameRoomService, getAdjustedCurrentTime } = useServerTime();
  const [gameRoomService, setGameRoomService] = useState(
    () =>
      new GameRoomService(
        `sector-${sector.slice(-1)}`,
        roomName ?? GameEnum.DEFAULT_ROOM_NAME,
      ),
  );

  useEffect(() => {
    setGameRoomService(new GameRoomService(
      `sector-${sector.slice(-1)}`,
      roomName ?? GameEnum.DEFAULT_ROOM_NAME,
    ));
  }, [ sector ]);

  const [activityLog, setActivityLog] = useState<ActivityLogType[]>(
    [],
  );
  const [localRound, setLocalRound] = useState(1);
  const [previousRound, setPreviousRound] = useState(1);
  const [roundStartActivityLog, setRoundStartActivityLog] = useState<
    ActivityLogType[]
  >([]);
  const [roundStartButtonSets, setRoundStartButtonSets] =
    useState<RoundStartButtonSets>({});
  const [
    showInsufficientBudgetModal,
    setShowInsufficientBudgetModal,
  ] = useState(false);
  const [lobbyState, setLobbyState] = useState<any>(
    createDefaultLobbyState(),
  );

  // Track previous phase for restart detection
  const [previousPhase, setPreviousPhase] =
    useState<GameLobbyStatus | null>(null);

  // Helper function to reset all local game state
  const resetLocalGameState = useCallback(() => {
    console.log('Resetting all local game state');
    setActivityLog([]);
    setLocalRound(1);
    setPreviousRound(1);
    setRoundStartActivityLog([]);
    setRoundStartButtonSets({});
    setShowInsufficientBudgetModal(false);
  }, []);

  // Use Firebase round instead of phase-based currentRound for actual game progression
  const firebaseRound = lobbyState?.[LobbyStateEnum.ROUND] || 1;

  // Calculate totalCoins from Firebase state
  const coinsTotalPerRound =
    lobbyState?.[LobbyStateEnum.COINS_TOTAL_PER_ROUND] ?? 10;
  const coinsSpentByRound =
    lobbyState?.[LobbyStateEnum.COINS_SPENT_BY_ROUND] ?? {};
  const coinsSpentThisRound = coinsSpentByRound[firebaseRound] ?? 0;
  const totalCoins = coinsTotalPerRound - coinsSpentThisRound;

  // Game flow management
  const {
    currentPhase,
    currentRound,
    isTransitioning,
    startGameFlow,
    resetGameFlow,
    startActualGameFlow,
  } = useGameFlowController(lobbyState, setLobbyState);

  // Phase timer management - values for Timer component
  const phaseStartTime =
    lobbyState?.[LobbyStateEnum.PHASE_START_TIME] || 0;
  const phaseDuration =
    lobbyState?.[LobbyStateEnum.PHASE_DURATION] || GAME_ROUND_TIMER;

  // Modal states for game flow
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showRoundInstructions, setShowRoundInstructions] =
    useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [showTeamNameInput, setShowTeamNameInput] = useState(false);

  const [showCutscene, setShowCutscene] = useState(false);
  const [showPostRound, setShowPostRound] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [coinsLeft, setCoinsLeft] = useState(0);
  const [sectorPerformance, setSectorPerformance] =
    useState<SectorPerformance>('okay');
  const [totalPerformance, setTotalPerformance] =
    useState<SectorPerformance>('okay');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Leaderboard state for ROUND_SCORE_BREAKDOWN phase
  const [showLeaderboardOverlay, setShowLeaderboardOverlay] =
    useState(false);
  const [leaderboardData, setLeaderboardData] =
    useState<ProcessedLeaderboardData>({
      topWinner: null,
      top5: [],
      currentTeamEntry: null,
    });

  // Debug logging for round state
  useEffect(() => {
    console.log(
      'SectorControl currentRound (phase-based):',
      currentRound,
    );
    console.log(
      'SectorControl firebaseRound (actual game round):',
      firebaseRound,
    );
  }, [currentRound, firebaseRound]);

  // Handle restart flow - reload when state changes away from RESTARTING
  useEffect(() => {
    if (
      previousPhase === GameLobbyStatus.RESTARTING &&
      currentPhase !== GameLobbyStatus.RESTARTING
    ) {
      console.log(
        'State changed away from RESTARTING - reloading page',
      );
      window.location.reload();
    }
    setPreviousPhase(currentPhase);
  }, [currentPhase, previousPhase]);

  // Game flow phase management
  useEffect(() => {
    // Close insufficient budget modal when phase changes (user can no longer take actions)
    if (
      showInsufficientBudgetModal &&
      currentPhase !== GameLobbyStatus.ROUND_GAMEPLAY
    ) {
      console.log(
        'Closing insufficient budget modal due to phase change to:',
        currentPhase,
      );
      setShowInsufficientBudgetModal(false);
    }

    // Close leaderboard when moving to any game phase (not INITIALIZING)
    if (
      isLeaderboardOpen &&
      currentPhase &&
      currentPhase !== GameLobbyStatus.INITIALIZING
    ) {
      console.log(
        'Closing leaderboard due to phase change to:',
        currentPhase,
      );
      setIsLeaderboardOpen(false);
      // Also reset Firebase state
      gameRoomService.updateLobbyStateKeyValue(
        LobbyStateEnum.SHOW_LEADERBOARD,
        false,
      );
    }

    // Handle phase-based modal displays and timers
    switch (currentPhase) {
      case GameLobbyStatus.INTRODUCTION:
        setShowIntroduction(true);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.ROUND_STORYLINE:
        setShowIntroduction(false);
        setShowRoundInstructions(true);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.ROUND_GAMEPLAY:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.ROUND_CUTSCENES:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(true);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.ROUND_SCORE_BREAKDOWN:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowPostRound(true);
        setShowLeaderboardOverlay(false);
        // Fetch leaderboard data when entering this phase
        const currentTeamNameScore =
          lobbyState?.[LobbyStateEnum.TEAM_NAME] || undefined;
        getGlobalLeaderboard(currentTeamNameScore).then((data) => {
          setLeaderboardData(data);
        });
        break;

      case GameLobbyStatus.ENDING:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(true);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        // Use totalScore from useSectorScores instead of calculated score
        setFinalScore(totalScore);
        break;

      case GameLobbyStatus.TEAM_NAME_INPUT:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(true);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.LEADERBOARD_DISPLAY:
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowPostRound(true);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;

      case GameLobbyStatus.RESTARTING:
        // Don't immediately reload - wait for state to change away from RESTARTING
        console.log(
          'RESTARTING phase detected - waiting for state change',
        );
        break;

      default:
        // Hide all modals for other phases
        setShowIntroduction(false);
        setShowRoundInstructions(false);
        setShowEnding(false);
        setShowTeamNameInput(false);
        setShowCutscene(false);
        setShowLeaderboardOverlay(false);
        setShowPostRound(false);
        break;
    }
  }, [
    currentPhase,
    activityLog,
    currentRound,
    showInsufficientBudgetModal,
    isLeaderboardOpen,
    gameRoomService,
  ]);

  // Timer is handled via Firebase sync in useTimer hook
  // No need to manually start/stop timers as they sync with Firebase timestamps

  // Calculate button sets for round start (handles both round changes and initial load)
  const calculateButtonSetsForRound = useCallback(
    (roundStartLog: ActivityLogType[], round: number) => {
      console.log(`Calculating button sets for round ${round}`);
      const buttonSets: RoundStartButtonSets = {};
      ['1A', '1B', '2A', '2B', '3A', '3B'].forEach((sectorId) => {
        buttonSets[sectorId] = {
          mangroves: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'mangroves',
          ),
          seawall: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'seawall',
          ),
          landReclamation: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'land-reclamation',
          ),
          stormSurgeBarrier: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'storm-surge-barrier',
          ),
          artificialReef: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'artificial-reef',
          ),
          hybridMeasure: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'hybrid-measure',
          ),
          revetment: calculateRoundStartButtonSet(
            roundStartLog,
            round,
            sectorId,
            'revetment',
          ),
        };
      });
      return buttonSets;
    },
    [],
  );

  // Handle round changes - capture round start state
  useEffect(() => {
    if (firebaseRound !== previousRound) {
      console.log(
        `Round changed from ${previousRound} to ${firebaseRound}`,
      );
      // Capture the activity log state at the start of this round
      const roundStartLog = [...activityLog];
      setRoundStartActivityLog(roundStartLog);

      // Calculate button sets for this round
      const buttonSets = calculateButtonSetsForRound(
        roundStartLog,
        firebaseRound,
      );
      setRoundStartButtonSets(buttonSets);
    }
    setPreviousRound(firebaseRound);
  }, [
    firebaseRound,
    previousRound,
    activityLog,
    calculateButtonSetsForRound,
  ]);

  // Initialize button sets on first load (R1)
  useEffect(() => {
    if (Object.keys(roundStartButtonSets).length === 0) {
      console.log('Initializing button sets for R1');
      const roundStartLog = [...activityLog];
      setRoundStartActivityLog(roundStartLog);
      const buttonSets = calculateButtonSetsForRound(
        roundStartLog,
        firebaseRound,
      );
      setRoundStartButtonSets(buttonSets);
    }
  }, [
    activityLog,
    firebaseRound,
    roundStartButtonSets,
    calculateButtonSetsForRound,
  ]);

  // Get sector titles
  const sectorTitles = getSectorTitles(sector);

  // Always call useProgression hooks at the top level to follow Rules of Hooks
  const sectorAId = `${sector.slice(-1)}A`;
  const sectorBId = `${sector.slice(-1)}B`;
  const progressionStateA = useProgression(
    activityLog,
    firebaseRound,
    sectorAId,
  );
  const progressionStateB = useProgression(
    activityLog,
    firebaseRound,
    sectorBId,
  );

  // Use sector scores to calculate performance for this specific sector
  const sectorNumber = sector.slice(-1);

  const overallScoresData = useSectorScores({
    activities: activityLog,
    newActivities: activityLog,
    lobbyState,
    setTotalScore,
    setCoinsLeft,
    setSector1Performance:
      sectorNumber === '1' ? setSectorPerformance : undefined,
    setSector2Performance:
      sectorNumber === '2' ? setSectorPerformance : undefined,
    setSector3Performance:
      sectorNumber === '3' ? setSectorPerformance : undefined,
    setTotalPerformance,
    roomName,
  });

  const handleMeasureClick = useCallback(
    async (
      activityType: ActivityTypeEnum,
      coinCost: number,
      sectorId: string,
    ) => {
      // Get the CURRENT firebaseRound from lobbyState to avoid stale closure
      const currentFirebaseRound =
        lobbyState?.[LobbyStateEnum.ROUND] || 1;

      // Debug logging to check round values
      console.log('🟡 MEASURE CLICK DEBUG:');
      console.log('currentRound (phase-based):', currentRound);
      console.log('firebaseRound (stale):', firebaseRound);
      console.log(
        'currentFirebaseRound (fresh):',
        currentFirebaseRound,
      );
      console.log(
        'lobbyState round:',
        lobbyState?.[LobbyStateEnum.ROUND],
      );
      console.log('Activity type:', activityType, 'Cost:', coinCost);

      // Check if we have sufficient coins BEFORE doing anything
      const currentCoinsTotalPerRound =
        lobbyState?.[LobbyStateEnum.COINS_TOTAL_PER_ROUND] ?? 10;
      const currentCoinsSpentByRound =
        lobbyState?.[LobbyStateEnum.COINS_SPENT_BY_ROUND] ?? {};
      const currentCoinsSpentThisRound =
        currentCoinsSpentByRound[currentFirebaseRound] ?? 0;
      const currentTotalCoins =
        currentCoinsTotalPerRound - currentCoinsSpentThisRound;

      if (currentTotalCoins < coinCost) {
        console.log(
          'Insufficient coins - showing modal without taking action',
        );
        setShowInsufficientBudgetModal(true);
        return; // Exit early - don't update UI or Firebase
      }

      // Only proceed if we have sufficient coins
      // Trigger Spline action
      triggerSingleBuild(activityType as any);

      // Log activity to Firebase FIRST (this will check coins again transactionally)
      const triggerConfig = SplineTriggersConfig[activityType];
      const subSectorFromConfig =
        triggerConfig?.subSector || sectorId;
      console.log(
        '🔵 Calling addElement with round:',
        currentFirebaseRound,
      );
      const result = await gameRoomService.addElement(
        activityType,
        `${activityType}`,
        currentFirebaseRound,
        coinCost,
        true,
        subSectorFromConfig as any,
      );

      if (result === 'insufficient') {
        console.log(
          'Insufficient coins from Firebase transaction - showing modal',
        );
        setShowInsufficientBudgetModal(true);
        return; // Don't update local UI if Firebase transaction failed
      } else if (result !== 'ok') {
        console.log('Failed to add element:', result);
        return; // Don't update local UI if Firebase operation failed
      }

      // Only update local UI if Firebase transaction succeeded
      const newActivity: ActivityLogType = {
        id: `temp-${Date.now()}`,
        userId: `Player ${sector.slice(-1)}`,
        userName: `Player ${sector.slice(-1)}`,
        action: activityType,
        value: `${activityType}`,
        round: currentFirebaseRound,
        subSector: subSectorFromConfig,
        timestamp: Date.now(),
      };
      setActivityLog((prev) => [...prev, newActivity]);

      // Note: Coin updates are handled via Firebase lobby state listener, not local state
    },
    [
      triggerSingleBuild,
      gameRoomService,
      currentRound,
      lobbyState,
      sector,
    ],
  );

  const handleDemolishClick = useCallback(
    async (sectorId: string, actionToDestroy: ActivityTypeEnum) => {
      // Get the CURRENT firebaseRound from lobbyState to avoid stale closure
      const currentFirebaseRound =
        lobbyState?.[LobbyStateEnum.ROUND] || 1;

      // Check if we have sufficient coins BEFORE doing anything (demolish costs 1 coin)
      const currentCoinsTotalPerRound =
        lobbyState?.[LobbyStateEnum.COINS_TOTAL_PER_ROUND] ?? 10;
      const currentCoinsSpentByRound =
        lobbyState?.[LobbyStateEnum.COINS_SPENT_BY_ROUND] ?? {};
      const currentCoinsSpentThisRound =
        currentCoinsSpentByRound[currentFirebaseRound] ?? 0;
      const currentTotalCoins =
        currentCoinsTotalPerRound - currentCoinsSpentThisRound;

      if (currentTotalCoins < 1) {
        console.log(
          'Insufficient coins for demolish - showing modal without taking action',
        );
        setShowInsufficientBudgetModal(true);
        return; // Exit early - don't update UI or Firebase
      }

      // Log demolish action to Firebase FIRST (this will check coins again transactionally)
      const result = await gameRoomService.addElement(
        ActivityTypeEnum.DEMOLISH,
        sectorId,
        currentFirebaseRound,
        1,
        true,
        sectorId as any,
      );

      if (result === 'insufficient') {
        console.log(
          'Insufficient coins for demolish from Firebase transaction - showing modal',
        );
        setShowInsufficientBudgetModal(true);
        return; // Don't update local UI if Firebase transaction failed
      } else if (result !== 'ok') {
        console.log('Failed to demolish:', result);
        return; // Don't update local UI if Firebase operation failed
      }

      // Only update local UI if Firebase transaction succeeded
      const demolishActivity: ActivityLogType = {
        id: `temp-demolish-${Date.now()}`,
        userId: `Player ${sector.slice(-1)}`,
        userName: `Player ${sector.slice(-1)}`,
        action: ActivityTypeEnum.DEMOLISH,
        value: sectorId, // Store the specific sector being demolished (e.g., "1A", "1B")
        round: currentFirebaseRound,
        subSector: sectorId,
        timestamp: Date.now(),
      };

      // Update activity log with demolish action
      const newActivityLog = [...activityLog, demolishActivity];
      setActivityLog(newActivityLog);

      // Recalculate button sets ONLY for the demolished sector to reflect the new state
      // Other sectors should keep their frozen button sets from round start
      console.log(
        `Recalculating button sets after demolish for sector ${sectorId} only`,
      );
      setRoundStartButtonSets((prevButtonSets) => {
        const updatedButtonSets = { ...prevButtonSets };

        // Only recalculate for the demolished sector
        updatedButtonSets[sectorId] = {
          mangroves: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'mangroves',
          ),
          seawall: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'seawall',
          ),
          landReclamation: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'land-reclamation',
          ),
          stormSurgeBarrier: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'storm-surge-barrier',
          ),
          artificialReef: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'artificial-reef',
          ),
          hybridMeasure: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'hybrid-measure',
          ),
          revetment: calculateRoundStartButtonSet(
            newActivityLog,
            currentFirebaseRound,
            sectorId,
            'revetment',
          ),
        };

        return updatedButtonSets;
      });
      setRoundStartActivityLog(newActivityLog);

      // Note: Coin updates are handled via Firebase lobby state listener, not local state
    },
    [
      gameRoomService,
      currentRound,
      sector,
      activityLog,
      calculateButtonSetsForRound,
      lobbyState,
    ],
  );

  const handleStartGame = useCallback(async () => {
    console.log('Starting game...');

    // Close leaderboard when starting game (reset Firebase state)
    await gameRoomService.updateLobbyStateKeyValue(
      LobbyStateEnum.SHOW_LEADERBOARD,
      false,
    );
    setIsLeaderboardOpen(false);

    // If we're in LEADERBOARD_DISPLAY phase, set status to RESTARTING instead of starting a new game
    if (currentPhase === GameLobbyStatus.LEADERBOARD_DISPLAY) {
      console.log(
        'In LEADERBOARD_DISPLAY phase - setting status to RESTARTING',
      );
      gameRoomService.updateLobbyStateKeyValue(
        LobbyStateEnum.GAME_LOBBY_STATUS,
        GameLobbyStatus.RESTARTING,
      );
      return;
    }

    // Then update the lobby status to start the game flow
    gameRoomService.updateLobbyStateKeyValue(
      LobbyStateEnum.GAME_LOBBY_STATUS,
      GameLobbyStatus.PREPARING,
    );
  }, [gameRoomService, currentPhase]);

  const handleShowLeaderboard = useCallback(async () => {
    // Toggle Firebase state for leaderboard visibility based on current Firebase state
    const currentFirebaseState =
      lobbyState?.[LobbyStateEnum.SHOW_LEADERBOARD] || false;
    const newState = !currentFirebaseState;
    await gameRoomService.updateLobbyStateKeyValue(
      LobbyStateEnum.SHOW_LEADERBOARD,
      newState,
    );
    setIsLeaderboardOpen(newState);
  }, [gameRoomService, lobbyState]);

  const handleCloseLeaderboard = useCallback(async () => {
    // Reset Firebase state when closing leaderboard
    await gameRoomService.updateLobbyStateKeyValue(
      LobbyStateEnum.SHOW_LEADERBOARD,
      false,
    );
    setIsLeaderboardOpen(false);
  }, [gameRoomService]);

  const handleTimeUp = useCallback(() => {
    console.log(
      'Round gameplay time is up! Waiting for admin to move to next phase...',
    );
    // Do nothing - wait for admin-phase-control page to move to next phase
  }, []);

  // Helper functions for DEMOLISH restrictions
  const isDemolishUsedInRound = useCallback(
    (sectorId: string, round: number): boolean => {
      return activityLog.some(
        (activity) =>
          activity.action === ActivityTypeEnum.DEMOLISH &&
          activity.round === round &&
          activity.subSector === sectorId,
      );
    },
    [activityLog],
  );

  const hasActionsInCurrentRound = useCallback(
    (sectorId: string, round: number): boolean => {
      return activityLog.some((activity) => {
        if (
          activity.round === round &&
          activity.subSector === sectorId
        ) {
          return true;
        }

        return false;
      });
    },
    [activityLog],
  );

  const isDemolishAllowed = useCallback(
    (sectorId: string, round: number): boolean => {
      // R1: DEMOLISH not available
      if (round === 1) {
        return false;
      }

      // R2+: Can only use once per round
      if (isDemolishUsedInRound(sectorId, round)) {
        return false;
      }

      // R2+: Must be first action of the round
      if (hasActionsInCurrentRound(sectorId, round)) {
        return false;
      }

      return true;
    },
    [isDemolishUsedInRound, hasActionsInCurrentRound],
  );

  // Timer is now managed by the game flow system above

  // Initialize game room connection and listen to activity changes
  useEffect(() => {
    const initializeGameRoom = async () => {
      try {
        // Try to join the existing room first
        const joined = await gameRoomService.joinRoom(roomName);
        if (!joined) {
          // If room doesn't exist, create it
          await gameRoomService.createRoom(roomName);
          await gameRoomService.joinRoom(roomName);
        }

        // Update server time context with game room service reference
        console.log(
          '🕒 [SECTOR CONTROL] Setting GameRoomService reference in ServerTimeContext',
        );
        updateFromGameRoomService(gameRoomService);

        // Listen to activity changes
        gameRoomService.onActivityChange((activities) => {
          // Reset local state when Firebase activities are empty (new game)
          if (activities.length === 0 && activityLog.length > 0) {
            console.log(
              'Firebase activities cleared - resetting local state',
            );
            resetLocalGameState();
            return; // Don't set empty activities if we just reset
          }
          setActivityLog(activities);
        });

        // Listen to round changes
        gameRoomService.onRoundChange((round) => {
          console.log('Firebase round changed to:', round);
          setLocalRound(round);
        });

        // Listen to lobby state changes
        gameRoomService.onLobbyStateChange((lobbyStateData) => {
          setLobbyState(lobbyStateData);

          // Reset local state when starting a new game (lobby status is INITIALIZING with no prior state)
          if (
            lobbyStateData &&
            lobbyStateData.gameLobbyStatus ===
              GameLobbyStatus.INITIALIZING
          ) {
            const hasExistingState =
              Object.keys(lobbyStateData.readyPlayers || {}).length >
                0 ||
              Object.keys(lobbyStateData.coinsSpentByRound || {})
                .length > 0;

            if (!hasExistingState) {
              console.log(
                'New game detected - clearing local selections',
              );
              resetLocalGameState();
            }
          }
        });
      } catch (error) {
        console.error('Failed to initialize game room:', error);
      }
    };

    initializeGameRoom();

    return () => {
      gameRoomService.disconnect();
    };
  }, [gameRoomService, resetLocalGameState, activityLog.length]);

  // Helper function to render sector section using ProgressionState system
  const renderSectorSection = (
    sectorId: string,
    title: string,
    progressionState: any,
    titleReverse: boolean
  ) => {
    // progression state is now passed as parameter to avoid calling hooks conditionally

    // Get additional data needed for comprehensive "No More Available Upgrades" check
    const activeActions = calculateActiveActions(activityLog);
    const sectorActions = getSectorActions(sectorId);
    const activeCPMPath = getActiveCPMPath(
      sectorActions,
      activeActions,
    );

    // Get pre-calculated button sets for this sector (calculated once at round start)
    const sectorButtonSets = roundStartButtonSets[sectorId] || {};
    // console.log(`Sector ${sectorId} button sets:`, sectorButtonSets);

    // Map measure types to their display names and button sets - sector-specific order
    const getMeasureTypeConfig = (sectorId: string) => {
      const baseConfig = {
        mangroves: {
          key: 'mangroves',
          title: 'MANGROVES',
          subtitle: '',
          roundStartActions: sectorButtonSets.mangroves || [],
          currentActions: progressionState.mangroves,
        },
        seawall: {
          key: 'seawall',
          title: 'SEAWALL',
          subtitle: '',
          roundStartActions: sectorButtonSets.seawall || [],
          currentActions: progressionState.seawall,
        },
        landReclamation: {
          key: 'land-reclamation',
          title: 'LAND RECLAMATION',
          subtitle: '',
          roundStartActions: sectorButtonSets.landReclamation || [],
          currentActions: progressionState.landReclamation,
        },
        coastalBarriers: {
          key: 'storm-surge-barrier',
          title: 'COASTAL BARRIERS',
          subtitle: '',
          roundStartActions: sectorButtonSets.stormSurgeBarrier || [],
          currentActions: progressionState.stormSurgeBarrier,
        },
        artificialReef: {
          key: 'artificial-reef',
          title: 'ARTIFICIAL REEF',
          subtitle: '',
          roundStartActions: sectorButtonSets.artificialReef || [],
          currentActions: progressionState.artificialReef,
        },
        revetment: {
          key: 'revetment',
          title: 'SEAWALL',
          subtitle: '',
          roundStartActions: sectorButtonSets.revetment || [],
          currentActions: progressionState.revetment,
        },
        hybridMeasure: {
          key: 'hybrid-measure',
          title: 'HYBRID MEASURE',
          subtitle: '',
          roundStartActions: sectorButtonSets.hybridMeasure || [],
          currentActions: progressionState.hybridMeasure,
        },
      };

      // Sector-specific ordering
      if (sectorId === '1A' || sectorId === '1B') {
        return [
          baseConfig.mangroves,
          baseConfig.seawall,
          baseConfig.landReclamation,
        ];
      } else if (sectorId === '2A' || sectorId === '2B') {
        return [
          baseConfig.mangroves,
          baseConfig.seawall,
          baseConfig.coastalBarriers,
        ];
      } else if (sectorId === '3A' || sectorId === '3B') {
        return [
          baseConfig.artificialReef,
          baseConfig.seawall,
          baseConfig.hybridMeasure,
        ];
      }

      // Fallback to all measures
      return Object.values(baseConfig);
    };

    const measureTypeConfig = getMeasureTypeConfig(sectorId);

    // Create measures array - include all measure types, show "Fully Upgraded" for empty ones
    const measures = measureTypeConfig
      .map((config) => {
        // Check if this is an active CPM path that was completed in a PREVIOUS round
        const hasAnySelectableInMeasureType =
          hasAnySelectableActionsInMeasureType(
            config.key,
            sectorActions,
            activeActions,
            activeCPMPath,
            firebaseRound,
          );
        const completionRound = getCPMCompletionRound(
          config.key,
          sectorId,
          activityLog,
        );
        const hasNoMoreAvailableUpgrades =
          !hasAnySelectableInMeasureType &&
          activeCPMPath === config.key &&
          completionRound !== null &&
          firebaseRound > completionRound;

        // If no actions and not active CPM path, don't show the card
        if (
          config.roundStartActions.length === 0 &&
          !hasNoMoreAvailableUpgrades
        ) {
          return null;
        }

        // Normal case: show available actions or no more available upgrades state
        return {
          type: config.key as any,
          title: config.title,
          subtitle: config.subtitle,
          hasNoMoreAvailableUpgrades,
          isActive: !activeCPMPath || activeCPMPath === config.key, // Active if no CPM is built or this is the active CPM
          options: config.roundStartActions.map(
            (roundStartActionState: any) => {
              // Find the current state of this action for proper button states
              let currentActionState = config.currentActions.find(
                (a: any) =>
                  a.config.id === roundStartActionState.config.id,
              );

              // If not found in current actions, recalculate the state based on current game state
              if (!currentActionState) {
                currentActionState = getActionState(
                  roundStartActionState.config,
                  activeActions,
                  activeCPMPath,
                  firebaseRound,
                  activityLog,
                );
              }

              const isSelected =
                currentActionState.status === ActionStatus.COMPLETED;
              const isAvailable =
                currentActionState.status === ActionStatus.SELECTABLE;
              const disabled =
                currentActionState.status ===
                  ActionStatus.LOCKED_CONFLICT ||
                currentActionState.status ===
                  ActionStatus.LOCKED_PREREQUISITE ||
                currentActionState.status === ActionStatus.REPLACED;

              return {
                title: currentActionState.config.displayName,
                coinCount: roundStartActionState.config.cost,
                onClick:
                  isAvailable && !disabled
                    ? () =>
                        handleMeasureClick(
                          currentActionState.config.id,
                          roundStartActionState.config.cost,
                          sectorId,
                        )
                    : undefined,
                isSelected,
                disabled,
                status: currentActionState.status, // Pass the status for potential UI enhancements
              };
            },
          ),
        };
      })
      .filter(Boolean); // Remove null entries

    // Determine if there are any constructions in this sector across the entire game session
    // This function now internally checks if the sector is demolishable (excludes Land Reclamation CPM)
    const canDemolish = hasAnyConstructionInSector(
      sectorId,
      activityLog,
    );
    const isDemolishAllowedForSector = isDemolishAllowed(
      sectorId,
      firebaseRound,
    );

    // Only show demolish option when it's actually clickable
    // Hide in R1, hide if already used in round, hide if other actions taken first, hide if nothing to demolish
    // Also hide if sector has Land Reclamation CPM (handled in hasAnyConstructionInSector)
    const shouldShowDemolish =
      canDemolish && isDemolishAllowedForSector;

    const demolishOption = shouldShowDemolish
      ? {
          coinCount: 1,
          onClick: () => {
            // Demolish all actions for this specific sector
            // We don't need to pass a specific action ID since demolish removes all actions in the sector
            handleDemolishClick(sectorId, ActivityTypeEnum.DEMOLISH);
          },
          disabled: false, // Always enabled when shown since we only show when clickable
        }
      : undefined;

    return (
      <SectorSection
        key={sectorId}
        title={title}
        measures={measures as any}
        demolishOption={demolishOption}
        titleReverse={titleReverse}
      />
    );
  };

  const isBottom = 
    currentPhase === GameLobbyStatus.ROUND_GAMEPLAY || 
    currentPhase === GameLobbyStatus.PREPARING || 
    currentPhase === GameLobbyStatus.ROUND_SCORE_BREAKDOWN ||
    currentPhase === GameLobbyStatus.ROUND_ANIMATION;

  const renderScore = (
    <div className="flex w-full justify-between text-white text-[3vh] pl-[1vh] pr-[1vh]">
      <div className="flex flex-col">
        <h1>
          {coinsLeft > 0 ? "BUDGET" : "NO MORE COINS"}
        </h1>
        <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: coinsLeft }).map((_, idx) => (
          <img
            key={'coin-' + idx}
            src="/games/pub-coastal-spline/images/coin.svg"
            alt="coin"
            className="w-[1.8vh] h-[1.8vh]"
          />
        ))}
        </div>
      </div>
      <div className="flex flex-col justify-end">
      <h1 className="text-center text-[3vw]">
          Round {lobbyState.round ?? 1}
        </h1>
      </div>
      <div className="flex flex-col">
        <h1 className="text-right">
          SCORE
        </h1>
        <h2 className="text-right number-enhanced">
          {totalScore} PTS
        </h2>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden"
      style={
        {
          ...([GameLobbyStatus.ROUND_CUTSCENES].indexOf(currentPhase) >= 0 ? { display: "none"} : {})
        }
      }
    >
      {/* Main content */}

      <div
        className="absolute left-1/2 -translate-x-1/2 w-full z-10 bg-[#10458B] px-[2vw] py-[1vh]"
        style={isBottom ? { bottom: 0 } : {
          ...([GameLobbyStatus.ROUND_CUTSCENES, GameLobbyStatus.TEAM_NAME_INPUT].indexOf(currentPhase) >= 0 ? { display: "none"} : {})
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 w-[101%] z-10 p-2 mt-[-11vh]">
          {/* Budget display left */}
          {renderScore}
        </div>
        <div className="w-full flex flex-col gap-[1vh]">
          {/* Render content based on current phase */}
          {(() => {
            // Gameplay phases: Show Timer, Budget, and Sectors
            if (
              currentPhase === GameLobbyStatus.ROUND_GAMEPLAY ||
              currentPhase === GameLobbyStatus.ROUND_SCORE_BREAKDOWN ||
              currentPhase === GameLobbyStatus.ROUND_ANIMATION
            ) {
              return (
                <div className="w-full flex flex-col">
                  {/* Top bar: Budget left, Timer taking remaining space */}
                  <div
                    className="w-full flex flex-row items-start gap-[1vh]"
                    style={{
                      alignItems: totalCoins > 0 ? 'start' : 'center',
                    }}
                  >

                    {/* Timer taking remaining space */}
                    <div className="flex-1 flex justify-center w-full">
                      {(() => {
                        const timerDuration = showCutscene
                          ? 0
                          : phaseDuration;
                        const timerIsRunning =
                          currentPhase ===
                            GameLobbyStatus.ROUND_GAMEPLAY &&
                          !showCutscene;
                        const timerSyncTimestamp = showCutscene
                          ? undefined
                          : phaseStartTime > 0
                            ? phaseStartTime
                            : undefined;

                        return (
                          <Timer
                            key={`${currentRound}-${currentPhase}`}
                            duration={timerDuration}
                            onTimeUp={handleTimeUp}
                            isRunning={timerIsRunning}
                            syncWithTimestamp={timerSyncTimestamp}
                            currentRound={firebaseRound}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Sector sections */}
                  <div className="flex flex-row w-full items-center justify-center gap-[1vh] mt-[1vh]">
                    
                    {renderSectorSection(
                      sectorAId,
                      sectorTitles.sectorA,
                      progressionStateA,
                      false
                    )}


                    {/* Center sector selector */}
                    {/* style={{ borderLeft: '0.1vw solid rgba(255, 255, 255, 0.2)', borderRight: '0.1vw solid rgba(255, 255, 255, 0.2)' }} */}
                    <div className="flex flex-row items-end justify-center pl-[1vw] pr-[1vw] self-end">
                      {/* left divider */}

                      <div className="w-px h-[14vh] bg-white/30 self-end mr-[1vw]" />

                      <div className="flex flex-col items-center gap-[1vh] mb-[1vh]">
                        {[1, 2, 3].map((num) => {
                          const id = `sector-${num}`;
                          const isSelected = sector === id;
                          return (
                            <div key={id} className="flex items-center">
                              {isSelected && (
                                <span className="w-0 h-0 border-y-[0.8vh] border-y-transparent border-l-[1vh] border-l-[#FFD447]" />
                              )}
                              <button
                                onClick={() => onClickSector && onClickSector(id)}
                                className={
                                  isSelected
                                    ? 'rounded-[1.2vh] px-[3vh] py-[1vh] font-extrabold tracking-wide text-[1vh] text-nowrap text-[#0F2C4C] bg-[#FFD447] shadow-[0_6px_0_rgba(0,0,0,0.2)] border-[0.2vh] border-[#FFE58A]'
                                    : num === 2
                                      ? 'rounded-[1.2vh] px-[3vh] py-[1vh] font-extrabold tracking-wide text-[1vh] text-nowrap text-white bg-gradient-to-b from-[#2e6e49] to-[#274d3a] border border-white/40'
                                      : num === 3
                                        ? 'rounded-[1.2vh] px-[3vh] py-[1vh] font-extrabold tracking-wide text-[1vh] text-nowrap text-white bg-gradient-to-b from-[#2f4f8a] to-[#283f6d] border border-white/40'
                                        : 'rounded-[1.2vh] px-[3vh] py-[1vh] font-extrabold tracking-wide text-[1vh] text-nowrap text-white bg-gradient-to-b from-[#8a7f2f] to-[#6d6528] border border-white/40'
                                }
                              >
                                {`SECTOR ${num}`}
                              </button>
                              {isSelected && (
                                <span className="w-0 h-0 border-y-[0.8vh] border-y-transparent border-r-[1vh] border-r-[#FFD447]" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* right divider */}
                      <div className="w-px h-[14vh] bg-white/30 self-end ml-[1vw]" />
                      
                    </div>

                    {renderSectorSection(
                      sectorBId,
                      sectorTitles.sectorB,
                      progressionStateB,
                      true
                    )}
                  </div>
                </div>
              );
            }

            // LEADERBOARD_DISPLAY phase: Show main menu screen
            if (
              currentPhase === GameLobbyStatus.LEADERBOARD_DISPLAY
            ) {
              return (
                <div className="absolute inset-0 z-20">
                  <PlayerBackToMenuScreen
                    onBackToMainMenu={handleStartGame}
                    playerNumber={getPlayerNumber(sector)}
                  />
                </div>
              );
            }

            // Start/Lobby phases: Show StartScreen
            if (
              !currentPhase ||
              currentPhase === GameLobbyStatus.INITIALIZING
            ) {
              return (
                <div className="absolute inset-0 z-20">
                  <StartScreen
                    onStartGame={handleStartGame}
                    onShowLeaderboard={handleShowLeaderboard}
                    playerNumber={getPlayerNumber(sector)}
                    isLeaderboardOpen={
                      lobbyState?.[LobbyStateEnum.SHOW_LEADERBOARD] ||
                      false
                    }
                  />
                </div>
              );
            }

            // Preparing phase: Show loading message
            if (currentPhase === GameLobbyStatus.PREPARING) {
              return (
                <div className="w-full flex items-center justify-center mt-8">
                  <div className="bg-white rounded-[16px] px-8 py-6">
                    <div className="text-center">
                      <div className="text-[24px] font-bold text-black text-center mb-4">
                        Game Starting<span className={styles.ellipsis}></span>
                      </div>
                      <div className="text-lg text-black mb-2">
                        Please wait while the game loads
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Other phases: Show circular loader
            return (
              null
            );
          })()}
        </div>
      </div>

      {/* Insufficient Budget Modal */}
      <InsufficientBudgetModal
        isOpen={showInsufficientBudgetModal}
        onClose={() => setShowInsufficientBudgetModal(false)}
      />

      {/* Game Flow Modals */}
      <IntroductionModal
        isOpen={showIntroduction}
        onDurationComplete={() => { 
          gameRoomService.updateLobbyState({
            ...lobbyState, ...{
            [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.ROUND_STORYLINE,
            [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime(),
            [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.ROUND_STORYLINE,
          }});
         }}
        duration={getPhaseDuration(GameLobbyStatus.INTRODUCTION)}
        syncWithTimestamp={
          lobbyState?.[LobbyStateEnum.PHASE_START_TIME] || undefined
        }
      />

      <EndingModal
        isOpen={showEnding}
        onDurationComplete={() => {}}
        finalScore={finalScore}
        duration={getPhaseDuration(GameLobbyStatus.ENDING)}
        syncWithTimestamp={
          lobbyState?.[LobbyStateEnum.PHASE_START_TIME] || undefined
        }
        totalPerformance={totalPerformance}
      />

      <TeamNameInputModal
        isOpen={showTeamNameInput}
        onChange={useMemo(() => {
          let timeoutId: NodeJS.Timeout;
          return async (teamName: string) => {
            // Debounce rapid updates to prevent Firebase blinking
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              try {
                await gameRoomService.updateLobbyStateKeyValue(
                  LobbyStateEnum.TEAM_NAME,
                  teamName,
                );
                console.log(
                  'Team name updated in lobby state while typing:',
                  teamName,
                );
              } catch (error) {
                console.error(
                  'Failed to update team name while typing:',
                  error,
                );
              }
            }, 300); // 300ms debounce
          };
        }, [])}
        onSubmit={async (teamName) => {
          try {
            // Save team name to lobby state first
            await gameRoomService.updateLobbyStateKeyValue(
              LobbyStateEnum.TEAM_NAME,
              teamName,
            );
            console.log('Team name saved to lobby state:', teamName);

            // Try using the gameRoomService method first
            if (typeof gameRoomService.saveTeamScore === 'function') {
              await gameRoomService.saveTeamScore(
                teamName,
                finalScore,
              );
              console.log(
                'Team score saved via gameRoomService:',
                teamName,
                'Score:',
                finalScore,
              );
            } else {
              // Fallback to standalone function
              console.log(
                'Using fallback function to save team score',
              );
              await saveTeamScoreToGlobalLeaderboard(
                teamName,
                finalScore,
                roomName,
                `Player ${sector.slice(-1)}`,
              );
              console.log(
                'Team score saved via standalone function:',
                teamName,
                'Score:',
                finalScore,
              );
            }

            // Transition to LEADERBOARD_DISPLAY after team name input
            await gameRoomService.updateLobbyStateKeyValue(
              LobbyStateEnum.GAME_LOBBY_STATUS,
              GameLobbyStatus.LEADERBOARD_DISPLAY,
            );
            console.log('Transitioning to LEADERBOARD_DISPLAY phase');

            setShowTeamNameInput(false);
          } catch (error) {
            console.error('Failed to save team score:', error);
            // Still close the modal even if save fails
            setShowTeamNameInput(false);
          }
        }}
        playerNumber={getPlayerNumber(sector)}
      />
      <LeaderboardOverlay
        isOpen={isLeaderboardOpen}
        onClose={handleCloseLeaderboard}
      />
    </div>
  );
};

export default SectorControl;

