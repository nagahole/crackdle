/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

type CreateRoomOutput = RouterOutputs["room"]["createRoom"];

interface CreateRoomButtonProps {
  onRoomCreated: (roomId: string, roomCode: string) => void;
}

export default function CreateRoomButton({ onRoomCreated }: CreateRoomButtonProps) {
  const createRoom = api.room.createRoom.useMutation({
    onSuccess: (res: CreateRoomOutput) => {
      // res.room contains the created room with id and code
      const room = res.room as { id: string; code: string } | undefined;
      if (room?.id && room?.code) {
        onRoomCreated(room.id, room.code);
      }
    },
    onError: (err) => {
      console.error("createRoom failed:", err.message);
      alert("Failed to create room: " + err.message);
    },
  });

  return (
    <button
      onClick={() => createRoom.mutate({ maxPlayers: 2, expiresMinutes: 60 })}
      disabled={createRoom.isPending}
      className="border-2 border-white text-white px-4 py-2 rounded"
    >
      {createRoom.isPending ? "Creating…" : "Create Room"}
    </button>
  );
}
