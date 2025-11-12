"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { api } from "@/trpc/react";
import { supabaseBrowser } from "@/lib/supabase-client";
import type { RouterOutputs } from "@/trpc/react";
import { StartGameButton } from "./StartRoomButton";

type RoomPlayer = {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  last_seen_at: string | null;
  guesses: unknown;
};

type RoomQueryOutput = RouterOutputs["room"]["getRoomByCode"];
type PlayersQueryOutput = RouterOutputs["room"]["listPlayers"];

export function Lobby({ roomId, roomCode }: { roomId: string; roomCode: string }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    void supabaseBrowser.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // fetch room (optional)
  const roomQuery = api.room.getRoomByCode.useQuery(
    { code: roomCode },
    { enabled: !!roomCode } // only run if code present
  );

  // list players
  const playersQuery = api.room.listPlayers.useQuery(
    { roomId },
    {
      refetchInterval: 5000,
      enabled: !!roomId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  const refetchPlayers = useCallback(() => {
    void playersQuery.refetch();
  }, [playersQuery]);

  useEffect(() => {
    if (roomId) {
      const timeoutId = setTimeout(() => {
        void playersQuery.refetch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!roomId) return;
    const channel = supabaseBrowser
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log("Player joined via realtime:", payload);
          refetchPlayers();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => {
          refetchPlayers();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          console.log("room update", payload);
          const newStatus = (payload.new as { status?: string })?.status;
          if (newStatus === "IN_PROGRESS") {
            void router.push(`/guess?room=${roomId}`);
          }
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [roomId, router, refetchPlayers]);

  const room = (roomQuery.data as RoomQueryOutput | undefined)?.room;
  const players = ((playersQuery.data as PlayersQueryOutput | undefined)?.players ?? []) as RoomPlayer[];

  useEffect(() => {
    if (players.length > 0) {
      console.log("Players in lobby:", players.length, players);
      console.log("Current user ID:", currentUserId);
    }
  }, [players, currentUserId]);

  if (roomQuery.isLoading || playersQuery.isLoading || roomQuery.isPending || playersQuery.isPending) {
    return (
      <div className="text-white">
        <div className="text-white">Loading lobby…</div>
      </div>
    );
  }
  if (roomQuery.error) {
    return <div className="text-red-400">Error loading room: {roomQuery.error.message}</div>;
  }

  const currentPlayer = players.find((p) => p.user_id === currentUserId);
  const isHost = currentPlayer?.role === "HOST";

  return (
    <div className="flex flex-col items-center gap-6 text-white w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Room <span className="text-emerald-400">{room?.code}</span>
        </h2>
        <p className="text-sm text-zinc-400">Status: <span className="text-zinc-200">{room?.status ?? "WAITING"}</span></p>
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Players <span className="text-zinc-400 text-sm">({players.length}/{room?.max_players ?? 2})</span></h3>
          {isHost ? (
            <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current"><path d="M12 2l2.9 6.26L21 9.27l-5 3.73L17.8 21 12 17.77 6.2 21 8 13 3 9.27l6.1-1.01L12 2z" /></svg>
              Host
            </span>
          ) : (
            <span className="text-sm text-zinc-500">Waiting...</span>
          )}
        </div>

        <ul className="space-y-2">
          {players.map((p) => {
            const isCurrent = p.user_id === currentUserId;
            const isPlayerHost = p.role === "HOST";

            return (
              <li
                key={p.id}
                className={`p-3 rounded-md border ${
                  isCurrent
                    ? "border-emerald-400 bg-emerald-400/6"
                    : isPlayerHost
                    ? "border-emerald-500/60 bg-emerald-500/4"
                    : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium ${
                      isCurrent ? "bg-emerald-400 text-black" : "bg-zinc-800 text-zinc-200"
                    }`}>
                      {isPlayerHost ? "H" : isCurrent ? "You" : p.user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {isCurrent ? "You" : `Player ${p.user_id.slice(0, 8)}`}
                        {isPlayerHost && <span className="ml-2 text-emerald-300 text-sm">• host</span>}
                      </div>
                      <div className="text-xs text-zinc-400">{p.joined_at ? new Date(p.joined_at).toLocaleTimeString() : "Joined"}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-zinc-300">{p.role}</div>
                    <div className="text-xs text-zinc-500">{p.last_seen_at ? "online" : "offline"}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-3">
        {isHost && room?.status !== "IN_PROGRESS" && (
          <div className="w-full max-w-md">
            <StartGameButton roomId={roomId} className="w-full" />
          </div>
        )}

        {!isHost && (
          <p className="text-sm text-zinc-400">Waiting for host to start the game…</p>
        )}
      </div>
    </div>
  );
}
