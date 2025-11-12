import { useMemo, useState } from "react";
import type { ToolProps } from "../toolbox";
import { TextOutput } from "./common/text-output";

function normalizeKeyword(keyword: string): string {
  return keyword.replace(/[^a-z]/gi, "").toUpperCase();
}

function decodeVigenere(cipherText: string, keyword: string): string {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword.length) {
    return cipherText ?? "";
  }

  let keyIndex = 0;
  const keywordLength = normalizedKeyword.length;

  return cipherText
    .split("")
    .map((char) => {
      if (!/[a-zA-Z]/.test(char) || keywordLength === 0) {
        return char;
      }

      const keyChar = normalizedKeyword.charAt(keyIndex % keywordLength);
      const keyShift = keyChar.charCodeAt(0) - 65;
      keyIndex += 1;

      const isLower = char === char.toLowerCase();
      const base = isLower ? 97 : 65;
      const charCode = char.charCodeAt(0) - base;
      const decoded = (charCode - keyShift + 26) % 26;
      return String.fromCharCode(decoded + base);
    })
    .join("");
}

export function VigenereCipher({ cipherText }: ToolProps) {
  const [keyword, setKeyword] = useState("");

  const output = useMemo(
    () => decodeVigenere(cipherText ?? "", keyword),
    [cipherText, keyword]
  );

  return (
    <div className="flex h-full w-full text-sm text-zinc-100">
      <div className="flex w-[320px] max-w-xs flex-col justify-center gap-2 bg-zinc-900 border-r border-zinc-800 p-4">
        <label className="flex flex-col text-xs text-zinc-400">
          Keyword
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="mt-1 h-9 rounded-md border border-zinc-700/50 bg-zinc-950/60 px-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            placeholder="Enter keyword"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </label>
        <p className="text-[10px] text-zinc-500">
          Only letters are used to decode. Other characters are ignored.
        </p>
      </div>
      <TextOutput text={output} />
    </div>
  );
}
