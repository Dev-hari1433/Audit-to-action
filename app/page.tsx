import { ArrowRight, Bot, CheckCircle2, Clock3, Eye, MapPin, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteLink as Link } from "@/components/site-link";

const workflow = [
  "Audit",
  "Responsibility",
  "Deadline",
  "Fix",
  "Evidence",
  "Verify",
  "Close",
];

export default function Home() {
  return (
    <main className="premium-canvas min-h-screen text-[#17231d]">
      <header className="sticky top-0 z-50 border-b border-[#173c30]/[.07] bg-[#f7f8f4]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" aria-label="AccessTrack home"><BrandLogo tagline="Access into action" /></Link>
        <nav className="flex items-center gap-2 text-sm font-semibold md:gap-8" aria-label="Primary navigation">
          <Link href="/buildings" className="hidden hover:text-[#0b5d45] sm:block">Buildings</Link>
          <a href="#how-it-works" className="hidden hover:text-[#0b5d45] md:block">How it works</a>
          <Link href="/login" className="rounded-full border border-[#17231d]/15 bg-white px-5 py-2.5 hover:border-[#0b5d45]">Sign in</Link>
        </nav>
      </div></header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-12 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[#0b5d45]/20 bg-[#e7f3ed] px-3 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#0b5d45]">
            <span className="h-2 w-2 rounded-full bg-[#e26a37]" /> Chennai accessibility pilot
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-7xl">
            Turning accessibility audits into <span className="text-[#0b5d45]">action.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#526159]">
            Every accessibility finding gets an owner, deadline, evidence, human verification and escalation—until the barrier is actually removed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/report" className="rounded-xl bg-[#e15f2a] px-6 py-4 text-center font-bold text-white shadow-[0_8px_24px_rgba(225,95,42,.24)] hover:bg-[#c94f1f] focus:outline-none focus:ring-4 focus:ring-[#e15f2a]/25">
              Report an accessibility problem
            </Link>
            <Link href="/buildings" className="rounded-xl border border-[#17231d]/15 bg-white px-6 py-4 text-center font-bold hover:border-[#0b5d45] focus:outline-none focus:ring-4 focus:ring-[#0b5d45]/15">
              View building accessibility
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,#164638,#0c2d24)] p-5 text-white shadow-[0_32px_80px_rgba(16,56,43,.24)] sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e56532]/15 blur-3xl" />
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9ecbbb]">Live accountability</p>
              <h2 className="mt-2 text-2xl font-bold">Government General Hospital</h2>
            </div>
            <span className="rounded-full bg-[#fbe5dc] px-3 py-1.5 text-xs font-extrabold text-[#b73c18]">8 DAYS OVERDUE</span>
          </div>
          <div className="rounded-2xl bg-white p-5 text-[#17231d]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#69766f]">Issue ACC-1024</p>
                <p className="mt-1 text-xl font-extrabold">No wheelchair ramp</p>
                <p className="mt-1 text-sm text-[#69766f]">Main entrance · High priority</p>
              </div>
              <span className="rounded-lg bg-[#fff2ec] px-3 py-2 text-xs font-black text-[#c14920]">HIGH</span>
            </div>
            <div className="my-5 h-px bg-[#dfe5e1]" />
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-[#69766f]">Responsible</dt><dd className="mt-1 font-bold">Hospital Engineering</dd></div>
              <div><dt className="text-[#69766f]">Escalation</dt><dd className="mt-1 font-bold text-[#b73c18]">Level 2 active</dd></div>
            </dl>
            <div className="mt-6 rounded-xl bg-[#f3f6f4] p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold"><span>Resolution progress</span><span>Evidence requested</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dbe3de]"><div className="h-full w-[58%] rounded-full bg-[#e15f2a]" /></div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[["20","Buildings"],["120","Issues"],["72%","Avg. score"]].map(([value,label]) => (
              <div key={label} className="rounded-xl bg-white/10 p-4"><strong className="block text-2xl">{value}</strong><span className="text-xs text-[#b6d4ca]">{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#17231d]/10 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[.2em] text-[#6b776f]">From finding to verified fix</p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {workflow.map((step, index) => (
              <li key={step} className="flex items-center gap-3 rounded-xl bg-[#f4f7f5] p-3 text-sm font-bold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0b5d45] text-xs text-white">{index + 1}</span>{step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#0b5d45]">Why AccessTrack?</p><h2 className="mt-3 text-4xl font-black leading-tight tracking-[-.035em]">Reports should end in action—not in a drawer.</h2><p className="mt-4 leading-7 text-[#66736c]">AccessTrack gives each barrier a visible owner, deadline and proof trail. Completion only counts after a human verifier approves the evidence.</p></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[{icon:Clock3,title:"Accountability",copy:"Every issue has a responsible party, department and deadline."},{icon:ShieldCheck,title:"Verification",copy:"Completion requires evidence and an independent human decision."},{icon:UsersRound,title:"Community",copy:"Citizens can report real barriers and follow the response."}].map(({icon:Icon,title,copy}, index) => <article key={title} className="rounded-2xl border border-[#dfe6e1] bg-white p-5 shadow-[0_10px_32px_rgba(20,45,34,.045)]"><span className={`grid h-11 w-11 place-items-center rounded-xl ${index === 1 ? "bg-[#fff0e9] text-[#d95425]" : "bg-[#e8f3ee] text-[#0b5d45]"}`}><Icon size={21} /></span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#66736c]">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#12382d] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:items-center">
          <div><div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[.18em] text-[#bcd8ce]"><Sparkles size={15} />AI screening — required</div><h2 className="mt-5 text-4xl font-black tracking-tight">Every photo is screened. Humans make the final decision.</h2><p className="mt-4 max-w-xl leading-7 text-[#c9ddd5]">Complaint photos and completion evidence pass through a required preliminary AI check before entering the human review queue.</p><div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-[#f29b75]/30 bg-[#e15f2a]/15 px-4 py-3 font-black text-[#ffb492]"><Eye size={20} />AI screens. Auditors verify.</div></div>
          <div className="grid gap-3 sm:grid-cols-2">{[{title:"Photo analysis",copy:"Flag possible steps, missing ramps and handrails.",icon:Bot},{title:"Voice reporting",copy:"Turn a spoken observation into an editable report.",icon:UsersRound},{title:"Before / after",copy:"Surface visible changes for the verifier to inspect.",icon:Sparkles},{title:"Smart classification",copy:"Suggest category, department and priority for admin review.",icon:CheckCircle2}].map(({title,copy,icon:Icon}) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.07] p-5"><Icon className="text-[#ff8a55]" size={21} /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#bdd4cb]">{copy}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-[#d8e2dc] bg-white shadow-[0_18px_55px_rgba(20,45,34,.07)] lg:grid lg:grid-cols-[1fr_.72fr]">
          <div className="p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#d95425]">Live hackathon demo</p><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight">Follow one missing ramp from audit to verified closure.</h2><p className="mt-4 max-w-2xl leading-7 text-[#66736c]">Start as an auditor, create a finding at Government General Hospital, assign it as admin, upload evidence as manager, and return as auditor to verify.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-6 py-4 font-black text-white">Open demo mode <ArrowRight size={18} /></Link><Link href="/report" className="inline-flex items-center justify-center rounded-xl border border-[#cad5cf] px-6 py-4 font-black">Report a problem</Link></div></div>
          <div className="grid min-h-[280px] place-items-center bg-[#eaf2ee] p-7"><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg"><div className="flex items-center justify-between"><span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-800">OVERDUE</span><span className="text-xs font-bold text-[#748078]">ACC-1024</span></div><h3 className="mt-4 text-xl font-black">No wheelchair ramp</h3><p className="mt-2 flex items-center gap-2 text-sm text-[#66736c]"><MapPin size={15} />Government General Hospital</p><div className="mt-5 space-y-2">{["Owner assigned","Deadline tracked","Evidence required","Human verification"].map((step,index)=><div key={step} className="flex items-center gap-3 text-sm font-bold"><span className={`grid h-7 w-7 place-items-center rounded-full ${index<2?"bg-[#0b5d45] text-white":"bg-[#edf1ee] text-[#7b8780]"}`}>{index<2?"✓":index+1}</span>{step}</div>)}</div></div></div>
        </div>
      </section>

      <footer className="border-t border-[#dfe6e1] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><BrandLogo tagline="From audit to action" /><p className="text-xs text-[#748078]">Fictional Chennai pilot data · Monitoring scores are not legal certification.</p></div></footer>
    </main>
  );
}
