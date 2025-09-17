import { useEffect } from "react";
import { GameLobbyStatus, LobbyStateEnum } from "@/lib/enums";
import { LobbyStateType } from "@/lib/types";
import { GameRoomService } from "@/lib/gameRoom";
import { PHASE_DURATIONS } from "./phaseUtils";
import { useServerTime } from "@/components/ServerTimeContext";

type UseLobbyPreparationProps = {
  lobbyState: LobbyStateType;
  gameRoomServiceRef: React.RefObject<GameRoomService | null>;
};

export function useLobbyPreparation({ lobbyState, gameRoomServiceRef }: UseLobbyPreparationProps) {
  const { getAdjustedCurrentTime } = useServerTime();
  useEffect(() => {
    if (lobbyState.gameLobbyStatus === GameLobbyStatus.PREPARING) {
      const timer = setTimeout(() => {
        // Update the lobby status to STARTED in Firebase
        gameRoomServiceRef.current
          ?.updateLobbyState({
            ...lobbyState,
            ...{
              [LobbyStateEnum.GAME_LOBBY_STATUS]: GameLobbyStatus.INTRODUCTION,
              [LobbyStateEnum.PHASE_DURATION]: PHASE_DURATIONS.INTRODUCTION,
              [LobbyStateEnum.PHASE_START_TIME]: getAdjustedCurrentTime()
            }
          });
        
        // gameRoomServiceRef.current
        //   ?.addElement(ActivityTypeEnum.DISPLAY_INSTRUCTION, "", 1, 0);

      }, 10);

      return () => clearTimeout(timer);
    }
  }, [lobbyState.gameLobbyStatus, gameRoomServiceRef, lobbyState]);
}