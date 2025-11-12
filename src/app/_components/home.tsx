"use client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Logo } from "./logo";
import { Subtitle } from "./subtitle";
import CreateRoomButton from "./room-components/CreateButton";
import { JoinRoomForm } from "./room-components/JoinRoomForm";
import { Lobby } from "./room-components/RoomLobby";

export function Home({ user }: { user: User; }) {
    const [currentRoom, setCurrentRoom] = useState<{ roomId: string; roomCode: string } | null>(null);
    const supabase = supabaseBrowser;

    const handleRoomCreated = (roomId: string, roomCode: string) => {
        setCurrentRoom({ roomId, roomCode });
    };

    const handleRoomJoined = (roomId: string, roomCode: string) => {
        setCurrentRoom({ roomId, roomCode });
    };

    const handleLeaveRoom = () => {
        setCurrentRoom(null);
    };

    // If user is in a room, show the lobby
    if (currentRoom) {
        return (
            <main className="flex bg-black min-h-screen flex-col items-center justify-center gap-4">
                <Logo/>
                <Subtitle/>

                <div className="text-sm text-gray-500">
                    Logged in as {user.email ?? user.id}
                </div>

                <Lobby roomId={currentRoom.roomId} roomCode={currentRoom.roomCode} />

                <button 
                    className="rounded bg-red-600 px-4 py-2 text-white" 
                    onClick={handleLeaveRoom}
                >
                    Leave Room
                </button>

                <button 
                    className="rounded bg-gray-600 px-4 py-2 text-white" 
                    onClick={async () => await supabase.auth.signOut()}
                >
                    Logout
                </button>
            </main>
        );
    }

    // Otherwise show the home screen with create/join options
    return (
        <main className="flex bg-black min-h-screen flex-col items-center justify-center gap-4">
            <Logo/>
            <Subtitle/>

            {/* logged in as johndoe@email.com */}
            <div className="text-sm text-gray-500">
                Logged in as {user.email ?? user.id}
            </div>

            <h2 className="text-2xl text-white font-semibold">Find a game</h2>

            <div className="flex gap-5">
                <CreateRoomButton onRoomCreated={handleRoomCreated} />
                <JoinRoomForm onRoomJoined={handleRoomJoined} />
            </div>

            <button className="rounded bg-red-600 px-4 py-2 text-white" onClick={async () => await supabase.auth.signOut()}>
                Logout
            </button>
        </main>
    );
}
