import { NextResponse } from "next/server";

interface ExtractVoiceRequest {
  transcript: string;
  language?: string;
}

interface GeminiTextResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

const chennaiBuildings = [
  { id: "bld-01", name: "Government General Hospital", keywords: ["hospital", "general hospital", "gh", "மருத்துவமனை", "अस्पताल", "ఆసుపత్రి"] },
  { id: "bld-02", name: "Anna Nagar Government College", keywords: ["anna nagar", "college", "கல்லூரி", "कॉलेज", "కళాశాల"] },
  { id: "bld-03", name: "Teynampet Corporation Office", keywords: ["teynampet", "corporation office", "வளாகம்", "कार्यालय"] },
  { id: "bld-04", name: "Marina Public Library", keywords: ["library", "marina", "நூலகம்", "पुस्तकालय"] },
  { id: "bld-05", name: "Mylapore Higher Secondary School", keywords: ["school", "mylapore", "பள்ளி", "स्कूल"] },
  { id: "bld-06", name: "South Chennai District Office", keywords: ["district office", "south chennai", "collectorate"] },
  { id: "bld-07", name: "Perambur Community Health Centre", keywords: ["perambur", "health centre", "clinic"] },
  { id: "bld-08", name: "Velachery Citizen Service Centre", keywords: ["velachery", "service centre", "seva kendra"] },
  { id: "bld-09", name: "Royapettah Arts College", keywords: ["royapettah", "arts college"] },
  { id: "bld-10", name: "Guindy Industrial Training Institute", keywords: ["guindy", "iti", "training"] }
];

