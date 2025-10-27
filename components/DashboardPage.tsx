

import React from 'react';
import { MOCK_INGREDIENTS } from '../constants';
import type { Ingredient } from '../types';
import Header from './Header';
// FIX: Import Theme type for Header props.
import type { Theme } from '../App';

interface DashboardPageProps {
  onSelectIngredient: (ingredient: Ingredient) => void;
  onLogout: () => void;
  // FIX: Add theme and onToggleTheme to props to satisfy HeaderProps.
  theme: Theme;
  onToggleTheme: () => void;
}

const statusStyles: Record<Ingredient['status'], string> = {
    'Compliant': 'bg-green-100 text-green-800',
    'Requires Review': 'bg-yellow-100 text-yellow-800',
    'Non-Compliant': 'bg-red-100 text-red-800',
    'Unchecked': 'bg-gray-100 text-gray-800'
};

const statusDotStyles: Record<Ingredient['status'], string> = {
    'Compliant': 'bg-green-500',
    'Requires Review': 'bg-yellow-500',
    'Non-Compliant': 'bg-red-500',
    'Unchecked': 'bg-gray-500'
};

const IngredientCard: React.FC<{ ingredient: Ingredient; onSelect: () => void }> = ({ ingredient, onSelect }) => {
    const progress = (ingredient.checkedCountries / ingredient.totalCountries) * 100;

    return (
        <div 
            onClick={onSelect} 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between"
        >
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800">{ingredient.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[ingredient.status]}`}>
                        {ingredient.status}
                    </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 h-10">{ingredient.description}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
                 <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{ingredient.checkedCountries} / {ingredient.totalCountries} Countries</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectIngredient, onLogout, theme, onToggleTheme }) => {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* FIX: Pass theme and onToggleTheme props to Header component. */}
      <Header title="Form 5 Compliance Overview" onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_INGREDIENTS.map((ingredient) => (
            <IngredientCard 
              key={ingredient.id} 
              ingredient={ingredient} 
              onSelect={() => onSelectIngredient(ingredient)} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;