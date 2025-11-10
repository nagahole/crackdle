"use client";

import React, { useMemo } from "react";
import { type LetterProps, LetterStatus } from "@/app/_components/letter/types";

interface TextareaProps {
  keyArray: string;       // Example: "RNDKEY"
  letters: LetterProps[]; // Contains { letter: 'R', status: 'correct' | 'partial' | 'default' }
  plainText: string;      // The plaintext paragraph to encrypt / reveal
}

export function Textarea({ keyArray, letters, plainText }: TextareaProps) {

  /** Convert key string to uppercase char array (R N D K E Y ...) */
  const keyChars = useMemo(() => keyArray.toUpperCase().split(""), [keyArray]);

  /** Set of letters that user has guessed (status !== "default") */
  const revealedKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const l of letters) {
      if (l.status !== LetterStatus.DEFAULT) {
        s.add(l.letter.toUpperCase());
      }
    }
    return s;
  }, [letters]);

  /** Set of letters the user guessed *correctly* (status === "correct") */
  const correctlyGuessedKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const l of letters) {
      if (l.status === LetterStatus.CORRECT) {
        s.add(l.letter.toUpperCase());
      }
    }
    return s;
  }, [letters]);

  /** Helper — detects alphabet characters */
  const isLetter = (ch: string) => /^[a-zA-Z]$/.test(ch);

  /** Vigenère encryption on a single character */
  const vigenereEncryptChar = (plainChar: string, keyChar: string) => {
    const isUpper = plainChar === plainChar.toUpperCase();
    const base = isUpper ? 65 : 97;
    const p = plainChar.charCodeAt(0) - base;
    const k = keyChar.charCodeAt(0) - 65;
    return String.fromCharCode(((p + k) % 26) + base);
  };

  /** Build output nodes (supports highlighting by inserting spans) */
  const ciphertextNodes = useMemo(() => {
    if (!keyChars.length) return plainText;

    let result: React.ReactNode[] = [];
    let keyIndex = 0;

    for (let i = 0; i < plainText.length; i++) {
      const ch = plainText[i];

      if (!isLetter(ch)) {
        result.push(ch);
        continue;
      }

      // ✅ Ensure keyChar is always a string
      const keyChar = keyChars[keyIndex % keyChars.length] ?? "A";

      const keyIsRevealed = revealedKeySet.has(keyChar);     // show plaintext
      const keyIsCorrect = correctlyGuessedKeySet.has(keyChar); // highlight

      let outputChar = ch;

      if (!keyIsRevealed) {
        outputChar = vigenereEncryptChar(ch, keyChar); // encrypt when not guessed
      }

      if (keyIsCorrect) {
        result.push(
          <span key={i} className="bg-emerald-400/30 ">
            {outputChar}
          </span>
        );
      } else {
        result.push(outputChar);
      }

      keyIndex++;
    }

    return result;
  }, [plainText, keyChars, revealedKeySet, correctlyGuessedKeySet]);

  return <div className="whitespace-pre-wrap">{ciphertextNodes}</div>;
}
