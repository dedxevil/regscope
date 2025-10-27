import React from 'react';

const ChartLoader: React.FC = () => {
    return (
        <div className="w-full h-full p-4 animate-pulse" aria-label="Loading chart data">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="flex justify-between mt-4">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
        </div>
    );
};

export default ChartLoader;