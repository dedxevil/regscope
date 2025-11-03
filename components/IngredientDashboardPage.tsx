import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Spinner from './Spinner';
import DetailedReport from './DetailedReport';
import ComplianceChart from './ComplianceChart';
import ComplianceByCountryChart from './ComplianceByCountryChart';
import ComplianceByTypeChart from './ComplianceByTypeChart';
import ComplianceRateGauge from './ComplianceRateGauge';
import FlaggedIngredientsChart from './FlaggedIngredientsChart';
import ComplianceTrendChart from './ComplianceTrendChart';
import { MOCK_INGREDIENTS, COUNTRIES, MOCK_COUNTRY_COMPLIANCE_DATA, MOCK_TREND_DATA } from '../constants';
import { fetchSimpleComplianceStatus, fetchComplianceInfo } from '../services/geminiService';
import type { Ingredient, Country, CountryComplianceStatus, ComplianceStatus, IngredientType, IngredientStatus } from '../types';
import IngredientListSkeleton from './skeletons/IngredientListSkeleton';


const statusStyles: Record<ComplianceStatus, string> = {
    'Compliant': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Non-Compliant': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Requires Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Error': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const typeColorMap: Record<IngredientType, { border: string, text: string, bg: string }> = {
    'Herbal Extract': { border: 'border-teal-500', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900' },
    'Mineral Pitch': { border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900' },
    'Processed Herb': { border: 'border-sky-500', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900' }
};

const typeColorStyles: Record<IngredientType, {
    selected: string;
    unselected: string;
    badge: string;
    selectedBadge: string;
}> = {
    'Herbal Extract': {
        selected: 'bg-teal-500 border-teal-500 text-white',
        unselected: 'border-teal-500/50 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/50',
        badge: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
        selectedBadge: 'bg-white/30 text-white'
    },
    'Mineral Pitch': {
        selected: 'bg-amber-500 border-amber-500 text-white',
        unselected: 'border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/50',
        badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
        selectedBadge: 'bg-white/30 text-white'
    },
    'Processed Herb': {
        selected: 'bg-sky-500 border-sky-500 text-white',
        unselected: 'border-sky-500/50 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/50',
        badge: 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300',
        selectedBadge: 'bg-white/30 text-white'
    }
};

const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CollapseLeftIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>);
const ExpandRightIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
const BackIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);

const getAcronym = (name: string): string => {
    if (!name) return '';
    const simpleName = name.replace(/ \([^)]*\)/g, "");
    const words = simpleName.split(/\s+/).filter(Boolean);
    if (words.length === 1) return (words[0].length > 2 ? words[0].substring(0, 2) : words[0]).toUpperCase();
    return words.map(word => word[0]).filter(char => char && char.match(/[a-zA-Z]/)).join('').toUpperCase();
};

const generateRandomizedIngredients = (): Ingredient[] => {
    const statuses: IngredientStatus[] = ['Compliant', 'Requires Review', 'Non-Compliant', 'Unchecked'];
    return MOCK_INGREDIENTS.map(ing => ({
        ...ing,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        checkedCountries: Math.floor(Math.random() * ing.totalCountries),
        flaggedCount: Math.floor(Math.random() * 15),
    }));
};

const IngredientDashboardPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [complianceResults, setComplianceResults] = useState<CountryComplianceStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [detailedReport, setDetailedReport] = useState<string | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isIngredientListCollapsed, setIsIngredientListCollapsed] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<Set<IngredientType>>(new Set());
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [ingredientsData, setIngredientsData] = useState<Ingredient[]>(MOCK_INGREDIENTS);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDashboardLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    
    const ingredientTypes: IngredientType[] = ['Herbal Extract', 'Mineral Pitch', 'Processed Herb'];

    const handleTypeToggle = (type: IngredientType) => {
        setSelectedTypes(prev => {
            const newSet = new Set(prev);
            newSet.has(type) ? newSet.delete(type) : newSet.add(type);
            return newSet;
        });
    };
    
    const ingredientTypeCounts = useMemo(() => {
        const counts: Record<IngredientType, number> = {
            'Herbal Extract': 0,
            'Mineral Pitch': 0,
            'Processed Herb': 0,
        };
        ingredientsData.forEach(ing => {
            if (ing.type in counts) {
                counts[ing.type]++;
            }
        });
        return counts;
    }, [ingredientsData]);

    const filteredIngredients = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        let ingredients = ingredientsData;
        if (selectedTypes.size > 0) ingredients = ingredients.filter(i => selectedTypes.has(i.type));
        if (query) ingredients = ingredients.filter(i => i.name.toLowerCase().includes(query));
        return ingredients;
    }, [searchQuery, selectedTypes, ingredientsData]);

    const chartData = useMemo(() => {
        const compliantCount = ingredientsData.filter(i => i.status === 'Compliant').length;
        const complianceRate = ingredientsData.length > 0 ? (compliantCount / ingredientsData.length) * 100 : 0;
        
        return {
            overall: ingredientsData.map(i => ({ status: i.status })),
            byType: ingredientTypes.map(type => ({
                type,
                compliant: ingredientsData.filter(i => i.type === type && i.status === 'Compliant').length,
                nonCompliant: ingredientsData.filter(i => i.type === type && i.status === 'Non-Compliant').length,
                review: ingredientsData.filter(i => i.type === type && i.status === 'Requires Review').length,
            })),
            complianceRate,
            flaggedIngredients: [...ingredientsData].sort((a, b) => b.flaggedCount - a.flaggedCount).slice(0, 10),
        };
    }, [ingredientsData]);

    const handleSelectIngredient = useCallback(async (ingredient: Ingredient) => {
        if (selectedIngredient?.id === ingredient.id && !isLoading) return;
        setIsLoading(true);
        setSelectedIngredient(ingredient);
        setSelectedCountry(null);
        setDetailedReport(null);
        setComplianceResults([]);

        const complianceResultsSettled = await Promise.allSettled(COUNTRIES.map(c => fetchSimpleComplianceStatus(ingredient.name, c.name)));
        setComplianceResults(complianceResultsSettled.map((res, i) => ({
            country: COUNTRIES[i],
            status: res.status === 'fulfilled' ? res.value : 'Error'
        })));
        
        setIsLoading(false);
    }, [selectedIngredient, isLoading]);
    
    const handleCountrySelect = useCallback(async (country: Country) => {
        if (!selectedIngredient) return;
        setSelectedCountry(country);
        setIsDetailLoading(true);
        setDetailedReport(null);
        try {
            const report = await fetchComplianceInfo(selectedIngredient.name, country.name);
            setDetailedReport(report);
        } catch (e) {
            setDetailedReport("Failed to load detailed report.");
        } finally {
            setIsDetailLoading(false);
        }
    }, [selectedIngredient]);

    const IngredientListPanel = ({ isCollapsed }: { isCollapsed: boolean }) => (
      <>
        <div className={`p-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0`}>
            {!isCollapsed && <h2 className="text-lg font-bold">Ingredients</h2>}
            <button onClick={() => setIsIngredientListCollapsed(!isCollapsed)} className="p-1 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white" title={isCollapsed ? 'Expand' : 'Collapse'}>
                {isCollapsed ? <ExpandRightIcon className="w-6 h-6" /> : <CollapseLeftIcon className="w-6 h-6" />}
            </button>
        </div>
        
        {isDashboardLoading ? <IngredientListSkeleton collapsed={isCollapsed} /> :
        isCollapsed ? (
            <div className="flex-grow overflow-y-auto">
                <ul>
                    {filteredIngredients.map(ing => (
                        <li key={ing.id} onClick={() => handleSelectIngredient(ing)} title={ing.name} className={`h-12 flex items-center justify-center cursor-pointer border-l-4 ${selectedIngredient?.id === ing.id ? typeColorMap[ing.type].border : 'border-transparent'} ${selectedIngredient?.id === ing.id ? typeColorMap[ing.type].bg : 'hover:bg-gray-50 dark:hover:bg-spotify-light-dark/50'} `}>
                            <span className={`font-bold text-xs ${typeColorMap[ing.type].text}`}>{getAcronym(ing.name)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <>
                <div className="p-4 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-spotify-gray">Filter by Type</p>
                    <div className="flex flex-wrap gap-2">
                        {ingredientTypes.map(type => {
                            const isSelected = selectedTypes.has(type);
                            const styles = typeColorStyles[type];
                            return (
                                <button 
                                    key={type} 
                                    onClick={() => handleTypeToggle(type)} 
                                    className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full border transition-colors duration-200 ${isSelected ? styles.selected : styles.unselected}`}
                                >
                                    {type}
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${isSelected ? styles.selectedBadge : styles.badge}`}>
                                        {ingredientTypeCounts[type]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark rounded-md focus:ring-spotify-green focus:border-spotify-green" /></div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <ul>
                        {filteredIngredients.map(ing => (
                            <li key={ing.id} onClick={() => handleSelectIngredient(ing)} className={`px-4 py-3 cursor-pointer border-l-4 ${selectedIngredient?.id === ing.id ? typeColorMap[ing.type].border + ' bg-gray-100 dark:bg-spotify-light-dark' : 'border-transparent hover:bg-gray-50 dark:hover:bg-spotify-light-dark/50'}`}>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{ing.name}</p>
                                <p className={`text-sm ${typeColorMap[ing.type].text}`}>{ing.type}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )}
      </>
    );

    return (
        <div className="h-full flex flex-col">
            <main className="flex-grow p-2 md:p-4 flex gap-2 md:gap-4 min-h-0 relative">
                
                {/* Desktop Sidebar */}
                <div className={`hidden md:flex flex-shrink-0 bg-white dark:bg-spotify-card rounded-lg shadow-md flex-col transition-all duration-300 ${isIngredientListCollapsed ? 'w-16' : 'w-full md:w-1/3 lg:w-1/4'}`}>
                    <IngredientListPanel isCollapsed={isIngredientListCollapsed} />
                </div>
                
                <div className="flex-grow flex flex-col gap-4 min-w-0">
                    {selectedIngredient ? (
                        <div className="flex flex-col gap-4 h-full">
                          <div className="flex-shrink-0">
                               <button onClick={() => setSelectedIngredient(null)} className="flex items-center text-sm font-medium text-gray-600 dark:text-spotify-gray hover:text-gray-900 dark:hover:text-white bg-white dark:bg-spotify-card px-3 py-2 rounded-lg shadow-md">
                                   <BackIcon className="w-5 h-5 mr-2" />
                                   Back to Dashboard
                               </button>
                           </div>
                           
                           <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex-shrink-0">
                               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedIngredient.name}</h2>
                               <p className="mt-1 text-sm text-gray-600 dark:text-spotify-gray">{selectedIngredient.description}</p>
                           </div>

                           <div className="flex-grow min-h-0">
                                {isLoading ? (
                                    <div className="flex h-full w-full items-center justify-center"><Spinner className="h-8 w-8 text-spotify-green" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                                       <div className="bg-white dark:bg-spotify-card rounded-lg shadow-md flex flex-col min-h-0">
                                            <h3 className="text-lg font-bold p-4 flex-shrink-0">Country Compliance</h3>
                                            <div className="flex-grow overflow-y-auto border-t dark:border-gray-700">
                                                <table className="w-full text-left"><tbody>{complianceResults.map(({country, status}) => (<tr key={country.code} onClick={() => handleCountrySelect(country)} className={`cursor-pointer ${selectedCountry?.code === country.code ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-spotify-light-dark'}`}><td className="p-3 flex items-center text-gray-800 dark:text-gray-200"><img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="w-5 h-auto mr-2"/>{country.name}</td><td className="p-3 text-right"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span></td></tr>))}</tbody></table>
                                            </div>
                                       </div>
                                       <div className="bg-white dark:bg-spotify-card rounded-lg shadow-md flex flex-col min-h-0">
                                           <h3 className="text-lg font-bold p-4 flex-shrink-0">{selectedCountry ? `Detailed Report: ${selectedCountry.name}` : 'Detailed Report'}</h3>
                                           <div className="flex-grow overflow-y-auto border-t dark:border-gray-700 p-3"><DetailedReport isLoading={isDetailLoading} report={detailedReport} defaultText={selectedCountry ? 'Loading...' : 'Select a country to view its detailed report.'}/></div>
                                       </div>
                                   </div>
                                )}
                           </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">Overall Status</h3><div className="flex-grow flex items-center justify-center"><ComplianceChart data={chartData.overall} isLoading={isDashboardLoading} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">Compliance Rate</h3><div className="flex-grow flex items-center justify-center"><ComplianceRateGauge value={chartData.complianceRate} isLoading={isDashboardLoading} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">By Country</h3><div className="flex-grow"><ComplianceByCountryChart data={MOCK_COUNTRY_COMPLIANCE_DATA} isLoading={isDashboardLoading} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">By Type</h3><div className="flex-grow"><ComplianceByTypeChart data={chartData.byType} isLoading={isDashboardLoading} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">Non-Compliant Trend (6 Months)</h3><div className="flex-grow"><ComplianceTrendChart data={MOCK_TREND_DATA} isLoading={isDashboardLoading} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] xl:min-h-0"><h3 className="text-md font-bold mb-2 flex-shrink-0">Top Flagged Ingredients</h3><div className="flex-grow"><FlaggedIngredientsChart ingredients={chartData.flaggedIngredients} isLoading={isDashboardLoading} /></div></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default IngredientDashboardPage;
