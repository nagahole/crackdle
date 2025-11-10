

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


export function Letter({ letter, status }: LetterProps) {

    const color = status === "correct" ? "bg-green-500" : status === "partial" ? "bg-yellow-500" : "bg-white";

    return (
        <div className="flex items-center justify-center">
            <div className={`text-white w-10 h-10 ${color} rounded-md flex items-center justify-center`}>
                {letter}
            </div>
        </div>
    )


 }




