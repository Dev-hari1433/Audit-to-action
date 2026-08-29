export function ScoreCard({ score, compact = false }: { score: number; compact?: boolean }) {
  const label = score >= 80 ? "Good" : score >= 60 ? "Needs improvement" : "Priority attention";
  const color = score >= 80 ? "#16805b" : score >= 60 ? "#d97706" : "#c43d2a";
  return (
    <div className={`rounded-2xl border border-[#dfe6e1] bg-white ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#6c7971]">Monitoring score</p><p className={`${compact ? "text-3xl" : "text-4xl"} mt-1 font-black`} style={{ color }}>{score}<span className="text-base text-[#7b877f]">/100</span></p></div>
        <div className="relative grid h-16 w-16 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${score}%, #e5ebe7 0)` }}><div className="grid h-11 w-11 place-items-center rounded-full bg-white text-xs font-black">{score}%</div></div>
      </div>
      <p className="mt-3 text-sm font-bold" style={{ color }}>{label}</p>
      {!compact && <p className="mt-1 text-xs text-[#718078]">Monitoring score — not a legal certification.</p>}
    </div>
  );
}
