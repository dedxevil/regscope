import React, { useState, useMemo } from 'react';
import { MOCK_INGREDIENTS } from '../constants';
import type { Ingredient } from '../types';
import type { Theme } from '../App';
import Header from './Header';

interface AllIngredientsListPageProps {
  onBack: () => void;
  onSelectIngredient: (ingredientName: string) => void;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const BackIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null, className?: string }> = ({ direction, className }) => {
    if (!direction) return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

const statusStyles: Record<Ingredient['status'], string> = {
    'Compliant': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Requires Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Non-Compliant': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Unchecked': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

type SortKeys = keyof Pick<Ingredient, 'name' | 'status' | 'checkedCountries'>;

const AllIngredientsListPage: React.FC<AllIngredientsListPageProps> = ({ onBack, onSelectIngredient, onLogout, theme, onToggleTheme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

    const filteredAndSortedIngredients = useMemo(() => {
        let items = MOCK_INGREDIENTS.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (sortConfig !== null) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [searchTerm, sortConfig]);

    const requestSort = (key: SortKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key: SortKeys) => (sortConfig?.key === key ? sortConfig.direction : null);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-spotify-dark">
            <Header title="All Monitored Ingredients" onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6"><button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 dark:text-spotify-gray hover:text-gray-900 dark:hover:text-white"><BackIcon className="w-5 h-5 mr-2" />Back to Dashboard</button></div>
                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search all ingredients..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 dark:bg-spotify-light-dark dark:border-gray-700">
                                <tr>
                                    <th className="p-3"><button onClick={() => requestSort('name')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">Ingredient Name <SortIcon direction={getSortDirection('name')} className="w-4 h-4 ml-2" /></button></th>
                                    <th className="p-3"><button onClick={() => requestSort('status')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">Status <SortIcon direction={getSortDirection('status')} className="w-4 h-4 ml-2" /></button></th>
                                    <th className="p-3"><button onClick={() => requestSort('checkedCountries')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">Countries Checked <SortIcon direction={getSortDirection('checkedCountries')} className="w-4 h-4 ml-2" /></button></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedIngredients.map(ingredient => (
                                    <tr key={ingredient.id} onClick={() => onSelectIngredient(ingredient.name)} className="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-spotify-light-dark cursor-pointer">
                                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{ingredient.name}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[ingredient.status]}`}>{ingredient.status}</span></td>
                                        <td className="p-3 text-gray-600 dark:text-spotify-gray">{ingredient.checkedCountries} / {ingredient.totalCountries}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredAndSortedIngredients.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-spotify-gray">No matching ingredients found.</div>}
                </div>
            </main>
        </div>
    );
};

export default AllIngredientsListPage;