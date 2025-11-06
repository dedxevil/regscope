import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { MOCK_PRODUCTS, COUNTRIES, MOCK_COUNTRY_COMPLIANCE_DATA, MOCK_TREND_DATA } from '../constants';
import type { Product, Country } from '../types';
import ComplianceChart from './ComplianceChart';
import ComplianceRateGauge from './ComplianceRateGauge';
import ChartLoader from './ChartLoader';
import Spinner from './Spinner';
import DetailedReport from './DetailedReport';
import { fetchProductIngredients, fetchComplianceInfo } from '../api/complianceApi';
import ComplianceByCountryChart from './ComplianceByCountryChart';
import ComplianceTrendChart from './ComplianceTrendChart';
import ProductListSkeleton from './skeletons/ProductListSkeleton';

const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CollapseLeftIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>);
const ExpandRightIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
const BackIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const GlobeIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.044-.044a2 2 0 012.828 0l.044.044M1.05 11a9 9 0 0118 0" /></svg>);

// --- Local Types for Report View ---
type ReportStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review';
interface IngredientCompliance {
    name: string;
    status: 'Loading' | ReportStatus | 'Error';
    summary: string;
}

// --- Local Components & Constants ---
const ComplianceByBrandChart: React.FC<{ data: any[], isLoading: boolean }> = ({ data, isLoading }) => {
    if (isLoading) return <ChartLoader />;

    const COLORS = { 'Compliant': '#1DB954', 'Non-Compliant': '#EF4444', 'Requires Review': '#F59E0B' };

    return (
        <div className="w-full space-y-4">
            {data.map(item => {
                const total = item.compliant + item.nonCompliant + item.review;
                const compliantWidth = total > 0 ? (item.compliant / total) * 100 : 0;
                const nonCompliantWidth = total > 0 ? (item.nonCompliant / total) * 100 : 0;
                const reviewWidth = total > 0 ? (item.review / total) * 100 : 0;

                return (
                    <div key={item.brand}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-spotify-gray">{item.brand}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{total} Products</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-spotify-light-dark rounded-full h-4 flex overflow-hidden">
                            <div style={{ width: `${compliantWidth}%`, backgroundColor: COLORS['Compliant'] }} title={`Compliant: ${item.compliant}`}></div>
                            <div style={{ width: `${nonCompliantWidth}%`, backgroundColor: COLORS['Non-Compliant'] }} title={`Non-Compliant: ${item.nonCompliant}`}></div>
                            <div style={{ width: `${reviewWidth}%`, backgroundColor: COLORS['Requires Review'] }} title={`Review: ${item.review}`}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

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

const getAcronym = (name: string): string => {
    if (!name) return '';
    const simpleName = name.replace(/ \([^)]*\)/g, "");
    const words = simpleName.split(/\s+/).filter(Boolean);
    if (words.length === 1) return (words[0].length > 3 ? words[0].substring(0, 3) : words[0]).toUpperCase();
    return words.map(word => word[0]).filter(char => char && char.match(/[a-zA-Z]/)).join('').toUpperCase();
};

const ProductDashboardPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductListCollapsed, setIsProductListCollapsed] = useState(false);
    const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [reportResults, setReportResults] = useState<IngredientCompliance[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
    
    // Individual loading states for a staggered effect
    const [isProductListLoading, setIsProductListLoading] = useState(true);
    const [isLoadingOverallStatus, setIsLoadingOverallStatus] = useState(true);
    const [isLoadingComplianceRate, setIsLoadingComplianceRate] = useState(true);
    const [isLoadingByCountry, setIsLoadingByCountry] = useState(true);
    const [isLoadingTrend, setIsLoadingTrend] = useState(true);
    const [isLoadingByBrand, setIsLoadingByBrand] = useState(true);
    
    useEffect(() => {
        const timers = [
            setTimeout(() => setIsProductListLoading(false), 500),
            setTimeout(() => setIsLoadingOverallStatus(false), 800),
            setTimeout(() => setIsLoadingComplianceRate(false), 1000),
            setTimeout(() => setIsLoadingByCountry(false), 1200),
            setTimeout(() => setIsLoadingTrend(false), 1400),
            setTimeout(() => setIsLoadingByBrand(false), 1600),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const companyNames = useMemo(() => Array.from(new Set(MOCK_PRODUCTS.map(p => p.company))), []);

    const companyCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        MOCK_PRODUCTS.forEach(p => {
            counts[p.company] = (counts[p.company] || 0) + 1;
        });
        return counts;
    }, []);

    const handleCompanyToggle = (company: string) => {
        setSelectedCompanies(prev => {
            const newSet = new Set(prev);
            newSet.has(company) ? newSet.delete(company) : newSet.add(company);
            return newSet;
        });
    };

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        let products = MOCK_PRODUCTS;
        if (selectedCompanies.size > 0) products = products.filter(p => selectedCompanies.has(p.company));
        if (query) products = products.filter(p => p.name.toLowerCase().includes(query) || p.company.toLowerCase().includes(query));
        return products;
    }, [searchQuery, selectedCompanies]);

    const handleSelectProduct = useCallback((product: Product) => {
        if (selectedProduct?.name === product.name) return;
        setSelectedProduct(product);
        setSelectedCountry(null);
        setReportResults([]);
        setExpandedIngredient(null);
    }, [selectedProduct]);

    const handleCountrySelectForReport = useCallback(async (countryCode: string) => {
        if (!selectedProduct) return;
        
        const country = COUNTRIES.find(c => c.code === countryCode);
        if (!country) return;

        setSelectedCountry(country);
        setIsReportLoading(true);
        setReportResults([]);
        setExpandedIngredient(null);
        
        try {
            const { ingredients } = await fetchProductIngredients(selectedProduct.name);
            setReportResults(ingredients.map(ing => ({ name: ing, status: 'Loading' as const, summary: '' })));
            
            ingredients.forEach(async (ingredientName, index) => {
                try {
                    const report = await fetchComplianceInfo(ingredientName, country.name);
                    const { status } = parseReport(report);
                    setReportResults(prev => {
                        const newResults = [...prev];
                        newResults[index] = { name: ingredientName, status, summary: report };
                        return newResults;
                    });
                } catch (e) {
                     setReportResults(prev => {
                        const newResults = [...prev];
                        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch compliance data.';
                        newResults[index] = { name: ingredientName, status: 'Error' as const, summary: errorMessage };
                        return newResults;
                    });
                }
            });
        } catch(e) {
            console.error(e);
        } finally {
            setIsReportLoading(false);
        }
    }, [selectedProduct]);
    
    const chartData = useMemo(() => {
        const products = MOCK_PRODUCTS;
        const totalProducts = products.length;
        const compliantCount = products.filter(p => p.status === 'Compliant').length;
        const complianceRate = totalProducts > 0 ? (compliantCount / totalProducts) * 100 : 0;
        
        const byBrand: Record<string, { compliant: number, nonCompliant: number, review: number }> = {};
        products.forEach(p => {
            if (!byBrand[p.company]) byBrand[p.company] = { compliant: 0, nonCompliant: 0, review: 0 };
            if (p.status === 'Compliant') byBrand[p.company].compliant++;
            else if (p.status === 'Non-Compliant') byBrand[p.company].nonCompliant++;
            else if (p.status === 'Requires Review') byBrand[p.company].review++;
        });

        const byBrandArray = Object.keys(byBrand).map(brand => ({ brand, ...byBrand[brand] }));
        
        return {
            overall: products.map(p => ({ status: p.status })),
            complianceRate,
            byBrand: byBrandArray
        };
    }, []);

    const overallStatusForReport = useMemo(() => {
        if (!reportResults.length || reportResults.some(r => r.status === 'Loading')) return 'Loading';
        if (reportResults.some(r => r.status === 'Non-Compliant')) return 'Non-Compliant';
        if (reportResults.some(r => r.status === 'Requires Review')) return 'Requires Review';
        if (reportResults.some(r => r.status === 'Error')) return 'Error';
        return 'Compliant';
    }, [reportResults]);

    const ProductListPanel = ({ isCollapsed }: { isCollapsed: boolean }) => (
        <>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                {!isCollapsed && <h2 className="text-lg font-bold">Products</h2>}
                <button onClick={() => setIsProductListCollapsed(!isCollapsed)} className="p-1 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white" title={isCollapsed ? 'Expand' : 'Collapse'}>
                    {isCollapsed ? <ExpandRightIcon className="w-6 h-6" /> : <CollapseLeftIcon className="w-6 h-6" />}
                </button>
            </div>
            
            {isProductListLoading ? <ProductListSkeleton collapsed={isCollapsed} /> : isCollapsed ? (
                 <div className="flex-grow overflow-y-auto">
                    <ul>
                        {filteredProducts.map(p => (
                            <li key={p.name} onClick={() => handleSelectProduct(p)} title={p.name} className={`h-12 flex items-center justify-center cursor-pointer border-l-4 ${selectedProduct?.name === p.name ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50' : 'border-transparent hover:bg-gray-50 dark:hover:bg-spotify-light-dark/50'}`}>
                                <span className={`font-bold text-xs ${selectedProduct?.name === p.name ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{getAcronym(p.name)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <>
                    <div className="p-4 border-b dark:border-gray-700">
                        <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-spotify-gray">Filter by Brand</p>
                        <div className="flex flex-wrap gap-2">
                            {companyNames.map(company => {
                                const isSelected = selectedCompanies.has(company);
                                return (
                                    <button key={company} onClick={() => handleCompanyToggle(company)} className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full border transition-colors duration-200 ${isSelected ? 'bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        {company}
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${isSelected ? 'bg-white/30 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{companyCounts[company]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="relative"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark rounded-md focus:ring-spotify-green focus:border-spotify-green" /></div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <ul>
                            {filteredProducts.map(p => (
                                <li key={p.name} onClick={() => handleSelectProduct(p)} className={`px-4 py-3 cursor-pointer border-l-4 ${selectedProduct?.name === p.name ? 'border-blue-500 bg-gray-100 dark:bg-spotify-light-dark' : 'border-transparent hover:bg-gray-50 dark:hover:bg-spotify-light-dark/50'}`}>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-spotify-gray">{p.company}</p>
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
                <div className={`hidden md:flex flex-shrink-0 bg-white dark:bg-spotify-card rounded-lg shadow-md flex-col transition-all duration-300 ${isProductListCollapsed ? 'w-16' : 'w-full md:w-1/3 lg:w-1/4'}`}>
                    <ProductListPanel isCollapsed={isProductListCollapsed} />
                </div>
                
                <div className="flex-grow flex flex-col gap-4 min-w-0">
                    {selectedProduct ? (
                        <div className="h-full flex flex-col gap-4 overflow-y-auto">
                           <div className="flex-shrink-0">
                               <button onClick={() => setSelectedProduct(null)} className="flex items-center text-sm font-medium text-gray-600 dark:text-spotify-gray hover:text-gray-900 dark:hover:text-white bg-white dark:bg-spotify-card px-3 py-2 rounded-lg shadow-md">
                                   <BackIcon className="w-5 h-5 mr-2" />
                                   Back to Dashboard
                               </button>
                           </div>
                           
                           <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex-shrink-0">
                               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedProduct.name}</h2>
                               <p className="mt-1 text-sm text-gray-600 dark:text-spotify-gray">{selectedProduct.company}</p>
                           </div>

                           <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex-shrink-0">
                               <label htmlFor="country-select-report" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray mb-2">Select a country to generate a report:</label>
                               <div className="relative">
                                  <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                                  <select id="country-select-report" value={selectedCountry?.code || ''} onChange={(e) => handleCountrySelectForReport(e.target.value)} className="w-full appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green">
                                      <option value="" disabled>Select a country</option>
                                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                  </select>
                               </div>
                           </div>
                           
                           {selectedCountry && (
                                <div className="flex-grow min-h-0">
                                     <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex-shrink-0 mb-4 flex justify-between items-center">
                                         <h3 className="text-lg font-bold">Report for {selectedCountry.name}</h3>
                                         <div>
                                            <span className="text-sm text-gray-500 dark:text-spotify-gray mr-2">Overall Status:</span>
                                            <span className={`font-bold ${statusStyles[overallStatusForReport]?.text || ''}`}>{overallStatusForReport}</span>
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         {reportResults.map((result) => (
                                             <div key={result.name} className="bg-white dark:bg-spotify-card rounded-lg shadow-sm overflow-hidden">
                                                 <button onClick={() => setExpandedIngredient(expandedIngredient === result.name ? null : result.name)} className="w-full text-left p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-spotify-light-dark" disabled={result.status === 'Loading' || result.status === 'Error'}>
                                                     <div className="flex items-center min-w-0">
                                                         {result.status === 'Loading' ? <Spinner className="w-4 h-4 mr-3 text-gray-400" /> : <span className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 ${statusStyles[result.status].dot}`}></span>}
                                                         <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{result.name}</span>
                                                     </div>
                                                     <div className="flex items-center flex-shrink-0 ml-4">
                                                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[result.status].badge} ${statusStyles[result.status].text}`}>{result.status}</span>
                                                         {result.status !== 'Loading' && result.status !== 'Error' && <svg className={`w-5 h-5 ml-3 text-gray-500 transform transition-transform duration-200 ${expandedIngredient === result.name ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                                                     </div>
                                                 </button>
                                                 {expandedIngredient === result.name && (<div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-spotify-light-dark/50"><DetailedReport report={result.summary} isLoading={false} defaultText=""/></div>)}
                                             </div>
                                         ))}
                                     </div>
                                </div>
                           )}
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Overall Product Status</h3><div className="flex-grow flex items-center justify-center"><ComplianceChart data={chartData.overall} totalLabel="Products" isLoading={isLoadingOverallStatus} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Product Compliance Rate</h3><div className="flex-grow flex items-center justify-center"><ComplianceRateGauge value={chartData.complianceRate} isLoading={isLoadingComplianceRate} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">By Country</h3><div className="flex-grow"><ComplianceByCountryChart data={MOCK_COUNTRY_COMPLIANCE_DATA} isLoading={isLoadingByCountry} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px]"><h3 className="text-md font-bold mb-2 flex-shrink-0">Non-Compliant Trend (6 Months)</h3><div className="flex-grow"><ComplianceTrendChart data={MOCK_TREND_DATA} isLoading={isLoadingTrend} /></div></div>
                                <div className="bg-white dark:bg-spotify-card p-4 rounded-lg shadow-md flex flex-col min-h-[300px] md:col-span-2"><h3 className="text-md font-bold mb-2 flex-shrink-0">Compliance by Brand</h3><div className="flex-grow flex items-center justify-center"><ComplianceByBrandChart data={chartData.byBrand} isLoading={isLoadingByBrand} /></div></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProductDashboardPage;