/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/server/routers/roomRouter.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"; // adjust imports to your project
import { createClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

/**
 * Server-side Supabase client (service role).
 * NOTE: only create/use this on the server (do NOT expose the key to the browser).
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variable");
}

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Room code generator */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // remove ambiguous chars
const CODE_LEN = 6;
const nanoid = customAlphabet(ALPHABET, CODE_LEN);

/**
 * Safely extract a message from unknown error shapes returned by Supabase or other libraries.
 * This avoids unsafe property access and satisfies eslint/ts checks.
 */
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as any;
    if (typeof anyErr.message === "string") return anyErr.message;
    if (typeof anyErr.error === "string") return anyErr.error;
    if (typeof anyErr.code === "string") return `Error code ${anyErr.code}`;
    try {
      return JSON.stringify(anyErr);
    } catch {
      return String(anyErr);
    }
  }
  return String(err);
}

/**
 * Safe helper to check for unique-violation code on supabase/postgres error shapes.
 */
function isUniqueConstraintError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  if (typeof anyErr.code === "string" && anyErr.code === "23505") return true;
  if (typeof anyErr.details === "string" && anyErr.details.toLowerCase().includes("unique")) return true;
  return false;
}

export const roomRouter = createTRPCRouter({
  createRoom: protectedProcedure
    .input(
      z.object({
        maxPlayers: z.number().min(2).max(10).optional(),
        expiresMinutes: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let createdRoom: any = null;

      for (let attempt = 0; attempt < 6; attempt++) {
        const code = nanoid();
        const expiresAt = input.expiresMinutes
          ? new Date(Date.now() + input.expiresMinutes * 60 * 1000).toISOString()
          : null;

        const payload: any = {
          code,
          host_id: userId,
          max_players: input.maxPlayers ?? 2,
          players_count: 1,
        };
        if (expiresAt) payload.expires_at = expiresAt;

        const res = await supabaseServer.from("rooms").insert(payload).select("*").maybeSingle();

        // do NOT destructure res.error directly — treat it as unknown via helper
        if (res.error) {
          if (isUniqueConstraintError(res.error)) {
            // unique code conflict — try next attempt
            continue;
          }
          const message = getErrorMessage(res.error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
        }

        if (res.data) {
          createdRoom = res.data;
          break;
        }
      }

      if (!createdRoom) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate unique room code. Try again." });
      }

      const rpRes = await supabaseServer
        .from("room_players")
        .insert({
          room_id: createdRoom.id,
          user_id: userId,
          role: "HOST",
          joined_at: new Date().toISOString(),
        })
        .select("*")
        .maybeSingle();

      if (rpRes.error) {
        // best-effort rollback - delete the room we created
        await supabaseServer.from("rooms").delete().eq("id", createdRoom.id);
        const message = getErrorMessage(rpRes.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      return { room: createdRoom, roomPlayer: rpRes.data };
    }),

  joinRoom: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // First, find the room by code
      const roomRes = await supabaseServer
        .from("rooms")
        .select("*")
        .eq("code", input.code.toUpperCase())
        .maybeSingle();

      if (roomRes.error) {
        const message = getErrorMessage(roomRes.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      if (!roomRes.data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const room = roomRes.data;

      // Check if room is joinable - only block if status is explicitly IN_PROGRESS or other non-joinable states
      // Allow joining if status is null, undefined, or "WAITING"
      if (room.status === "IN_PROGRESS" || room.status === "FINISHED" || room.status === "CANCELLED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Room is not joinable" });
      }

      // Check if room is full
      if (room.players_count >= room.max_players) {
        throw new TRPCError({ code: "CONFLICT", message: "Room is full" });
      }

      // Check if user is already in the room
      const existingPlayerRes = await supabaseServer
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingPlayerRes.error && !existingPlayerRes.error.message?.includes("No rows")) {
        const message = getErrorMessage(existingPlayerRes.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      if (existingPlayerRes.data) {
        // User is already in the room, just return the room
        return { room };
      }

      // Add user to the room
      const insertRes = await supabaseServer
        .from("room_players")
        .insert({
          room_id: room.id,
          user_id: userId,
          role: "PLAYER",
          joined_at: new Date().toISOString(),
        })
        .select("*")
        .maybeSingle();

      if (insertRes.error) {
        const message = getErrorMessage(insertRes.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      // Update room player count
      const updateRes = await supabaseServer
        .from("rooms")
        .update({ players_count: room.players_count + 1 })
        .eq("id", room.id)
        .select("*")
        .maybeSingle();

      if (updateRes.error) {
        const message = getErrorMessage(updateRes.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      return { room: updateRes.data ?? room };
    }),

  leaveRoom: protectedProcedure
    .input(z.object({ roomId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const res = await supabaseServer.rpc("leave_room_by_id", {
        p_room_id: input.roomId,
        p_user_id: userId,
      });

      if (res.error) {
        const message = getErrorMessage(res.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }

      return { ok: true };
    }),

  startGame: protectedProcedure
    .input(z.object({ roomId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const res = await supabaseServer.rpc("start_game", {
        p_room_id: input.roomId,
        p_user_id: userId,
      });

      if (res.error) {
        const msg = getErrorMessage(res.error);
        if (msg.includes("NOT_ENOUGH_PLAYERS")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough players to start" });
        }
        if (msg.includes("ONLY_HOST") || msg.includes("ONLY HOST")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only host can start the game" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
      }

      return { room: res.data };
    }),

  getRoomByCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const res = await supabaseServer.from("rooms").select("*").eq("code", input.code).maybeSingle();

      if (res.error) {
        const message = getErrorMessage(res.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
      if (!res.data) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      return { room: res.data };
    }),

  listPlayers: publicProcedure
    .input(z.object({ roomId: z.string().uuid() }))
    .query(async ({ input }) => {
      const res = await supabaseServer
        .from("room_players")
        .select("id, user_id, role, joined_at, last_seen_at, guesses")
        .eq("room_id", input.roomId)
        .order("joined_at", { ascending: true });

      if (res.error) {
        const message = getErrorMessage(res.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
      return { players: res.data ?? [] };
    }),
});
