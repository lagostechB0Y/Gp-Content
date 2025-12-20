# GoPolitical Content Suite

A specialized, AI-powered frontend dashboard designed for "GoPolitical" to streamline the discovery, creation, and distribution of viral political news content.

Built with **React**, **Vite**, **Tailwind CSS**, and **Google Gemini 2.5 Flash**.

## 🚀 Features

### 1. 🔗 Link Importer
Turn external URLs into original feature stories in seconds.
*   **Content Extraction:** Fetches article text from external URLs using smart CORS proxies.
*   **AI Drafting:** Uses **Gemini 2.5 Flash** to rewrite stories into 700+ word feature articles tailored for the Nigerian mass market (Simple English, engaging tone).
*   **Smart Categorization:** Automatically tags articles with relevant political categories (Civic Tech, Governance, Economy, etc.).
*   **WordPress Integration:** One-click import to send the drafted content directly to a WordPress backend as a Draft.

### 2. 📡 News Scanner
Automated monitoring of major news sources.
*   **Source Scanning:** Scrapes headlines from major outlets (Punch, The Guardian, Premium Times, etc.).
*   **AI Filtering:** Analyzes links to identify political relevance, discarding non-political content (sports, entertainment).
*   **Deduplication:** Uses AI "fingerprinting" to avoid listing the same story multiple times.
*   **Workflow:** Directly send interesting scanned articles to the Importer for rewriting.

### 3. 🌪️ Spin Room (Social Media Generator)
Repurpose long-form content for viral social engagement.
*   **Multi-Platform Generation:** Instantly generates:
    *   **Twitter/X Threads:** 5-7 tweets with hooks and hashtags.
    *   **WhatsApp Broadcasts:** Urgent, emoji-rich summaries for broadcast lists.
    *   **Instagram Captions:** Engagement-focused captions with trending hashtags.
*   **🎨 Viral Card Generator:** Features a built-in HTML5 Canvas engine that auto-generates downloadable, branded quote cards (images) based on the article's "Viral Hook".

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK
*   **State/Cache:** LocalStorage (for persistence without a database)
*   **Icons:** Heroicons (SVG)

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will start at `http://localhost:3000`.

## 📖 Usage Guide

1.  **Dashboard:** Navigate between tools using the sidebar.
2.  **Importer:** Paste a URL. The AI will summarize it. Review the generated text, title, and categories. Click "Import Article Draft" to send to WordPress, or "Draft Social Media Posts" to move to the Spin Room.
3.  **News Scanner:** Click "Scan". The system will look for new articles from the configured sources. Click "Use this article" to load a found story into the Importer.
4.  **Spin Room:** Paste any text (or use text passed from the Importer). Click "Generate Social Pack". Download the generated graphic card or copy text for social platforms.

## ⚠️ Important Notes

*   **CORS Proxies:** The `contentFetcher` service uses public CORS proxies (e.g., corsproxy.io) to fetch external HTML. For a high-traffic production environment, it is highly recommended to host your own proxy server.
*   **API Costs:** This application uses the Google Gemini API. Ensure your billing is configured correctly in Google AI Studio.

## 📄 License

Internal Tool - GoPolitical Media.