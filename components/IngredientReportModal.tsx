import React, { useEffect, useState, useCallback } from 'react';
import DetailedReport from './DetailedReport';
import Spinner from './Spinner';
import { fetchComplianceInfo } from '../services/geminiService';
import type { Ingredient, Country } from '../types';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface IngredientReportModalProps {
    ingredient: Ingredient;
    country: Country;
    onClose: () => void;
}

const IngredientReportModal: React.FC<IngredientReportModalProps> = ({ ingredient, country, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const fetchReport = useCallback(async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const fetchedReport = await fetchComplianceInfo(ingredient.name, country.name);
            setReport(fetchedReport);
        } catch (e) {
            setReport("Failed to load detailed report.");
        } finally {
            setIsLoading(false);
        }
    }, [ingredient, country]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ingredient-report-title"
        >
            <div
                className="bg-white dark:bg-spotify-card rounded-lg shadow-2xl w-full max-w-2xl h-auto max-h-[85vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="ingredient-report-title" className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Detailed Report: {ingredient.name} in {country.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark"
                        aria-label="Close report"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto">
                    <DetailedReport
                        report={report}
                        isLoading={isLoading}
                        defaultText="Loading report..."
                    />
                </main>
            </div>
        </div>
    );
};

export default IngredientReportModal;
