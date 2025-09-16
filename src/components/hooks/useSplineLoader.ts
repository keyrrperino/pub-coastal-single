import { useEffect } from "react";
import { Application } from "@splinetool/runtime";
import { SPLINE_URL } from "@/lib/constants";
import { CutScenesEnum, GameLobbyStatus } from "@/lib/enums";
import { LobbyStateType } from "@/lib/types";

export function useSplineLoader(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  splineAppRef: React.RefObject<Application | null>,
  setIsLoaded: (loaded: boolean) => void,
  isLoaded: boolean,
  lobbyState: LobbyStateType
) {
  useEffect(() => {
    if (!isLoaded) return;

    if (lobbyState.gameLobbyStatus === GameLobbyStatus.INITIALIZING) {
      const playCamGrid = splineAppRef?.current?.findObjectByName("play cam grid");
      if (playCamGrid) {
        playCamGrid.state = "Initialize";
      }
    } else if (![GameLobbyStatus.ROUND_GAMEPLAY, GameLobbyStatus.ROUND_SCORE_BREAKDOWN, GameLobbyStatus.ROUND_ANIMATION].includes(lobbyState.gameLobbyStatus)) {
      const playCamGrid = splineAppRef?.current?.findObjectByName("play cam grid");
      if (playCamGrid) {
        playCamGrid.state = "Center";
      }
    } else {
      const playCamGrid = splineAppRef?.current?.findObjectByName("play cam grid");
      if (playCamGrid) {
        playCamGrid.state = undefined;
      }
    }
  }, [lobbyState, isLoaded]);

  useEffect(() => {
    if (canvasRef.current && !splineAppRef.current) {
      const app = new Application(canvasRef.current);
      app.load(SPLINE_URL).then(() => {
        console.log('loaded');
        splineAppRef.current = app;
        setIsLoaded(true);
      });
    }

    return () => {
      splineAppRef.current?.dispose?.();
      splineAppRef.current = null;
    };
    // Only run on mount/unmount or if refs/URL change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canvasRef,
    splineAppRef,
    setIsLoaded,
  ]);
}