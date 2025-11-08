import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COUNTRIES, MOCK_INGREDIENTS, MOCK_TREND_DATA } from '../constants';
import type { Country, Ingredient, IngredientType } from '../types';
import Spinner from './Spinner';
import { fetchSimpleComplianceStatus, fetchIngredientSummary } from '../services/geminiService';
import ComplianceRateGauge from './ComplianceRateGauge';
import ComplianceTrendChart from './ComplianceTrendChart';
import TopIngredientsChart from './TopIngredientsChart';
import TopCountriesChart from './TopCountriesChart';
import ComplianceChart from './ComplianceChart';
import FlaggedIngredientsChart from './FlaggedIngredientsChart';
import ComplianceByTypeChart from './ComplianceByTypeChart';
import type { CountryComplianceStatus, ComplianceStatus } from '../types';
import IngredientReportModal from './IngredientReportModal'; // New Import
import IngredientIcon from './IngredientIcon';
import CountryIcon from './CountryIcon';

// --- ICONS ---
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const ClearIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);


// --- LOCAL TYPES & HELPERS ---
const statusStyles: Record<ComplianceStatus, string> = {
    'Compliant': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Non-Compliant': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Requires Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Error': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const parseMarkdown = (text: string | null): string => {
    if (!text) return '';
    return text.trim()
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
};

// --- SEARCH CONTROLS COMPONENT ---
interface IngredientSearchControlsProps {
    onIngredientSelect: (ingredient: Ingredient | null) => void;
    onCountrySelect: (country: Country | null) => void;
}
const IngredientSearchControls: React.FC<IngredientSearchControlsProps> = ({ onIngredientSelect, onCountrySelect }) => {
    const [ingredientQuery, setIngredientQuery] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [isListVisible, setIsListVisible] = useState(false);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setIsListVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredIngredients = useMemo(() => {
        if (!ingredientQuery.trim()) return MOCK_INGREDIENTS;
        return MOCK_INGREDIENTS.filter(i => i.name.toLowerCase().includes(ingredientQuery.toLowerCase()));
    }, [ingredientQuery]);

    const handleIngredientSelect = (ingredient: Ingredient) => {
        setIngredientQuery(ingredient.name);
        onIngredientSelect(ingredient);
        setIsListVisible(false);
    };
    
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        setSelectedCountryCode(countryCode);
        const country = COUNTRIES.find(c => c.code === countryCode);
        onCountrySelect(country || null);
    };

    const handleClearIngredient = () => {
        setIngredientQuery('');
        onIngredientSelect(null);
    }

    return (
        <div className="bg-white dark:bg-spotify-card p-4 rounded-xl shadow-lg w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative" ref={searchWrapperRef}>
                    <label htmlFor="ingredient-search" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray mb-1">Ingredient</label>
                    <div className="relative">
                        <IngredientIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                        <input id="ingredient-search" type="text" value={ingredientQuery} onChange={e => setIngredientQuery(e.target.value)} onFocus={() => setIsListVisible(true)} placeholder="Search or select an ingredient..." className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark rounded-md focus:ring-spotify-green focus:border-spotify-green" autoComplete="off" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                            {ingredientQuery && <button onClick={handleClearIngredient} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><ClearIcon className="w-4 h-4"/></button>}
                            <ChevronDownIcon className="w-5 h-5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                    {isListVisible && (
                        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-spotify-light-dark border dark:border-gray-700 rounded-md shadow-lg z-20 text-left max-h-60 overflow-y-auto">
                            {filteredIngredients.length > 0 ? filteredIngredients.map(i => (<li key={i.id} onClick={() => handleIngredientSelect(i)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><span className="font-medium">{i.name}</span></li>))
                            : <li className="px-4 py-2 text-gray-500">No ingredients found</li>}
                        </ul>
                    )}
                </div>
                <div className="relative">
                    <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray mb-1">Country</label>
                    <CountryIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray mt-3 pointer-events-none" />
                    <select id="country-select" value={selectedCountryCode} onChange={handleCountryChange} className="w-full appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark rounded-md focus:ring-spotify-green focus:border-spotify-green">
                        <option value="">Select a country...</option>
                        {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                    </select>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const IngredientDashboardPage: React.FC = () => {
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    const [complianceResults, setComplianceResults] = useState<CountryComplianceStatus[]>([]);
    const [ingredientSummary, setIngredientSummary] = useState<string | null>(null);
    const [isComplianceLoading, setIsComplianceLoading] = useState(false);
    const [viewingReportForCountry, setViewingReportForCountry] = useState<Country | null>(null);

    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

    useEffect(() => {
        setIsLoadingDashboard(true);
        const timer = setTimeout(() => setIsLoadingDashboard(false), 1000);
        return () => clearTimeout(timer);
    }, [selectedCountry, selectedIngredient]);
    
    const countryDashboardData = useMemo(() => {
        if (!selectedCountry) return null;
        const seed = selectedCountry.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const topIngredients = [...MOCK_INGREDIENTS].sort((a, b) => (a.name.length * seed) % 50 - (b.name.length * seed) % 50).slice(0, 5).map((p, i) => ({ name: p.name, value: 10 + ((seed * (i + 1) * p.name.length) % 25) })).sort((a, b) => b.value - a.value);
        const ingredientTypes: IngredientType[] = ['Herbal Extract', 'Mineral Pitch', 'Processed Herb'];

        return {
            complianceRate: 60 + (seed % 35),
            trendData: MOCK_TREND_DATA.map(d => ({ ...d, nonCompliant: Math.max(0, d.nonCompliant + (seed % 5) - 2) })),
            topIngredients,
            overallStatusData: MOCK_INGREDIENTS.map(p => ({ status: p.status })),
            topFlaggedIngredients: MOCK_INGREDIENTS,
            complianceByType: ingredientTypes.map(type => ({
                type,
                compliant: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Compliant').length + (seed % 5),
                nonCompliant: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Non-Compliant').length + (seed % 3),
                review: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Requires Review').length + (seed % 4),
            }))
        };
    }, [selectedCountry]);

    const handleFetchIngredientDetails = useCallback(async (ingredient: Ingredient) => {
        setIsComplianceLoading(true);
        setComplianceResults([]);
        setIngredientSummary(null);

        const [summaryResult, complianceResultsSettled] = await Promise.all([
            fetchIngredientSummary(ingredient.name),
            Promise.allSettled(COUNTRIES.map(c => fetchSimpleComplianceStatus(ingredient.name, c.name)))
        ]);

        setIngredientSummary(summaryResult);

        setComplianceResults(complianceResultsSettled.map((res, i) => ({
            country: COUNTRIES[i],
            status: res.status === 'fulfilled' ? res.value : 'Error'
        })));
        setIsComplianceLoading(false);
    }, []);
    
    const ingredientChartData = useMemo(() => {
        if (!selectedIngredient || !complianceResults.length) return null;

        const flaggedCountries = complianceResults
            .map(({ country, status }) => {
                let score = 0;
                if (status === 'Non-Compliant') score = Math.random() * 40 + 60; // 60-100
                else if (status === 'Requires Review') score = Math.random() * 30 + 30; // 30-60
                else if (status === 'Compliant') score = Math.random() * 30; // 0-30
                return { name: country.name, value: Math.round(score) };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const seed = selectedIngredient.name.length;
        const trendData = MOCK_TREND_DATA.map(d => ({
            ...d,
            nonCompliant: Math.max(0, d.nonCompliant - 5 + (seed % 5) - (d.month.length % 3))
        }));

        return { flaggedCountries, trendData };
    }, [selectedIngredient, complianceResults]);


    useEffect(() => {
        if (selectedIngredient) {
            handleFetchIngredientDetails(selectedIngredient);
        }
    }, [selectedIngredient, handleFetchIngredientDetails]);

    useEffect(() => {
        if (selectedIngredient && selectedCountry) {
            setViewingReportForCountry(selectedCountry);
        }
    }, [selectedIngredient, selectedCountry]);

    // FIX: Add logic to close modal when ingredient or country is deselected
    useEffect(() => {
        if (!selectedIngredient || !selectedCountry) {
            setViewingReportForCountry(null);
        }
    }, [selectedIngredient, selectedCountry]);


    const renderContent = () => {
        if (!selectedCountry && !selectedIngredient) {
            return (
                <div className="flex-grow flex items-center justify-center text-center p-4">
                    <div>
                        <IngredientIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Ingredient & Country Dashboard</h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Select an ingredient and/or a country to begin.</p>
                    </div>
                </div>
            );
        }

        if (selectedCountry && !selectedIngredient) {
            return (
                <div className="flex-grow overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                        Compliance Dashboard for {selectedCountry.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceRateGauge value={countryDashboardData.complianceRate} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><TopIngredientsChart data={countryDashboardData.topIngredients} isLoading={isLoadingDashboard} title={`Top 5 Flagged Ingredients`} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceChart data={countryDashboardData.overallStatusData} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceTrendChart data={countryDashboardData.trendData} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><FlaggedIngredientsChart ingredients={countryDashboardData.topFlaggedIngredients} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceByTypeChart data={countryDashboardData.complianceByType} isLoading={isLoadingDashboard} /></div>
                    </div>
                </div>
            );
        }

        if (selectedIngredient) {
             return (
                <div className="flex flex-col gap-4 h-full flex-grow min-h-0">
                    <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex-shrink-0">
                       <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedIngredient.name}</h2>
                       <p className="mt-1 text-sm text-gray-600 dark:text-spotify-gray">{selectedIngredient.description}</p>
                    </div>
                    <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                        <div className="bg-white dark:bg-spotify-card rounded-lg shadow-md flex flex-col lg:col-span-1">
                            <h3 className="text-lg font-bold p-4 flex-shrink-0">Country Compliance</h3>
                            <div className="flex-grow overflow-y-auto border-t dark:border-gray-700">
                                {isComplianceLoading ? (
                                    <div className="flex h-full w-full items-center justify-center"><Spinner className="h-8 w-8 text-spotify-green" /></div>
                                ) : (
                                    <table className="w-full text-left">
                                        <tbody>
                                            {complianceResults.map(({country, status}) => (<tr key={country.code} onClick={() => setViewingReportForCountry(country)} className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-spotify-light-dark`}><td className="p-3 flex items-center text-gray-800 dark:text-gray-200"><img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="w-5 h-auto mr-2"/>{country.name}</td><td className="p-3 text-right"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span></td></tr>))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                       </div>
                       <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Global Compliance Status</h3><ComplianceChart data={complianceResults} totalLabel="Countries" isLoading={isComplianceLoading} /></div>
                            <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Non-Compliance Trend</h3><ComplianceTrendChart data={ingredientChartData?.trendData || []} isLoading={isComplianceLoading} /></div>
                            <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Top 5 Flagged Countries</h3><TopCountriesChart data={ingredientChartData?.flaggedCountries || []} isLoading={isComplianceLoading} title="" /></div>
                            <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">AI Summary</h3>
                                <div className="flex-grow overflow-y-auto">
                                    {isComplianceLoading ? <div className="flex h-full w-full items-center justify-center"><Spinner className="h-6 w-6 text-spotify-green" /></div> : <div className="prose prose-sm max-w-none text-gray-600 dark:text-spotify-gray" dangerouslySetInnerHTML={{ __html: parseMarkdown(ingredientSummary) }} />}
                                </div>
                            </div>
                       </div>
                   </div>
                </div>
            );
        }
        return null; // Should not be reached
    };

    return (
        <>
            <div className="h-full flex flex-col p-2 md:p-4 gap-4">
                <div className="flex-shrink-0">
                    <IngredientSearchControls 
                        onIngredientSelect={setSelectedIngredient}
                        onCountrySelect={setSelectedCountry}
                    />
                </div>
                {renderContent()}
            </div>
            {viewingReportForCountry && selectedIngredient && (
                <IngredientReportModal
                    ingredient={selectedIngredient}
                    country={viewingReportForCountry}
                    onClose={() => setViewingReportForCountry(null)}
                />
            )}
        </>
    );
};

export default IngredientDashboardPage;
