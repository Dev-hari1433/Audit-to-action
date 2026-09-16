import { NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  history?: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
}

const SYSTEM_PROMPT = `You are Access Assistant, the official voice and AI intelligence of AccessTrack — India's accessibility accountability platform for public and private buildings (starting with Chennai).
You speak naturally, warmly, and concisely, suitable for both text chat and real-time voice speech output (like Gemini Voice in the Gemini app).

Key Knowledge & Principles:
1. AccessTrack Workflow:
   Citizen reports barrier with mandatory photo and OTP -> Certified Auditor reviews and checks building -> Auditor assigns responsible department with deadline -> Department performs civil work and uploads completion after-photos -> AI performs preliminary before/after comparison and scores progress (30%, 70%, 100%) -> Certified Auditor physically verifies on-site and approves -> Building accessibility score updates dynamically for all citizens.
2. Authority & Strict Rule:
   AI assists with preliminary screening and progress scoring, but AI NEVER determines legal compliance or closes tickets. ONLY certified human auditors can verify and close tickets.
3. Scoring Guide:
   Public monitoring scores range from 0 to 100.
   - 80–100: Good accessibility compliance
   - 60–79: Needs improvement
   - Below 60: Priority attention required
   Scores increase when a certified auditor verifies a completed fix (+4 to +8 points per verified remediation).
4. Standards:
   Harmonized Guidelines 2021, Rights of Persons with Disabilities (RPwD) Act 2016, and National Building Code of India (NBC 2016). Ramp slope must not exceed 1:12, continuous handrails on both sides at 750mm and 900mm height, tactile landing warning pavers, minimum doorway clearance 900mm.
5. Tone:
   Keep answers concise (2-4 sentences or short bullet points), helpful, and direct. Avoid overwhelming prose so voice readout is crisp and pleasant.`;

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message = "", history = [] } = body;

    if (!message.trim()) {
      return NextResponse.json({ success: false, error: "Empty message" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const contents = [
          { role: "user", parts: [{ text: `[System Instruction: ${SYSTEM_PROMPT}]` }] },
          { role: "model", parts: [{ text: "Understood. I am Access Assistant, ready to help citizens, auditors, and building managers with accessibility accountability in India." }] },
          ...history.slice(-6),
          { role: "user", parts: [{ text: message }] }
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600
              }
            })
          }
        );
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = (await geminiRes.json()) as any;
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({
              success: true,
              reply: reply.trim(),
              provider: "gemini-2.5-flash"
            });
          }
        }
      } catch (geminiError) {
        console.error("Gemini Chat API call failed, falling back to local domain:", geminiError);
      }
    }

    // Intelligent domain fallback
    const lower = message.toLowerCase();
    let fallbackReply = "AccessTrack helps citizens report barriers, lets auditors assign corrective actions, and tracks verified civil repairs until resolution.";

    if (lower.includes("report") || lower.includes("complaint")) {
      fallbackReply = "To report an accessibility barrier, go to the Report Problem tab. You can take a live camera photo, capture GPS coordinates, verify your phone number, and submit in under 1 minute.";
    } else if (lower.includes("score") || lower.includes("rating")) {
      fallbackReply = "The Building Accessibility Score (0–100) measures universal access compliance under NBC 2016. Scores only increase when a certified human auditor verifies completed repairs.";
    } else if (lower.includes("auditor") || lower.includes("verify")) {
      fallbackReply = "Certified auditors inspect buildings, assign deadlines to facility departments, and physically verify proof of work. AI assists with preliminary checks, but only auditors can close tickets.";
    } else if (lower.includes("ramp") || lower.includes("toilet") || lower.includes("lift")) {
      fallbackReply = "National Building Code 2016 specifies maximum 1:12 slope for wheelchair ramps with continuous dual handrails at 750mm and 900mm height, tactile landing tiles, and 900mm clear doorways.";
    }

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      provider: "demo-ai"
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
