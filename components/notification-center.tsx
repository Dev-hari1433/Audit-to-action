"use client";

import { useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useStore } from "@/lib/store";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationsRead } = useStore();
  const unread = notifications.filter((item) => !item.read).length;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-label={`Notifications, ${unread} unread`} className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#dfe6e1] bg-white text-[#4c5a52] hover:border-[#0b5d45]">
        <Bell size={19} />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d95425] px-1 text-[9px] font-black text-white">{unread}</span>}
      </button>
      {open && (
        <div className="fixed inset-x-3 top-16 z-50 rounded-2xl border border-[#dfe6e1] bg-white p-3 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[380px]">
          <div className="flex items-center justify-between px-2 py-2"><div><h2 className="font-black">Notifications</h2><p className="text-xs text-[#728078]">Deadlines, evidence and verification</p></div><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[#f1f5f2]" aria-label="Close notifications"><X size={18} /></button></div>
          <div className="max-h-[420px] space-y-2 overflow-y-auto py-2">
            {notifications.map((item) => <div key={item.id} className={`rounded-xl border p-3 ${item.read ? "border-[#e8ece9] bg-white" : "border-[#cfe5da] bg-[#f0f8f4]"}`}><div className="flex items-start gap-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.type === "WARNING" ? "bg-orange-500" : item.type === "SUCCESS" ? "bg-emerald-600" : "bg-sky-600"}`} /><div><p className="text-sm font-extrabold">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-[#66736c]">{item.message}</p><p className="mt-1 text-[11px] text-[#91a098]">{item.createdAt}</p></div></div></div>)}
          </div>
          <button onClick={markNotificationsRead} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#edf4f0] px-4 py-3 text-sm font-bold text-[#0b5d45]"><CheckCheck size={17} />Mark all as read</button>
        </div>
      )}
    </div>
  );
}
