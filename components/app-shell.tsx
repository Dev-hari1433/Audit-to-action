"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileWarning,
  Gauge,
  LogOut,
  Menu,
  RefreshCcw,
  ShieldCheck,
  Siren,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notification-center";
import { demoAccounts } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Role } from "@/types";

const roleLabels: Record<Role, string> = { CITIZEN: "Citizen", AUDITOR: "Auditor", BUILDING_MANAGER: "Building manager", ADMIN: "Administrator" };

const nav = {
  CITIZEN: [
    ["Dashboard", "/citizen/dashboard", Gauge],
    ["My reports", "/citizen/reports", FileWarning],
    ["Report problem", "/report", ClipboardCheck],
    ["Buildings", "/buildings", Building2],
  ],
  AUDITOR: [
    ["Dashboard", "/auditor/dashboard", Gauge],
    ["Assigned buildings", "/auditor/buildings", Building2],
    ["Audits", "/auditor/audits", ClipboardCheck],
    ["Issues", "/auditor/issues", FileWarning],
    ["Verification", "/auditor/verification", ShieldCheck],
  ],
  BUILDING_MANAGER: [
    ["Dashboard", "/manager/dashboard", Gauge],
    ["Assigned issues", "/manager/issues", Wrench],
  ],
  ADMIN: [
    ["Dashboard", "/admin/dashboard", BarChart3],
    ["Buildings", "/admin/buildings", Building2],
    ["Audits", "/admin/audits", ClipboardCheck],
    ["Issues", "/admin/issues", FileWarning],
    ["Escalations", "/admin/escalations", Siren],
    ["Users", "/admin/users", Users],
    ["Citizen reports", "/admin/reports", FileWarning],
  ],
} satisfies Record<Role, [string, string, typeof Gauge][]>;

function RoleGate() {
  const router = useRouter();
  const { login } = useStore();
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6f4] p-5">
      <section className="w-full max-w-4xl rounded-[2rem] border border-[#dfe6e1] bg-white p-6 shadow-[0_24px_80px_rgba(20,45,34,.12)] sm:p-10">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0b5d45] font-black text-white">A</span><div><p className="font-black">ACCESS<span className="text-[#d95425]">TRACK</span></p><p className="text-xs text-[#6e7b73]">Secure role workspace</p></div></div>
        <h1 className="mt-8 text-3xl font-black tracking-tight">Choose a demo role</h1>
        <p className="mt-2 max-w-2xl text-[#66736c]">No credentials are needed. Each role opens a realistic seeded workspace, and changes persist on this device.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => <button key={account.role} onClick={() => { login(account.role); const base = account.role === "BUILDING_MANAGER" ? "manager" : account.role.toLowerCase(); router.push(`/${base}/dashboard`); }} className="rounded-2xl border border-[#dfe6e1] p-5 text-left hover:border-[#0b5d45] hover:bg-[#f4faf7]"><p className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">Login as {roleLabels[account.role]}</p><p className="mt-2 text-lg font-extrabold">{account.name}</p><p className="mt-1 text-sm text-[#718078]">{account.detail}</p></button>)}
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-[#0b5d45] hover:underline">← Return to public site</Link>
      </section>
    </main>
  );
}

function SidebarContent({ role, items, pathname, onNavigate, onReset, onSwitch }: { role: Role; items: [string, string, typeof Gauge][]; pathname: string; onNavigate: () => void; onReset: () => void; onSwitch: () => void }) {
  return (
    <>
      <Link href="/" className="flex items-center gap-3 px-1"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white font-black text-[#0b5d45]">A</span><div><p className="font-black text-white">ACCESS<span className="text-[#ff8a55]">TRACK</span></p><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9fc0b4]">Demo mode</p></div></Link>
      <div className="mt-8 rounded-xl bg-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#9fc0b4]">Signed in as</p><p className="mt-1 text-sm font-extrabold text-white">{roleLabels[role]}</p></div>
      <nav className="mt-7 flex-1 space-y-1" aria-label={`${roleLabels[role]} navigation`}>
        {items.map(([label, href, Icon]) => { const active = pathname === href || (href.split("/").length > 2 && pathname.startsWith(`${href}/`)); return <Link onClick={onNavigate} key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-white text-[#0b5d45] shadow-sm" : "text-[#cbe0d8] hover:bg-white/10 hover:text-white"}`}><Icon size={18} aria-hidden="true" />{label}</Link>; })}
      </nav>
      <div className="space-y-1 border-t border-white/10 pt-4">
        <button onClick={onReset} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#cbe0d8] hover:bg-white/10 hover:text-white"><RefreshCcw size={17} />Reset demo data</button>
        <button onClick={onSwitch} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#cbe0d8] hover:bg-white/10 hover:text-white"><LogOut size={17} />Switch role</button>
      </div>
    </>
  );
}

export function AppShell({ children, title, eyebrow, action }: { children: React.ReactNode; title: string; eyebrow?: string; action?: React.ReactNode }) {
  const { role, logout, resetDemo } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!role) return <RoleGate />;
  const items = nav[role];
  const switchRole = () => { logout(); router.push("/login"); };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#17231d]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col bg-[#12382d] p-5 lg:flex"><SidebarContent role={role} items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} onReset={resetDemo} onSwitch={switchRole} /></aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[280px] flex-col bg-[#12382d] p-5" onClick={(event) => event.stopPropagation()}><button className="absolute right-4 top-4 rounded-lg p-2 text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button><SidebarContent role={role} items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} onReset={resetDemo} onSwitch={switchRole} /></aside></div>}
      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#dfe6e1] bg-[#f7f9f7]/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe6e1] bg-white lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="min-w-0">{eyebrow && <p className="truncate text-[10px] font-black uppercase tracking-[.15em] text-[#718078]">{eyebrow}</p>}<h1 className="truncate text-lg font-black sm:text-xl">{title}</h1></div></div>
          <div className="flex items-center gap-2">{action}<NotificationCenter /><span className="hidden rounded-full bg-[#e6f2ec] px-3 py-2 text-xs font-extrabold text-[#0b5d45] sm:block">DEMO MODE</span></div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
