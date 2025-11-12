interface TextOutputProps {
  text: string;
}

export function TextOutput({ text }: TextOutputProps) {
  return (
    <div className="flex flex-1 items-stretch pr-4 pt-4 pb-4">
      <div className="w-8 h-full flex flex-row items-center justify-center text-emerald-300/80 text-xl line">
        &raquo;
      </div>
      <div className="flex-1">
        {text ? (
          text
        ) : (
          <span className="text-xs text-zinc-500">
            Output will appear here as you interact with the tool.
          </span>
        )}
      </div>
    </div>
  );
}
