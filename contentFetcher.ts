// This service uses public CORS proxies to fetch content. A fallback list is used for reliability.
// NOTE: For production applications, running your own CORS proxy is highly recommended.
const CORS_PROXIES = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://cors.eu.org/${url}`,
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
];

/**
 * Common selectors for the main article content.
 */
const CONTENT_SELECTORS = [
    'article .entry-content',
    '.entry-content',
    'article',
    '[role="article"]',
    '.post-content',
    '.article-body',
    '.story-content',
    '[role="main"]',
    'main',
    '#main',
    '#content',
];

/**
 * Selectors for elements to be removed (ads, navigation, etc.).
 */
const UNWANTED_SELECTORS = [
    'script',
    'style',
    'nav',
    'footer',
    'header',
    'aside',
    '.ad',
    '.ads',
    '.advert',
    '.advertisement',
    '[class*="ad-"]',
    '.social-share',
    '.related-posts',
    '.comments',
    '#comments',
];

/**
 * Fetches HTML from a URL, cleans it, and extracts text content using a multi-stage process.
 * @param url The URL of the article to fetch.
 * @returns A promise that resolves to the extracted text content.
 */
export async function fetchAndParseUrl(url: string): Promise<string> {
    let lastError: Error | null = null;

    for (const buildProxyUrl of CORS_PROXIES) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

        try {
            const proxyUrl = buildProxyUrl(url);
            const response = await fetch(proxyUrl, { 
                signal: controller.signal,
                headers: { 'X-Requested-With': 'XMLHttpRequest' } 
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }

            const html = await response.text();
            if (!html) {
                 throw new Error("Received empty HTML content.");
            }
            
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Attempt 1: Find a specific content element and clean it
            for (const selector of CONTENT_SELECTORS) {
                const mainContentElement = doc.querySelector(selector) as HTMLElement;
                if (mainContentElement) {
                    const contentClone = mainContentElement.cloneNode(true) as HTMLElement;
                    UNWANTED_SELECTORS.forEach(s => contentClone.querySelectorAll(s).forEach(el => el.remove()));
                    const cleanedText = contentClone.textContent?.replace(/\s\s+/g, ' ').trim();
                    if (cleanedText && cleanedText.length > 100) {
                        return cleanedText; // Success
                    }
                }
            }

            // Attempt 2 (Fallback): Use the whole body, but still try to clean it
            const bodyClone = doc.body.cloneNode(true) as HTMLElement;
            UNWANTED_SELECTORS.forEach(s => bodyClone.querySelectorAll(s).forEach(el => el.remove()));
            let bodyText = bodyClone.textContent?.replace(/\s\s+/g, ' ').trim();
            if (bodyText && bodyText.length > 100) {
                return bodyText; // Success
            }

            // Attempt 3 (Desperation Mode): Use the whole body, uncleaned.
            bodyText = doc.body.textContent?.replace(/\s\s+/g, ' ').trim();
            if (bodyText && bodyText.length > 100) {
                return bodyText; // Success
            }

            // If all parsing attempts for this proxy fail, set error and try next proxy
            throw new Error("Could not find any text content on the page.");

        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`Fetch attempt failed for a proxy:`, error);
            if (error instanceof DOMException && error.name === 'AbortError') {
                 lastError = new Error("Request timed out.");
            } else {
                 lastError = error instanceof Error ? error : new Error(String(error));
            }
        }
    }

    // If all proxies have failed, throw a more informative error.
    let reason = "an unknown error occurred.";
    if (lastError) {
        const errorMessage = lastError.message.toLowerCase();
        if (errorMessage.includes('failed to fetch')) {
            reason = "the request was blocked, the website is offline, or a public proxy is unavailable. Please try another article.";
        } else if (errorMessage.includes('timed out')) {
            reason = "the request timed out because the website is slow to respond. Please try again later.";
        } else {
            reason = lastError.message;
        }
    }
    throw new Error(`Failed to retrieve content. Reason: ${reason}`);
}