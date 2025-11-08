import React from 'react';
import ChartLoader from './ChartLoader';

interface ChartData {
    type: string;
    compliant: number;
    nonCompliant: number;
    review: number;
}

interface ComplianceByTypeChartProps {
    data: ChartData[];
    isLoading: boolean;
}

const COLORS = {
    compliant: '#1DB954',
    nonCompliant: '#EF4444',
    review: '#F59E0B',
};

const ComplianceByTypeChart: React.FC<ComplianceByTypeChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
             <div className="w-full h-full flex flex-col">
                 <h3 className="text-md font-bold mb-2 flex-shrink-0">Compliance by Type</h3>
                 <ChartLoader />
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-md font-bold mb-2 flex-shrink-0">Compliance by Type</h3>
            <div className="space-y-4 flex-grow">
                {data.map(item => {
                    const total = item.compliant + item.nonCompliant + item.review;
                    const compliantWidth = total > 0 ? (item.compliant / total) * 100 : 0;
                    const nonCompliantWidth = total > 0 ? (item.nonCompliant / total) * 100 : 0;
                    const reviewWidth = total > 0 ? (item.review / total) * 100 : 0;

                    return (
                        <div key={item.type}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-spotify-gray">{item.type}</span>
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
             <div className="flex justify-end space-x-4 pt-2 text-xs flex-shrink-0">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.compliant}}></span><span className="text-gray-600 dark:text-spotify-gray">Compliant</span></div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.nonCompliant}}></span><span className="text-gray-600 dark:text-spotify-gray">Non-C.</span></div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: COLORS.review}}></span><span className="text-gray-600 dark:text-spotify-gray">Review</span></div>
            </div>
        </div>
    );
};

export default ComplianceByTypeChart;
