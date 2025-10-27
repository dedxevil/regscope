
// FIX: Create the ComplianceChart component which was missing.
import React, { useMemo } from 'react';
import type { ComplianceStatus, IngredientStatus } from '../types';
import ChartLoader from './ChartLoader';

interface ChartData {
    status: ComplianceStatus | IngredientStatus;
}

interface ComplianceChartProps {
    data: ChartData[];
    totalLabel?: string;
    isLoading: boolean;
}

const COLORS: Record<ComplianceStatus | IngredientStatus, string> = {
    'Compliant': '#1DB954', // green
    'Non-Compliant': '#EF4444', // red
    'Requires Review': '#F59E0B', // yellow
    'Unchecked': '#6B7280', // gray
    'Error': '#9CA3AF' // gray
};

const ComplianceChart: React.FC<ComplianceChartProps> = ({ data, totalLabel = "Items", isLoading }) => {
    if (isLoading) {
        return <ChartLoader />;
    }

    const summary = useMemo(() => {
        const counts: Record<ComplianceStatus | IngredientStatus, number> = {
            'Compliant': 0,
            'Non-Compliant': 0,
            'Requires Review': 0,
            'Error': 0,
            'Unchecked': 0
        };
        data.forEach(item => {
            if (item.status in counts) {
                counts[item.status as keyof typeof counts]++;
            }
        });
        const total = data.length;
        const segments = (Object.keys(counts) as Array<keyof typeof counts>)
            .filter((status) => counts[status] > 0)
            .map((status) => ({
                status,
                count: counts[status],
                percentage: total > 0 ? (counts[status] / total) * 100 : 0,
            }));
        return { segments, total };
    }, [data]);

    const r = 52;
    const circumference = 2 * Math.PI * r;
    let accumulatedAngle = 0;

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center h-full w-full gap-4">
            <div className="relative w-32 h-32 lg:w-36 lg:h-36 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r={r} fill="transparent" strokeWidth="16" className="text-gray-200 dark:text-gray-700" />
                    {summary.segments.map(({ status, percentage }) => {
                        const offset = circumference - (percentage / 100) * circumference;
                        const rotation = accumulatedAngle;
                        accumulatedAngle += percentage;
                        return (
                             <circle
                                key={status}
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                strokeWidth="16"
                                stroke={COLORS[status]}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform={`rotate(${(rotation / 100) * 360} 60 60)`}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summary.total}</span>
                    <span className="text-sm text-gray-500 dark:text-spotify-gray">{totalLabel}</span>
                </div>
            </div>
            <div className="flex flex-col space-y-2 text-sm w-full lg:w-auto">
                {summary.segments.map(({ status, count }) => (
                    <div key={status} className="flex items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[status] }}></span>
                            <span className="text-gray-700 dark:text-spotify-gray">{status}</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplianceChart;