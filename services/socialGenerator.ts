import { GoogleGenAI, Type } from "@google/genai";
import { SocialPack } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateSocialPack(articleText: string, headline: string): Promise<SocialPack> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are the Social Media Manager for "GoPolitical", a viral Nigerian political news outlet.
Your goal is to repurpose a news article into high-engagement content for three specific platforms.

**Input Article:**
Headline: ${headline}
Text: ${articleText.substring(0, 6000)}

**Task:**
Generate a JSON object containing content for Twitter/X, WhatsApp, Instagram/Facebook, and a Viral Graphic Card.

**1. Twitter/X Thread (Array of Strings):**
-   Create a thread of 5-7 tweets.
-   **Tweet 1:** Must be a "Killer Hook". Provocative, questioning, or breaking news style. NO hashtags in the first tweet.
-   **Middle Tweets:** Summarize the key facts punchily. One fact per tweet.
-   **Last Tweet:** A call to action (e.g., "Read full story on site") and relevant hashtags (e.g., #NigeriaPolitics #GoPolitical).
-   Tone: Witty, sharp, "Nigerian Twitter" vibe (relatable but smart).

**2. WhatsApp Broadcast (String):**
-   Format: "🚨 BREAKING NEWS: [Headline]"
-   Body: Short, bullet points, heavy use of Emojis.
-   Tone: Urgent, "Forwarded many times" energy.
-   Closing: "👉 Follow GoPolitical for more."

**3. Instagram/Facebook Caption (String):**
-   Start with an engaging question to the audience (e.g., "Do you agree that...?").
-   Brief summary of the story.
-   Block of 10 relevant hashtags mixed with Nigerian trending tags.

**4. Viral Hook (String):**
-   A single, powerful, provocative sentence or quote (max 30 words).
-   This will be placed on a graphic image card.
-   It must be standalone and shocking or highly informative.
-   Do NOT include hashtags or emojis here. Just the text.

**Output Schema:**
Return a JSON object with keys: "twitter", "whatsapp", "instagram", "viral_hook".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        twitter: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A thread of 5-7 tweets."
                        },
                        whatsapp: {
                            type: Type.STRING,
                            description: "A viral WhatsApp broadcast message."
                        },
                        instagram: {
                            type: Type.STRING,
                            description: "An engaging Instagram/Facebook caption."
                        },
                        viral_hook: {
                            type: Type.STRING,
                            description: "A short, powerful text for a viral image card."
                        }
                    },
                    required: ["twitter", "whatsapp", "instagram", "viral_hook"]
                }
            }
        });

        if (!response.text) {
            throw new Error("AI returned empty response for social pack.");
        }

        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error("Error generating social pack:", error);
        throw new Error("Failed to generate social media content.");
    }
}