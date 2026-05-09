import { GoogleGenAI, Type } from "@google/genai";
import { Category, Verdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateVeoVideo(myth: string, officialName: string, knockoutPunch: string) {
  // Create a new instance with the user's selected API key (or fallback)
  const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
  const userAi = new GoogleGenAI({ apiKey });

  const prompt = `Create a cinematic, gritty 9:16 vertical video for social media (TikTok/Instagram Reels).
  The background is a dark, smoke-filled boxing ring.
  Stage 1: The text "${myth}" is hanging in the air like a target.
  Stage 2: A giant boxing glove slams into the text in slow-motion, causing it to shatter into pixels.
  Stage 3: Out of the explosion, the gold-glowing text "${officialName}" appears.
  Stage 4: Finally, show the knockout punch text: "${knockoutPunch}".
  Style: Dynamic camera movements, high contrast lighting, urban boxing gym aesthetic.`;

  try {
    let operation = await userAi.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await userAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed - no URI returned.");

    // Fetch the video with the API key in headers
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch generated video.");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Video Error:", error);
    throw error;
  }
}

export async function getRefereeVerdict(myth: string) {
  const prompt = `You are the UBUNK HEAD REFEREE. 
A user has submitted this claim: "${myth}"

TASK:
1. Determine if this claim is a common myth (BUNK), a proven fact (TRUTH), complete nonsense (NONSENSE), or dangerous misinformation (DANGEROUS).
2. Rate the "Impact" from 1-10.
3. Provide a boxing-style verdict.

OUTPUT FORMAT (JSON):
{
  "category": "LEGIT_MYTH" | "NONSENSE" | "DANGEROUS" | "WEIRD_FACT",
  "verdict": "BUNK" | "TRUTH" | "DISQUALIFIED",
  "official_name": "punchy name",
  "referee_commentary": "boxing style comment",
  "tale_of_the_tape": ["point 1", "point 2", "point 3"],
  "knockout_punch": "one sentence closer",
  "reliability_score": 1-100,
  "rp_adjustment": integer
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are the UBUNK HEAD REFEREE. Use boxing jargon. Be aggressive but scientifically accurate. Output JSON.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            verdict: { type: Type.STRING },
            official_name: { type: Type.STRING },
            referee_commentary: { type: Type.STRING },
            tale_of_the_tape: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            knockout_punch: { type: Type.STRING },
            reliability_score: { type: Type.NUMBER },
            rp_adjustment: { type: Type.INTEGER }
          },
          required: ["category", "verdict", "official_name", "referee_commentary", "tale_of_the_tape", "knockout_punch", "reliability_score", "rp_adjustment"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result as {
      category: Category;
      verdict: Verdict;
      official_name: string;
      referee_commentary: string;
      tale_of_the_tape: string[];
      knockout_punch: string;
      reliability_score: number;
      rp_adjustment: number;
    };
  } catch (error) {
    console.error("Referee AI Error:", error);
    throw new Error("The Ref was knocked out. Try again!");
  }
}
