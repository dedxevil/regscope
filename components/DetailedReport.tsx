import React from 'react';
import Spinner from './Spinner';

interface DetailedReportProps {
    report: string | null;
    isLoading: boolean;
    defaultText: string;
}

const DetailedReport: React.FC<DetailedReportProps> = ({ report, isLoading, defaultText }) => {
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

    const renderLine = (line: string, index: number) => {
        if (line.startsWith('### ')) {
            return (
                <h4 key={index} className="text-sm font-bold uppercase text-gray-500 dark:text-spotify-gray mt-4 mb-2">
                    {line.substring(4)}
                </h4>
            );
        }
        if (line.startsWith('* ')) {
            const content = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-spotify-green font-semibold">$1</strong>');
            return (
                <li key={index} className="flex items-start" dangerouslySetInnerHTML={{ __html: `<svg class="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-spotify-green" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span>${content}</span>` }} />
            );
        }
        
        const contentWithHighlights = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600 dark:text-spotify-green font-semibold">$1</strong>');
        return <p key={index} className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: contentWithHighlights }} />;
    };

    return (
        <div className="text-sm space-y-2">
            {report.split('\n').map((line, index) => renderLine(line.trim(), index))}
        </div>
    );
};

export default DetailedReport;
