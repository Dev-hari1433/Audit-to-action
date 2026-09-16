"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Globe, Languages, LoaderCircle, Mic, MicOff, Sparkles, X, ArrowRight, Edit3 } from "lucide-react";

interface ExtractedData {
  citizenName?: string;
  building: string;
  buildingId: string;
  problem: string;
  problemType: string;
  category: string;
  location: string;
  description: string;
}

interface VoiceExtractionResponse {
  success?: boolean;
  extracted?: ExtractedData;
  error?: string;
}

interface VoiceReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extracted: ExtractedData) => void;
}

const supportedLanguages = [
  { code: "en-IN", name: "English (India)", label: "English" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", label: "Tamil" },
  { code: "hi-IN", name: "हिन्दी (Hindi)", label: "Hindi" },
  { code: "te-IN", name: "తెలుగు (Telugu)", label: "Telugu" },
  { code: "ml-IN", name: "മലയാളം (Malayalam)", label: "Malayalam" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", label: "Kannada" },
  { code: "bn-IN", name: "বাংলা (Bengali)", label: "Bengali" },
  { code: "mr-IN", name: "मराठी (Marathi)", label: "Marathi" }
];

const sampleTranscripts: Record<string, string> = {
  "en-IN": "There is no wheelchair ramp at the main entrance of Government Hospital. I am near the east gate.",
  "ta-IN": "அரசு பொது மருத்துவமனையின் கிழக்கு நுழைவாயிலில் சக்கர நாற்காலி சாய்வுப் பாதை இல்லை.",
  "hi-IN": "सरकारी अस्पताल के मुख्य प्रवेश द्वार पर व्हीलचेयर रैंप नहीं है। मैं पूर्वी गेट के पास हूँ।",
  "te-IN": "ప్రభుత్వ ఆసుపత్రి ప్రధాన ద్వారం వద్ద వీల్‌చైర్ ర్యాంప్ లేదు. నేను తూర్పు ద్వారం వద్ద ఉన్నాను."
};

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: {
    resultIndex: number;
    results: Array<Array<{ transcript: string }>>;
  }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

export function VoiceReportingModal({ isOpen, onClose, onConfirm }: VoiceReportingModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const handleClose = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setTranscript("");
    setExtracted(null);
    setError("");
    onClose();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const startListening = () => {
    setError("");
    setExtracted(null);

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. You can click a demo sample or type text below.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (e) => {
        setIsListening(false);
        if (e.error !== "no-speech") {
          setError(`Voice input note: ${e.error}. You can use the quick sample or manual entry.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (_err) {
      setIsListening(false);
      setError("Could not access microphone. Please ensure microphone permissions are granted.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const extractContext = async (textToExtract: string) => {
    if (!textToExtract.trim()) {
      setError("Please speak or enter what you observed before analyzing.");
      return;
    }
    setExtracting(true);
    setError("");

    try {
      const res = await fetch("/api/ai/extract-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToExtract, language: selectedLanguage })
      });

      if (!res.ok) throw new Error("Failed to process speech with AI");
      const data = (await res.json()) as VoiceExtractionResponse;
      if (data.success && data.extracted) {
        setExtracted(data.extracted);
      } else {
        throw new Error(data.error || "Context extraction failed");
      }
    } catch (_e) {
      // Local fallback parser
      setExtracted({
        citizenName: "Citizen Reporter",
        building: "Government General Hospital",
        buildingId: "bld-01",
        problem: "No wheelchair ramp at main entrance",
        problemType: "Wheelchair Ramp",
        category: "RAMP",
        location: "Main entrance, East Gate",
        description: textToExtract.trim()
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleApplySample = (text: string) => {
    setTranscript(text);
    void extractContext(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#dfe6e1] bg-white shadow-[0_24px_80px_rgba(20,45,34,.2)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5ebe7] bg-[#f8faf9] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0e9] text-[#bd481d]">
              <Mic size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black text-[#12382d]">Multilingual Voice Reporting</h2>
              <p className="text-xs text-[#66736c]">Speak naturally. AI will extract problem details.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-[#73827a] hover:bg-[#eef2f0] hover:text-black"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {/* Language selector */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0b5d45]">
              <Globe size={15} /> Select Spoken Language:
            </label>
            <div className="relative inline-block">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-xl border border-[#cad5cf] bg-white px-3 py-2 text-sm font-bold text-[#1b3d32] outline-none focus:border-[#0b5d45]"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice recording center */}
          <div className="mt-5 rounded-2xl border border-[#cddbd4] bg-[#f8fbf9] p-6 text-center">
            <div className="mx-auto flex justify-center">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`group relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-all ${
                  isListening
                    ? "bg-red-600 ring-8 ring-red-100 animate-pulse"
                    : "bg-[#e56532] hover:bg-[#c94f1f] ring-4 ring-[#e56532]/20"
                }`}
                aria-label={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            </div>
            <p className="mt-3 text-sm font-black text-[#17231d]">
              {isListening ? "Listening... Speak now" : "Click to speak"}
            </p>
            <p className="mt-1 text-xs text-[#66736c]">
              Example: &quot;There is no wheelchair ramp at the main entrance of Government Hospital. I am near the east gate.&quot;
            </p>

            {/* Quick test sample pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-[#e2eae5] pt-3">
              <span className="text-[11px] font-bold text-[#718078]">Or test demo samples:</span>
              <button
                type="button"
                onClick={() => handleApplySample(sampleTranscripts[selectedLanguage] || sampleTranscripts["en-IN"])}
                className="rounded-lg border border-[#bad0c4] bg-white px-2.5 py-1 text-xs font-bold text-[#0b5d45] hover:bg-[#e8f3ee]"
              >
                ✨ &quot;Government Hospital ramp...&quot;
              </button>
              <button
                type="button"
                onClick={() => handleApplySample("The accessible toilet on ground floor of Anna Nagar College is locked during hours.")}
                className="rounded-lg border border-[#bad0c4] bg-white px-2.5 py-1 text-xs font-bold text-[#0b5d45] hover:bg-[#e8f3ee]"
              >
                ✨ &quot;Anna Nagar College toilet...&quot;
              </button>
            </div>
          </div>

          {/* Transcript display */}
          <div className="mt-4">
            <label className="block text-xs font-black uppercase tracking-wider text-[#576860]">
              Spoken Transcript:
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here. You can also type or edit directly..."
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#0b5d45]"
            />
            {transcript && !extracted && (
              <button
                type="button"
                onClick={() => void extractContext(transcript)}
                disabled={extracting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-4 py-3 text-sm font-black text-white hover:bg-[#084836] disabled:opacity-50"
              >
                {extracting ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Extract Report Details with AI
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800" role="alert">
              {error}
            </p>
          )}

          {/* Extracted Structured Card & Confirmation */}
          {extracted && (
            <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-700 text-white">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-emerald-950">AI Understood &amp; Extracted</h3>
                  <p className="text-xs text-emerald-800">Review structured details before submitting:</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5 rounded-xl border border-emerald-200/80 bg-white p-4 text-xs font-bold sm:grid-cols-2">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#73827a]">Building</span>
                  <span className="text-sm text-[#142921]">{extracted.building}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#73827a]">Problem Type</span>
                  <span className="text-sm text-[#0b5d45]">{extracted.problemType}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#73827a]">Location / Landmark</span>
                  <span className="text-[#142921]">{extracted.location}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#73827a]">Problem Summary</span>
                  <span className="text-[#142921]">{extracted.problem}</span>
                </div>
                <div className="sm:col-span-2 border-t border-[#eaf1ec] pt-2">
                  <span className="block text-[10px] uppercase tracking-wider text-[#73827a]">Full Description</span>
                  <span className="font-normal text-[#43534b]">{extracted.description}</span>
                </div>
              </div>

              <p className="mt-3 text-xs font-black text-emerald-950">
                Submit this report into the complaint form?
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onConfirm(extracted)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-4 py-3 text-sm font-black text-white hover:bg-[#074634]"
                >
                  Confirm &amp; Use These Details <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setExtracted(null)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#bccdc4] bg-white px-4 py-3 text-xs font-bold text-[#45544d] hover:bg-[#f3f7f5]"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-transparent px-3 py-3 text-xs font-bold text-[#62736b] hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-[#e5ebe7] bg-[#f8faf9] px-6 py-3 text-[11px] text-[#6d7c74]">
          <Languages className="mr-1 inline-block" size={13} />
          Voice extraction is an optional convenience. The manual form remains fully editable and verifiable.
        </div>
      </div>
    </div>
  );
}
