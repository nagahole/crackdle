"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

type JoinRoomOutput = RouterOutputs["room"]["joinRoom"];

interface JoinRoomFormProps {
  onRoomJoined: (roomId: string, roomCode: string) => void;
}

export function JoinRoomForm({ onRoomJoined }: JoinRoomFormProps) {
  const [code, setCode] = useState("");
  const utils = api.useUtils();
  
  const joinRoom = api.room.joinRoom.useMutation({
    onSuccess: async (res: JoinRoomOutput) => {
      // res.room is the room row returned by the RPC
      const room = res.room as { id: string; code: string } | undefined;
      if (room?.id && room?.code) {
        // Invalidate and refetch players list for this room
        await utils.room.listPlayers.invalidate({ roomId: room.id });
        onRoomJoined(room.id, room.code);
        setCode(""); // Clear the input after successful join
      }
    },
    onError: (err) => {
      // map common errors to nice messages
      if (err.data?.code === "NOT_FOUND") alert("Room not found");
      else if (err.data?.code === "CONFLICT") alert("Room is full");
      else alert(err.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return;
        joinRoom.mutate({ code: code.trim().toUpperCase() });
      }}
      className="flex gap-2"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter room code"
        className="border-2 border-white py-2 px-3 text-white bg-transparent rounded"
        maxLength={6}
      />
      <button 
        type="submit" 
        disabled={joinRoom.isPending} 
        className="border-2 border-white text-white px-4 py-2 rounded"
      >
        {joinRoom.isPending ? "Joining…" : "Join"}
      </button>
    </form>
  );
}
