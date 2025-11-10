'use client';

import React, { useCallback, useState, useRef, useEffect } from "react";
import { type LetterProps, LetterStatus } from "@/app/_components/letter/types";
import { Letter } from "@/app/_components/letter/letter";
import { Toolbox } from "../_components/toolbox";


// Replace with randomised key
const KEY = "RNDKEY";

type LogLine = { text: string; type: "user" | "correct" | "partial" | "error" | "input" };

export default function TestPage() {

  const keyArray = KEY.split("");

  // Current status of letters
  const [letters, setLetters] = useState<LetterProps[]>(
    keyArray.map((ch) => ({ letter: ch, status: LetterStatus.DEFAULT }))
  );

  // Log lines for terminal area
  const [logLines, setLogLines] = useState<LogLine[]>([{ text: ">", type: "input" }]);

  // Current input buffer for the line being typed
  const [currentInput, setCurrentInput] = useState("");

  const logEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new log line added or input changes
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logLines, currentInput]);

  // Helper function to get each character from user guess
  const getGuessChars = (value: string) => value.split("");

  // When user presses enter or guess
  const handleGuess = useCallback((guess: string) => {

    // Splits the guess
    const guessChars = getGuessChars(guess);

    // Append user guess line
    setLogLines((prev) => [
      // Replace the last input line with a user line showing the guess
      ...prev.slice(0, -1),
      { text: `> ${guess}`, type: "user" }
    ]);

    // Show error message if the length doesn't match up
    if (guessChars.length !== KEY.length) {
      setLogLines((prev) => [
        ...prev,
        { text: "Error: Guess length does not match the size of the key.", type: "error" },
        { text: ">", type: "input" }
      ]);
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

    // Determine feedback message and type
    let correctCount = 0;
    let partialCount = 0;
    guessChars.forEach((ch, idx) => {
      if (ch === keyArray[idx]) correctCount++;
      else if (keyArray.includes(ch)) partialCount++;
    });

    if (correctCount === KEY.length) {
      setLogLines((prev) => [
        ...prev,
        { text: "All letters correct! Well done!", type: "correct" },
        { text: ">", type: "input" }
      ]);
    } else if (correctCount > 0 || partialCount > 0) {
      setLogLines((prev) => [
        ...prev,
        { text: `Correct letters: ${correctCount}, Partial matches: ${partialCount}`, type: "partial" },
        { text: ">", type: "input" }
      ]);
    } else {
      setLogLines((prev) => [
        ...prev,
        { text: "No matching letters found.", type: "error" },
        { text: ">", type: "input" }
      ]);
    }

  }, [keyArray]);

  // Global keypress handler for terminal input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentInput.trim().length > 0) {
          handleGuess(currentInput.trim().toUpperCase());
          setCurrentInput("");
        } else {
          // If enter pressed on empty input, just add a new prompt line
          setLogLines((prev) => [
            ...prev.slice(0, -1),
            { text: `>`, type: "user" },
            { text: ">", type: "input" }
          ]);
        }
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        setCurrentInput((prev) => (prev + e.key.toUpperCase()).slice(0, KEY.length));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentInput, handleGuess]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-300 font-mono">

      {/* Top area: flex row with three panels */}
      <div className="flex flex-row flex-1 border-b border-zinc-800">

        {/* Left panel: fixed width with Toolbox */}
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
          <Toolbox />
        </div>

        {/* Center panel: expanded tool with letter board at top */}
        <div className="flex-1 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
          {/* Letter board */}
          <div className="flex flex-row gap-3 mb-6 justify-center">
            {letters.map((l, i) => (
              <Letter key={i} letter={l.letter} status={l.status} />
            ))}
          </div>
          {/* Expanded tool placeholder */}
          <div className="flex-1 border border-zinc-800 rounded-md bg-zinc-900 flex items-center justify-center text-zinc-500 italic">
            Expanded tool placeholder
          </div>
        </div>

        {/* Right panel: ciphertext panel */}
        <div className="w-80 bg-zinc-900 p-4 overflow-auto text-zinc-400 text-sm select-text">
          <div className="whitespace-pre-wrap">
            {/* Placeholder ciphertext text */}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </div>
      </div>

      {/* Bottom area: terminal-like guess section */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex flex-col h-64 text-xs leading-tight">

        {/* Scrollable log area */}
        <div className="flex-1 overflow-y-auto mb-3 px-2 font-mono">
          {logLines.map((line, idx) => {
            let className = "";
            if (line.type === "user") className = "text-emerald-300 select-none";
            else if (line.type === "correct") className = "text-green-500";
            else if (line.type === "partial") className = "text-orange-300";
            else if (line.type === "error") className = "text-red-500 italic";
            else if (line.type === "input") className = "text-emerald-300 select-none flex";

            if (line.type === "input") {
              return (
                <div key={idx} className={className}>
                  <span>{line.text} </span>
                  <span>{currentInput}</span>
                  <span className="blink" />
                </div>
              );
            }

            return (
              <div key={idx} className={className}>
                {line.text}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>

      </div>

      {/* blink styling */}
      <style>{`
        .blink {
          display: inline-block;
          width: 8px;
          height: 1em;
          background-color: #22c55e;
          margin-left: 2px;
          animation: blink 1s steps(2, start) infinite;
          vertical-align: bottom;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
