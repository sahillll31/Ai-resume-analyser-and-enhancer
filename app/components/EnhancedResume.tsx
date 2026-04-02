import { useState } from 'react';

interface EnhancedResumeProps {
    content: string;
    isLoading: boolean;
    onEnhance: () => void;
}

const EnhancedResume = ({ content, isLoading, onEnhance }: EnhancedResumeProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Simple markdown-to-HTML converter for display
    const renderMarkdown = (md: string) => {
        let html = md
            // Headers
            .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-5 mb-2">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-3">$1</h1>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Bullet points
            .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 leading-relaxed">$1</li>')
            // Line breaks
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');

        // Wrap consecutive <li> items in <ul>
        html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*(?:<br\/>)?)+)/g, '<ul class="list-disc space-y-1 my-2">$1</ul>');

        return html;
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Enhance Button */}
            {!content && !isLoading && (
                <button
                    onClick={onEnhance}
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Enhance Resume for This Job
                </button>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#667eea] animate-spin"></div>
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">AI is enhancing your resume...</p>
                    <p className="text-gray-400 text-sm">This may take a minute</p>
                </div>
            )}

            {/* Enhanced Resume Content */}
            {content && !isLoading && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Enhanced Resume
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onEnhance}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Regenerate
                            </button>
                        </div>
                    </div>

                    <div
                        className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                    />
                </div>
            )}
        </div>
    );
};

export default EnhancedResume;
