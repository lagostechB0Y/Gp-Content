import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from '../constants';

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface SummaryResult {
    title: string;
    summary: string;
    categories: string[];
}

export async function summarizeContent(articleText: string): Promise<SummaryResult> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are the Editor-in-Chief of "GoPolitical", a popular Nigerian political news outlet known for its accessible reporting.
Your task is to transform the provided source text into a compelling news report that is easy for everyone to understand.

**MANDATORY DIRECTIVES:**
1.  **Length & Depth:** Write a **FULL FEATURE ARTICLE of at least 700 words**. Expand on the facts with context and clear explanations.
2.  **Language & Tone:**
    -   **Language:** Use **Simple, Basic English**. The article must be easily understood by the average Nigerian on the street (mass market appeal). Avoid big grammar, complex jargon, or overly academic words.
    -   **Tone:** Professional and journalistic, but conversational, direct, and engaging.
    -   **Context:** Explain *why* the event matters in simple terms. Use relatable Nigerian political concepts (e.g., "grassroots", "stakeholders", "godfatherism") where appropriate, but keep the sentence structure simple.
3.  **Structure:**
    -   **Headline:** Catchy, clear, and punchy (Nigerian Newspaper style).
    -   **The Lead:** A straightforward opening paragraph that tells the reader exactly what happened and why it is important.
    -   **The Body:** Break down the details.
        -   Provide history/background in simple terms.
        -   Explain the roles of key parties (APC, PDP, LP, NNPP, etc.).
        -   Include quotes or reactions (paraphrased for clarity if necessary).
    -   **Conclusion:** A clear summary of what might happen next.
4.  **Brand Voice:** "GoPolitical" speaks to the people. Accurate, fair, but very easy to read.

**Output Format:**
Return a JSON object with three keys:
- "title": The headline.
- "summary": The full, 700+ word article text. (Format as plain text with double line breaks for paragraphs).
- "categories": An array of matching categories from the provided list.

Available Categories: ${CATEGORIES.join(', ')}

Source Text:\n${articleText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A compelling, clear Nigerian-newspaper style headline."
                        },
                        summary: {
                            type: Type.STRING,
                            description: "The full, 700+ word feature article in simple English."
                        },
                        categories: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of one to three relevant category names."
                        }
                    },
                    required: ["title", "summary", "categories"]
                }
            }
        });
        
        if (!response.text) {
            throw new Error("Received an empty response from the AI model.");
        }

        const jsonStr = response.text.trim();
        const result: SummaryResult = JSON.parse(jsonStr);

        // Filter out any categories suggested by the AI that are not in our master list
        const validCategories = result.categories.filter(cat => CATEGORIES.includes(cat));

        return { ...result, categories: validCategories };

    } catch (error) {
        console.error("Error generating article:", error);
        throw new Error("Could not generate article content from AI. Please check the console for details.");
    }
}

export async function regenerateHeadline(articleText: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Read the following text and generate a SINGLE, catchy, Nigerian-newspaper style headline. 
It should be punchy, engaging, and relevant to the average Nigerian citizen.
Do not use quotes around the output. Return ONLY the headline text.

Text:\n${articleText.substring(0, 5000)}`,
            config: {
                responseMimeType: "text/plain",
            }
        });

        if (!response.text) {
            throw new Error("Empty response for headline generation");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error regenerating headline:", error);
        throw error;
    }
}

export async function regenerateArticleBody(articleText: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are the Editor-in-Chief of "GoPolitical". Rewrite the following story into a **FULL FEATURE ARTICLE of at least 700 words**.
            
**Directives:**
- Use **Simple, Basic English** (mass market appeal).
- Tone: Conversational, direct, and engaging.
- Explain context and history simply.
- Format as plain text with double line breaks for paragraphs.
- Do not include a title in the output, just the body text.

Source Text:\n${articleText}`,
            config: {
                responseMimeType: "text/plain",
            }
        });

        if (!response.text) {
            throw new Error("Empty response for article generation");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error regenerating article body:", error);
        throw error;
    }
}