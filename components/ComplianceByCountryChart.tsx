import React, { useState } from 'react';
import ChartLoader from './ChartLoader';

interface ChartData {
    country: string;
    compliant: number;
    nonCompliant: number;
    review: number;
}

interface ComplianceByCountryChartProps {
    data: ChartData[];
    isLoading: boolean;
}

const COLORS = {
    compliant: '#1DB954',
    nonCompliant: '#EF4444',
    review: '#F59E0B',
};

const ITEMS_PER_PAGE = 5;

const ComplianceByCountryChart: React.FC<ComplianceByCountryChartProps> = ({ data, isLoading }) => {
    const [currentPage, setCurrentPage] = useState(0);

    if (isLoading) {
        return <ChartLoader />;
    }

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow space-y-3 min-h-[260px]">
                {paginatedData.map(item => {
                    const total = item.compliant + item.nonCompliant + item.review;
                    const compliantWidth = total > 0 ? (item.compliant / total) * 100 : 0;
                    const nonCompliantWidth = total > 0 ? (item.nonCompliant / total) * 100 : 0;
                    const reviewWidth = total > 0 ? (item.review / total) * 100 : 0;

                    return (
                        <div key={item.country}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-spotify-gray">{item.country}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{total} Ingredients</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-spotify-light-dark rounded-full h-4 flex overflow-hidden">
                                <div style={{ width: `${compliantWidth}%`, backgroundColor: COLORS.compliant }} title={`Compliant: ${item.compliant}`}></div>
                                <div style={{ width: `${nonCompliantWidth}%`, backgroundColor: COLORS.nonCompliant }} title={`Non-Compliant: ${item.nonCompliant}`}></div>
                                <div style={{ width: `${reviewWidth}%`, backgroundColor: COLORS.review }} title={`Review Needed: ${item.review}`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center pt-2">
                <div className="flex justify-start space-x-2 text-xs">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.compliant}}></span><span className="text-gray-600 dark:text-spotify-gray">Compliant</span></div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.nonCompliant}}></span><span className="text-gray-600 dark:text-spotify-gray">Non-C</span></div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.review}}></span><span className="text-gray-600 dark:text-spotify-gray">Review</span></div>
                </div>
                 <div className="flex items-center space-x-2">
                    <button onClick={goToPrevPage} disabled={currentPage === 0} className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-spotify-light-dark disabled:opacity-50 disabled:cursor-not-allowed">
                       &lt;
                    </button>
                    <span className="text-xs text-gray-500 dark:text-spotify-gray">{currentPage + 1} / {totalPages}</span>
                    <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1} className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-spotify-light-dark disabled:opacity-50 disabled:cursor-not-allowed">
                       &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComplianceByCountryChart;