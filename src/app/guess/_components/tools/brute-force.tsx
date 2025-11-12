import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import type { ToolProps } from "../toolbox";
import { TextOutput } from "./common/text-output";

type KeyCell = {
  letter: string;
  locked: boolean;
};

const MIN_LENGTH = 1;
const MAX_LENGTH = 12;

function normalizeLetter(input: string): string {
  const upper = input.toUpperCase().replace(/[^A-Z]/g, "");
  return upper ? upper[0] : "A";
}

function createInitialKey(length: number): KeyCell[] {
  return Array.from({ length }, () => ({ letter: "A", locked: false }));
}

function buildKeyString(cells: KeyCell[]): string {
  return cells.map((cell) => cell.letter).join("");
}

function decodeWithKey(cipherText: string, key: string): string {
  if (!cipherText) return "";
  if (!key.length) return cipherText;

  const cleanedKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanedKey.length) return cipherText;

  let keyIndex = 0;
  const keyLength = cleanedKey.length;

  return cipherText
    .split("")
    .map((char) => {
      if (!/[a-zA-Z]/.test(char)) {
        return char;
      }
      const shiftChar = cleanedKey[keyIndex % keyLength];
      keyIndex += 1;
      const shift = shiftChar.charCodeAt(0) - 65;

      const isLower = char === char.toLowerCase();
      const base = isLower ? 97 : 65;
      const charCode = char.charCodeAt(0) - base;
      const decoded = (charCode - shift + 26) % 26;
      return String.fromCharCode(decoded + base);
    })
    .join("");
}

function incrementCells(cells: KeyCell[]): KeyCell[] {
  const next = cells.map((cell) => ({ ...cell }));
  let carry = true;
  let index = next.length - 1;

  while (carry && index >= 0) {
    const cell = next[index];
    if (cell.locked) {
      index -= 1;
      continue;
    }
    const code = cell.letter.charCodeAt(0) - 65;
    const newCode = (code + 1) % 26;
    cell.letter = String.fromCharCode(65 + newCode);
    carry = newCode === 0;
    index -= 1;
  }

  return next;
}

function decrementCells(cells: KeyCell[]): KeyCell[] {
  const next = cells.map((cell) => ({ ...cell }));
  let borrow = true;
  let index = next.length - 1;

  while (borrow && index >= 0) {
    const cell = next[index];
    if (cell.locked) {
      index -= 1;
      continue;
    }
    const code = cell.letter.charCodeAt(0) - 65;
    const newCode = (code - 1 + 26) % 26;
    cell.letter = String.fromCharCode(65 + newCode);
    borrow = newCode === 25;
    index -= 1;
  }

  return next;
}

export function BruteForce({ cipherText }: ToolProps) {
  const [keyLength, setKeyLength] = useState(5);
  const [cells, setCells] = useState<KeyCell[]>(() => createInitialKey(5));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setCells((prev) => {
      if (keyLength === prev.length) return prev;
      if (keyLength > prev.length) {
        const additions = createInitialKey(keyLength - prev.length);
        return [...prev, ...additions];
      }
      return prev.slice(0, keyLength);
    });
    setEditingIndex(null);
  }, [keyLength]);

  const keyString = useMemo(() => buildKeyString(cells), [cells]);

  const output = useMemo(
    () => decodeWithKey(cipherText ?? "", keyString),
    [cipherText, keyString]
  );

  const handleLengthChange = (value: number) => {
    const clamped = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, value));
    setKeyLength(clamped);
  };

  const handleArrow = (direction: "left" | "right") => {
    setCells((prev) => {
      const updatable = prev.some((cell) => !cell.locked);
      if (!updatable) return prev;
      return direction === "right" ? incrementCells(prev) : decrementCells(prev);
    });
  };

  const handleCellDoubleClick = (index: number) => {
    setCells((prev) =>
      prev.map((cell, i) =>
        i === index ? { ...cell, locked: !cell.locked } : cell
      )
    );
  };

  const handleCellClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (event.detail > 1) return;
    const cell = cells[index];
    setEditingIndex(index);
    const initial = cell.letter;
    requestAnimationFrame(() => {
      const input = document.getElementById(`key-cell-input-${index}`) as HTMLInputElement | null;
      if (input) {
        input.value = initial;
        input.focus();
        input.select();
      }
    });
  };

  const handleEditingChange = (index: number, value: string) => {
    const letter = normalizeLetter(value);
    setCells((prev) =>
      prev.map((cell, i) => (i === index ? { ...cell, letter } : cell))
    );
  };

  const handleEditingKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      setEditingIndex(null);
    }
  };

  const handleKeyPadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleArrow("right");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleArrow("left");
    }
  };

  return (
    <div className="flex h-full w-full text-sm text-zinc-100">
      <div className="flex w-[360px] max-w-sm flex-col gap-5 border-r border-zinc-800 bg-zinc-900/90 p-5">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Keyword length
            </h2>
            <span className="rounded border border-zinc-700/60 bg-zinc-950/60 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              {keyLength}
            </span>
          </div>
          <input
            type="range"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={keyLength}
            onChange={(event) => handleLengthChange(Number(event.target.value))}
            className="accent-emerald-500"
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{MIN_LENGTH}</span>
            <span>{MAX_LENGTH}</span>
          </div>
        </section>

        <section
          className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          tabIndex={0}
          onKeyDown={handleKeyPadKeyDown}
        >
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Key explorer
            </h3>
            <span className="text-[10px] text-zinc-500">Use ← / → to iterate</span>
          </header>
          <div className="grid grid-cols-5 gap-2">
            {cells.map((cell, index) => {
              const isLocked = cell.locked;
              const isEditing = editingIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(event) => handleCellClick(event, index)}
                  onDoubleClick={() => handleCellDoubleClick(index)}
                  className={
                    "flex h-12 items-center justify-center rounded-lg border text-lg font-semibold transition " +
                    (isLocked
                      ? "border-rose-600/70 bg-rose-900/40 text-rose-200"
                      : "border-zinc-700 bg-zinc-900/70 text-zinc-100 hover:border-emerald-500/60 hover:text-emerald-200")
                  }
                >
                  {isEditing ? (
                    <input
                      id={`key-cell-input-${index}`}
                      defaultValue={cell.letter}
                      maxLength={1}
                      onBlur={() => setEditingIndex(null)}
                      onChange={(event) => handleEditingChange(index, event.target.value)}
                      onKeyDown={(event) => handleEditingKeyDown(event, index)}
                      className="h-full w-full rounded-md bg-transparent text-center text-lg font-semibold uppercase text-emerald-200 outline-none"
                    />
                  ) : (
                    cell.letter
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-[11px] text-zinc-500">
            <p>• Click once to set a letter.</p>
            <p>• Double-click to lock or unlock a position.</p>
            <p>• Locked letters stay fixed during iteration.</p>
          </div>
        </section>
      </div>

      <TextOutput text={output} />
    </div>
  );
}
