type ToolboxItem = {
  name: string;
  shortcut?: string;
  description?: string;
};

const TOOLBOX_ITEMS: ToolboxItem[] = [
  {
    name: "Caesar cipher",
    shortcut: "C",
    description: "Fixed-shift substitution",
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

export function Toolbox() {
  return (
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
        {TOOLBOX_ITEMS.map((tool) => (
          <button
            key={tool.name}
            type="button"
            className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-left transition hover:border-emerald-400/70 hover:bg-zinc-900/90"
          >
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
            {tool.shortcut ? (
              <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] text-zinc-400 group-hover:border-emerald-400/70 group-hover:text-emerald-300">
                {tool.shortcut}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}