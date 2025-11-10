// app/_components/letter/index.tsx
import React from "react";
import { type LetterProps, LetterStatus } from "./types";

/** Presentational letter cell */
export function Letter({ letter, status }: LetterProps) {
  const bgClass =
    status === LetterStatus.CORRECT
      ? "bg-green-500"
      : status === LetterStatus.PARTIAL
      ? "bg-yellow-500"
      : "bg-white";

  return (
    <div className="flex items-center justify-center">
      <div
        className={`text-white w-10 h-10 ${bgClass} rounded-md flex items-center justify-center`}
        aria-label={`Letter ${letter} is ${status}`}
      >
        {letter}
      </div>
    </div>
  );
}
