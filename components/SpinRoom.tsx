import React, { useState, useEffect, useRef } from 'react';
import { generateSocialPack } from '../services/socialGenerator';
import { SocialPack, AlertType } from '../types';
import { Spinner } from './Spinner';
import { Alert } from './Alert';

export const SpinRoom: React.FC = () => {
    const [sourceText, setSourceText] = useState('');
    const [headline, setHeadline] = useState('');
    const [socialPack, setSocialPack] = useState<SocialPack | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
    
    // Canvas ref for generating the image
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cardUrl, setCardUrl] = useState<string | null>(null);

    useEffect(() => {
        // Check if there's content passed from Importer
        const payload = localStorage.getItem('spinRoomPayload');
        if (payload) {
            try {
                const { content, title } = JSON.parse(payload);
                if (content) setSourceText(content);
                if (title) setHeadline(title);
                // Clear it so it doesn't persist forever
                localStorage.removeItem('spinRoomPayload');
            } catch (e) {
                console.error("Failed to parse spin room payload");
            }
        }
    }, []);

    useEffect(() => {
        if (socialPack?.viral_hook && canvasRef.current) {
            drawViralCard(socialPack.viral_hook);
        }
    }, [socialPack]);

    const drawViralCard = (text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 1080;
        const height = 1080;
        
        // Set actual canvas size
        canvas.width = width;
        canvas.height = height;

        // 1. Background (Gradient)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1e40af'); // blue-800
        gradient.addColorStop(1, '#581c87'); // purple-900
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Branding Header (Optional watermarks)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.font = 'bold 200px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText('GoPolitical', 0, 0);
        ctx.restore();

        // 3. Main Text (Wrapped)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 70px "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = width - 160; // 80px padding each side
        const lineHeight = 90;
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const totalTextHeight = lines.length * lineHeight;
        let startY = (height - totalTextHeight) / 2;

        // Shift up slightly to make room for footer
        startY -= 40;

        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), width / 2, startY + (i * lineHeight));
        });

        // 4. Footer
        const footerY = height - 80;
        
        // Divider line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.moveTo(width / 2 - 100, footerY - 50);
        ctx.lineTo(width / 2 + 100, footerY - 50);
        ctx.stroke();

        // Footer Text
        ctx.fillStyle = '#fbbf24'; // amber-400 for contrast
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.fillText('GoPolitical.ng', width / 2, footerY);
        
        // Create URL for download
        setCardUrl(canvas.toDataURL('image/png'));
    };

    const handleGenerate = async () => {
        if (!sourceText || sourceText.length < 50) {
            setAlert({ type: AlertType.Error, message: "Please enter more content to generate socials." });
            return;
        }

        setIsLoading(true);
        setAlert(null);
        setSocialPack(null);
        setCardUrl(null);

        try {
            const pack = await generateSocialPack(sourceText, headline || "GoPolitical News");
            setSocialPack(pack);
        } catch (error) {
            setAlert({ type: AlertType.Error, message: "Failed to generate social content. Try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setAlert({ type: AlertType.Success, message: `${label} copied to clipboard!` });
        setTimeout(() => setAlert(null), 3000);
    };
    
    const downloadCard = () => {
        if (cardUrl) {
            const link = document.createElement('a');
            link.download = `gopolitical-viral-card-${Date.now()}.png`;
            link.href = cardUrl;
            link.click();
        }
    };

    return (
        <div className="space-y-6">
             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white mb-6 shadow-md">
                <h3 className="text-xl font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                    Social Media Spin Room
                </h3>
                <p className="text-purple-100 text-sm mt-1 opacity-90">
                    Turn your article draft into viral content for Twitter, WhatsApp, and Instagram in seconds.
                </p>
            </div>

            {alert && <Alert type={alert.type} message={alert.message} />}

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Article Headline (Optional)</label>
                        <input 
                            type="text" 
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g. Senate Passes New Bill"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Source Text (Paste Article Here)</label>
                    <textarea 
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Paste the full article content here..."
                    />
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !sourceText}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 transition-colors"
                    >
                        {isLoading ? (
                            <> <Spinner /> <span className="ml-2">Spinning Socials...</span> </>
                        ) : 'Generate Social Pack'}
                    </button>
                </div>
            </div>

            {socialPack && (
                <div className="animate-fade-in-up space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Twitter Column */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
                            <div className="p-3 border-b border-gray-100 bg-sky-50 flex justify-between items-center rounded-t-lg shrink-0">
                                <h4 className="font-bold text-sky-700 flex items-center text-sm">
                                    <span className="mr-2 text-lg">🐦</span> Twitter Thread
                                </h4>
                                <button 
                                    onClick={() => copyToClipboard(socialPack.twitter.join('\n\n'), 'Twitter Thread')}
                                    className="text-xs bg-white border border-sky-200 text-sky-600 px-2 py-1 rounded hover:bg-sky-100 transition-colors"
                                >
                                    Copy Thread
                                </button>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto flex-1">
                                {socialPack.twitter.map((tweet, i) => (
                                    <div key={i} className="text-sm text-gray-800 p-3 bg-gray-50 rounded border border-gray-100 relative group">
                                        <p>{tweet}</p>
                                        <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                                            <span>{i + 1}/{socialPack.twitter.length}</span>
                                            <button 
                                                onClick={() => copyToClipboard(tweet, `Tweet ${i+1}`)}
                                                className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp Column */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
                            <div className="p-3 border-b border-gray-100 bg-green-50 flex justify-between items-center rounded-t-lg shrink-0">
                                <h4 className="font-bold text-green-700 flex items-center text-sm">
                                    <span className="mr-2 text-lg">📱</span> WhatsApp
                                </h4>
                                <button 
                                    onClick={() => copyToClipboard(socialPack.whatsapp, 'WhatsApp Broadcast')}
                                    className="text-xs bg-white border border-green-200 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="p-2 flex-1 relative">
                                <textarea 
                                    readOnly
                                    value={socialPack.whatsapp}
                                    className="w-full h-full text-sm text-gray-800 bg-green-50/30 p-3 rounded border-none focus:ring-0 resize-none font-sans whitespace-pre-wrap"
                                />
                            </div>
                        </div>

                        {/* Instagram Column */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
                            <div className="p-3 border-b border-gray-100 bg-pink-50 flex justify-between items-center rounded-t-lg shrink-0">
                                <h4 className="font-bold text-pink-700 flex items-center text-sm">
                                    <span className="mr-2 text-lg">📸</span> IG/Facebook
                                </h4>
                                <button 
                                    onClick={() => copyToClipboard(socialPack.instagram, 'Instagram Caption')}
                                    className="text-xs bg-white border border-pink-200 text-pink-600 px-2 py-1 rounded hover:bg-pink-100 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="p-2 flex-1 relative">
                                <textarea 
                                    readOnly
                                    value={socialPack.instagram}
                                    className="w-full h-full text-sm text-gray-800 bg-pink-50/30 p-3 rounded border-none focus:ring-0 resize-none font-sans whitespace-pre-wrap"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* New Viral Card Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-indigo-900 text-white flex justify-between items-center">
                            <h4 className="font-bold flex items-center">
                                <span className="mr-2 text-xl">🎨</span> Viral Quote Card
                            </h4>
                            <button 
                                onClick={downloadCard}
                                className="text-sm bg-white text-indigo-900 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors flex items-center shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download Image
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 flex flex-col items-center">
                             {/* Hidden Canvas used for high-res generation */}
                            <canvas 
                                ref={canvasRef} 
                                className="hidden" 
                            />
                            
                            {/* Live Preview of the generated image */}
                            {cardUrl ? (
                                <div className="relative group max-w-sm shadow-2xl rounded-lg overflow-hidden border-4 border-white">
                                    <img src={cardUrl} alt="Viral Card Preview" className="w-full h-auto" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <button 
                                            onClick={downloadCard}
                                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 w-64 flex items-center justify-center text-gray-400">
                                    Generating preview...
                                </div>
                            )}
                            <p className="mt-4 text-sm text-gray-500 max-w-lg text-center">
                                This card is auto-generated with a punchy quote from the article, ready for Instagram, WhatsApp Status, or Twitter.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};