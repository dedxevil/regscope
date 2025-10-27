

import React, { useState, useCallback } from 'react';
import type { Ingredient } from '../types';
import Header from './Header';
import { COUNTRIES } from '../constants';
import { fetchComplianceInfo } from '../services/geminiService';
import Spinner from './Spinner';
// FIX: Import Theme type for Header props.
import type { Theme } from '../App';

interface IngredientDetailPageProps {
  ingredient: Ingredient;
  onBack: () => void;
  onLogout: () => void;
  // FIX: Add theme and onToggleTheme to props to satisfy HeaderProps.
  theme: Theme;
  onToggleTheme: () => void;
}

const BackIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const IngredientDetailPage: React.FC<IngredientDetailPageProps> = ({ ingredient, onBack, onLogout, theme, onToggleTheme }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(COUNTRIES[0].name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [complianceReport, setComplianceReport] = useState<string | null>(null);

  const handleCheckCompliance = useCallback(async () => {
    if (!selectedCountry) return;
    setIsLoading(true);
    setError(null);
    setComplianceReport(null);

    try {
      const report = await fetchComplianceInfo(ingredient.name, selectedCountry);
      setComplianceReport(report);
    } catch (err) {
      setError('Failed to fetch compliance information. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [ingredient.name, selectedCountry]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* FIX: Pass theme and onToggleTheme props to Header component. */}
      <Header title={`Compliance Details: ${ingredient.name}`} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <BackIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{ingredient.name}</h2>
            <p className="mt-1 text-gray-600">{ingredient.description}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Check Country Compliance</h3>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                 <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-grow block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                    {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.name}>
                            {country.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleCheckCompliance}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Spinner /> : <SearchIcon className="w-5 h-5 mr-2 -ml-1" />}
                    Check Compliance
                </button>
            </div>
        </div>

        {isLoading && (
            <div className="mt-6 flex justify-center items-center text-gray-600">
                <Spinner />
                <span className="ml-2">Analyzing regulations for {selectedCountry}...</span>
            </div>
        )}

        {error && <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}
        
        {complianceReport && (
             <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Report: {selectedCountry}</h3>
                <div 
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: complianceReport.replace(/\n/g, '<br />') }}
                />
            </div>
        )}

      </main>
    </div>
  );
};

export default IngredientDetailPage;