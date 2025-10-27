import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Spinner from './Spinner';
import ComplianceChart from './ComplianceChart';
import { MOCK_INGREDIENTS, COUNTRIES } from '../constants';
import { fetchSimpleComplianceStatus, fetchComplianceInfo, fetchIngredientSummary } from '../services/geminiService';
import type { Ingredient, Country, CountryComplianceStatus, ComplianceStatus } from '../types';
import type { Theme } from '../App';

interface IngredientSearchDetailPageProps {
    ingredientName: string;
    onBack: () => void;
    onLogout: () => void;
    theme: Theme;
    onToggleTheme: () => void;
}

const BackIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const statusStyles: Record<ComplianceStatus, string> = {
    'Compliant': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Non-Compliant': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Requires Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Error': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const parseMarkdown = (text: string | null): string => {
    if (!text) return '';
    return text.trim()
        .replace(/\n\s*\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(<br>|<\/p>|$)/g, '<h3>$1</h3>')
        .replace(/\* (.*?)(<br>|<\/p>|$)/g, '<li>$1</li>')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>/g, '</li></ul>')
        .replace(/<\/ul><ul>/g, '');
};

const IngredientSearchDetailPage: React.FC<IngredientSearchDetailPageProps> = ({ ingredientName, onBack, onLogout, theme, onToggleTheme }) => {
    const [searchedIngredient, setSearchedIngredient] = useState<Ingredient | null>(null);
    const [ingredientSummary, setIngredientSummary] = useState<string | null>(null);
    const [complianceResults, setComplianceResults] = useState<CountryComplianceStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [detailedReport, setDetailedReport] = useState<string | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        const loadIngredientData = async () => {
            setIsLoading(true);
            setError(null);
            setComplianceResults([]);
            setIngredientSummary(null);
            setSelectedCountry(null);
            setDetailedReport(null);
            
            const foundIngredient = MOCK_INGREDIENTS.find(i => i.name.toLowerCase() === ingredientName.toLowerCase());
            
            if (!foundIngredient) {
                setError(`Ingredient "${ingredientName}" not found.`);
                setIsLoading(false);
                return;
            }
            
            setSearchedIngredient(foundIngredient);
            
            const [summaryResult, complianceResultsSettled] = await Promise.all([
                fetchIngredientSummary(foundIngredient.name),
                Promise.allSettled(
                    COUNTRIES.map(country => fetchSimpleComplianceStatus(foundIngredient.name, country.name))
                )
            ]);
            
            setIngredientSummary(summaryResult);

            const newComplianceResults = complianceResultsSettled.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return { country: COUNTRIES[index], status: result.value };
                }
                return { country: COUNTRIES[index], status: 'Error' as ComplianceStatus };
            });

            setComplianceResults(newComplianceResults);
            setIsLoading(false);
        };
        
        if (ingredientName) {
            loadIngredientData();
        }
    }, [ingredientName]);

    const handleCountrySelect = useCallback(async (country: Country) => {
        if (!searchedIngredient) return;
        setSelectedCountry(country);
        setIsDetailLoading(true);
        setDetailedReport(null);
        try {
            const report = await fetchComplianceInfo(searchedIngredient.name, country.name);
            setDetailedReport(report);
        } catch (e) {
            setDetailedReport("Failed to load detailed report.");
        } finally {
            setIsDetailLoading(false);
        }
    }, [searchedIngredient]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-spotify-dark">
            <Header title="Ingredient Details" onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center text-sm font-medium text-gray-600 dark:text-spotify-gray hover:text-gray-900 dark:hover:text-white"
                    >
                        <BackIcon className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                </div>
                {isLoading && (
                    <div className="text-center p-8">
                        <Spinner className="h-10 w-10 text-spotify-green mx-auto" />
                        <p className="mt-2 text-gray-600 dark:text-spotify-gray">Analyzing {ingredientName} across {COUNTRIES.length} countries...</p>
                    </div>
                )}
                {error && <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">{error}</div>}
                {searchedIngredient && !isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                Compliance Status: <span className="text-blue-600 dark:text-spotify-green">{searchedIngredient.name}</span>
                            </h2>
                            <div className="max-h-[600px] overflow-y-auto pr-2">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white dark:bg-spotify-card">
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="py-2 text-gray-600 dark:text-spotify-gray">Country</th>
                                            <th className="py-2 text-right text-gray-600 dark:text-spotify-gray">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complianceResults.map(({ country, status }) => (
                                            <tr key={country.code} onClick={() => handleCountrySelect(country)} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-spotify-light-dark cursor-pointer">
                                                <td className="py-3 flex items-center text-gray-800 dark:text-gray-200">
                                                    <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="w-5 h-auto mr-3" />
                                                    {country.name}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
                                                        {status === 'Compliant' || status === 'Non-Compliant' ? (status === 'Compliant' ? 'YES' : 'NO') : status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8">
                            <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Ingredient Details</h3>
                                <p className="mt-2 text-gray-600 dark:text-spotify-gray">{searchedIngredient.description}</p>
                            </div>
                            {ingredientSummary && (
                                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Detailed Summary</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600 dark:text-spotify-gray" dangerouslySetInnerHTML={{ __html: parseMarkdown(ingredientSummary) }} />
                                </div>
                            )}
                            <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Compliance Summary</h3>
                                {/* FIX: Pass isLoading prop to ComplianceChart. */}
                                <ComplianceChart data={complianceResults} totalLabel="Countries" isLoading={isLoading} />
                            </div>
                            {selectedCountry && (
                                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Detailed Report for {selectedCountry.name}</h3>
                                    {isDetailLoading ? (
                                        <div className="flex items-center text-gray-600 dark:text-spotify-gray"><Spinner className="h-5 w-5 mr-2" /> Loading...</div>
                                    ) : (
                                        <div className="prose prose-sm max-w-none max-h-80 overflow-y-auto dark:prose-invert" dangerouslySetInnerHTML={{ __html: parseMarkdown(detailedReport) }} />
                                    )}
                                </div>
                            )}
                            <div className="h-4"></div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default IngredientSearchDetailPage;