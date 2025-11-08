import React from 'react';
import ChartLoader from './ChartLoader';

interface ChartData {
    name: string;
    value: number; // e.g., non-compliance percentage
}

interface TopProductsChartProps {
    data: ChartData[];
    isLoading: boolean;
    title: string;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, isLoading, title }) => {

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col">
                <h3 className="text-md font-bold mb-4 flex-shrink-0">{title}</h3>
                <ChartLoader />
            </div>
        )
    }
    
    const maxValue = Math.max(...data.map(d => d.value), 0) || 100;

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-md font-bold mb-4 flex-shrink-0">{title}</h3>
            <div className="space-y-3 pr-2 flex-grow">
                {data.map(item => {
                    const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                        <div key={item.name} className="flex items-center text-sm">
                            <div className="w-2/5 truncate pr-2 text-gray-600 dark:text-spotify-gray" title={item.name}>
                                {item.name}
                            </div>
                            <div className="w-3/5 flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-spotify-light-dark rounded-full h-4">
                                    <div
                                        className="bg-red-500 h-4 rounded-full"
                                        style={{ width: `${barWidth}%`, transition: 'width 0.5s ease-in-out' }}
                                    />
                                </div>
                                <span className="pl-3 font-semibold text-gray-700 dark:text-gray-200 w-12 text-right">{item.value.toFixed(0)}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopProductsChart;