"use client";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

type StartGameOutput = RouterOutputs["room"]["startGame"];

export function StartGameButton({ roomId }: { roomId: string }) {
  const startGame = api.room.startGame.useMutation({
    onSuccess: (res: StartGameOutput) => {
      // server updated rooms.status to IN_PROGRESS; Supabase realtime will push this to clients
      console.log("game started", res.room);
    },
    onError: (err) => {
      alert("Cannot start game: " + err.message);
    },
  });

  return (
    <button onClick={() => startGame.mutate({ roomId })} disabled={startGame.isPending} className="btn">
      {startGame.isPending ? "Starting…" : "Start Game"}
    </button>
  );
}
