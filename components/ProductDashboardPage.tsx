import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COUNTRIES, MOCK_PRODUCTS, MOCK_TREND_DATA, MOCK_INGREDIENTS } from '../constants';
import type { Country, Product, Ingredient, IngredientType } from '../types';
import Spinner from './Spinner';
import DetailedReport from './DetailedReport';
import { fetchProductIngredients, fetchComplianceInfo } from '../api/complianceApi';
import ComplianceRateGauge from './ComplianceRateGauge';
import ComplianceTrendChart from './ComplianceTrendChart';
import TopProductsChart from './TopProductsChart';
import IngredientReportModal from './IngredientReportModal';
import ProductStatusChart from './ProductStatusChart';
import ComplianceChart from './ComplianceChart';
import FlaggedIngredientsChart from './FlaggedIngredientsChart';
import ComplianceByTypeChart from './ComplianceByTypeChart';
import IngredientCompositionChart from './IngredientCompositionChart';
import ProductIcon from './ProductIcon';
import CountryIcon from './CountryIcon';


// --- ICONS ---
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const ClearIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);


// --- LOCAL TYPES & HELPERS ---
type ReportStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review';
export interface IngredientCompliance {
    name: string;
    status: 'Loading' | ReportStatus | 'Error';
    summary: string;
}
const statusStyles: Record<IngredientCompliance['status'], { badge: string, text: string, dot: string }> = {
    'Loading': { badge: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' },
    'Compliant': { badge: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500' },
    'Non-Compliant': { badge: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500' },
    'Requires Review': { badge: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
    'Error': { badge: 'bg-gray-200 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' }
};
const parseReport = (report: string): { status: ReportStatus } => {
    let status: ReportStatus = 'Requires Review';
    if (report.toLowerCase().includes('status:** **compliant')) status = 'Compliant';
    else if (report.toLowerCase().includes('status:** **non-compliant')) status = 'Non-Compliant';
    else if (report.toLowerCase().includes('status:** **restricted')) status = 'Requires Review';
    return { status };
};

// --- SEARCH CONTROLS COMPONENT ---
interface ProductSearchControlsProps {
    onProductSelect: (product: Product | null) => void;
    onCountrySelect: (country: Country | null) => void;
}
const ProductSearchControls: React.FC<ProductSearchControlsProps> = ({ onProductSelect, onCountrySelect }) => {
    const [productQuery, setProductQuery] = useState('');
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

    const filteredProducts = useMemo(() => {
        if (!productQuery.trim()) return MOCK_PRODUCTS;
        return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase()));
    }, [productQuery]);

    const handleProductSelect = (product: Product) => {
        setProductQuery(product.name);
        onProductSelect(product);
        setIsListVisible(false);
    };
    
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        setSelectedCountryCode(countryCode);
        const country = COUNTRIES.find(c => c.code === countryCode);
        onCountrySelect(country || null);
    };

    const handleClearProduct = () => {
        setProductQuery('');
        onProductSelect(null);
    }

    return (
        <div className="bg-white dark:bg-spotify-card p-4 rounded-xl shadow-lg w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative" ref={searchWrapperRef}>
                    <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray mb-1">Product</label>
                    <div className="relative">
                        <ProductIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                        <input id="product-search" type="text" value={productQuery} onChange={e => setProductQuery(e.target.value)} onFocus={() => setIsListVisible(true)} placeholder="Search or select a product..." className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark rounded-md focus:ring-spotify-green focus:border-spotify-green" autoComplete="off" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                            {productQuery && <button onClick={handleClearProduct} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><ClearIcon className="w-4 h-4"/></button>}
                            <ChevronDownIcon className="w-5 h-5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                    {isListVisible && (
                        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-spotify-light-dark border dark:border-gray-700 rounded-md shadow-lg z-20 text-left max-h-60 overflow-y-auto">
                            {filteredProducts.length > 0 ? filteredProducts.map(p => (<li key={p.name} onClick={() => handleProductSelect(p)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><span className="font-medium">{p.name}</span><span className="text-sm text-gray-500 dark:text-spotify-gray ml-2">- {p.company}</span></li>))
                            : <li className="px-4 py-2 text-gray-500">No products found</li>}
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
const ProductDashboardPage: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [reportResults, setReportResults] = useState<IngredientCompliance[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [viewingIngredient, setViewingIngredient] = useState<IngredientCompliance | null>(null);
    
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

    useEffect(() => {
        setIsLoadingDashboard(true); // Reset loading state when selection changes
        const timer = setTimeout(() => setIsLoadingDashboard(false), 1000);
        return () => clearTimeout(timer);
    }, [selectedCountry, selectedProduct]);


    useEffect(() => {
        if (!selectedProduct || !selectedCountry) {
            setReportResults([]);
            return;
        }

        const runComplianceCheck = async () => {
            setIsReportLoading(true);
            
            try {
                const { ingredients } = await fetchProductIngredients(selectedProduct.name);
                setReportResults(ingredients.map(ing => ({ name: ing, status: 'Loading', summary: '' })));
                
                await Promise.all(ingredients.map(async (ingredientName, index) => {
                    try {
                        const report = await fetchComplianceInfo(ingredientName, selectedCountry.name);
                        const { status } = parseReport(report);
                        setReportResults(prev => {
                            const newResults = [...prev];
                            newResults[index] = { name: ingredientName, status, summary: report };
                            return newResults;
                        });
                    } catch (e) {
                        setReportResults(prev => {
                            const newResults = [...prev];
                            newResults[index] = { name: ingredientName, status: 'Error', summary: e instanceof Error ? e.message : 'Failed to fetch.' };
                            return newResults;
                        });
                    }
                }));

            } catch (e) {
                console.error(e);
            } finally {
                setIsReportLoading(false);
            }
        };

        runComplianceCheck();
    }, [selectedProduct, selectedCountry]);
    
    const fullViewingIngredient = useMemo(() => {
        if (!viewingIngredient) return null;
        return MOCK_INGREDIENTS.find(i => i.name === viewingIngredient.name) || null;
    }, [viewingIngredient]);


    const countryDashboardData = useMemo(() => {
        if (!selectedCountry) return null;
        const seed = selectedCountry.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const topProducts = [...MOCK_PRODUCTS].sort((a, b) => (a.name.length * seed) % 50 - (b.name.length * seed) % 50).slice(0, 5).map((p, i) => ({ name: p.name, value: 10 + ((seed * (i + 1) * p.name.length) % 40) })).sort((a, b) => b.value - a.value);
        const ingredientTypes: IngredientType[] = ['Herbal Extract', 'Mineral Pitch', 'Processed Herb'];

        return {
            complianceRate: 60 + (seed % 35),
            trendData: MOCK_TREND_DATA.map(d => ({ ...d, nonCompliant: Math.max(0, d.nonCompliant + (seed % 5) - 2) })),
            topProducts,
            productStatusData: MOCK_PRODUCTS.map(p => ({ status: p.status })),
            topFlaggedIngredients: MOCK_INGREDIENTS, // Pass all, chart will sort and slice
            complianceByType: ingredientTypes.map(type => ({
                type,
                compliant: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Compliant').length + (seed % 5),
                nonCompliant: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Non-Compliant').length + (seed % 3),
                review: MOCK_INGREDIENTS.filter(i => i.type === type && i.status === 'Requires Review').length + (seed % 4),
            }))
        };
    }, [selectedCountry]);

    const productChartData = useMemo(() => {
        if (!selectedProduct) return { complianceRate: 0, statusBreakdown: [], ingredientComposition: {ingredients: []}, trendData: [] };

        const seed = selectedProduct.name.length;
        const trendData = MOCK_TREND_DATA.map(d => ({...d, nonCompliant: Math.max(0, d.nonCompliant - 5 + (seed % 5) - (d.month.length % 3))}));

        if (!reportResults.length || reportResults.some(r => r.status === 'Loading')) {
            return { complianceRate: 0, statusBreakdown: [], ingredientComposition: { ingredients: [] }, trendData };
        }
        
        const completed = reportResults.filter(r => r.status !== 'Loading' && r.status !== 'Error');
        const compliantCount = completed.filter(r => r.status === 'Compliant').length;
        const complianceRate = completed.length > 0 ? (compliantCount / completed.length) * 100 : 0;
        
        const ingredientDetails = selectedProduct.ingredients
            .map(name => MOCK_INGREDIENTS.find(i => i.name === name))
            .filter((i): i is Ingredient => !!i);

        return {
            complianceRate,
            statusBreakdown: completed.map(r => ({ status: r.status })),
            ingredientComposition: { ingredients: ingredientDetails },
            trendData,
        };
    }, [reportResults, selectedProduct]);

    const renderContent = () => {
        if (!selectedCountry && !selectedProduct) {
             return (
                <div className="flex-grow flex items-center justify-center text-center p-4">
                    <div>
                        <ProductIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Product & Country Dashboard</h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Select a product and/or a country to begin.</p>
                    </div>
                </div>
            );
        }

        if (selectedCountry && !selectedProduct) {
            return (
                <div className="flex-grow overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                        Compliance Dashboard for {selectedCountry.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceRateGauge value={countryDashboardData.complianceRate} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><TopProductsChart data={countryDashboardData.topProducts} isLoading={isLoadingDashboard} title={`Top 5 Non-Compliant Products (%)`} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ProductStatusChart data={countryDashboardData.productStatusData} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceTrendChart data={countryDashboardData.trendData} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><FlaggedIngredientsChart ingredients={countryDashboardData.topFlaggedIngredients} isLoading={isLoadingDashboard} /></div>
                         <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><ComplianceByTypeChart data={countryDashboardData.complianceByType} isLoading={isLoadingDashboard} /></div>
                    </div>
                </div>
            );
        }
        
        if (selectedProduct) {
            return (
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                    {/* Left Column: Ingredient List */}
                    <div className="bg-white dark:bg-spotify-card rounded-lg shadow-md flex flex-col lg:col-span-1">
                         <h3 className="text-lg font-bold p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">{selectedProduct.name} Ingredients</h3>
                         <div className="flex-grow overflow-y-auto">
                             <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {reportResults.length > 0 ? reportResults.map((result) => (
                                     <li key={result.name} onClick={() => result.status !== 'Loading' && result.status !== 'Error' && setViewingIngredient(result)} className={`p-3 flex items-center justify-between ${result.status !== 'Loading' && result.status !== 'Error' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-spotify-light-dark/50' : ''}`}>
                                        <div className="flex items-center min-w-0">
                                            {result.status === 'Loading' ? <Spinner className="w-4 h-4 mr-3 text-gray-400" /> : <span className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 ${statusStyles[result.status].dot}`}></span>}
                                            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{result.name}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[result.status].badge} ${statusStyles[result.status].text}`}>{result.status}</span>
                                     </li>
                                )) : selectedProduct.ingredients.map(name => (
                                     <li key={name} className="p-3 flex items-center min-w-0">
                                         <span className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 bg-gray-300 dark:bg-gray-600"></span>
                                         <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{name}</span>
                                     </li>
                                ))}
                             </ul>
                         </div>
                    </div>

                    {/* Right Column: Charts */}
                    <div className="lg:col-span-2 flex flex-col">
                        {!selectedCountry ? (
                            <div className="flex-grow flex items-center justify-center text-center p-4 bg-white dark:bg-spotify-card rounded-lg shadow-md">
                                <div>
                                    <CountryIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                                    <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Select a country</h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please select a country to view compliance details for {selectedProduct.name}.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Ingredient Compliance Rate</h3><ComplianceRateGauge value={productChartData.complianceRate} isLoading={isReportLoading} /></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Ingredient Status Breakdown</h3><ComplianceChart data={productChartData.statusBreakdown} totalLabel="Ingredients" isLoading={isReportLoading} /></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Ingredient Composition</h3><IngredientCompositionChart data={productChartData.ingredientComposition} isLoading={isReportLoading} /></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[250px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Product Compliance Trend</h3><ComplianceTrendChart data={productChartData.trendData} isLoading={isReportLoading} /></div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    };

    return (
        <>
            <div className="h-full flex flex-col p-2 md:p-4 gap-4">
                <div className="flex-shrink-0">
                    <ProductSearchControls 
                        onProductSelect={setSelectedProduct}
                        onCountrySelect={setSelectedCountry}
                    />
                </div>
                {renderContent()}
            </div>
            {viewingIngredient && fullViewingIngredient && selectedCountry && (
                 <IngredientReportModal
                    ingredient={fullViewingIngredient}
                    country={selectedCountry}
                    onClose={() => setViewingIngredient(null)}
                />
            )}
        </>
    );
};

export default ProductDashboardPage;
