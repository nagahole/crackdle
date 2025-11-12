import { useEffect, useMemo, useState } from "react";
import type { ToolProps } from "../toolbox";

// Standard English letter frequencies (percentages)
const ENGLISH_FREQUENCIES: Record<string, number> = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702, F: 2.228, G: 2.015,
  H: 6.094, I: 6.966, J: 0.153, K: 0.772, L: 4.025, M: 2.406, N: 6.749,
  O: 7.507, P: 1.929, Q: 0.095, R: 5.987, S: 6.327, T: 9.056, U: 2.758,
  V: 0.978, W: 2.360, X: 0.150, Y: 1.974, Z: 0.074,
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function calculateFrequency(
  text: string,
  wordLength: number,
  offset: number
): Record<string, number> {
  const letters = text
    .toUpperCase()
    .split("")
    .filter((char) => /[A-Z]/.test(char));

  const stride = Math.max(1, wordLength);
  const normalizedOffset = ((offset % stride) + stride) % stride;

  const counts = LETTERS.reduce<Record<string, number>>((acc, letter) => {
    acc[letter] = 0;
    return acc;
  }, {});
  let total = 0;

  // Extract letters at positions: offset, offset + wordLength, offset + 2*wordLength, ...
  for (let i = normalizedOffset; i < letters.length; i += stride) {
    const char = letters[i];
    if (!char) continue;
    counts[char] = (counts[char] ?? 0) + 1;
    total++;
  }

  // Convert to percentages
  const frequencies: Record<string, number> = {};
  LETTERS.forEach((letter) => {
    const count = counts[letter] ?? 0;
    frequencies[letter] = total > 0 ? (count / total) * 100 : 0;
  });

  return frequencies;
}

function applyShiftOffset(
  frequencies: Record<string, number>,
  shift: number
): Record<string, number> {
  const shifted: Record<string, number> = {};
  const normalizedShift = ((shift % 26) + 26) % 26;

  LETTERS.forEach((letter, index) => {
    const shiftedIndex = (index - normalizedShift + 26) % 26;
    const targetLetter = LETTERS[shiftedIndex];
    shifted[letter] = targetLetter ? frequencies[targetLetter] ?? 0 : 0;
  });

  return shifted;
}

interface FrequencyColumnProps {
  letter: string;
  value: number;
  maxValue: number;
  colorClass: string;
  showLetterLabel?: boolean;
  labelPosition?: "top" | "bottom";
}

function FrequencyColumn({
  letter,
  value,
  maxValue,
  colorClass,
  showLetterLabel = false,
  labelPosition = "bottom",
}: FrequencyColumnProps) {
  const safeMax = maxValue > 0 ? maxValue : 1;
  const heightPercent = Math.min(100, (value / safeMax) * 100);

  return (
    <div
      className={`flex-1 h-full min-w-0 flex flex-col items-center ${
        showLetterLabel ? (labelPosition === "top" ? "gap-1 pb-2" : "gap-1 pt-2") : ""
      }`}
    >
      {showLetterLabel && labelPosition === "top" ? (
        <span className="text-[10px] font-mono text-zinc-400">{letter}</span>
      ) : null}
      <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-md bg-zinc-950/40">
        <div
          className={`${colorClass} w-full rounded-t-md transition-[height] duration-200 ease-out`}
          style={{ height: `${heightPercent}%` }}
        />
      </div>
      {showLetterLabel && labelPosition === "bottom" ? (
        <span className="text-[10px] font-mono text-zinc-400">{letter}</span>
      ) : null}
    </div>
  );
}

interface FrequencyChartProps {
  title: string;
  subtitle?: string;
  data: Record<string, number>;
  maxValue: number;
  colorClass: string;
  showLetterLabels?: boolean;
  letterLabelPosition?: "top" | "bottom";
  headerPosition?: "top" | "bottom";
}

function FrequencyChart({
  title,
  subtitle,
  data,
  maxValue,
  colorClass,
  showLetterLabels = false,
  letterLabelPosition = "bottom",
  headerPosition = "top",
}: FrequencyChartProps) {
  const headerContent = (position: "top" | "bottom") => (
    <div
      className={`flex items-center justify-between ${
        position === "top" ? "mb-3" : "mt-3"
      }`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
        {title}
      </h3>
      {subtitle ? (
        <span className="text-[10px] text-zinc-500">{subtitle}</span>
      ) : null}
    </div>
  );

  return (
    <section className="flex flex-1 flex-col rounded-2xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3">
      {headerPosition === "top" ? headerContent("top") : null}
      <div className="flex-1">
        <div className="flex h-full min-h-[80px] items-end gap-[6px]">
          {LETTERS.map((letter) => (
            <FrequencyColumn
              key={letter}
              letter={letter}
              value={data[letter] ?? 0}
              maxValue={maxValue}
              colorClass={colorClass}
              showLetterLabel={showLetterLabels}
              labelPosition={letterLabelPosition}
            />
          ))}
        </div>
      </div>
      {headerPosition === "bottom" ? headerContent("bottom") : null}
    </section>
  );
}

export function FrequencyAnalysis({ cipherText }: ToolProps) {
  const [wordLength, setWordLength] = useState(8);
  const [offset, setOffset] = useState(0);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (offset > wordLength - 1) {
      setOffset(Math.max(0, wordLength - 1));
    }
  }, [wordLength, offset]);

  const cipherFrequencies = useMemo(
    () => calculateFrequency(cipherText ?? "", wordLength, offset),
    [cipherText, wordLength, offset]
  );

  const shiftedFrequencies = useMemo(
    () => applyShiftOffset(cipherFrequencies, shift),
    [cipherFrequencies, shift]
  );

  const maxFrequency = Math.max(
    ...Object.values(ENGLISH_FREQUENCIES),
    ...Object.values(shiftedFrequencies)
  );

  return (
    <div className="flex h-full w-full text-sm text-zinc-100">
      {/* Left side: controls */}
      <div className="flex w-[320px] max-w-xs flex-col gap-4 bg-zinc-900 border-r border-zinc-800 p-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Word length</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={wordLength}
              onChange={(e) => setWordLength(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <span className="tabular-nums text-zinc-300 w-8 text-right">
              {wordLength}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Offset (0 to {wordLength - 1})</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={Math.max(0, wordLength - 1)}
              step="1"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <span className="tabular-nums text-zinc-300 w-8 text-right">
              {offset}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Hypothetical shift</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <span className="tabular-nums text-zinc-300 w-12 text-right">
              {shift >= 0 ? `+${shift}` : shift}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500">
            Analyzing positions: {offset}, {offset + wordLength}, {offset + wordLength * 2}...
          </p>
        </div>
      </div>

      {/* Right side: frequency charts */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        <FrequencyChart
          title="English Reference"
          subtitle="Standard distribution"
          data={ENGLISH_FREQUENCIES}
          maxValue={maxFrequency}
          colorClass="bg-emerald-500/70"
          showLetterLabels
          letterLabelPosition="top"
        />

        <FrequencyChart
          title="Ciphertext Distribution"
          subtitle={
            shift !== 0
              ? `Shifted by ${shift >= 0 ? `+${shift}` : shift}`
              : "Live from ciphertext"
          }
          data={shiftedFrequencies}
          maxValue={maxFrequency}
          colorClass="bg-emerald-400/80"
          showLetterLabels
          letterLabelPosition="bottom"
          headerPosition="bottom"
        />
      </div>
    </div>
  );
}
