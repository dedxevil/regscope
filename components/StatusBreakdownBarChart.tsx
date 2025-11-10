import React, { useMemo } from 'react';
import type { Product } from '../types';
import ChartLoader from './ChartLoader';

interface ChartData {
    status: Product['status'];
}

interface StatusBreakdownBarChartProps {
    data: ChartData[];
    isLoading: boolean;
}

const COLORS: Record<Product['status'], string> = {
    'Compliant': '#1DB954', // green
    'Non-Compliant': '#EF4444', // red
    'Requires Review': '#F59E0B', // yellow
};

const StatusBreakdownBarChart: React.FC<StatusBreakdownBarChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return <ChartLoader />;
    }

    const summary = useMemo(() => {
        const counts: Record<Product['status'], number> = {
            'Compliant': 0,
            'Non-Compliant': 0,
            'Requires Review': 0,
        };
        data.forEach(item => {
            if (item.status in counts) {
                counts[item.status]++;
            }
        });
        // Consistent order of bars
        const bars = (['Non-Compliant', 'Requires Review', 'Compliant'] as Array<keyof typeof counts>)
            .map((status) => ({
                status,
                count: counts[status],
            }));
        return { bars };
    }, [data]);

    const maxCount = useMemo(() => Math.max(...summary.bars.map(b => b.count), 1), [summary]); // Use 1 to avoid division by zero

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="space-y-4 pr-2">
                {summary.bars.map(item => {
                    const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                        <div key={item.status} className="flex items-center text-sm">
                            <div className="w-2/5 truncate pr-2 text-gray-600 dark:text-spotify-gray" title={item.status}>
                                {item.status}
                            </div>
                            <div className="w-3/5 flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-spotify-light-dark rounded-full h-4">
                                    <div
                                        className="h-4 rounded-full"
                                        style={{ width: `${barWidth}%`, backgroundColor: COLORS[item.status], transition: 'width 0.5s ease-in-out' }}
                                    />
                                </div>
                                <span className="pl-3 font-semibold text-gray-700 dark:text-gray-200 w-12 text-right">{item.count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusBreakdownBarChart;
