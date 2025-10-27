import React, { useState, useMemo } from 'react';
import { COUNTRIES } from '../constants';
import type { Country } from '../types';
import type { Theme } from '../App';
import Header from './Header';

interface CountriesListPageProps {
  onBack: () => void;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const BackIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

const CountriesListPage: React.FC<CountriesListPageProps> = ({ onBack, onLogout, theme, onToggleTheme }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-spotify-dark">
            <Header title="Analyzed Countries" onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6"><button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 dark:text-spotify-gray hover:text-gray-900 dark:hover:text-white"><BackIcon className="w-5 h-5 mr-2" />Back to Dashboard</button></div>
                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search countries..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {filteredCountries.map(country => (
                           <div key={country.code} className="flex items-center p-3 bg-gray-50 dark:bg-spotify-light-dark rounded-md">
                               <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="w-8 h-auto mr-4 rounded" />
                               <span className="font-medium text-gray-800 dark:text-gray-200">{country.name}</span>
                           </div>
                       ))}
                    </div>
                    {filteredCountries.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-spotify-gray">No matching countries found.</div>}
                </div>
            </main>
        </div>
    );
};

export default CountriesListPage;