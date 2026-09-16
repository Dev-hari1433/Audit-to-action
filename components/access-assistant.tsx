"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronRight,
  RotateCcw,
  Bot,
  User,
  ShieldCheck
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SiteLink as Link } from "@/components/site-link";

interface BrowserSpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  actionButtons?: Array<{ label: string; href?: string; onClick?: () => void }>;
  timestamp: string;
}

interface ChatResponse {
  reply?: string;
}

export function AccessAssistant() {
  const { reports, issues, buildings } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "assistant",
      text: "Hello! I am Access Assistant, powered by Gemini 2.5 Flash. I can help you report accessibility barriers, track existing complaints with real-time updates, explain statuses, and locate accessible buildings across Chennai.",
      actionButtons: [
        { label: "Report a Problem", href: "/report" },
        { label: "Track a Complaint", onClick: () => handleTrackPrompt() },
        { label: "Find Monitored Buildings", href: "/buildings" }
      ],
      timestamp: "Just now"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Text-to-speech helper
  const speakText = useCallback(
    (text: string) => {
      if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [speechEnabled]
  );

  const handleTrackPrompt = () => {
    const recentReports = reports.slice(0, 3);
    const reportList = recentReports
      .map((r) => `• ${r.id} (${r.buildingName}): ${r.status}`)
      .join("\n");

    const reply =
      recentReports.length > 0
        ? `To track a complaint, simply type its ID (e.g., "${recentReports[0].id}") or select from your recent reports:\n\n${reportList}`
        : "Please enter your Complaint ID (e.g., ACC-2026-000123) to check its live status, verified photos, and next steps.";

    addAssistantMessage(reply, [
      { label: "View All My Reports", href: "/citizen/reports" },
      { label: "Report New Barrier", href: "/report" }
    ]);
  };

  const addAssistantMessage = (
    text: string,
    actionButtons?: Array<{ label: string; href?: string; onClick?: () => void }>
  ) => {
    const newMsg: Message = {
      id: crypto.randomUUID(),
      sender: "assistant",
      text,
      actionButtons,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, newMsg]);
    speakText(text);
  };

  const processQuery = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const lower = query.toLowerCase();

    // 1. Complaint ID Tracking Lookup (e.g., ACC-2026-000123, ACC-1201, 000124)
    const accMatch = query.match(/ACC[-_0-9]+/i) || query.match(/\b\d{5,6}\b/);
    if (accMatch) {
      const searchId = accMatch[0].toUpperCase().replace("_", "-");
      const normalizedSearch = searchId.startsWith("ACC-") ? searchId : `ACC-2026-${searchId}`;

      const foundReport = reports.find(
        (r) =>
          r.id.toUpperCase() === normalizedSearch.toUpperCase() ||
          r.id.toUpperCase().includes(searchId) ||
          (r.complaintNumber && r.complaintNumber.toUpperCase().includes(searchId))
      );

      const foundIssue = issues.find(
        (i) =>
          i.id.toUpperCase() === normalizedSearch.toUpperCase() ||
          i.id.toUpperCase().includes(searchId) ||
          (i.reportId && i.reportId.toUpperCase().includes(searchId))
      );

      if (foundReport || foundIssue) {
        const id = foundReport?.id || foundIssue?.id;
        const buildingName = foundReport?.buildingName || foundIssue?.buildingName;
        const status = foundReport?.status || foundIssue?.status;
        const category = foundReport?.category || foundIssue?.category;

        let statusExplanation = "";
        let nextStep = "";

        switch (status) {
          case "SUBMITTED":
          case "UNDER_REVIEW":
            statusExplanation = "Your report has been received and is waiting in the certified auditor's initial intake queue.";
            nextStep = "Auditor physical assessment and building checklist review.";
            break;
          case "ACCEPTED":
            statusExplanation = "Certified auditor has accepted the complaint. A corrective work ticket is being dispatched.";
            nextStep = "Formal assignment to the facility engineering department.";
            break;
          case "ASSIGNED":
            statusExplanation = "Assigned to the responsible facility department with an active 30-day resolution deadline.";
            nextStep = "Department mobilization and start of civil repairs.";
            break;
          case "IN_PROGRESS":
            statusExplanation = "Remediation work is actively underway on-site.";
            nextStep = "Building manager uploads mandatory completion after-photo.";
            break;
          case "EVIDENCE_UPLOADED":
          case "VERIFICATION_PENDING":
            statusExplanation = "Work proof photo has been submitted by the facility department. AI preliminary screening passed.";
            nextStep = "Certified auditor on-site verification and sign-off.";
            break;
          case "REWORK_REQUIRED":
            statusExplanation = "The auditor inspected the work proof and found non-compliance. Corrective rework is required.";
            nextStep = "Facility team fixes remaining barriers and resubmits evidence.";
            break;
          case "VERIFIED":
          case "CLOSED":
          case "RESOLVED":
            statusExplanation = "Accessibility barrier successfully rectified and independently verified by a certified auditor.";
            nextStep = "Public building score updated (+4 points). Ticket closed.";
            break;
          case "OVERDUE":
          case "ESCALATED":
            statusExplanation = "Resolution deadline exceeded. Formal administrative escalation active.";
            nextStep = "Department head intervention or administrative enforcement.";
            break;
          default:
            statusExplanation = `Current state: ${status}.`;
            nextStep = "Auditor workflow progression.";
        }

        const reply = `Found Record: **${id}**\n\n• **Building:** ${buildingName}\n• **Category:** ${category}\n• **Current Status:** ${status}\n• **Summary:** ${statusExplanation}\n• **Next Action:** ${nextStep}`;

        addAssistantMessage(reply, [
          { label: `Open Timeline for ${id}`, href: `/citizen/reports/${id}` },
          { label: "Add Follow-up Photo/Note", href: `/citizen/reports/${id}` }
        ]);
        return;
      } else {
        const reply = `I searched for complaint ID **${query}** across our live database, but couldn't find a matching record. Please verify the ID format (e.g., ACC-2026-000123).`;
        addAssistantMessage(reply, [{ label: "View All My Reports", href: "/citizen/reports" }]);
        return;
      }
    }

    // Call Gemini 2.5 Flash via /api/ai/chat
    setIsThinking(true);
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: query,
        history: messages.slice(-6).map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: m.text }]
        }))
      })
    })
      .then((res) => res.json() as Promise<ChatResponse>)
      .then((data) => {
        setIsThinking(false);
        if (data?.reply) {
          addAssistantMessage(data.reply, [
            { label: "Report a Problem", href: "/report" },
            { label: "Track a Complaint", onClick: () => handleTrackPrompt() },
            { label: "Explore Buildings", href: "/buildings" }
          ]);
        } else {
          handleLocalFallback(lower);
        }
      })
      .catch(() => {
        setIsThinking(false);
        handleLocalFallback(lower);
      });
  };

  const handleLocalFallback = (lower: string) => {
    // 2. Status explanations
    if (lower.includes("verification pending") || lower.includes("what does verification pending mean")) {
      const reply =
        "**Verification Pending** means the building department has submitted proof of work and the auditor still needs to verify it.";
      addAssistantMessage(reply, [{ label: "Track a Complaint", onClick: () => handleTrackPrompt() }]);
      return;
    }

    if (lower.includes("rework required") || lower.includes("what is rework")) {
      const reply =
        "**Rework Required** occurs when a certified auditor reviews the submitted completion evidence and determines that the fix is incomplete or fails accessibility standards (such as a ramp without continuous handrails or non-compliant gradient). The facility department must rectify the deficiencies.";
      addAssistantMessage(reply);
      return;
    }

    if (lower.includes("overdue") || lower.includes("escalat")) {
      const reply =
        "**Overdue & Escalation**: When an assigned accessibility ticket exceeds its 30-day deadline without approved verification, it is flagged as OVERDUE. The system triggers administrative escalation:\n• Level 1: Responsible Facility Coordinator\n• Level 2: Department Head\n• Level 3: Municipal / Administrative Authority.";
      addAssistantMessage(reply, [{ label: "View Escalation Queue", href: "/admin/escalations" }]);
      return;
    }

    if (lower.includes("score") || lower.includes("accessibility score") || lower.includes("monitoring score")) {
      const reply =
        "**Accessibility Monitoring Score** (0–100):\n• **80–100:** Good accessibility compliance\n• **60–79:** Needs improvement\n• **Below 60:** Priority attention required\n\n*Important:* This is a community monitoring score, not a legal certification. Scores only increase when a certified auditor officially verifies a completed fix (+4 to +8 points per verified remediation).";
      addAssistantMessage(reply, [{ label: "Explore Building Directory", href: "/buildings" }]);
      return;
    }

    // 3. How to report / start report
    if (
      lower.includes("how to report") ||
      lower.includes("report a problem") ||
      lower.includes("start complaint") ||
      lower.includes("create report")
    ) {
      const reply =
        "Reporting an accessibility barrier takes under 1 minute:\n1. Open the Report form\n2. Select or search the building\n3. Choose barrier category (Ramp, Toilet, Lift, etc.)\n4. Take or upload a live photo (mandatory)\n5. Fetch GPS location or pick on map\n6. Verify mobile OTP and submit!";
      addAssistantMessage(reply, [
        { label: "Go to Report Form", href: "/report" },
        { label: "Report with Voice", href: "/report" }
      ]);
      return;
    }

    // 4. Follow-up explanation
    if (lower.includes("follow up") || lower.includes("add follow-up") || lower.includes("update complaint")) {
      const reply =
        "You can add progress notes and fresh photos to an existing complaint without filing a duplicate. Simply navigate to your complaint tracking page (`/citizen/reports/[id]`) and click **+ Add Follow-up**. All updates remain organized under your original Complaint ID.";
      addAssistantMessage(reply, [{ label: "View My Complaints", href: "/citizen/reports" }]);
      return;
    }

    // 5. Find building / locations
    if (lower.includes("building") || lower.includes("hospital") || lower.includes("college") || lower.includes("chennai")) {
      const matchedBuilding = buildings.find(
        (b) => lower.includes(b.name.toLowerCase()) || lower.includes(b.type.toLowerCase())
      );

      if (matchedBuilding) {
        const reply = `**${matchedBuilding.name}**\n• Address: ${matchedBuilding.address}, ${matchedBuilding.city}\n• Accessibility Score: **${matchedBuilding.score}/100**\n• Type: ${matchedBuilding.type} (${matchedBuilding.ownership})\n• Last Audit: ${matchedBuilding.lastAudit}`;
        addAssistantMessage(reply, [
          { label: `View ${matchedBuilding.name}`, href: `/buildings/${matchedBuilding.id}` },
          { label: "Report Problem Here", href: `/report` }
        ]);
        return;
      }

      const reply = `AccessTrack currently monitors 20 public and commercial facilities in Chennai, including Government General Hospital (72/100), Ripon Building (68/100), and Anna Nagar Government College (60/100).`;
      addAssistantMessage(reply, [{ label: "Browse All Buildings", href: "/buildings" }]);
      return;
    }

    // 6. Generic helpful response
    const reply =
      "I am here to guide you through AccessTrack. You can ask me:\n• *'What is the status of ACC-2026-000123?'*\n• *'What does verification pending mean?'*\n• *'How do I report a barrier?'*\n• *'Explain the accessibility score'*";
    addAssistantMessage(reply, [
      { label: "Report Problem", href: "/report" },
      { label: "Track My Complaint", onClick: () => handleTrackPrompt() },
      { label: "Building Directory", href: "/buildings" }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processQuery(input);
    }
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addAssistantMessage("Voice recognition is not supported by your browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event: BrowserSpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput(transcript);
          processQuery(transcript);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Access Assistant"
            className="group flex items-center gap-2.5 rounded-full bg-[#12382d] px-4 py-3 text-white shadow-2xl transition hover:scale-105 hover:bg-[#0b2820] focus:outline-hidden focus:ring-4 focus:ring-emerald-500/30"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <Bot size={20} className="text-emerald-300" />
            <span className="font-extrabold text-sm tracking-wide">Access Assistant</span>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <aside
          aria-label="Access Assistant Dialog"
          className="fixed bottom-4 right-4 z-50 flex h-[580px] w-[95vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-[#cfe0d6] bg-white shadow-[0_20px_60px_rgba(18,56,45,0.22)] animate-in fade-in slide-in-from-bottom-5 sm:right-6 sm:bottom-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1b4b3d] bg-[#12382d] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-emerald-300 shadow-inner">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-black text-base leading-tight">Access Assistant</h2>
                <p className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini 2.5 Flash Voice Agent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`rounded-lg p-2 transition ${
                  speechEnabled ? "bg-white/20 text-emerald-300" : "text-white/60 hover:text-white"
                }`}
                aria-label={speechEnabled ? "Disable speech output" : "Enable speech output"}
                title={speechEnabled ? "Voice Output: ON" : "Voice Output: OFF"}
              >
                {speechEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: "reset-1",
                      sender: "assistant",
                      text: "Chat history cleared. How may I help you today?",
                      actionButtons: [
                        { label: "Report a Problem", href: "/report" },
                        { label: "Track a Complaint", onClick: () => handleTrackPrompt() },
                        { label: "Find Buildings", href: "/buildings" }
                      ],
                      timestamp: "Just now"
                    }
                  ]);
                }}
                className="rounded-lg p-2 text-white/60 transition hover:text-white"
                aria-label="Reset conversation"
                title="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close Access Assistant"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="flex items-center justify-between border-b border-[#e5eee8] bg-[#f5faf7] px-4 py-2 text-[11px] font-bold text-[#446054]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0b5d45]" />
              Realtime Database Connected
            </span>
            <span>{reports.length} Reports Active</span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fbfdfc] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#0b5d45] text-white shadow-xs">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-[#12382d] text-white font-medium"
                      : "border border-[#d7e5de] bg-white text-[#1a2d24]"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#e8f0ec]">
                      {msg.actionButtons.map((btn, idx) =>
                        btn.href ? (
                          <Link
                            key={idx}
                            href={btn.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#f0f7f3] px-2.5 py-1.5 text-[11px] font-black text-[#0b5d45] border border-[#cbe0d5] transition hover:bg-[#0b5d45] hover:text-white"
                          >
                            {btn.label} <ChevronRight size={12} />
                          </Link>
                        ) : (
                          <button
                            key={idx}
                            type="button"
                            onClick={btn.onClick}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#f0f7f3] px-2.5 py-1.5 text-[11px] font-black text-[#0b5d45] border border-[#cbe0d5] transition hover:bg-[#0b5d45] hover:text-white"
                          >
                            {btn.label}
                          </button>
                        )
                      )}
                    </div>
                  )}

                  <div
                    className={`mt-1 text-[9px] ${
                      msg.sender === "user" ? "text-white/60 text-right" : "text-[#7a8c83]"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#e15f2a] text-white shadow-xs">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-2.5 justify-start animate-in fade-in">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#0b5d45] text-white shadow-xs">
                  <Bot size={15} />
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-[#f3faf6] p-3 text-xs text-[#0b5d45] flex items-center gap-2 shadow-2xs">
                  <Sparkles size={14} className="animate-spin text-[#e56532]" />
                  <span className="font-bold">Consulting Gemini 2.5 Flash…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-[#e2ece6] bg-white px-3 py-2 text-[10px]">
            {[
              "Track ACC-2026-000123",
              "What does verification pending mean?",
              "Explain accessibility score",
              "How to add follow-up?",
              "Find nearest hospital"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => processQuery(chip)}
                className="whitespace-nowrap rounded-full border border-[#cbdad1] bg-[#f5f9f6] px-2.5 py-1 font-bold text-[#2e473c] transition hover:border-[#0b5d45] hover:bg-[#0b5d45] hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input & Voice Bar */}
          <div className="border-t border-[#d8e5df] bg-white p-3">
            <div className="relative flex items-center gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening to your voice…" : "Ask about a complaint ID, status, or building…"}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-[#132820] placeholder-[#81948a] shadow-inner focus:outline-hidden focus:ring-2 ${
                  isListening
                    ? "border-red-400 bg-red-50 text-red-900 ring-red-300"
                    : "border-[#c4d6cc] bg-[#fbfdfc] focus:border-[#0b5d45] focus:ring-[#0b5d45]/20"
                }`}
              />

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "border border-[#c6d7cd] bg-white text-[#0b5d45] hover:bg-[#f0f6f3]"
                }`}
                aria-label={isListening ? "Stop listening" : "Voice input"}
                title={isListening ? "Click to stop listening" : "Speak to assistant"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="button"
                onClick={() => processQuery(input)}
                disabled={!input.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0b5d45] text-white shadow-xs transition hover:bg-[#084835] disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
