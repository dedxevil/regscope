import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import ComplianceChart from './ComplianceChart';
import { MOCK_INGREDIENTS, COUNTRIES, MOCK_COUNTRY_COMPLIANCE_DATA } from '../constants';
import type { Ingredient, IngredientType } from '../types';
import type { Theme } from '../App';
import ComplianceByCountryChart from './ComplianceByCountryChart';
import GaugeChart from './GaugeChart';
import ComplianceByTypeChart from './ComplianceByTypeChart';

interface MainPageProps {
    onLogout: () => void;
    onShowCompliantList: () => void;
    onShowAllIngredientsList: () => void;
    onShowCountriesList: () => void;
    onSelectIngredient: (ingredientName: string) => void;
    theme: Theme;
    onToggleTheme: () => void;
}

const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const MainPage: React.FC<MainPageProps> = ({ onLogout, onShowCompliantList, onShowAllIngredientsList, onShowCountriesList, onSelectIngredient, theme, onToggleTheme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
    // FIX: Add isLoading state for charts to satisfy props requirements.
    const [isLoadingCharts, setIsLoadingCharts] = useState(true);

    useEffect(() => {
        // Simulate chart loading
        const timer = setTimeout(() => setIsLoadingCharts(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const summaryStats = useMemo(() => ({
        compliantIngredients: MOCK_INGREDIENTS.filter(i => i.status === 'Compliant').length,
        totalIngredients: MOCK_INGREDIENTS.length,
        totalCountries: COUNTRIES.length,
    }), []);

    const overallCompliancePercentage = useMemo(() => {
        const total = MOCK_INGREDIENTS.length;
        return total > 0 ? Math.round((summaryStats.compliantIngredients / total) * 100) : 0;
    }, [summaryStats.compliantIngredients]);

    const overallComplianceData = useMemo(() => MOCK_INGREDIENTS.map(i => ({ status: i.status })), []);

    const complianceByTypeData = useMemo(() => {
        const types: IngredientType[] = ['Herbal Extract', 'Mineral Pitch', 'Processed Herb'];
        return types.map(type => {
            const ingredientsOfType = MOCK_INGREDIENTS.filter(i => i.type === type);
            return {
                type: type,
                compliant: ingredientsOfType.filter(i => i.status === 'Compliant').length,
                nonCompliant: ingredientsOfType.filter(i => i.status === 'Non-Compliant').length,
                review: ingredientsOfType.filter(i => i.status === 'Requires Review').length,
            };
        });
    }, []);

    useEffect(() => {
        const query = debouncedSearchQuery.trim().toLowerCase();
        if (query) {
            const filtered = MOCK_INGREDIENTS.filter(i => i.name.toLowerCase().includes(query));
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchQuery]);

    const handleSuggestionClick = (ingredientName: string) => {
        setSearchQuery('');
        setSuggestions([]);
        onSelectIngredient(ingredientName);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-spotify-dark">
            <Header title="Global Compliance Dashboard" onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                 <div className="relative mb-8">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-spotify-gray pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for an ingredient to view its detailed report..."
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-card text-gray-900 dark:text-gray-100 rounded-full focus:ring-spotify-green focus:border-spotify-green text-lg"
                        />
                         {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-spotify-gray hover:text-gray-800 dark:hover:text-gray-200" aria-label="Clear search">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                     {suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-spotify-card border dark:border-gray-700 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                            {suggestions.map(ing => (
                                <li 
                                    key={ing.id} 
                                    onClick={() => handleSuggestionClick(ing.name)}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-spotify-light-dark cursor-pointer text-gray-800 dark:text-gray-200"
                                >
                                    {ing.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-left">
                        Overall Compliance Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <GaugeChart value={overallCompliancePercentage} label="Compliant Ingredients" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                             <div onClick={onShowCompliantList} className="bg-gray-50 dark:bg-spotify-light-dark p-4 rounded-lg shadow-inner hover:shadow-lg transition-shadow cursor-pointer"><p className="text-sm text-gray-500 dark:text-spotify-gray">Compliant Ingredients</p><p className="text-3xl font-bold text-green-600 dark:text-spotify-green">{summaryStats.compliantIngredients}</p></div>
                             <div onClick={onShowAllIngredientsList} className="bg-gray-50 dark:bg-spotify-light-dark p-4 rounded-lg shadow-inner hover:shadow-lg transition-shadow cursor-pointer"><p className="text-sm text-gray-500 dark:text-spotify-gray">Monitored Ingredients</p><p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summaryStats.totalIngredients}</p></div>
                             <div onClick={onShowCountriesList} className="bg-gray-50 dark:bg-spotify-light-dark p-4 rounded-lg shadow-inner hover:shadow-lg transition-shadow cursor-pointer"><p className="text-sm text-gray-500 dark:text-spotify-gray">Countries Analyzed</p><p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summaryStats.totalCountries}</p></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow">
                         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Overall Ingredient Status</h2>
                         {/* FIX: Pass isLoading prop to ComplianceChart. */}
                         <ComplianceChart data={overallComplianceData} totalLabel="Ingredients" isLoading={isLoadingCharts} />
                    </div>
                     <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow">
                         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Compliance by Top Countries</h2>
                         {/* FIX: Pass isLoading prop to ComplianceByCountryChart. */}
                         <ComplianceByCountryChart data={MOCK_COUNTRY_COMPLIANCE_DATA} isLoading={isLoadingCharts} />
                    </div>
                    <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow">
                         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Compliance by Type</h2>
                         {/* FIX: Pass isLoading prop to ComplianceByTypeChart. */}
                         <ComplianceByTypeChart data={complianceByTypeData} isLoading={isLoadingCharts} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainPage;