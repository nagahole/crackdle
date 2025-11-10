'use client';

import { Letter } from "@/app/_components/letter";
import { useState } from "react";

export default function TestPage() {


    const LetterStatus = {
        CORRECT: "correct",
        PARTIAL: "partial",
        DEFAULT: "default",
    } as const;

    type LetterStatus = typeof LetterStatus[keyof typeof LetterStatus];

    interface LetterProps {
        letter: string;
        status: LetterStatus;
    }



    // Replace with randomisers later
    const key = "RNDKEY";
    const keyArray = key.split("");

    const [guess, setGuess] = useState("");

    const [letters, setLetters] = useState<LetterProps[]>(
        keyArray.map(letter => ({
            letter,
            status: "correct"
        }))
    );


    const handleGuess = () => {
        console.log("User guess:", guess);
        
        const guessSplit = guess.split("");

        setLetters(prev => prev.map(letter => {}))

        setGuess(""); // clears input after handling
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center min-h-screen bg-red-500 border-2 border-red-500 rounded-lg">

            <div className="flex flex-row gap-5 items-center justify-center">
                {letters.map((l, i) => (
                    <Letter key={i} letter={l.letter} status={l.status} />
                ))}
            </div>

            <div className="flex flex-row gap-5 items-center justify-center">
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="w-50 h-10 bg-white rounded-md text-black px-5"
                    placeholder="Enter your guess"
                />

                <button
                    onClick={handleGuess}
                    className="w-20 h-10 bg-white rounded-md text-black"
                >
                    Guess
                </button>
            </div>
        </div>
    );
}
