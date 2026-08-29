import { BellRing, CalendarClock, Siren, UserRound } from "lucide-react";

export function EscalationTimeline({ level }: { level: number }) {
  const events = [
    { label: "Responsible person", detail: "Initial assignment and reminders", icon: UserRound },
    { label: "Department / building head", detail: "Escalated after missed deadline", icon: BellRing },
    { label: "Higher administrative authority", detail: "Next escalation if unresolved", icon: Siren },
  ];
  return (
    <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5">
      <div className="flex items-center gap-2"><CalendarClock size={19} className="text-[#d95425]" /><h2 className="font-black">Escalation path</h2></div>
      <ol className="mt-5 space-y-1">{events.map((event, index) => { const active = level >= index + 1; return <li key={event.label} className="grid grid-cols-[34px_1fr] gap-3"><div className="flex flex-col items-center"><span className={`grid h-8 w-8 place-items-center rounded-full ${active ? "bg-[#d95425] text-white" : "bg-[#e8edea] text-[#718078]"}`}><event.icon size={15} /></span>{index < events.length - 1 && <span className={`h-8 w-0.5 ${active && level > index + 1 ? "bg-[#d95425]" : "bg-[#dfe6e1]"}`} />}</div><div className="pt-1"><p className={`text-sm font-extrabold ${active ? "text-[#9f3516]" : "text-[#526159]"}`}>Level {index + 1}: {event.label}</p><p className="mt-0.5 text-xs text-[#77837c]">{event.detail}</p></div></li>; })}</ol>
    </section>
  );
}
