import React, { useMemo } from 'react';
import Spinner from './Spinner';

interface DetailedReportProps {
    report: string | null;
    isLoading: boolean;
    defaultText: string;
}

// A component to parse and render text with **highlighted** segments
const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const content = part.slice(2, -2);
                    let colorClass = 'text-blue-600 dark:text-spotify-green'; // Default for other highlights
                    
                    if (content.toLowerCase() === 'compliant') colorClass = 'text-green-600 dark:text-spotify-green font-extrabold';
                    else if (content.toLowerCase() === 'restricted') colorClass = 'text-yellow-600 dark:text-yellow-400 font-extrabold';
                    else if (content.toLowerCase() === 'non-compliant') colorClass = 'text-red-600 dark:text-red-400 font-extrabold';
                    
                    return <strong key={i} className={colorClass}>{content}</strong>;
                }
                return part;
            })}
        </>
    );
};

const DetailedReport: React.FC<DetailedReportProps> = ({ report, isLoading, defaultText }) => {
    const parsedReport = useMemo(() => {
        if (!report) return [];
        
        const structuredReport: Array<{ type: string; content: string; }> = [];
        const lines = report.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('### ')) {
                structuredReport.push({ type: 'heading', content: trimmedLine.substring(4) });
            } else if (trimmedLine.toUpperCase().startsWith('**STATUS:**')) {
                 structuredReport.push({ type: 'status', content: trimmedLine.substring('**STATUS:**'.length).trim() });
            } else if (trimmedLine.startsWith('* ')) {
                structuredReport.push({ type: 'listItem', content: trimmedLine.substring(2) });
            } else if (trimmedLine) {
                structuredReport.push({ type: 'paragraph', content: trimmedLine });
            }
        }
        return structuredReport;
    }, [report]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-spotify-gray">
                <Spinner className="w-6 h-6 mr-2" />
                <span>Loading Report...</span>
            </div>
        );
    }

    if (!report) {
        return <div className="text-gray-500 dark:text-spotify-gray p-4 text-center">{defaultText}</div>;
    }

    return (
        <div className="text-sm space-y-3">
            {parsedReport.map((item, index) => {
                switch (item.type) {
                    case 'heading':
                        return <h4 key={index} className="text-sm font-bold uppercase text-gray-500 dark:text-spotify-gray tracking-wider mt-4 mb-1 first:mt-0">{item.content}</h4>;
                    case 'status':
                        return (
                            <p key={index} className="text-gray-700 dark:text-gray-300">
                                <strong className="font-bold text-gray-800 dark:text-gray-100">STATUS: </strong>
                                <HighlightedText text={item.content} />
                            </p>
                        );
                    case 'listItem':
                        return (
                             <div key={index} className="flex items-start">
                                <svg className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-spotify-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                <span className="text-gray-700 dark:text-gray-300"><HighlightedText text={item.content} /></span>
                            </div>
                        );
                    case 'paragraph':
                        return <p key={index} className="text-gray-700 dark:text-gray-300"><HighlightedText text={item.content} /></p>;
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default DetailedReport;