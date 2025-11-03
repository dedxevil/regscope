import React, { useState, useEffect, useRef } from 'react';
import { COUNTRIES, MOCK_PRODUCTS } from '../constants';
import type { Country, Product } from '../types';

interface ProductSearchPageProps {
  onSearch: (productName: string, country: Country) => void;
}

const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const GlobeIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.044-.044a2 2 0 012.828 0l.044.044M1.05 11a9 9 0 0118 0" /></svg>);

const ProductSearchPage: React.FC<ProductSearchPageProps> = ({ onSearch }) => {
    const [productQuery, setProductQuery] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(COUNTRIES[0].code);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isProductSelected, setIsProductSelected] = useState(false);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

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
            setSuggestions(
                MOCK_PRODUCTS.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5) // Limit suggestions to 5
            );
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
            setIsProductSelected(true); // Ensure it's marked as selected
            onSearch(product.name, country);
        } else if (!product) {
            // Handle case where user types a product name not in the list and hits enter
            setIsProductSelected(false);
            // Optionally, show an error message
        }
    };

    const isButtonDisabled = !isProductSelected || !selectedCountryCode;

    return (
      <div className="flex items-center justify-center h-full p-4">
          <div className="w-full max-w-2xl">
              <div className="bg-white dark:bg-spotify-card p-8 rounded-xl shadow-2xl text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Compliance Check</h1>
                  <p className="text-gray-600 dark:text-spotify-gray mb-8">Select a product and a country to generate a compliance report.</p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="relative" ref={searchWrapperRef}>
                          <label htmlFor="product-search" className="sr-only">Search for a product</label>
                          <div className="relative">
                               <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                               <input
                                  id="product-search"
                                  type="text"
                                  value={productQuery}
                                  onChange={handleProductChange}
                                  placeholder="Search for a product (e.g., Liv. 52 DS)"
                                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-spotify-green focus:border-spotify-green text-lg"
                                  autoComplete="off"
                              />
                          </div>
                          {suggestions.length > 0 && (
                              <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-spotify-light-dark border dark:border-gray-700 rounded-md shadow-lg z-10 text-left">
                                  {suggestions.map(product => (
                                      <li 
                                          key={product.name}
                                          onClick={() => handleSuggestionClick(product)}
                                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                                      >
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-sm text-gray-500 dark:text-spotify-gray ml-2">- {product.company}</span>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                      
                      <div className="relative">
                          <label htmlFor="country-select" className="sr-only">Select a country</label>
                          <GlobeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                          <select
                              id="country-select"
                              value={selectedCountryCode}
                              onChange={(e) => setSelectedCountryCode(e.target.value)}
                              className="w-full appearance-none pl-12 pr-10 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-spotify-green focus:border-spotify-green text-lg"
                          >
                              {COUNTRIES.map(country => (
                                  <option key={country.code} value={country.code}>{country.name}</option>
                              ))}
                          </select>
                      </div>

                      <button
                          type="submit"
                          disabled={isButtonDisabled}
                          className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-spotify-green dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spotify-green transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Check Compliance
                      </button>
                  </form>
              </div>
          </div>
      </div>
    );
};

export default ProductSearchPage;