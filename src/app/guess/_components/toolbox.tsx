'use client';

import React, { useState, type ComponentType } from "react";
import { CaeserCipher } from "./tools/caeser-cipher";
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
  },
  {
    name: "Frequency",
    shortcut: "F",
    description: "Letter frequency analysis",
  },
  {
    name: "Brute force",
    shortcut: "B",
    description: "Exhaustive key search",
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
    <div className="flex flex-row flex-1">
      <ToolboxList toolboxItems={TOOLBOX_ITEMS} selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      {/* Center panel: expanded tool with letter board at top */}
      <div className="flex-1 flex flex-col">
        {/* Expanded tool placeholder */}
        <div className="flex-1 flex items-center justify-center p-16">
          {selectedTool ? (
            <section
              key={selectedTool.name}
              className="w-full h-full rounded-md border border-emerald-500/80 bg-zinc-900/90 flex items-center justify-center shadow-lg shadow-emerald-500/20 tool-card-pop overflow-hidden"
            >
              {selectedTool.component ? <selectedTool.component cipherText={ciphertext} /> : null }
            </section>
          ) : (
            <section className="w-full max-w-md rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 flex items-center justify-center transform transition-all duration-300 ease-out scale-95 opacity-80">
              <span className="text-xs text-zinc-500">
                Select a tool from the toolbox to view it here
              </span>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}