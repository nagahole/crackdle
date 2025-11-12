"use client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Logo } from "./logo";
import { Subtitle } from "./subtitle";
import CreateRoomButton from "./room-components/CreateButton";
import { JoinRoomForm } from "./room-components/JoinRoomForm";
import { Lobby } from "./room-components/RoomLobby";

export function Home({ user }: { user: User }) {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-start px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        {/* Top: logo + slogan */}
        <header className="flex flex-col items-center gap-2 mb-8">
          <div className="w-full flex items-center justify-center pt-2">
            <Logo />
          </div>
          <div className="text-center">
            <Subtitle />
            <p className="mt-2 text-sm text-zinc-400">
              Play quick 1v1 decryption races — challenge a friend with a room code.
            </p>
          </div>
        </header>

        {/* User info + actions */}
        <section className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-sm text-zinc-400">Logged in as</div>
            <div className="text-sm text-gray-200 font-medium">{user.email ?? user.id}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="rounded-md py-2 px-3 bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-emerald-400 transition"
            >
              Logout
            </button>

            <button
              onClick={handleLeaveRoom}
              disabled={!currentRoom}
              className="rounded-md py-2 px-3 bg-red-600 text-white hover:brightness-95 disabled:opacity-40 transition"
            >
              Leave Room
            </button>
          </div>
        </section>

        {/* Main area */}
        <section className="bg-transparent rounded-md p-6 border border-zinc-800">
          {currentRoom ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Room: <span className="text-emerald-400">{currentRoom.roomCode}</span></h3>
                <p className="text-sm text-zinc-400 mt-1">Waiting for opponent — share the room code to invite.</p>
              </div>

              <div className="mb-6">
                <Lobby roomId={currentRoom.roomId} roomCode={currentRoom.roomCode} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLeaveRoom}
                  className="rounded-md py-3 px-4 bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-emerald-400 transition"
                >
                  Leave
                </button>

                <button
                  onClick={() => {/* optional: navigate to game or other action */}}
                  className="rounded-md py-3 px-4 bg-emerald-400 text-black font-semibold hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)] transition"
                >
                  Back to lobby
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl text-white font-semibold mb-4">Find a game</h2>

              <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-stretch">
                <div className="flex-1">
                  <CreateRoomButton onRoomCreated={handleRoomCreated} className="w-full" />
                </div>

                <div className="flex-1">
                  <JoinRoomForm onRoomJoined={handleRoomJoined} />
                </div>
              </div>

              <div className="mt-6 text-sm text-zinc-400">
                Tip: share your room code with a friend — both players will receive the same ciphertext when the host starts the game.
              </div>
            </>
          )}
        </section>

        {/* Footer small note */}
        <footer className="mt-6 text-xs text-zinc-600 text-center">
          <span>By playing you agree to the terms. Have fun and play fair.</span>
        </footer>
      </div>
    </main>
  );
}
