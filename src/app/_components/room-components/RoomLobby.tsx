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
      refetchInterval: 5000, // fallback polling
      enabled: !!roomId, // only run if roomId is present
      refetchOnMount: true, // always refetch when component mounts
      refetchOnWindowFocus: true, // refetch when window regains focus
    }
  );

  const refetchPlayers = useCallback(() => {
    void playersQuery.refetch();
  }, [playersQuery]);

  // Refetch players immediately when roomId changes
  useEffect(() => {
    if (roomId) {
      // Small delay to ensure the join mutation has completed
      const timeoutId = setTimeout(() => {
        void playersQuery.refetch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!roomId) return;
    // subscribe to postgres_changes via Supabase client
    const channel = supabaseBrowser
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        (payload) => {
          // new player joined
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
          // room status changed (start game etc.)
          console.log("room update", payload);
          // example: if status => IN_PROGRESS navigate to /guess
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

  // Get room and players data (before conditional returns to maintain hook order)
  const room = (roomQuery.data as RoomQueryOutput | undefined)?.room;
  const players = ((playersQuery.data as PlayersQueryOutput | undefined)?.players ?? []) as RoomPlayer[];
  
  // Debug logging - must be before conditional returns
  useEffect(() => {
    if (players.length > 0) {
      console.log("Players in lobby:", players.length, players);
      console.log("Current user ID:", currentUserId);
    }
  }, [players, currentUserId]);

  if (roomQuery.isLoading || playersQuery.isLoading || roomQuery.isPending || playersQuery.isPending) {
    return <div className="text-white">Loading lobby…</div>;
  }
  if (roomQuery.error) {
    return <div className="text-red-500">Error loading room: {roomQuery.error.message}</div>;
  }
  
  // Check if current user is the host
  const currentPlayer = players.find(p => p.user_id === currentUserId);
  const isHost = currentPlayer?.role === "HOST";

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Room {room?.code}</h2>
        <p className="text-gray-400">Status: {room?.status ?? "WAITING"}</p>
      </div>

      <div className="w-full max-w-md">
        <h3 className="text-xl font-semibold mb-3">Players ({players.length}/{room?.max_players ?? 2})</h3>
        <ul className="space-y-2">
          {players.map((p) => (
            <li 
              key={p.id} 
              className={`p-3 rounded border-2 ${
                p.user_id === currentUserId 
                  ? "border-blue-500 bg-blue-500/20" 
                  : "border-gray-600 bg-gray-800/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>
                  {p.role === "HOST" && "👑 "}
                  {p.user_id === currentUserId ? "You" : `Player ${p.user_id.slice(0, 8)}`}
                </span>
                <span className="text-sm text-gray-400">{p.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isHost && room?.status !== "IN_PROGRESS" && (
        <StartGameButton roomId={roomId} />
      )}

      {!isHost && (
        <p className="text-gray-400 text-sm">Waiting for host to start the game...</p>
      )}
    </div>
  );
}