export async function POST(request: Request) {
  try {
    let body: Partial<ExtractVoiceRequest> = {};
    try {
      body = (await request.json()) as ExtractVoiceRequest;
    } catch {
      body = {};
    }
    const { transcript = "", language = "en-IN" } = body;

    if (!transcript.trim()) {
      return NextResponse.json({ success: false, error: "Empty speech transcript" }, { status: 400 });
    }

    // Optional Google Gemini Multilingual NLP Extraction
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const facilityList = chennaiBuildings.map((b) => `- ${b.name} (ID: ${b.id})`).join("\n");
        const prompt = `You are AccessTrack's multilingual voice reporting parser for India.
The citizen spoke in ${language}: "${transcript}".
Extract the facility, barrier category, exact location, and concise problem summary.
Monitored Chennai Facilities:
${facilityList}

Allowed Problem Types:
- Wheelchair Ramp (category: RAMP)
- Accessible Toilet (category: TOILETS)
- Lift (category: LIFT)
- Parking (category: PARKING)
- Entrance (category: ENTRANCE)
- Handrail (category: HANDRAIL)
- Tactile Path (category: PATHWAY)
- Signage (category: SIGNAGE)
- Door / Corridor (category: ENTRANCE)
- Other (category: OTHER)

Format output strictly as valid JSON:
{
  "buildingName": string,
  "buildingId": string,
  "problemType": string,
  "category": string,
  "location": string,
  "problemSummary": string
}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: "application/json"
              }
            })
          }
        );
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = (await geminiRes.json()) as GeminiTextResponse;
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const matchedBld = chennaiBuildings.find((b) => b.id === parsed.buildingId) || chennaiBuildings[0];

            return NextResponse.json({
              success: true,
              provider: "gemini-2.5-flash",
              extracted: {
                citizenName: "Citizen Reporter",
                building: parsed.buildingName || matchedBld.name,
                buildingId: parsed.buildingId || matchedBld.id,
                problem: parsed.problemSummary || "Accessibility barrier reported via voice",
                problemType: parsed.problemType || "Wheelchair Ramp",
                category: parsed.category || "RAMP",
                location: parsed.location || "Main entrance",
                description: transcript.trim()
              },
              confirmationMessage: `I understood:\n• Building: ${parsed.buildingName || matchedBld.name}\n• Problem: ${parsed.problemSummary}\n• Location: ${parsed.location || "Main entrance"}\n• Type: ${parsed.problemType || "Wheelchair Ramp"}\n\nDo you want to submit this complaint?`,
              language
            });
          }
        }
      } catch {
        // Fall back gracefully to keyword matching
      }
    }

    const lower = transcript.toLowerCase();

    // Match building
    let matchedBuilding = chennaiBuildings[0]; // Default to Government General Hospital
    for (const bld of chennaiBuildings) {
      if (bld.keywords.some((k) => lower.includes(k.toLowerCase()) || transcript.includes(k))) {
        matchedBuilding = bld;
        break;
      }
    }

    // Match problem type
    let problemType: string = "Wheelchair Ramp";
    let category: string = "RAMP";
    let problemSummary = "No wheelchair ramp at entrance";

    if (lower.includes("toilet") || lower.includes("washroom") || lower.includes("restroom") || lower.includes("கழிப்பறை") || lower.includes("शौचालय")) {
      problemType = "Accessible Toilet";
      category = "TOILETS";
      problemSummary = "Accessible toilet inaccessible or locked";
    } else if (lower.includes("lift") || lower.includes("elevator") || lower.includes("மின் தூக்கி") || lower.includes("लिफ्ट")) {
      problemType = "Lift";
      category = "LIFT";
      problemSummary = "Elevator out of order or buttons inaccessible";
    } else if (lower.includes("park") || lower.includes("parking") || lower.includes("வாகனம்") || lower.includes("पार्किंग")) {
      problemType = "Parking";
      category = "PARKING";
      problemSummary = "Accessible parking bay blocked or unmarked";
    } else if (lower.includes("handrail") || lower.includes("rail") || lower.includes("கைப்பிடி") || lower.includes("रेलिंग")) {
      problemType = "Handrail";
      category = "HANDRAIL";
      problemSummary = "Handrail missing on stairs or slope";
    } else if (lower.includes("tactile") || lower.includes("path") || lower.includes("blind") || lower.includes("பாதை")) {
      problemType = "Tactile Path";
      category = "PATHWAY";
      problemSummary = "Tactile pathway damaged or obstructed";
    } else if (lower.includes("sign") || lower.includes("braille") || lower.includes("board") || lower.includes("பெயர் பலகை")) {
      problemType = "Signage";
      category = "SIGNAGE";
      problemSummary = "Wayfinding signage missing accessible contrast or Braille";
    } else if (lower.includes("door") || lower.includes("entrance") || lower.includes("gate") || lower.includes("நுழைவு")) {
      problemType = "Entrance";
      category = "ENTRANCE";
      problemSummary = "Entrance threshold step or narrow door width";
    } else if (lower.includes("ramp") || lower.includes("steps") || lower.includes("wheelchair") || lower.includes("சாய்வுப் பாதை") || lower.includes("रैंप")) {
      problemType = "Wheelchair Ramp";
      category = "RAMP";
      problemSummary = "No wheelchair ramp at main entrance";
    } else {
      problemType = "Other";
      category = "OTHER";
      problemSummary = "Accessibility barrier identified in transit path";
    }

    // Match location
    let location = "Main entrance";
    if (lower.includes("east gate") || lower.includes("கிழக்கு")) {
      location = "Main entrance, East Gate";
    } else if (lower.includes("west gate") || lower.includes("மேற்கு")) {
      location = "West Gate entrance";
    } else if (lower.includes("ground floor") || lower.includes("தரைத்தளம்")) {
      location = "Ground floor corridor";
    } else if (lower.includes("reception") || lower.includes("வரவேற்பு")) {
      location = "Main Reception lobby";
    } else if (lower.includes("block b") || lower.includes("block a")) {
      location = "Block B entrance";
    } else if (lower.includes("parking area")) {
      location = "Visitor parking area";
    }

    const confirmationMessage = `I understood:\n• Building: ${matchedBuilding.name}\n• Problem: ${problemSummary}\n• Location: ${location}\n• Type: ${problemType}\n\nSubmit this report?`;

    return NextResponse.json({
      success: true,
      extracted: {
        citizenName: "Citizen Reporter",
        building: matchedBuilding.name,
        buildingId: matchedBuilding.id,
        problem: problemSummary,
        problemType,
        category,
        location,
        description: transcript.trim()
      },
      confirmationMessage,
      language
    });
  } catch (_err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to extract context from voice transcript"
      },
      { status: 500 }
    );
  }
}
