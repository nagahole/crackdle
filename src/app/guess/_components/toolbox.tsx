'use client';

import React, { useState, type ComponentType } from "react";
import { type LetterProps, LetterStatus } from "@/app/_components/letter/types";
import { Letter } from "@/app/_components/letter/letter";
import { CaeserCipher } from "./tools/caeser-cipher";

export interface ToolProps {
    cipherText: string;
}

type ToolboxItem = {
  name: string;
  shortcut?: string;
  description?: string;
  component?: ComponentType;
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
  const [animTick, setAnimTick] = useState(0);

  function handleSelect(tool: ToolboxItem) {
    setSelectedTool(tool);
    setAnimTick((t) => t + 1);
  }

  return (
    <div className="flex flex-row flex-1 p-4">
      {/* Left panel: Toolbox */}
      <div className="w-64 p-4 flex flex-col self-center">
        <section className="w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-sm shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Toolbox
              </h2>
            </div>
            <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              Tools
            </span>
          </header>

          <div className="grid gap-1.5">
            {TOOLBOX_ITEMS.map((tool) => {
              const isSelected = selectedTool?.name === tool.name;
              return (
                <button
                  key={tool.name}
                  type="button"
                  onClick={() => handleSelect(tool)}
                  className={
                    "group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-left transition hover:border-emerald-400/70 hover:bg-zinc-900/90" +
                    (isSelected ? " border-emerald-500 bg-zinc-900/90 outline outline-1 outline-emerald-400" : "")
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-zinc-100">
                        {tool.name}
                      </span>
                      {tool.description ? (
                        <span className="text-[10px] text-zinc-500">
                          {tool.description}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {tool.shortcut ? (
                    <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] text-zinc-400 group-hover:border-emerald-400/70 group-hover:text-emerald-300">
                      {tool.shortcut}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Center panel: expanded tool with letter board at top */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Expanded tool placeholder */}
        <div className="flex-1 flex items-center justify-center">
          {selectedTool ? (
            <section
              key={`${selectedTool.name}-${animTick}`}
              className="w-full max-w-md rounded-xl border border-emerald-500/80 bg-zinc-900/90 p-8 flex items-center justify-center shadow-lg shadow-emerald-500/20 tool-card-pop"
            >
              {selectedTool.component ? <selectedTool.component/> : null }
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