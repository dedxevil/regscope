import React, { useMemo } from 'react';
import type { Ingredient } from '../types';
import ChartLoader from './ChartLoader';

interface ChartData {
    ingredients: Ingredient[];
}

interface IngredientCompositionChartProps {
    data: ChartData;
    isLoading: boolean;
}

const TYPE_COLORS: Record<Ingredient['type'], string> = {
    'Herbal Extract': '#1DB954', // Green
    'Mineral Pitch': '#F59E0B', // Amber
    'Processed Herb': '#3B82F6', // Blue
};

const IngredientCompositionChart: React.FC<IngredientCompositionChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return <ChartLoader />;
    }

    const summary = useMemo(() => {
        const counts: Record<Ingredient['type'], number> = {
            'Herbal Extract': 0,
            'Mineral Pitch': 0,
            'Processed Herb': 0,
        };
        data.ingredients.forEach(item => {
            if (item.type in counts) {
                counts[item.type]++;
            }
        });
        const total = data.ingredients.length;
        const segments = (Object.keys(counts) as Array<keyof typeof counts>)
            .filter((type) => counts[type] > 0)
            .map((type) => ({
                type,
                count: counts[type],
                percentage: total > 0 ? (counts[type] / total) * 100 : 0,
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
                    {summary.segments.map(({ type, percentage }) => {
                        const offset = circumference - (percentage / 100) * circumference;
                        const rotation = accumulatedAngle;
                        accumulatedAngle += percentage;
                        return (
                             <circle
                                key={type}
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                strokeWidth="16"
                                stroke={TYPE_COLORS[type]}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform={`rotate(${(rotation / 100) * 360} 60 60)`}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summary.total}</span>
                    <span className="text-sm text-gray-500 dark:text-spotify-gray">Ingredients</span>
                </div>
            </div>
            <div className="flex flex-col space-y-2 text-sm w-full lg:w-auto">
                {summary.segments.map(({ type, count }) => (
                    <div key={type} className="flex items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[type] }}></span>
                            <span className="text-gray-700 dark:text-spotify-gray">{type}</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IngredientCompositionChart;
