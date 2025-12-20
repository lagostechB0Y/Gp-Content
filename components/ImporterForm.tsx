import React, { useState, useEffect } from 'react';
import { importLink } from '../services/api';
import { summarizeContent, regenerateHeadline, regenerateArticleBody } from '../services/summarizer';
import { fetchAndParseUrl } from '../services/contentFetcher';
import { Alert } from './Alert';
import { Spinner } from './Spinner';
import { AlertType, ApiResponseError, Tab } from '../types';
import { CATEGORIES } from '../constants';

const DEFAULT_API_ENDPOINT = 'https://staging.gopolitical.ng/wp-json/gopolitical/v1/import';

interface ImporterFormProps {
    setActiveTab?: (tab: Tab) => void;
}

export const ImporterForm: React.FC<ImporterFormProps> = ({ setActiveTab }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  // New state to hold the original fetched content for re-spinning
  const [originalContent, setOriginalContent] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSpinningHeadline, setIsSpinningHeadline] = useState(false);
  const [isSpinningArticle, setIsSpinningArticle] = useState(false);
  
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState(
    localStorage.getItem('gopoliticalApiEndpoint') || DEFAULT_API_ENDPOINT
  );

  useEffect(() => {
    localStorage.setItem('gopoliticalApiEndpoint', apiEndpoint);
  }, [apiEndpoint]);
  
  useEffect(() => {
    const payload = localStorage.getItem('importerPayload');
    if (payload) {
      try {
        const { url, title } = JSON.parse(payload);
        setUrl(url || '');
        setTitle(title || '');
        // Clean up immediately after use
        localStorage.removeItem('importerPayload');
      } catch (error) {
        console.error("Failed to parse importer payload:", error);
        localStorage.removeItem('importerPayload');
      }
    }
  }, []);


  const handleFetchAndSummarize = async () => {
    setAlert(null);
    if (!url.trim()) {
        setAlert({ type: AlertType.Error, message: 'Please enter a URL to fetch.' });
        return;
    }
     try {
        new URL(url);
    } catch (_) {
        setAlert({ type: AlertType.Error, message: 'Please enter a valid URL.' });
        return;
    }

    setIsLoading(true);
    setSummary('');
    // Clear title so the new AI generated one takes precedence
    setTitle(''); 
    setCategories([]);
    setOriginalContent('');

    try {
        setLoadingMessage('Fetching article content...');
        const articleText = await fetchAndParseUrl(url);

        if (!articleText || articleText.trim().length < 100) {
             throw new Error("Could not extract meaningful content from the URL.");
        }
        
        // Save raw content for re-spinning
        setOriginalContent(articleText);

        setLoadingMessage('Drafting 700+ word feature article...');
        const result = await summarizeContent(articleText);

        setSummary(result.summary);
        setTitle(result.title); // FIX: Always use the AI generated title
        setCategories(result.categories || []);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        setAlert({ type: AlertType.Error, message });
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }

  const handleRespinHeadline = async () => {
    const contentToUse = originalContent || summary;
    if (!contentToUse) return;

    setIsSpinningHeadline(true);
    try {
        const newTitle = await regenerateHeadline(contentToUse);
        setTitle(newTitle);
    } catch (error) {
        console.error("Failed to respin headline", error);
    } finally {
        setIsSpinningHeadline(false);
    }
  };

  const handleRespinArticle = async () => {
    const contentToUse = originalContent;
    if (!contentToUse) return;

    setIsSpinningArticle(true);
    try {
        const newBody = await regenerateArticleBody(contentToUse);
        setSummary(newBody);
    } catch (error) {
        console.error("Failed to respin article", error);
    } finally {
        setIsSpinningArticle(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory) && CATEGORIES.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };
  
  const handleSendToSpinRoom = () => {
    if (summary && setActiveTab) {
        localStorage.setItem('spinRoomPayload', JSON.stringify({ content: summary, title: title }));
        setActiveTab('spin-room');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    if (!url.trim()) {
      setAlert({ type: AlertType.Error, message: 'URL is a required field.' });
      return;
    }
    
    if (!summary.trim()) {
        setAlert({ type: AlertType.Error, message: 'Please generate the content before importing.' });
        return;
    }

    setIsImporting(true);

    try {
        const response = await importLink({ title, url, content: summary, categories }, apiEndpoint);

        if (response.success) {
          setAlert({
            type: AlertType.Success,
            message: `Draft created. ID: ${response.data.ID}`,
          });
          setTitle('');
          setUrl('');
          setSummary('');
          setCategories([]);
          setOriginalContent('');
        } else {
          setAlert({
            type: AlertType.Error,
            message: (response as ApiResponseError).data.message || 'An unknown error occurred.',
          });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during import.';
        setAlert({ type: AlertType.Error, message });
    } finally {
        setIsImporting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {alert && <Alert type={alert.type} message={alert.message} />}
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Article URL (Required)
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://example.com/article"
              />
            </div>
          </div>

          <div>
             <button
                type="button"
                onClick={handleFetchAndSummarize}
                disabled={isLoading || isImporting || !url}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
             >
                {isLoading ? (
                    <> <Spinner /> <span className="ml-2">{loadingMessage}</span> </>
                ) : 'Generate GoPolitical Feature Article'}
            </button>
          </div>
          
          <hr/>

           <div>
            <div className="flex justify-between items-center">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Headline <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                {(originalContent || summary) && (
                    <button 
                        type="button" 
                        onClick={handleRespinHeadline}
                        disabled={isSpinningHeadline}
                        className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                        title="Re-generate Headline"
                    >
                         <svg className={`w-4 h-4 ${isSpinningHeadline ? 'animate-spin text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                )}
            </div>
            <div className="mt-1 relative">
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Compelling AI-suggested headline will appear here"
              />
            </div>
          </div>

          {(categories.length > 0 || summary) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                AI-Suggested Matching Categories
              </label>
              <div className="mt-2 flex flex-wrap items-start gap-2">
                {categories.map((category) => (
                  <span key={category} className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {category}
                    <button type="button" onClick={() => handleRemoveCategory(category)} className="ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 focus:outline-none">
                      <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    list="category-options"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a category..."
                  />
                   <datalist id="category-options">
                    {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                  <button type="button" onClick={handleAddCategory} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add
                  </button>
              </div>
            </div>
          )}

           <div>
            <div className="flex justify-between items-center">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                    Generated Feature Article (GoPolitical Style)
                </label>
                {(originalContent) && (
                    <button 
                        type="button" 
                        onClick={handleRespinArticle}
                        disabled={isSpinningArticle}
                        className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                        title="Re-generate Article Body"
                    >
                         <svg className={`w-4 h-4 ${isSpinningArticle ? 'animate-spin text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                )}
            </div>
            <div className="mt-1">
                <textarea
                    id="summary"
                    name="summary"
                    rows={20}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="The full 700+ word feature article will appear here..."
                />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isImporting || isLoading || !summary}
            className="flex-1 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? <Spinner /> : 'Import Article Draft'}
          </button>
          
           <button
            type="button"
            disabled={!summary || isLoading}
            onClick={handleSendToSpinRoom}
            className="flex-1 w-full flex justify-center items-center py-2 px-4 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
          >
             <span className="mr-2">⚡</span> Draft Social Media Posts
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <details className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-gray-700 select-none">
                API Endpoint Configuration
            </summary>
            <div className="mt-4">
                <label htmlFor="api-endpoint" className="block text-xs font-medium text-gray-500">
                    WordPress Import API URL
                </label>
                <input
                    type="url"
                    id="api-endpoint"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your WordPress API endpoint"
                />
                <p className="mt-2 text-xs text-gray-500">
                    This URL is used to import the article. It's saved in your browser.
                </p>
            </div>
        </details>
      </div>

    </div>
  );
};