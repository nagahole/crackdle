import { useEffect, useState } from "react";
import type { ToolProps } from "../toolbox";
import { TextOutput } from "./common/text-output";

type Mode = "cipher" | "custom";

function shiftText(text: string, offset: number): string {
  const normalized = ((offset % 26) + 26) % 26;
  return text
    .split("")
    .map((ch) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      const isLower = ch === ch.toLowerCase();
      const base = isLower ? 97 : 65;
      const code = ch.charCodeAt(0) - base;
      const shifted = (code + normalized) % 26;
      return String.fromCharCode(shifted + base);
    })
    .join("");
}

export function CaeserCipher({ cipherText }: ToolProps) {
  const [mode, setMode] = useState<Mode>("cipher");
  const [shift, setShift] = useState(0);
  const [lockPositive, setLockPositive] = useState(true);
  const [customText, setCustomText] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    handleApply();
  }, [mode, shift, customText])

  const handleShiftChange = (value: number) => {
    let v = value;
    if (lockPositive && v < 0) v = 0;
    if (v < -25) v = -25;
    if (v > 25) v = 25;
    setShift(v);
  };

  const handleApply = () => {
    const source =
      mode === "cipher" ? (cipherText ?? "") : customText;
    const result = shiftText(source, shift);
    setOutput(result);
  };

  const handleToggleLock = () => {
    setLockPositive((prev) => {
      const next = !prev;
      if (next && shift < 0) {
        setShift(0);
      }
      return next;
    });
  };

  const activeTabClasses =
    "flex-1 text-center py-1.5 text-xs font-semibold rounded-md border bg-zinc-800 border-zinc-500 text-zinc-50";
  const inactiveTabClasses =
    "flex-1 text-center py-1.5 text-xs font-medium rounded-md border bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200";

  const effectiveMin = lockPositive ? 0 : -25;

  return (
    <div className="flex h-full w-full text-sm text-zinc-100">
      {/* Left side: controls */}
      <div className="flex flex-1 w-[320px] max-w-xs flex-col gap-4 bg-zinc-900 border-r border-zinc-800 p-4">
        {/* Mode toggle */}
        <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("cipher")}
            className={mode === "cipher" ? activeTabClasses : inactiveTabClasses}
          >
            CIPHER
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={mode === "custom" ? activeTabClasses : inactiveTabClasses}
          >
            CUSTOM
          </button>
        </div>

        {/* Slider + lock */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Shift offset</span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-zinc-300">
                {shift}
              </span>
              <button
                type="button"
                onClick={handleToggleLock}
                className={
                  "flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                  (lockPositive
                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-600 bg-zinc-800 text-zinc-300")
                }
              >
                {lockPositive ? "🔒 0–25" : "🔓 ±25"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="range"
              min={effectiveMin}
              max={25}
              step={1}
              value={shift}
              onChange={(e) => handleShiftChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{effectiveMin}</span>
              <span>0</span>
              <span>25</span>
            </div>
          </div>
        </div>

        {/* Text area only in CUSTOM mode */}
        {mode === "custom" && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-400">
              Input text
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full min-h-[120px] resize-none rounded-md border border-zinc-700/40 bg-zinc-950/60 px-2.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              placeholder="Type text to shift..."
            />
          </div>
        )}
      </div>

      <TextOutput text={output} />
    </div>
  );
}