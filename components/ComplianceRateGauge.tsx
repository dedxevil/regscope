
// FIX: Create the ComplianceRateGauge component which was missing.
import React from 'react';
import ChartLoader from './ChartLoader';

interface ComplianceRateGaugeProps {
    value: number; // 0 to 100
    isLoading: boolean;
}

const getColor = (value: number) => {
    if (value < 50) return '#EF4444'; // red
    if (value < 80) return '#F59E0B'; // yellow
    return '#1DB954'; // green
};

const ComplianceRateGauge: React.FC<ComplianceRateGaugeProps> = ({ value, isLoading }) => {
    if (isLoading) {
        return <ChartLoader />;
    }

    const r = 80;
    const circumference = Math.PI * r; // semi-circle circumference
    
    // Correctly calculate the offset for the progress arc
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const color = getColor(value);
    
    // Define the semi-circle path
    const arcPath = `M 20 100 A ${r} ${r} 0 0 1 180 100`;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 110" className="w-full max-w-xs">
                {/* Background Arc */}
                <path
                    d={arcPath}
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-spotify-light-dark"
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
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
                {/* Text Value */}
                <text
                    x="50%"
                    y="85%"
                    textAnchor="middle"
                    className="text-5xl font-bold fill-current text-gray-800 dark:text-gray-100"
                >
                    {Math.round(value)}%
                </text>
            </svg>
            <p className="-mt-2 text-center text-lg font-semibold text-gray-600 dark:text-spotify-gray">
                Compliance Rate
            </p>
        </div>
    );
};

export default ComplianceRateGauge;