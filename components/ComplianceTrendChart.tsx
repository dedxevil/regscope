import React from 'react';
import ChartLoader from './ChartLoader';

interface TrendData {
    month: string;
    nonCompliant: number;
}

interface ComplianceTrendChartProps {
    data: TrendData[];
    isLoading: boolean;
}

const ComplianceTrendChart: React.FC<ComplianceTrendChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return <ChartLoader />;
    }

    const width = 300;
    const height = 150;
    const padding = 20;

    const maxValue = Math.max(...data.map(d => d.nonCompliant), 0);
    const yMax = Math.ceil(maxValue * 1.1); // Add 10% padding to top

    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - (point.nonCompliant / yMax) * (height - 2 * padding) - padding;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`}>
                {/* Y-axis labels */}
                <text x={padding - 5} y={padding + 5} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-spotify-gray">{yMax}</text>
                <text x={padding - 5} y={height - padding} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-spotify-gray">0</text>
                
                {/* Grid lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} className="stroke-current text-gray-200 dark:text-spotify-light-dark" strokeWidth="0.5" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-current text-gray-300 dark:text-gray-600" strokeWidth="1" />
                
                {/* Line */}
                <polyline
                    fill="none"
                    className="stroke-current text-red-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
                
                {/* Points */}
                {data.map((point, i) => {
                    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
                    const y = height - (point.nonCompliant / yMax) * (height - 2 * padding) - padding;
                    return <circle key={i} cx={x} cy={y} r="3" className="fill-current text-red-500" />;
                })}
                
                {/* X-axis labels */}
                {data.map((point, i) => {
                    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
                    return <text key={i} x={x} y={height - padding/3} textAnchor="middle" className="text-xs fill-current text-gray-500 dark:text-spotify-gray">{point.month}</text>
                })}
            </svg>
        </div>
    );
};

export default ComplianceTrendChart;
