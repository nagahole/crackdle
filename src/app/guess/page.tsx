// app/test/TestPage.tsx
'use client';

import React, { useCallback, useState } from "react";
import { type LetterProps, LetterStatus } from "@/app/_components/letter/types";
import { Letter } from "@/app/_components/letter/letter";


// Replace with randomised key 
const KEY = "RNDKEY";

export default function TestPage() {

  const keyArray = KEY.split("");

  // Users gues
  const [guess, setGuess] = useState("");

  // Current status of letters
  const [letters, setLetters] = useState<LetterProps[]>(
    keyArray.map((ch) => ({ letter: ch, status: LetterStatus.DEFAULT }))
  );

  // Helper function to get each character from user guess
  const getGuessChars = (value: string) => value.split("");

  // When user presses enter or guess
  const handleGuess = useCallback(() => {

    // Splits the guess
    const guessChars = getGuessChars(guess);

    // Show error message if the length doesn't match up 
    if (guessChars.length !== KEY.length) {
      alert("Doesn't match the size of the key");
      return;
    }

    // Update the status of each letter based on the user's guess
    setLetters((prev) =>
      prev.map((cell, idx) => ({
        letter: cell.letter,
        status:
          guessChars[idx] === cell.letter
            ? LetterStatus.CORRECT
            : guessChars.includes(cell.letter)
            ? LetterStatus.PARTIAL
            : LetterStatus.DEFAULT,
      }))
    );

    setGuess("");
  }, [guess]);

  return (
    <div className="flex flex-col gap-5 items-center justify-center min-h-screen bg-red-500 border-2 border-red-500 rounded-lg">
      
      {/* Letter board */}
      <div className="flex flex-row gap-5 items-center justify-center">
        {letters.map((l, i) => (
          <Letter key={i} letter={l.letter} status={l.status} />
        ))}
      </div>

        {/* Guess box */}
      <div className="flex flex-row gap-5 items-center justify-center">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          className="w-50 h-10 bg-white rounded-md text-black px-5"
          placeholder="Enter your guess"
          aria-label="Guess input"
        />

        <button
          onClick={handleGuess}
          className="w-20 h-10 bg-white rounded-md text-black"
          aria-label="Submit guess"
        >
          Guess
        </button>
      </div>
    </div>
  );
}
