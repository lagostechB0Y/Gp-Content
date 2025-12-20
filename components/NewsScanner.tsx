import React, { useState, useEffect } from 'react';
import { scanNewsSources } from '../services/newsScannerService';
import { ScannedArticle, ScanResults } from '../types';
import { Alert } from './Alert';
import { AlertType, Tab } from '../types';
import { CATEGORIES } from '../constants';

const DEFAULT_NEWS_SOURCES = [
    "https://punchng.com/",
    "https://www.theguardian.ng/category/news/politics/",
    "https://www.premiumtimesng.com/",
    "https://www.vanguardngr.com/category/politics/",
    "https://thenationonlineng.net/politics/"
].join('\n');

interface NewsScannerProps {
    setActiveTab: (tab: Tab) => void;
}

export const NewsScanner: React.FC<NewsScannerProps> = ({ setActiveTab }) => {
    const [sources, setSources] = useState<string>(
        localStorage.getItem('gopoliticalNewsSources') || DEFAULT_NEWS_SOURCES
    );
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [results, setResults] = useState<ScanResults | null>(
        JSON.parse(localStorage.getItem('gopoliticalScanResults') || 'null')
    );
    const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
    const [scanCompleted, setScanCompleted] = useState(false);

    useEffect(() => {
        localStorage.setItem('gopoliticalNewsSources', sources);
    }, [sources]);

    const handleScan = async (force: boolean = false) => {
        setIsLoading(true);
        setAlert(null);
        setScanCompleted(false);
        setProgressMessage('Starting scan...');

        if (force) {
            localStorage.removeItem('gopoliticalProcessedUrls');
            setProgressMessage('Cache cleared. Starting fresh scan...');
        }
        
        try {
            const sourceList = sources.split('\n').map(s => s.trim()).filter(Boolean);
            if (sourceList.length === 0) {
                throw new Error("Please provide at least one news source URL.");
            }
            
            const scanResult = await scanNewsSources(sourceList, setProgressMessage);
            setResults(scanResult);
            localStorage.setItem('gopoliticalScanResults', JSON.stringify(scanResult));

            if (scanResult.articles.length > 0) {
                setAlert({ type: AlertType.Success, message: `Scan complete! Found ${scanResult.articles.length} unique political articles.` });
            }
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred during the scan.';
            setAlert({ type: AlertType.Error, message });
        } finally {
            setIsLoading(false);
            setProgressMessage('');
            setScanCompleted(true);
        }
    };

    const handleUseInImporter = (article: ScannedArticle) => {
        localStorage.setItem('importerPayload', JSON.stringify({ url: article.url, title: article.headline }));
        setActiveTab('importer');
    };

    const groupedArticles = results?.articles.reduce((acc, article) => {
        const category = article.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(article);
        return acc;
    }, {} as Record<string, ScannedArticle[]>);
    
    const hasResults = groupedArticles && Object.keys(groupedArticles).length > 0;

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="news-sources" className="block text-sm font-medium text-gray-700">
                    News Source Homepages (one per line)
                </label>
                <textarea
                    id="news-sources"
                    rows={5}
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. https://punchng.com/topics/politics/"
                    disabled={isLoading}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => handleScan(false)}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Scanning...' : 'Scan For New Articles'}
                </button>
                <button
                    onClick={() => handleScan(true)}
                    disabled={isLoading}
                    title="Clears the list of recently scanned articles and rescans all sources."
                    className="w-full sm:w-auto flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200"
                >
                   Clear Cache & Force Rescan
                </button>
            </div>
             {isLoading && (
                <p className="text-center text-sm text-gray-500 mt-2">{progressMessage}</p>
            )}

            {alert && <Alert type={alert.type} message={alert.message} />}

            <div className="space-y-4">
                {results && (
                     <p className="text-xs text-gray-500 text-center">
                        Last scanned on: {new Date(results.timestamp).toLocaleString()}
                    </p>
                )}
                {hasResults && CATEGORIES.map(category => {
                    if (!groupedArticles[category] || groupedArticles[category].length === 0) {
                        return null;
                    }
                    return (
                        <details key={category} className="bg-gray-50 rounded-lg p-3" open>
                            <summary className="cursor-pointer font-medium text-gray-900 select-none">
                                {category} ({groupedArticles[category].length})
                            </summary>
                            <ul className="mt-4 space-y-3 divide-y divide-gray-200">
                                {groupedArticles[category].slice(0, 10).map(article => (
                                    <li key={article.url} className="text-sm flex justify-between items-center pt-3 first:pt-0">
                                        <div className="flex-1 mr-2">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {article.headline}
                                            </a>
                                            <span className="text-gray-500 ml-2 text-xs">({article.source})</span>
                                        </div>
                                        <button
                                            onClick={() => handleUseInImporter(article)}
                                            className="flex-shrink-0 px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Use this article
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    );
                })}
                {scanCompleted && !hasResults && (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800">No New Articles Found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            The scanner couldn't find any new political articles. Try adding more specific news source URLs (like politics sections) or use the "Clear Cache" button to rescan everything from the last 24 hours.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};