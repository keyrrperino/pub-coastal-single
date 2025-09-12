import { useEffect, useState } from "react";
import { usePreparingProgress } from "./usePreparingProgress";
import { ActivityTypeEnum, GameLobbyStatus, LobbyStateEnum, SubSectorEnum } from "@/lib/enums";
import { LobbyStateType, SplineTriggerConfigItem } from "@/lib/types"; // Assuming this type exists
import { GameRoomService } from "@/lib/gameRoom";
import { PHASE_DURATIONS } from "./phaseUtils";
import { useTimer } from "./useTimer";
import { useServerTime } from "@/components/ServerTimeContext";
import { SplineTriggersConfig } from "@/lib/constants";
import { start } from "repl";

export function useLobbyStoryline(
  lobbyState: LobbyStateType,
  gameRoomServiceRef: React.RefObject<GameRoomService | null>
) {
  const { getAdjustedCurrentTime } = useServerTime();

  const onNext = async () => {
    if (gameRoomServiceRef.current) {
      if (gameRoomServiceRef.current) {
        if (lobbyState.round <= 1) {
          await startGame();
          // gameRoomServiceRef.current.addElement(ActivityTypeEnum.CHANGE_SCENE, "", 1, 0, false, SubSectorEnum.ONE_A);

        }

        gameRoomServiceRef.current.updateLobbyState({
          ...lobbyState, ...{
          [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.ROUND_GAMEPLAY,
          [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime(),
          [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.ROUND_GAMEPLAY,
        }});
      }
    }
  }

  const startGame = async () => {
    const btn = SplineTriggersConfig[
      ActivityTypeEnum.START_GAME
    ] as SplineTriggerConfigItem;
    
    await gameRoomServiceRef?.current?.addElement(
      btn.activityType!,
      btn.buttonValue ?? '',
      0,
      0,
      false,
      SubSectorEnum.ONE_A,
    );
  }

  return {onNext};
}