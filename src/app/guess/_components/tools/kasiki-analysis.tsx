import { useMemo, useState } from "react";
import type { ToolProps } from "../toolbox";

type NgramEntry = {
  text: string;
  length: number;
  count: number;
  positions: number[];
  earliestIndex: number;
};

const LETTERS_REGEX = /^[A-Z]+$/;

function sanitizeCipherText(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

function computeLeaderboard(text: string): NgramEntry[] {
  if (!text) return [];

  const ngramMap = new Map<string, number[]>();

  for (let length = 5; length >= 3; length -= 1) {
    for (let index = 0; index <= text.length - length; index += 1) {
      const slice = text.slice(index, index + length);
      if (!LETTERS_REGEX.test(slice)) continue;

      const positions = ngramMap.get(slice);
      if (positions) {
        positions.push(index);
      } else {
        ngramMap.set(slice, [index]);
      }
    }
  }

  const leaderboard: NgramEntry[] = [];

  ngramMap.forEach((positions, ngram) => {
    if (positions.length < 2) return;
    positions.sort((a, b) => a - b);
    leaderboard.push({
      text: ngram,
      length: ngram.length,
      count: positions.length,
      positions,
      earliestIndex: positions[0]!,
    });
  });

  leaderboard.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    if (b.count !== a.count) return b.count - a.count;
    if (a.earliestIndex !== b.earliestIndex) {
      return a.earliestIndex - b.earliestIndex;
    }
    return a.text.localeCompare(b.text);
  });

  return leaderboard;
}

function findOccurrences(text: string, query: string): number[] {
  if (!query.length) return [];
  const positions: number[] = [];
  let index = text.indexOf(query, 0);
  while (index !== -1) {
    positions.push(index);
    index = text.indexOf(query, index + 1);
  }
  return positions;
}

export function KasikiAnalysis({ cipherText }: ToolProps) {
  const [query, setQuery] = useState("");

  const sanitizedCipher = useMemo(
    () => sanitizeCipherText(cipherText ?? ""),
    [cipherText]
  );

  const leaderboard = useMemo(
    () => computeLeaderboard(sanitizedCipher),
    [sanitizedCipher]
  );

  const normalizedQuery = useMemo(
    () => query.toUpperCase().replace(/[^A-Z]/g, ""),
    [query]
  );

  const occurrences = useMemo(
    () => findOccurrences(sanitizedCipher, normalizedQuery),
    [sanitizedCipher, normalizedQuery]
  );

  const distances = useMemo(() => {
    if (occurrences.length < 2) return [];
    const gaps: number[] = [];
    for (let i = 0; i < occurrences.length - 1; i += 1) {
      gaps.push(occurrences[i + 1]! - occurrences[i]!);
    }
    return gaps;
  }, [occurrences]);

  let statusMessage: string | null = null;
  if (!normalizedQuery.length) {
    statusMessage = "Enter a substring to inspect repetition gaps.";
  } else if (occurrences.length === 0) {
    statusMessage = "No occurrences found for that substring.";
  } else if (occurrences.length === 1) {
    statusMessage = "Only one occurrence found; at least two are needed to compute distances.";
  }

  return (
    <div className="flex h-full w-full text-sm text-zinc-100">
      {/* Left side: substring inspector */}
      <div className="flex w-[340px] max-w-sm flex-col gap-4 border-r border-zinc-800 bg-zinc-900/90 p-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Substring
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type or paste a sequence..."
            className="h-10 rounded-md border border-zinc-700/60 bg-zinc-950/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {normalizedQuery && normalizedQuery !== query ? (
            <span className="text-[11px] text-zinc-500">
              Using normalized input: <span className="font-mono">{normalizedQuery}</span>
            </span>
          ) : null}
        </div>

        <section className="flex flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-xs">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
            Occurrence distances
          </h3>
          {statusMessage ? (
            <p className="text-zinc-500">{statusMessage}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Occurrence indices
                </p>
                <p className="mt-1 font-mono text-[12px] text-zinc-100">
                  {occurrences.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Distances
                </p>
                <p className="mt-1 font-mono text-[12px] text-emerald-300">
                  {distances.join(", ")}
                </p>
              </div>
            </div>
          )}
          <p className="mt-auto text-[10px] text-zinc-500">
            Analysis ignores non-letter characters to mirror traditional Kasiski examination.
          </p>
        </section>
      </div>

      {/* Right side: leaderboard */}
      <div className="flex-1 p-6">
        <section className="flex h-full flex-col rounded-xl border border-emerald-500/40 bg-zinc-900/70 shadow-inner shadow-emerald-500/10">
          <header className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                Kasiski Leaderboard
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500">
                N-grams (3–5 letters) appearing at least twice.
              </p>
            </div>
            <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
              {leaderboard.length} hits
            </span>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Not enough repeated n-grams discovered yet. Try a longer ciphertext.
              </p>
            ) : (
              <ol className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2">
                {leaderboard.map((entry) => (
                  <li
                    key={`${entry.text}-${entry.earliestIndex}`}
                    className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                  >
                    <span className="font-mono text-sm text-zinc-100">
                      {entry.text}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {entry.count} occurrences
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
