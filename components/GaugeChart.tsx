import React from 'react';

interface GaugeChartProps {
    value: number; // 0 to 100
    label: string;
}

const getColor = (value: number) => {
    if (value < 40) return '#EF4444'; // red
    if (value < 70) return '#F59E0B'; // yellow
    return '#1DB954'; // green
};

const GaugeChart: React.FC<GaugeChartProps> = ({ value, label }) => {
    const r = 80;
    const circumference = Math.PI * r;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const color = getColor(value);
    const arcPath = `M 20 100 A ${r} ${r} 0 0 1 180 100`;

    return (
        <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 200 110" className="w-full max-w-xs">
                <path
                    d={arcPath}
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-spotify-light-dark"
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                <path
                    d={arcPath}
                    fill="none"
                    stroke={color}
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
                <text
                    x="50%"
                    y="75%"
                    textAnchor="middle"
                    className="text-5xl font-bold fill-current text-gray-800 dark:text-gray-100"
                >
                    {Math.round(value)}%
                </text>
            </svg>
            <p className="-mt-4 text-center text-lg font-semibold text-gray-600 dark:text-spotify-gray">
                {label}
            </p>
        </div>
    );
};

export default GaugeChart;
