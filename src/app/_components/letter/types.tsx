
// Status constants for runtime usage (useful if you want to map to css classes)
export const LetterStatus = {
    CORRECT: "correct",
    PARTIAL: "partial",
    DEFAULT: "default",
  } as const;
  
  // derive a TypeScript type from the constants
  export type LetterStatus = typeof LetterStatus[keyof typeof LetterStatus];
  
  // Reusable props shape for Letter-like components
  export interface LetterProps {
    letter: string;
    status: LetterStatus;
  }
  