import { GoogleGenAI, Type } from "@google/genai";
import { fetchAndParseUrl } from "./contentFetcher";
import { ScannedArticle, ScanResults } from "../types";
import { CATEGORIES } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY is not configured");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function findArticleLinksWithAI(html: string, baseUrl: string): Promise<string[]> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following HTML document from the base URL: ${baseUrl}.
Your task is to act as a web scraper. Identify all the unique <a> tags that link to individual news articles hosted on the same domain.
- IGNORE links to category pages, author pages, ads, social media, privacy policies, or external sites.
- FOCUS on links whose path and text suggest they are distinct articles.
- Resolve all URLs to be absolute, using the base URL provided.
Return the result as a JSON array of strings. For example: ["https://example.com/article-1", "https://example.com/article-2"]

HTML:\n${html}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    if (!response.text) {
        throw new Error("AI link discovery returned an empty response.");
    }
    
    return JSON.parse(response.text.trim());
}

async function findArticleLinksWithDOM(html: string, baseUrl: string): Promise<string[]> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = new Set<string>();
    const base = new URL(baseUrl);

    doc.querySelectorAll('a[href]').forEach(a => {
        try {
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const absoluteUrl = new URL(href, base.href).href;
            if (new URL(absoluteUrl).hostname !== base.hostname) return;

            const path = new URL(absoluteUrl).pathname.toLowerCase();
            const text = (a as HTMLElement).textContent?.trim() || '';

            const excludedPaths = ['/author', '/category', '/tag', '/topics', '/about', '/contact', '/privacy', '/terms'];
            if (path === '/' || excludedPaths.some(ex => path.startsWith(ex)) || path.match(/\.(jpg|jpeg|png|gif|pdf|zip|mp3|mp4)$/)) {
                return;
            }

            const pathSegments = path.split('/').filter(Boolean);
            if (text.split(/\s+/).length > 3 && pathSegments.length >= 2) {
                links.add(absoluteUrl);
            }
        } catch (e) { /* Ignore invalid URLs */ }
    });
    return Array.from(links);
}

async function findArticleLinks(sourceUrl: string, setProgress: (msg: string) => void): Promise<string[]> {
    setProgress(`Fetching links from ${new URL(sourceUrl).hostname}...`);
    const html = await fetchAndParseUrl(sourceUrl); // Fetches the raw HTML of the source page

    try {
        setProgress(`Using AI to find article links...`);
        const aiLinks = await findArticleLinksWithAI(html, sourceUrl);
        if (aiLinks && aiLinks.length > 0) {
            return aiLinks;
        }
        throw new Error("AI found no links, trying fallback.");
    } catch (error) {
        console.warn("AI link discovery failed:", error, "Falling back to standard discovery.");
        setProgress("AI discovery failed. Falling back to standard link discovery...");
        return await findArticleLinksWithDOM(html, sourceUrl);
    }
}

async function analyzeArticle(url: string, content: string): Promise<Omit<ScannedArticle, 'source'>> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following news article for a Nigerian political news website. The text may be messy, focus on the core article content.
1.  Read the article and determine if its main subject is Nigerian politics, governance, elections, policy, or civic matters.
2.  If it IS politically relevant, you MUST choose the most fitting category from this list: ${CATEGORIES.join(', ')}.
3.  If the article is NOT politically relevant (e.g., sports, entertainment, listicles), you MUST return the category as "Non-Political".
4.  Provide a compelling, factual, SEO-friendly headline.
5.  Write a very short, one-sentence summary of the core event for deduplication.

You MUST format the output as a JSON object with keys: "category", "headline", and "fingerprint".

Article:\n${content}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: `The category. Must be one of: ${CATEGORIES.join(', ')} or "Non-Political"` },
                    headline: { type: Type.STRING },
                    fingerprint: { type: Type.STRING }
                },
                required: ["category", "headline", "fingerprint"]
            }
        }
    });

    if (!response.text) {
        throw new Error("AI analysis returned an empty response.");
    }
    const result = JSON.parse(response.text.trim());
    const finalCategory = CATEGORIES.includes(result.category) ? result.category : "Non-Political";

    return { url, headline: result.headline, category: finalCategory, fingerprint: result.fingerprint };
}

export async function scanNewsSources(
    sources: string[],
    setProgress: (msg: string) => void
): Promise<ScanResults> {
    const BATCH_SIZE = 5;
    const processedUrlsKey = 'gopoliticalProcessedUrls';
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    let processedDb: { [url: string]: number } = JSON.parse(localStorage.getItem(processedUrlsKey) || '{}');
    const now = Date.now();
    Object.keys(processedDb).forEach(url => {
        if (now - processedDb[url] > TWENTY_FOUR_HOURS) {
            delete processedDb[url];
        }
    });

    let allLinks: string[] = [];
    for (const source of sources) {
        try {
            const links = await findArticleLinks(source, setProgress);
            allLinks.push(...links);
        } catch (error) {
            console.warn(`Could not find any links from ${source}:`, error);
        }
    }
    const uniqueLinks = [...new Set(allLinks)];
    const newLinks = uniqueLinks.filter(link => !processedDb[link]);

    setProgress(`Found ${newLinks.length} new potential articles. Analyzing in batches...`);

    const analyzedArticles: ScannedArticle[] = [];
    for (let i = 0; i < newLinks.length; i += BATCH_SIZE) {
        const batch = newLinks.slice(i, i + BATCH_SIZE);
        setProgress(`Analyzing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(newLinks.length / BATCH_SIZE)} (${batch.length} articles)...`);

        const batchPromises = batch.map(async (link) => {
            try {
                const content = await fetchAndParseUrl(link);
                if (content.length < 200) return null;
                const analysis = await analyzeArticle(link, content);
                processedDb[link] = now;
                return { ...analysis, source: new URL(link).hostname.replace('www.', '') };
            } catch (error) {
                console.warn(`Failed to process ${link}:`, error);
                processedDb[link] = now;
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);
        analyzedArticles.push(...batchResults.filter((result): result is ScannedArticle => result !== null));
    }
    
    const politicallyRelevantArticles = analyzedArticles.filter(article => article.category !== "Non-Political");

    setProgress(`Deduplicating ${politicallyRelevantArticles.length} relevant articles...`);
    const uniqueArticles: ScannedArticle[] = [];
    const seenFingerprints = new Set<string>();

    for (const article of politicallyRelevantArticles) {
        if (article.fingerprint && !seenFingerprints.has(article.fingerprint)) {
            uniqueArticles.push(article);
            seenFingerprints.add(article.fingerprint);
        }
    }

    localStorage.setItem(processedUrlsKey, JSON.stringify(processedDb));
    
    return { timestamp: now, articles: uniqueArticles };
}