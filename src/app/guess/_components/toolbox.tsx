'use client';

import React, { useState, type ComponentType } from "react";
import { CaeserCipher } from "./tools/caeser-cipher";
import { VigenereCipher } from "./tools/vigenere-cipher";
import { KasikiAnalysis } from "./tools/kasiki-analysis";
import { FrequencyAnalysis } from "./tools/frequency-analysis";
import { BruteForce } from "./tools/brute-force";
import { ToolboxList } from "./toolbox-list";

export interface ToolProps {
    cipherText: string;
}

export type ToolboxItem = {
  name: string;
  shortcut?: string;
  description?: string;
  component?: ComponentType<ToolProps>;
};

const TOOLBOX_ITEMS: ToolboxItem[] = [
  {
    name: "Caesar cipher",
    shortcut: "C",
    description: "Fixed-shift substitution",
    component: CaeserCipher,
  },
  {
    name: "Vigenère",
    shortcut: "V",
    description: "Keyword-based polyalphabetic",
    component: VigenereCipher,
  },
  {
    name: "Frequency",
    shortcut: "F",
    description: "Letter frequency analysis",
    component: FrequencyAnalysis,
  },
  {
    name: "Kasiski",
    shortcut: "K",
    description: "Repeated n-gram inspector",
    component: KasikiAnalysis,
  },
  {
    name: "Brute force",
    shortcut: "B",
    description: "Exhaustive key search",
    component: BruteForce,
  },
  {
    name: "Hint",
    shortcut: "H",
    description: "Reveal a small clue",
  },
];

type ToolboxProps = {
  ciphertext: string;
};

export function Toolbox({ ciphertext }: ToolboxProps) {

  const [selectedTool, setSelectedTool] = useState<ToolboxItem | null>(null);

  return (
    <div className="flex flex-row flex-1 min-h-0">
      <ToolboxList toolboxItems={TOOLBOX_ITEMS} selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      {/* Expanded tool placeholder */}
      <div className="flex-1 min-h-0 p-10 flex">
        {selectedTool ? (
          <section
            key={selectedTool.name}
            className="flex flex-1 min-h-0 overflow-auto flex-col rounded-md border border-emerald-500/80 bg-zinc-900/90 shadow-lg shadow-emerald-500/20 tool-card-pop"
          >
              {selectedTool.component ? <selectedTool.component cipherText={ciphertext} /> : null }
          </section>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <section className="w-full max-w-md rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 flex items-center justify-center transform transition-all duration-300 ease-out scale-95 opacity-80">
              <span className="text-xs text-zinc-500">
                Select a tool from the toolbox to view it here
              </span>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}