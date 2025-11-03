import React, { useState, useEffect, useRef } from 'react';
import type { Country, Product } from '../types';
import { fetchProductIngredients, fetchComplianceInfo } from '../api/complianceApi';
import Spinner from './Spinner';
import { COUNTRIES, MOCK_PRODUCTS } from '../constants';
import DetailedReport from './DetailedReport';

// --- Local Search Form Component ---
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const GlobeIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.044-.044a2 2 0 012.828 0l.044.044M1.05 11a9 9 0 0118 0" /></svg>);

const ProductCountrySearchForm: React.FC<{
  onSearch: (productName: string, country: Country) => void;
  initialProductName?: string;
  initialCountry?: Country;
}> = ({ onSearch, initialProductName = '', initialCountry }) => {
    const [productQuery, setProductQuery] = useState(initialProductName);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry?.code || COUNTRIES[0].code);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isProductSelected, setIsProductSelected] = useState(!!initialProductName);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setProductQuery(initialProductName);
      setSelectedCountryCode(initialCountry?.code || COUNTRIES[0].code);
      setIsProductSelected(!!initialProductName);
    }, [initialProductName, initialCountry]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setProductQuery(query);
        setIsProductSelected(false);
        if (query.trim()) {
            setSuggestions(MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (product: Product) => {
        setProductQuery(product.name);
        setIsProductSelected(true);
        setSuggestions([]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const country = COUNTRIES.find(c => c.code === selectedCountryCode);
        const product = MOCK_PRODUCTS.find(p => p.name.toLowerCase() === productQuery.toLowerCase());
        
        if (product && country) {
            setIsProductSelected(true);
            onSearch(product.name, country);
        }
    };

    const isButtonDisabled = !isProductSelected || !selectedCountryCode;

    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="relative flex-grow w-full" ref={searchWrapperRef}>
              <div className="relative">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                   <input
                      type="text"
                      value={productQuery}
                      onChange={handleProductChange}
                      placeholder="Search for a product..."
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-spotify-green focus:border-spotify-green text-base"
                      autoComplete="off"
                  />
              </div>
              {suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-spotify-light-dark border dark:border-gray-700 rounded-md shadow-lg z-20 text-left">
                      {suggestions.map(product => (
                          <li key={product.name} onClick={() => handleSuggestionClick(product)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-gray-500 dark:text-spotify-gray ml-2">- {product.company}</span>
                          </li>
                      ))}
                  </ul>
              )}
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <GlobeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray pointer-events-none" />
              <select value={selectedCountryCode} onChange={(e) => setSelectedCountryCode(e.target.value)} className="w-full appearance-none pl-12 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-spotify-green focus:border-spotify-green text-base">
                  {COUNTRIES.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
              </select>
          </div>
          <button type="submit" disabled={isButtonDisabled} className="w-full sm:w-auto flex-shrink-0 flex justify-center py-2 px-6 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-spotify-green dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spotify-green transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Search</button>
      </form>
    );
};

// --- Main Report Page Component ---

interface ProductReportPageProps {
  productName: string;
  country: Country;
  onSearch: (productName: string, country: Country) => void;
}

type ReportStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review';

interface IngredientCompliance {
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

const parseReport = (report: string) => {
    let status: ReportStatus = 'Requires Review';
    if (report.toLowerCase().includes('status:** **compliant')) status = 'Compliant';
    if (report.toLowerCase().includes('status:** **non-compliant')) status = 'Non-Compliant';
    if (report.toLowerCase().includes('status:** **restricted')) status = 'Requires Review';
    return { status };
};

const ProductReportPage: React.FC<ProductReportPageProps> = ({ productName, country, onSearch }) => {
    const [company, setCompany] = useState<Product['company'] | ''>('');
    const [results, setResults] = useState<IngredientCompliance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setCompany('');
        setExpandedIngredient(null);
        
        const runComplianceCheck = async () => {
            try {
                const { company: productCompany, ingredients } = await fetchProductIngredients(productName);
                setCompany(productCompany);
                const initialResults = ingredients.map(ing => ({ name: ing, status: 'Loading' as const, summary: '' }));
                setResults(initialResults);
                setIsLoading(false);
                
                ingredients.forEach(async (ingredientName, index) => {
                    try {
                        const report = await fetchComplianceInfo(ingredientName, country.name);
                        const { status } = parseReport(report);
                        setResults(prev => {
                            const newResults = [...prev];
                            newResults[index] = { name: ingredientName, status, summary: report };
                            return newResults;
                        });

                    } catch (e) {
                         setResults(prev => {
                            const newResults = [...prev];
                            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch compliance data.';
                            newResults[index] = { name: ingredientName, status: 'Error' as const, summary: errorMessage };
                            return newResults;
                        });
                    }
                });

            } catch(e) {
                if (e instanceof Error) setError(e.message);
                setIsLoading(false);
            }
        };

        runComplianceCheck();
    }, [productName, country]);
    
    const overallStatus = () => {
        if (!results.length || results.some(r => r.status === 'Loading')) return 'Loading';
        if (results.some(r => r.status === 'Non-Compliant')) return 'Non-Compliant';
        if (results.some(r => r.status === 'Requires Review')) return 'Requires Review';
        if (results.some(r => r.status === 'Error')) return 'Error';
        return 'Compliant';
    }

    if (isLoading && !error) {
        return (
            <div className="flex-grow flex items-center justify-center h-full">
                 <Spinner className="h-10 w-10 text-spotify-green" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full h-full overflow-y-auto">
             <div className="bg-white dark:bg-spotify-card p-4 rounded-xl shadow-lg mb-8 sticky top-[-24px] lg:top-[-32px] z-10">
                 <ProductCountrySearchForm 
                    onSearch={onSearch}
                    initialProductName={productName}
                    initialCountry={country}
                 />
            </div>
            
            {error ? (
                <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg text-center">{error}</div>
            ) : (
                <>
                <div className="bg-white dark:bg-spotify-card p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-spotify-gray">{company}</p>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{productName}</h1>
                            <div className="mt-2 flex items-center">
                                <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="w-6 h-auto mr-3 rounded" />
                                <span className="text-lg text-gray-600 dark:text-gray-300">{country.name}</span>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                             <p className="text-sm text-gray-500 dark:text-spotify-gray">Overall Status</p>
                             <p className={`text-2xl font-bold ${statusStyles[overallStatus()]?.text || 'text-gray-800 dark:text-gray-200'}`}>
                                {overallStatus() === 'Loading' ? 'Analyzing...' : overallStatus()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Ingredient Breakdown</h2>
                    {results.map((result, index) => (
                        <div key={index} className="bg-white dark:bg-spotify-card rounded-lg shadow-md overflow-hidden">
                            <button 
                                onClick={() => setExpandedIngredient(expandedIngredient === result.name ? null : result.name)}
                                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-spotify-light-dark transition-colors duration-150"
                                aria-expanded={expandedIngredient === result.name}
                                disabled={result.status === 'Loading'}
                            >
                                <div className="flex items-center min-w-0">
                                    {result.status === 'Loading' ? (
                                        <Spinner className="w-5 h-5 mr-3 text-gray-400" />
                                    ) : (
                                        <span className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${statusStyles[result.status].dot}`}></span>
                                    )}
                                    <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{result.name}</span>
                                </div>
                                <div className="flex items-center flex-shrink-0 ml-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[result.status].badge} ${statusStyles[result.status].text}`}>
                                        {result.status}
                                    </span>
                                    {result.status !== 'Loading' && (
                                     <svg className={`w-5 h-5 ml-4 text-gray-500 transform transition-transform duration-200 ${expandedIngredient === result.name ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    )}
                                </div>
                            </button>
                            {expandedIngredient === result.name && result.status !== 'Loading' && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-spotify-light-dark">
                                     <DetailedReport report={result.summary} isLoading={false} defaultText="" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
    );
};

export default ProductReportPage;