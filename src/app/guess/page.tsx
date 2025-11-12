'use client';

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Toolbox } from "./_components/toolbox";


// Replace with randomised key
const KEY = "RNDKEY";

// Ciphertext to pass to toolbox
const CIPHERTEXT = `Vviv ot ksqs lcfisfr orl yphvdfizk pbr vopsws cis cj Ixgwqz orl ttuom hs ahgsoc ogzghg hgs awjar, hgsc ksbs khhl ck. Ivsx uyijssr niv nagsg zg am kasds orl lwsm gspxws ig afmvy sckm dvmq xb hgs pwfv rovb apwc ks bveaws ciq aiidh wbrhiiv dt uqcaqfv hvda. Evv aohdf, apwc ks cwh jwrcad tezetfg, svig yjofcsh wmg twdzha scr kzhgpws cjdf scj wsfcg. Xpwn zcnyil suhsq iw, ifs ks kcssws otssv bzta. Zzhiz kiwzk, hlmq hvoqsh wmg vclsw ifs ciq teuaawsr klmf ls ptwpb ldkbr orl uxhwdg evv hiptffa. Gu ozk hlm scwazzw bzph hqozmdasr svi tgcu fnoh bzgcifv xpw pusr kmbz jg, rnuw idlomr ketctr qkcwmki.

Obc hlwkt hvzh vmepwb zfi alxzz vwxp mh bcv, vizw ph hgs ivv dt hgs awjar. Omr xpwgs azm fm fd zov zinl tlqddx ezph mni qict wh, aix qx nci rhiid bm rnu, cwm rob zh pmshh swdikl bs hn qsuw pthdf cwm. Xt kd'fi vgi zcxop bg ivs svmvyh ks kczm, owoh'r hlm hdwbs? Hlil'h zwjs rwl wojhbk i etacqm. Xpsi'g kgsr ew hhco piqfv vilor.

Bzph'g z ymvv dt rdoxp, wksb ht cwm zsso pvmsivwmu.

Ww. Sqcis hlil. Iifmg scl ivs vcvtv swrm'h ivv lwhg o fifv. Cf ligp gu o kgwqxwg. Rcm'h kml bs kqcro: lwsfd kizw qobfg, wwet pwf, gsuw awhszi, jmi hvzh aik tofkm sv, tttcqs tmgezs fcx bzt rfhtx wx lvos kea zpdddbmvy.`;

type LogLine = { text: string; type: "user" | "correct" | "partial" | "error" | "input" };

export default function TestPage() {

  const [isFocused, setIsFocused] = useState(false);

  const keyArray = KEY.split("");

  // Log lines for terminal area
  const [logLines, setLogLines] = useState<LogLine[]>([{ text: ">", type: "input" }]);

  // Current input buffer for the line being typed
  const [currentInput, setCurrentInput] = useState("");

  const logEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-300 font-mono">

      {/* Top area: flex row with toolbox and ciphertext panel */}
      <div className="flex flex-row flex-1 min-h-0 border-b border-zinc-800">
        {/* Toolbox component (contains left panel with tools and center panel with expanded area) */}
        <Toolbox ciphertext={CIPHERTEXT} />

        {/* Right panel: ciphertext panel */}
        <div className="w-80 bg-zinc-900 p-4 overflow-auto text-zinc-400 text-sm select-text">
          <div className="whitespace-pre-wrap">
            {CIPHERTEXT}
          </div>
        </div>
      </div>

      {/* Bottom area: terminal-like guess section */}
      <div
        ref={terminalRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={() => terminalRef.current?.focus()}
        onKeyDown={handleKeyDown}
        className="bg-zinc-900 border-t border-zinc-800 p-4 flex flex-col h-64 text-xs leading-tight"
      >

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
                  {isFocused && <span className="blink" />}
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
